const form = document.getElementById("scan-form");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const date = document.getElementById("birth-date").value;
  const time = document.getElementById("birth-time").value;
  const place = document.getElementById("birth-place").value.trim();

  if (!date || !time || !place) {
    statusEl.textContent = "入力が足りないよ。3つ全部入れてね。";
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "スキャン中…✨";
  resultEl.textContent = "";

  try {
    const res = await fetch("https://yuiko-astrology-api-1.onrender.com/calc/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ date, time, place })
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw_response: text };
    }

    if (!res.ok) {
      throw new Error(JSON.stringify(data, null, 2));
    }

    resultEl.textContent = JSON.stringify(data, null, 2);
    statusEl.textContent = "できたよ✨";

  } catch (err) {
    console.error(err);
    statusEl.textContent = "エラーが起きました。";
    resultEl.textContent = err.message || "不明なエラーです。";
  } finally {
    submitBtn.disabled = false;
  }
});