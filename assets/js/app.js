const DATA_PATH = "./assets/data/trip-data.json";
const FALLBACK_SPOT = "./assets/images/fallbacks/spot-fallback.svg";

const root = document.getElementById("app");
const currentPage = document.body.dataset.page || "index";

bootstrap().catch((error) => {
  console.error(error);
  root.innerHTML = `
    <div class="site-shell">
      <section class="section">
        <h1 class="section__title">가이드를 불러오지 못했습니다</h1>
        <p class="section__desc">로컬 데이터 로딩 중 문제가 발생했습니다. 새로고침 후 다시 확인해 주세요.</p>
      </section>
    </div>
  `;
});

async function bootstrap() {
  const response = await fetch(DATA_PATH);
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }

  const data = await response.json();
  document.title = getPageTitle(data, currentPage);

  root.innerHTML = `
    <div class="site-shell">
      ${renderTopbar(data)}
      <div class="${currentPage === "index" || currentPage === "safety" ? "page-grid page-grid--wide" : "page-grid"}">
        <div class="page-main">
          ${renderPage(data)}
        </div>
        <aside class="action-panel">
          ${renderActionPanel(data)}
        </aside>
      </div>
    </div>
    ${renderFooterNav()}
  `;
}

function getPageTitle(data, page) {
  if (page === "index") {
    return `${data.site.title} | ${data.site.window}`;
  }

  if (page === "safety") {
    return `안전 매뉴얼 | ${data.site.title}`;
  }

  const day = data.days.find((entry) => entry.id === page);
  return day ? `${day.navLabel} | ${data.site.title}` : data.site.title;
}

function renderTopbar(data) {
  return `
    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand">
          <span class="brand__eyebrow">Taipei Couple Webbook</span>
          <strong class="brand__title">${data.site.title}</strong>
          <span class="brand__meta">${data.site.window} · ${data.site.lodging}</span>
        </div>
        <div class="status-strip">
          <span class="pill">입국 픽업 완료</span>
          <span class="pill pill--warm">3/15 22:00 출국 샌딩 완료</span>
          <span class="pill pill--neutral">저강도 동선 기준</span>
        </div>
      </div>
    </header>
  `;
}

function renderPage(data) {
  if (currentPage === "index") {
    return renderIndex(data);
  }

  if (currentPage === "safety") {
    return renderSafety(data);
  }

  const day = data.days.find((entry) => entry.id === currentPage);
  return day ? renderDay(data, day) : renderIndex(data);
}

function renderIndex(data) {
  return `
    ${renderHero({
      eyebrow: `<span class="pill">3박 4일 일정</span><span class="pill pill--warm">숙소 ${data.site.hotelShort}</span>`,
      title: "둘 다 무리하지 않는\n타이베이 커플 루트",
      lead: data.site.summary,
      image: data.site.heroImage,
      summary: [
        { label: "항공", value: `${data.site.flights.depart} / ${data.site.flights.return}` },
        { label: "숙소 위치", value: "닝샤 야시장 도보권 · MRT 접근 편함" },
        { label: "운영 원칙", value: "계단 최소화 · 휴식 자주 · 과식 금지" }
      ]
    })}

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">한눈에 보는 일정</h2>
          <p class="section__desc">제공된 Google Maps 앵커를 기준으로 동선을 정리하고, 혼잡도와 체력 소모를 낮추는 방식으로 재구성했습니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${data.days
          .map(
            (day) => `
              <article class="quick-card">
                <div class="spot-card__meta">
                  <span class="badge badge--blue">${day.dateLabel}</span>
                  <span class="badge">${day.energy}</span>
                </div>
                <h3 class="spot-card__title">${day.navLabel}</h3>
                <p class="spot-card__summary">${day.theme}</p>
                <ul class="list">
                  ${day.headlines.map((item) => `<li>${item}</li>`).join("")}
                </ul>
                <div class="cta-row">
                  <a class="button-link" href="./${day.id}.html">자세히 보기</a>
                  <a class="button-link button-link--ghost" href="${day.dayMapUrl}" target="_blank" rel="noreferrer">Google Maps</a>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">건강 배려 운영 원칙</h2>
          <p class="section__desc">진료 지침이 아니라 여행 운영 기준입니다. 무리할 조짐이 보이면 즉시 하루 강도를 낮추는 전제로 구성했습니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${data.healthProfiles
          .map(
            (profile) => `
              <article class="health-card">
                <div class="spot-card__meta">
                  <span class="badge badge--good">${profile.role}</span>
                  <span class="badge">${profile.age}</span>
                </div>
                <h3 class="spot-card__title">${profile.title}</h3>
                <ul class="list">
                  ${profile.points.map((point) => `<li>${point}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">출발 전 체크</h2>
          <p class="section__desc">공항과 야시장 모두 현장 자극이 강하므로, 미리 챙기면 당일 체력 손실을 줄일 수 있는 항목만 추렸습니다.</p>
        </div>
      </div>
      <div class="grid grid--3">
        ${data.preTripChecklist.map(renderBulletCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">핵심 링크</h2>
          <p class="section__desc">숙소 기준 동선, 응급 대응, 공항 정보는 여기서 바로 열 수 있게 묶었습니다.</p>
        </div>
      </div>
      <div class="source-list">
        ${data.site.links
          .map(
            (link) => `
              <article class="source-card">
                <h3 class="source-card__title">${link.title}</h3>
                <p class="source-card__text">${link.text}</p>
                <div class="cta-row">
                  <a class="button-link button-link--ghost" href="${link.url}" target="_blank" rel="noreferrer">바로 열기</a>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    ${renderSourcesSection(data.site.sourceRefs)}
  `;
}

function renderDay(data, day) {
  return `
    ${renderHero({
      eyebrow: `<span class="pill">${day.dateLabel}</span><span class="pill pill--neutral">${day.energy}</span>`,
      title: day.heroTitle,
      lead: day.heroLead,
      image: day.heroImage,
      summary: day.summaryCards
    })}

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">오늘의 루트</h2>
          <p class="section__desc">${day.routeSummary}</p>
        </div>
        <a class="button-link button-link--ghost" href="${day.dayMapUrl}" target="_blank" rel="noreferrer">전체 동선 보기</a>
      </div>
      <div class="timeline">
        ${day.timeline.map(renderTimelineCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">식당과 쉬는 포인트</h2>
          <p class="section__desc">대기 시간이 길거나 향이 강한 곳은 제외하고, 좌석 확보와 회복 동선이 쉬운 곳 위주로 골랐습니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${day.foodSpots.map(renderSpotCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">오늘의 운영 팁</h2>
          <p class="section__desc">커플 여행 감성과 컨디션 관리를 동시에 잡기 위한 실전 메모입니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${day.comfortCards.map(renderBulletCard).join("")}
      </div>
    </section>

    ${renderSourcesSection(day.sourceRefs)}
  `;
}

function renderSafety(data) {
  return `
    ${renderHero({
      eyebrow: `<span class="pill pill--warm">위기 대응</span><span class="pill">공항 · 병원 · 분실</span>`,
      title: "당황하지 않도록\n행동 순서를 미리 고정",
      lead: data.safety.intro,
      image: data.safety.heroImage,
      summary: data.safety.summaryCards
    })}

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">즉시 연락처</h2>
          <p class="section__desc">숫자를 외우기 어렵다면 휴대폰 잠금화면 메모와 카카오톡 나에게 보내기에 복사해 두는 구성이 좋습니다.</p>
        </div>
      </div>
      <div class="table-list">
        ${data.safety.emergencyContacts
          .map(
            (item) => `
              <article class="table-row">
                <div>
                  <h3 class="table-row__title">${item.title}</h3>
                  <p class="table-row__text">${item.text}</p>
                </div>
                <div class="table-row__meta">${item.value}</div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">상황별 대응 순서</h2>
          <p class="section__desc">증상이 심해지면 즉시 이동을 멈추고, 둘 중 상태가 나은 사람이 연락과 결제를 담당하도록 역할을 나눕니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${data.safety.scenarios
          .map(
            (scenario) => `
              <article class="scenario-card">
                <div class="spot-card__meta">
                  <span class="badge badge--warn">${scenario.tag}</span>
                </div>
                <h3 class="spot-card__title">${scenario.title}</h3>
                <ul class="list">
                  ${scenario.steps.map((step) => `<li>${step}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">병원 베이스</h2>
          <p class="section__desc">숙소 인근, 북부 동선, 공황 증상 대응을 고려해 바로 떠올릴 수 있는 거점만 남겼습니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${data.safety.hospitals
          .map(
            (hospital) => `
              <article class="contact-card">
                <div class="spot-card__meta">
                  <span class="badge badge--blue">${hospital.area}</span>
                </div>
                <h3 class="spot-card__title">${hospital.name}</h3>
                <p class="spot-card__summary">${hospital.summary}</p>
                <ul class="list">
                  <li>${hospital.address}</li>
                  <li>${hospital.phone}</li>
                  <li>${hospital.note}</li>
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">분실과 귀국 실패 방지</h2>
          <p class="section__desc">타오위안 공항 출발이 새벽 항공편이므로, 여권과 약은 체크인 수하물에 넣지 않는 것이 핵심입니다.</p>
        </div>
      </div>
      <div class="grid grid--2">
        ${data.safety.preventionCards.map(renderBulletCard).join("")}
      </div>
      <p class="footnote">의학적 진단이 아니라 여행 운영 기준입니다. 증상이 빠르게 악화되면 현장 판단보다 즉시 의료기관과 긴급전화 이용을 우선합니다.</p>
    </section>

    ${renderSourcesSection(data.safety.sourceRefs)}
  `;
}

function renderHero(config) {
  return `
    <section class="hero">
      <div class="hero__grid">
        <div class="hero__content">
          <div class="hero__eyebrow">${config.eyebrow}</div>
          <h1 class="hero__title">${config.title.replace("\n", "<br />")}</h1>
          <p class="hero__lead">${config.lead}</p>
          <div class="hero__summary">
            ${config.summary
              .map(
                (item) => `
                  <div class="summary-card">
                    <div class="summary-card__label">${item.label}</div>
                    <div class="summary-card__value">${item.value}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="hero-visual">
          ${renderImage(config.image, config.title)}
        </div>
      </div>
    </section>
  `;
}

function renderTimelineCard(item) {
  return `
    <article class="timeline-card">
      <div class="timeline-card__time">
        <span>${item.time}</span>
        <strong class="timeline-card__slot">${item.title}</strong>
        <span>${item.transport}</span>
      </div>
      <div class="timeline-card__content">
        <div class="timeline-card__visual">
          ${renderImage(item.image, item.title)}
        </div>
        <div class="timeline-card__meta">
          ${item.badges.map(renderBadge).join("")}
        </div>
        <p class="timeline-card__summary">${item.summary}</p>
        <ul class="list">
          ${item.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
        </ul>
        <div class="timeline-card__detail">
          <div class="detail-box">
            <div class="detail-box__label">커플 포인트</div>
            <div class="detail-box__value">${item.coupleTip}</div>
          </div>
          <div class="detail-box">
            <div class="detail-box__label">컨디션 운영</div>
            <div class="detail-box__value">${item.healthTip}</div>
          </div>
        </div>
        <div class="cta-row">
          <a class="button-link button-link--ghost" href="${item.mapUrl}" target="_blank" rel="noreferrer">지도 열기</a>
          ${
            item.backupPlan
              ? `<a class="button-link button-link--ghost" href="${item.backupPlanUrl || item.mapUrl}" target="_blank" rel="noreferrer">대안 동선</a>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

function renderSpotCard(item) {
  return `
    <article class="spot-card">
      <div class="spot-card__visual">
        ${renderImage(item.image, item.title)}
      </div>
      <div class="spot-card__meta">
        ${item.badges.map(renderBadge).join("")}
      </div>
      <h3 class="spot-card__title">${item.title}</h3>
      <p class="spot-card__summary">${item.summary}</p>
      <ul class="list">
        ${item.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
      <div class="cta-row">
        <a class="button-link button-link--ghost" href="${item.mapUrl}" target="_blank" rel="noreferrer">지도 열기</a>
      </div>
    </article>
  `;
}

function renderBulletCard(item) {
  return `
    <article class="quick-card">
      <div class="spot-card__meta">
        <span class="badge badge--good">${item.tag}</span>
      </div>
      <h3 class="spot-card__title">${item.title}</h3>
      <ul class="list">
        ${item.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderBadge(text) {
  const className = text.includes("주의")
    ? "badge badge--warn"
    : text.includes("낮음") || text.includes("회복")
      ? "badge badge--good"
      : "badge";
  return `<span class="${className}">${text}</span>`;
}

function renderImage(src, alt) {
  return `<img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_SPOT}'" />`;
}

function renderActionPanel(data) {
  const panel = currentPage === "index"
    ? data.actionPanels.index
    : currentPage === "safety"
      ? data.actionPanels.safety
      : data.actionPanels[currentPage];

  return `
    <section class="action-card">
      <h2 class="action-card__title">지금 해야 할 일</h2>
      <div class="action-card__body">
        <ul class="list">
          ${panel.steps.map((step) => `<li>${step}</li>`).join("")}
        </ul>
      </div>
    </section>
    <section class="callout">
      <h2 class="callout__title">${panel.calloutTitle}</h2>
      <p class="callout__text">${panel.calloutText}</p>
    </section>
  `;
}

function renderFooterNav() {
  const pages = [
    { id: "index", href: "./index.html", label: "홈" },
    { id: "day1", href: "./day1.html", label: "Day 1" },
    { id: "day2", href: "./day2.html", label: "Day 2" },
    { id: "day3", href: "./day3.html", label: "Day 3" },
    { id: "day4", href: "./day4.html", label: "Day 4" },
    { id: "safety", href: "./safety.html", label: "안전" }
  ];

  return `
    <nav class="footer-nav" aria-label="하단 페이지 이동">
      ${pages
        .map(
          (page) => `
            <a class="${page.id === currentPage ? "is-active" : ""}" href="${page.href}">
              ${page.label}
            </a>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderSourcesSection(sources) {
  return `
    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">공식 참고 링크</h2>
          <p class="section__desc">운영 시간, 관광 안내, 긴급 연락처 확인에 쓴 공식 또는 1차 출처입니다.</p>
        </div>
      </div>
      <div class="source-list">
        ${sources
          .map(
            (source) => `
              <article class="source-card">
                <h3 class="source-card__title">${source.title}</h3>
                <p class="source-card__text">${source.text}</p>
                <div class="cta-row">
                  <a class="button-link button-link--ghost" href="${source.url}" target="_blank" rel="noreferrer">출처 보기</a>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
