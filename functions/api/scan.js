export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { date, time, place } = body || {};

    if (!date || !time || !place) {
      return json(
        { error: "date, time, place が必要です。" },
        400
      );
    }

    const apiUrl = "https://yuiko-astrology-api-1.onrender.com/calc/v2";

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date,
        time,
        place
      })
    });

    const rawText = await apiRes.text();

    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!apiRes.ok) {
      return json(
        {
          error: "外部APIの呼び出しに失敗しました。",
          upstream_status: apiRes.status,
          upstream_status_text: apiRes.statusText,
          upstream_body: data
        },
        apiRes.status
      );
    }

    if (!rawText) {
      return json(
        {
          error: "上流APIは200を返しましたが、本文が空でした。",
          upstream_status: apiRes.status,
          upstream_status_text: apiRes.statusText,
          sent_body: { date, time, place }
        },
        502
      );
    }

    return json(
      {
        ok: true,
        upstream_status: apiRes.status,
        data: data
      },
      200
    );
  } catch (error) {
    return json(
      {
        error: "Functions 側でエラーが起きました。",
        detail: String(error)
      },
      500
    );
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
