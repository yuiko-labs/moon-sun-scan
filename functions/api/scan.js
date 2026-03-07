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

    const text = await apiRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!apiRes.ok) {
      return json(
        {
          error: "外部APIの呼び出しに失敗しました。",
          detail: data
        },
        apiRes.status
      );
    }

    return json(data, 200);
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
