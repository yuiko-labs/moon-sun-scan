const form = document.getElementById("scan-form");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submit-btn");

const birthDateEl = document.getElementById("birth-date");
const birthTimeEl = document.getElementById("birth-time");
const birthPlaceEl = document.getElementById("birth-place");
const timeUnknownEl = document.getElementById("time-unknown");

const SIGN_JA = {
  Aries: "牡羊座",
  Taurus: "牡牛座",
  Gemini: "双子座",
  Cancer: "蟹座",
  Leo: "獅子座",
  Virgo: "乙女座",
  Libra: "天秤座",
  Scorpio: "蠍座",
  Sagittarius: "射手座",
  Capricorn: "山羊座",
  Aquarius: "水瓶座",
  Pisces: "魚座"
};

const PLANET_JA = {
  sun: "太陽",
  moon: "月",
  mercury: "水星",
  venus: "金星",
  mars: "火星",
  jupiter: "木星",
  saturn: "土星",
  uranus: "天王星",
  neptune: "海王星",
  pluto: "冥王星"
};

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function signJa(sign) {
  return SIGN_JA[sign] || sign || "-";
}

function planetJa(name) {
  return PLANET_JA[name] || name || "-";
}

function syncTimeUnknown() {
  if (timeUnknownEl.checked) {
    birthTimeEl.value = "";
    birthTimeEl.disabled = true;
  } else {
    birthTimeEl.disabled = false;
  }
}

function formatPlanetBlock(title, planet) {
  if (!planet) {
    return `
      <div class="result-card">
        <h3>${escapeHtml(title)}</h3>
        <p>データがありません。</p>
      </div>
    `;
  }

  const sabianText =
    planet.sabian_degree != null
      ? `${planet.sabian_degree}度`
      : "-";

  const houseText =
    planet.house != null
      ? `${planet.house}ハウス`
      : "-";

  return `
    <div class="result-card">
      <h3>${escapeHtml(title)}</h3>
      <p><strong>サイン：</strong>${escapeHtml(signJa(planet.sign))}</p>
      <p><strong>ハウス：</strong>${escapeHtml(houseText)}</p>
      <p><strong>サビアン度数：</strong>${escapeHtml(sabianText)}</p>
      <p><strong>経度：</strong>${escapeHtml(planet.longitude ?? "-")}</p>
    </div>
  `;
}

function renderResult(data) {
  const sun = data?.planets?.sun;
  const moon = data?.planets?.moon;

  resultEl.innerHTML = `
    <div class="result-wrap">
      <div class="result-card">
        <h2>基本情報</h2>
        <p><strong>生年月日：</strong>${escapeHtml(data?.input?.date || "-")}</p>
        <p><strong>出生時間：</strong>${escapeHtml(data?.input?.time || "-")}</p>
        <p><strong>出生地：</strong>${escapeHtml(data?.input?.place || "-")}</p>
      </div>

      <div class="result-grid">
        ${formatPlanetBlock("太陽", sun)}
        ${formatPlanetBlock("月", moon)}
      </div>
    </div>
  `;
}

timeUnknownEl.addEventListener("change", syncTimeUnknown);
syncTimeUnknown();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const date = birthDateEl.value;
  const time = birthTimeEl.value;
  const place = birthPlaceEl.value.trim();
  const timeUnknown = timeUnknownEl.checked;

  if (!date || (!time && !timeUnknown) || !place) {
    statusEl.textContent = "入力が足りないよ。";
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "スキャン中…✨";
  resultEl.innerHTML = "";

  try {
    const res = await fetch("https://yuiko-astrology-api-1.onrender.com/calc/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date,
        time: timeUnknown ? null : time,
        place
      })
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

    renderResult(data);
    statusEl.textContent = "できたよ✨";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "エラーが起きました。";
    resultEl.textContent = err.message || "不明なエラーです。";
  } finally {
    submitBtn.disabled = false;
  }
});