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

const NOTE_FREE_ARTICLE_URL = "https://note.com/preview/n6d6bc3728de3?prev_access_key=5fb0891c1264bad4a7f5d21cd26e87da";

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

function formatPlanetBlock(title, planet, timeUnknown) {
  if (!planet) {
    return `
      <div class="result-card">
        <h3>${escapeHtml(title)}</h3>
        <p>データがありません。</p>
      </div>
    `;
  }

  const sabianLabel = timeUnknown && title === "月"
    ? "サビアン度数（参考）"
    : "サビアン度数";

  const sabianText =
    planet.sabian_degree != null ? `${planet.sabian_degree}度` : "-";

  const houseText =
    !timeUnknown && planet.house != null ? `${planet.house}ハウス` : null;

  return `
    <div class="result-card">
      <h3>${escapeHtml(title)}</h3>
      <p><strong>サイン：</strong>${escapeHtml(signJa(planet.sign))}（${escapeHtml(planet.sign || "-")}）</p>
      ${houseText ? `<p><strong>ハウス：</strong>${escapeHtml(houseText)}</p>` : ""}
      <p><strong>${escapeHtml(sabianLabel)}：</strong>${escapeHtml(sabianText)}</p>
      <p><strong>経度：</strong>${escapeHtml(planet.longitude ?? "-")}</p>
    </div>
  `;
}

function buildInsightLead(sun, moon) {
  const sunText = signJa(sun?.sign || "");
  const moonText = signJa(moon?.sign || "");

  if (!sun?.sign && !moon?.sign) {
    return `
      <div class="result-card value-card">
        <h2>この診断でわかること</h2>
        <p>
          太陽は表に出やすい自分らしさ、月は心の奥にある素直な反応を表します。
          この2つを一緒に見ると、あなたの個性の入り口が見えやすくなります。
        </p>
      </div>
    `;
  }

  return `
    <div class="result-card value-card">
      <h2>この診断でわかること</h2>
      <p>
        太陽の<strong>${escapeHtml(sunText || "-")}</strong>と、
        月の<strong>${escapeHtml(moonText || "-")}</strong>をあわせて見ると、
        表に出やすい魅力と、心の奥にある本音の両方が見えやすくなります。
        ここはあなたの出生図の入り口です✨
      </p>
    </div>
  `;
}

function buildTeaserCard() {
  return `
    <div class="result-card teaser-card">
      <h2>この先も、まだ面白い</h2>
      <p>
        太陽と月の組み合わせには、
        恋愛傾向、才能、人との関わり方、人生テーマなど、
        まだまだ読み解けるポイントがあります。
      </p>
      <p class="teaser-note">
        ここでは入り口だけ。
        続きは、もっとやさしく読める形で見にいけます✨
      </p>
    </div>
  `;
}

function buildNoteCta() {
  const isReady =
    NOTE_FREE_ARTICLE_URL.startsWith("http://") ||
    NOTE_FREE_ARTICLE_URL.startsWith("https://");

  if (!isReady) {
    return `
      <div class="result-card cta-card">
        <h2>もっと詳しく見たい方はこちら</h2>
        <p>
          太陽と月の組み合わせから見える性格の傾向や、
          出生図の面白さを無料note記事で読める導線をここに入れます。
        </p>
        <p class="cta-sub">
          ※ 今は note のURLが未設定です。script.js の
          NOTE_FREE_ARTICLE_URL を差し替えると使えます。
        </p>
      </div>
    `;
  }

  return `
    <div class="result-card cta-card">
      <h2>もっと詳しく見たい方はこちら</h2>
      <p>
        太陽と月の組み合わせから見える性格の傾向、
        才能、人との関わり方などを無料note記事でやさしく読めます✨
      </p>
      <a
        class="cta-link"
        href="${NOTE_FREE_ARTICLE_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        無料note記事を読む
      </a>
    </div>
  `;
}

function buildShareText(sun, moon) {
  const sunText = signJa(sun?.sign || "-");
  const moonText = signJa(moon?.sign || "-");

  return `🌙魔女っ娘★月と太陽スキャン

私の太陽星座：${sunText}
私の月星座：${moonText}

AI占星術で、出生図の入り口を見てみた✨
あなたも診断してみてね
https://moon-sun-scan.yuiko-astroscan.workers.dev`;
}

function buildShareButtons(sun, moon) {
  const shareText = buildShareText(sun, moon);
  const encodedText = encodeURIComponent(shareText);

  const xUrl = `https://x.com/intent/tweet?text=${encodedText}`;
  const threadsUrl = `https://www.threads.com/intent/post?text=${encodedText}`;

  return `
    <div class="share-block">
      <h2>診断結果をシェア</h2>
      <p class="share-text">
        面白かったら、太陽と月の組み合わせをシェアしてみてね✨
      </p>
      <div class="action-buttons">
        <a
          class="action-button action-button-x"
          href="${xUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Xでシェア
        </a>
        <a
          class="action-button action-button-threads"
          href="${threadsUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Threadsでシェア
        </a>
      </div>
    </div>
  `;
}

function renderResult(data) {
  const sun = data?.planets?.sun;
  const moon = data?.planets?.moon;
  const scanComment = data?.comment || "";
  const timeUnknown = !data?.input?.time;

  const commentHtml = scanComment
    ? `<p>${escapeHtml(scanComment)}</p>`
    : `<p>コメントはまだありません。</p>`;

  return (resultEl.innerHTML = `
    <div class="result-wrap">
      ${buildInsightLead(sun, moon)}

      <div class="result-card">
        <h2>基本情報</h2>
        <p><strong>生年月日：</strong>${escapeHtml(data?.input?.date || "-")}</p>
        <p><strong>出生時間：</strong>${escapeHtml(data?.input?.time || "不明（12:00で計算）")}</p>
        <p><strong>出生地：</strong>${escapeHtml(data?.input?.place || "-")}</p>
        <p><strong>タイムゾーン：</strong>${escapeHtml(data?.input?.timezone || "-")}</p>
      </div>

      <div class="result-card">
        <h2>魔女っ娘コメント</h2>
        ${commentHtml}
      </div>

      <div class="result-grid">
        ${formatPlanetBlock("太陽", sun, timeUnknown)}
        ${formatPlanetBlock("月", moon, timeUnknown)}
      </div>

      ${buildTeaserCard()}
      ${buildNoteCta()}
      ${buildShareButtons(sun, moon)}
    </div>
  `);
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
    const res = await fetch("https://yuiko-astrology-api-1.onrender.com/scan/comment/v1", {
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