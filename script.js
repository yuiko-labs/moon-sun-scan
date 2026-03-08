const form = document.getElementById("scan-form");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submit-btn");

const birthYearEl = document.getElementById("birth-year");
const birthMonthEl = document.getElementById("birth-month");
const birthDayEl = document.getElementById("birth-day");
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

function pad2(value) {
  return String(value).padStart(2, "0");
}

function buildDateString(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function isValidDateParts(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return false;
  }

  if (String(year).length !== 4) {
    return false;
  }

  if (m < 1 || m > 12) {
    return false;
  }

  if (d < 1 || d > 31) {
    return false;
  }

  const dt = new Date(y, m - 1, d);

  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

function limitNumberInput(el, maxLength) {
  if (!el) return;

  el.addEventListener("input", () => {
    let value = el.value.replace(/\D/g, "");

    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }

    el.value = value;
  });
}

function syncTimeUnknown() {
  if (!birthTimeEl || !timeUnknownEl) return;

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
      <p><strong>サイン：</strong>${escapeHtml(signJa(planet.sign))}（${escapeHtml(planet.sign || "-")}）</p>
      <p><strong>ハウス：</strong>${escapeHtml(houseText)}</p>
      <p><strong>サビアン度数：</strong>${escapeHtml(sabianText)}</p>
      <p><strong>経度：</strong>${escapeHtml(planet.longitude ?? "-")}</p>
    </div>
  `;
}

function formatAspectItem(a) {
  const p1 = planetJa(a.p1);
  const p2 = planetJa(a.p2);
  const type = a.type_label_ja || a.type || "-";
  const comment = a.comment || "";

  return `
    <li>
      <strong>${escapeHtml(p1)} × ${escapeHtml(p2)}</strong><br>
      ${escapeHtml(type)}<br>
      ${escapeHtml(comment)}
    </li>
  `;
}

function renderResult(data) {
  const sun = data?.planets?.sun;
  const moon = data?.planets?.moon;
  const aspects = Array.isArray(data?.aspects) ? data.aspects : [];

  const sunMoonAspects = aspects.filter((a) => {
    return a.p1 === "sun" || a.p2 === "sun" || a.p1 === "moon" || a.p2 === "moon";
  });

  const otherAspects = aspects.filter((a) => {
    return !(a.p1 === "sun" || a.p2 === "sun" || a.p1 === "moon" || a.p2 === "moon");
  });

  const sunMoonAspectHtml = sunMoonAspects.length
    ? `<ul class="aspect-list">${sunMoonAspects.map(formatAspectItem).join("")}</ul>`
    : `<p>太陽・月に関する主要アスペクトはありません。</p>`;

  const otherAspectHtml = otherAspects.length
    ? `<details>
         <summary>その他のアスペクトも見る</summary>
         <ul class="aspect-list">${otherAspects.map(formatAspectItem).join("")}</ul>
       </details>`
    : "";

  resultEl.innerHTML = `
    <div class="result-wrap">
      <div class="result-card">
        <h2>基本情報</h2>
        <p><strong>生年月日：</strong>${escapeHtml(data?.input?.date || "-")}</p>
        <p><strong>出生時間：</strong>${escapeHtml(data?.input?.time || "-")}</p>
        <p><strong>出生地：</strong>${escapeHtml(data?.input?.place || "-")}</p>
        <p><strong>タイムゾーン：</strong>${escapeHtml(data?.input?.timezone || "-")}</p>
      </div>

      <div class="result-grid">
        ${formatPlanetBlock("太陽", sun)}
        ${formatPlanetBlock("月", moon)}
      </div>

      <div class="result-card">
        <h2>太陽と月の主要アスペクト</h2>
        ${sunMoonAspectHtml}
        ${otherAspectHtml}
      </div>

      <div class="result-card">
        <h2>ひとことメモ</h2>
        <p>この画面は、まず「太陽」と「月」を見やすく読むための簡易表示です。</p>
        <p>今後ここに、仕事・家庭・父性・母性などの読み解き文も追加できます。</p>
      </div>
    </div>
  `;
}

limitNumberInput(birthYearEl, 4);
limitNumberInput(birthMonthEl, 2);
limitNumberInput(birthDayEl, 2);

timeUnknownEl.addEventListener("change", syncTimeUnknown);
syncTimeUnknown();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const year = birthYearEl.value.trim();
  const month = birthMonthEl.value.trim();
  const day = birthDayEl.value.trim();
  const time = birthTimeEl.value;
  const place = birthPlaceEl.value.trim();
  const timeUnknown = timeUnknownEl.checked;

  if (!year || !month || !day || (!time && !timeUnknown) || !place) {
    statusEl.textContent = "入力が足りないよ。必要な項目を入れてね。";
    return;
  }

  if (!isValidDateParts(year, month, day)) {
    statusEl.textContent = "生年月日を正しく入れてね。";
    return;
  }

  const date = buildDateString(year, month, day);

  submitBtn.disabled = true;
  statusEl.textContent = "スキャン中…✨（初回はサーバー起動のため1〜2分かかることがあります）";
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