const DATA_PATH = "./assets/data/trip-data.json";
const FALLBACK_SPOT = "./assets/images/fallbacks/spot-fallback.svg";
const UPDATED_AT = "2026. 3. 9.";

const root = document.getElementById("app");
const currentPage = document.body.dataset.page || "index";

bootstrap().catch((error) => {
  console.error(error);
  root.innerHTML = `
    <div class="site-shell">
      <section class="article-section article-section--error">
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
      <div class="page-main">
        ${renderPage(data)}
      </div>
    </div>
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
  const links = [
    { id: "index", href: "./index.html", label: "Home" },
    { id: "day1", href: "./day1.html", label: "Day 1" },
    { id: "day2", href: "./day2.html", label: "Day 2" },
    { id: "day3", href: "./day3.html", label: "Day 3" },
    { id: "day4", href: "./day4.html", label: "Day 4" },
    { id: "safety", href: "./safety.html", label: "Safety" }
  ];

  return `
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__row">
          <div class="brand">
            <span class="brand__eyebrow">Taipei Slow Trip Notes</span>
            <strong class="brand__title">${data.site.title}</strong>
            <span class="brand__meta">${data.site.window} · ${data.site.lodging}</span>
          </div>
          <div class="status-strip">
            <span class="pill">입국 픽업 완료</span>
            <span class="pill pill--warm">3/15 22:00 출국 샌딩 완료</span>
            <span class="pill pill--neutral">저강도 동선 기준</span>
          </div>
        </div>
        <nav class="topbar__nav" aria-label="상단 페이지 이동">
          ${links
            .map(
              (link) => `
                <a class="topbar__link ${link.id === currentPage ? "is-active" : ""}" href="${link.href}">
                  ${link.label}
                </a>
              `
            )
            .join("")}
        </nav>
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
  const dayOverview = data.days.map((day) => ({
    title: `${day.navLabel} · ${day.theme}`,
    summary: day.routeSummary,
    meta: `${day.dateLabel} · ${day.energy}`
  }));

  return `
    ${renderArticleHeader({
      eyebrow: "타이베이 커플 가이드",
      category: "3박 4일 저강도 여행 설계",
      area: "닝샤 야시장 베이스",
      title: "천천히 보고 오래 남기는\n타이베이 3박 4일",
      lead: data.site.summary,
      image: data.site.heroImage,
      facts: [
        { label: "출국", value: data.site.flights.depart },
        { label: "귀국", value: data.site.flights.return },
        { label: "숙소", value: data.site.lodging }
      ]
    })}

    ${renderSectionTabs([
      { id: "overview", label: "개요" },
      { id: "route", label: "날짜별 루트" },
      { id: "practical", label: "건강·준비" },
      { id: "links", label: "링크" }
    ])}

    ${renderActionPanel(data)}

    <section id="overview" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">여행 개요</p>
          <h2 class="section__title">첫 장에서 읽는 여행의 결</h2>
          <p class="section__desc">많이 보는 여행이 아니라, 오래 걷지 않아도 장면이 남는 순서로 정리했습니다.</p>
        </div>
      </div>
      <div class="editorial-grid">
        ${renderArticleBrief(
          "편집 노트",
          "첫 장면은 대도정의 오후, 둘째 장면은 Beitou의 김과 Shilin의 정원, 마지막 바깥 장면은 Tamsui 강변의 바람으로 정리했습니다.",
          [
            "택시와 MRT를 섞어 계단과 장거리 도보를 줄였습니다.",
            "식사는 실내 좌석 확보, 기름기 조절, 당 보충 가능 여부를 우선했습니다.",
            "하루 강도가 올라가면 바로 대안 동선으로 내릴 수 있게 설계했습니다."
          ]
        )}
        <div class="article-brief article-brief--muted">
          <span class="article-brief__label">느리게 움직이는 규칙</span>
          <p class="article-brief__summary">여행의 완성도보다 하루를 끝낼 때의 표정이 더 중요하다는 전제로 움직입니다. 무릎, 당 조절, 위장 부담을 고려해 아래 기준을 고정합니다.</p>
          <ul class="outline-list">
            <li class="outline-list__item">오전 시작은 늦춰도 되지만 야간 무리 일정은 추가하지 않기</li>
            <li class="outline-list__item">30~60분마다 앉을 수 있는 장소를 먼저 확보하기</li>
            <li class="outline-list__item">야시장은 체류 시간을 줄이고 숙소 복귀 난도가 낮은 날에만 넣기</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="route" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">루트 한눈에 보기</p>
          <h2 class="section__title">날짜별 장면과 리듬</h2>
          <p class="section__desc">먼저 전체 흐름을 보고, 각 날짜의 무드와 휴식 타이밍을 페이지별로 이어 읽는 구조입니다.</p>
        </div>
      </div>
      ${renderRouteOverview(dayOverview)}
      <div class="story-grid story-grid--days">
        ${data.days.map(renderDayStory).join("")}
      </div>
    </section>

    <section id="practical" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">건강·준비</p>
          <h2 class="section__title">출발 전에 마음을 가볍게 만드는 메모</h2>
          <p class="section__desc">의료 조언이 아니라, 낯선 도시에서 결정을 단순하게 만들기 위한 여행 운영 기준입니다.</p>
        </div>
      </div>
      <div class="editorial-grid editorial-grid--compact">
        ${data.healthProfiles
          .map(
            (profile) => `
              <article class="checklist-card checklist-card--soft">
                <span class="checklist-card__tag">${profile.role} · ${profile.age}</span>
                <h3 class="checklist-card__title">${profile.title}</h3>
                <ul class="list">
                  ${profile.points.map((point) => `<li>${point}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="editorial-grid editorial-grid--compact">
        ${data.preTripChecklist.map(renderChecklistPanel).join("")}
      </div>
    </section>

    <section id="links" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">핵심 링크</p>
          <h2 class="section__title">현장에선 이 링크만 열면 됩니다</h2>
          <p class="section__desc">Google Maps 앵커와 안전 페이지를 한곳에 모아, 찾느라 리듬이 끊기지 않게 했습니다.</p>
        </div>
      </div>
      <div class="story-grid story-grid--compact">
        ${data.site.links.map(renderLinkStory).join("")}
      </div>
    </section>

    ${renderRelatedRoutes()}
    ${renderSourcesSection(data.site.sourceRefs)}
  `;
}

function renderDay(data, day) {
  return `
    ${renderArticleHeader({
      eyebrow: day.dateLabel,
      category: "일정 상세",
      area: day.theme,
      title: day.heroTitle,
      lead: day.heroLead,
      image: day.heroImage,
      facts: day.summaryCards
    })}

    ${renderSectionTabs([
      { id: "overview", label: "개요" },
      { id: "route", label: "동선" },
      { id: "eats", label: "먹기" },
      { id: "practical", label: "실전 정보" }
    ])}

    ${renderActionPanel(data)}

    <section id="overview" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">오늘의 개요</p>
          <h2 class="section__title">오늘의 무드와 운영 포인트</h2>
          <p class="section__desc">긴 설명보다, 오늘 어떤 장면을 남기고 어디서 쉬어야 하는지만 빠르게 보이게 정리했습니다.</p>
        </div>
      </div>
      <div class="editorial-grid">
        ${renderArticleBrief("오늘의 루트", day.routeSummary, day.headlines)}
        <div class="article-brief article-brief--muted">
          <span class="article-brief__label">이동 메모</span>
          <p class="article-brief__summary">전체 동선은 Google Maps 앵커와 함께 보면 훨씬 선명해집니다. 현장에서 흐름이 끊기면 곧바로 택시로 바꾸는 것이 이 일정의 기본값입니다.</p>
          <div class="cta-row cta-row--editorial">
            <a class="editorial-link" href="${day.dayMapUrl}" target="_blank" rel="noreferrer">전체 동선 Google Maps</a>
          </div>
        </div>
      </div>
    </section>

    <section id="route" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">루트 한눈에 보기</p>
          <h2 class="section__title">시간대별 장면</h2>
          <p class="section__desc">먼저 흐름을 보고, 각 구간에서 무엇을 줄이고 무엇을 남길지 바로 판단할 수 있게 구성했습니다.</p>
        </div>
      </div>
      ${renderRouteOverview(
        day.timeline.map((item) => ({
          title: item.title,
          summary: item.summary,
          meta: `${item.time} · ${item.transport}`
        }))
      )}
      <div class="feature-list">
        ${day.timeline.map((item, index) => renderFeatureStop(item, index)).join("")}
      </div>
    </section>

    <section id="eats" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">음식·휴식</p>
          <h2 class="section__title">앉아서 쉬기 좋은 식탁과 카페</h2>
          <p class="section__desc">줄이 길거나 향이 강한 곳은 덜어내고, 좌석 확보와 회복에 유리한 장소만 남겼습니다.</p>
        </div>
      </div>
      <div class="story-grid story-grid--compact">
        ${day.foodSpots.map(renderEditorialSpot).join("")}
      </div>
    </section>

    <section id="practical" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">실전 정보</p>
          <h2 class="section__title">오늘을 부드럽게 끝내는 메모</h2>
          <p class="section__desc">커플 여행의 분위기와 컨디션 관리를 함께 지키기 위한 메모만 남겼습니다.</p>
        </div>
      </div>
      <div class="editorial-grid editorial-grid--compact">
        ${day.comfortCards.map(renderChecklistPanel).join("")}
      </div>
    </section>

    ${renderRelatedRoutes()}
    ${renderSourcesSection(day.sourceRefs)}
  `;
}

function renderSafety(data) {
  return `
    ${renderArticleHeader({
      eyebrow: "위기 대응",
      category: "공항 · 병원 · 분실",
      area: "타이베이 여행 안전 매뉴얼",
      title: "당황하지 않도록\n행동 순서를 미리 고정",
      lead: data.safety.intro,
      image: data.safety.heroImage,
      facts: data.safety.summaryCards
    })}

    ${renderSectionTabs([
      { id: "contacts", label: "긴급 연락" },
      { id: "scenarios", label: "상황별 대응" },
      { id: "medical", label: "병원" },
      { id: "prevention", label: "예방" }
    ])}

    ${renderActionPanel(data)}

    <section id="contacts" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">긴급 연락</p>
          <h2 class="section__title">먼저 저장할 번호</h2>
          <p class="section__desc">외우기 어렵다면 잠금화면 메모와 카카오톡 나에게 보내기에 같이 저장해 두는 편이 좋습니다.</p>
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

    <section id="scenarios" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">상황별 대응</p>
          <h2 class="section__title">증상별 즉시 행동 순서</h2>
          <p class="section__desc">증상이 심해지면 이동을 멈추고, 상태가 더 안정적인 사람이 연락과 결제를 맡는 구조로 역할을 나눕니다.</p>
        </div>
      </div>
      <div class="feature-list feature-list--safety">
        ${data.safety.scenarios.map((scenario, index) => renderSafetyScenario(scenario, index)).join("")}
      </div>
    </section>

    <section id="medical" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">병원 베이스</p>
          <h2 class="section__title">기억해야 할 진료 거점</h2>
          <p class="section__desc">숙소 인근, 북부 동선, 공황 증상 대응을 고려해 바로 떠올릴 수 있는 곳만 남겼습니다.</p>
        </div>
      </div>
      <div class="story-grid story-grid--compact">
        ${data.safety.hospitals.map(renderHospitalCard).join("")}
      </div>
    </section>

    <section id="prevention" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">예방 메모</p>
          <h2 class="section__title">분실과 귀국 실패 방지</h2>
          <p class="section__desc">새벽 공항편 전제이므로 여권, 약, 충전기, 저혈당 대비 간식을 체크인 수하물에 넣지 않는 것이 핵심입니다.</p>
        </div>
      </div>
      <div class="editorial-grid editorial-grid--compact">
        ${data.safety.preventionCards.map(renderChecklistPanel).join("")}
      </div>
      <p class="footnote">의학적 진단이 아니라 여행 운영 기준입니다. 증상이 빠르게 악화되면 현장 판단보다 즉시 의료기관과 긴급전화 이용을 우선합니다.</p>
    </section>

    ${renderRelatedRoutes()}
    ${renderSourcesSection(data.safety.sourceRefs)}
  `;
}

function renderArticleHeader(config) {
  return `
    <section class="article-head">
      <div class="article-head__meta">
        <span class="article-head__eyebrow">${config.eyebrow}</span>
        <span class="article-head__dot"></span>
        <span class="article-head__category">${config.category}</span>
        <span class="article-head__dot"></span>
        <span class="article-head__area">${config.area}</span>
        <span class="article-head__update">최종 정리 ${UPDATED_AT}</span>
      </div>
      <div class="article-head__grid">
        <div class="article-head__content">
          <h1 class="article-head__title">${config.title.split("\n").join("<br />")}</h1>
          <p class="article-head__lead">${config.lead}</p>
          <div class="article-head__facts">
            ${config.facts
              .map(
                (fact) => `
                  <div class="article-head__fact">
                    <span>${fact.label}</span>
                    <strong>${fact.value}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="article-head__hero">
          ${renderImage(config.image, config.title)}
        </div>
      </div>
    </section>
  `;
}

function renderSectionTabs(items) {
  return `
    <nav class="section-tabs" aria-label="섹션 바로가기">
      ${items
        .map(
          (item) => `
            <a class="section-tabs__link" href="#${item.id}">${item.label}</a>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderArticleBrief(label, summary, points = []) {
  return `
    <div class="article-brief">
      <span class="article-brief__label">${label}</span>
      <p class="article-brief__summary">${summary}</p>
      ${points.length ? `<ul class="outline-list">${points.map((point) => `<li class="outline-list__item">${point}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function renderRouteOverview(items) {
  return `
    <ol class="route-overview">
      ${items
        .map(
          (item, index) => `
            <li class="route-overview__item">
              <span class="route-overview__number">${String(index + 1).padStart(2, "0")}</span>
              <div class="route-overview__body">
                <strong>${item.title}</strong>
                <p>${item.summary}</p>
                <span>${item.meta}</span>
              </div>
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function renderDayStory(day) {
  return `
    <article class="story-card">
      <div class="story-card__visual">
        ${renderImage(day.heroImage, day.navLabel)}
      </div>
      <div class="story-card__content">
        <div class="spot-card__meta">
          <span class="badge badge--blue">${day.dateLabel}</span>
          <span class="badge">${day.energy}</span>
        </div>
        <h3 class="story-card__title">${day.navLabel}</h3>
        <p class="story-card__summary">${day.theme}</p>
        <ul class="list">
          ${day.headlines.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <div class="cta-row cta-row--editorial">
          <a class="editorial-link" href="./${day.id}.html">상세 일정 보기</a>
          <a class="editorial-link editorial-link--muted" href="${day.dayMapUrl}" target="_blank" rel="noreferrer">Google Maps</a>
        </div>
      </div>
    </article>
  `;
}

function renderFeatureStop(item, index) {
  return `
    <article class="feature-stop">
      <div class="feature-stop__header">
        <div class="feature-stop__number">${String(index + 1).padStart(2, "0")}</div>
        <div class="feature-stop__heading">
          <p class="feature-stop__kicker">${item.time} · ${item.transport}</p>
          <h3 class="feature-stop__title">${item.title}</h3>
        </div>
        <a class="editorial-link editorial-link--muted" href="${item.mapUrl}" target="_blank" rel="noreferrer">지도 열기</a>
      </div>
      <div class="feature-stop__image">
        ${renderImage(item.image, item.title)}
      </div>
      <div class="feature-stop__meta">
        ${item.badges.map(renderBadge).join("")}
      </div>
      <p class="feature-stop__summary">${item.summary}</p>
      <div class="feature-stop__layout">
        <div class="feature-stop__body">
          <section class="editorial-note editorial-note--rule">
            <h4 class="editorial-note__title">이 구간에서 할 일</h4>
            <ul class="list">
              ${item.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
            </ul>
          </section>
          <section class="editorial-note editorial-note--columns">
            <p><strong>커플 포인트</strong>${item.coupleTip}</p>
            <p><strong>컨디션 운영</strong>${item.healthTip}</p>
            ${item.backupPlan ? `<p><strong>대안 동선</strong>${item.backupPlan}</p>` : ""}
          </section>
        </div>
        <aside class="feature-stop__aside">
          <div class="feature-stop__fact">
            <span>시간대</span>
            <strong>${item.time}</strong>
          </div>
          <div class="feature-stop__fact">
            <span>이동 수단</span>
            <strong>${item.transport}</strong>
          </div>
          <div class="feature-stop__fact">
            <span>추천 체류 톤</span>
            <strong>${pickVisitTone(item.badges)}</strong>
          </div>
          <div class="feature-stop__fact">
            <span>복귀 판단</span>
            <strong>${item.backupPlan ? "대안 동선 확보" : "현 루트 유지"}</strong>
          </div>
        </aside>
      </div>
    </article>
  `;
}

function renderEditorialSpot(item) {
  return `
    <article class="story-card story-card--compact">
      <div class="story-card__visual">
        ${renderImage(item.image, item.title)}
      </div>
      <div class="story-card__content">
        <div class="spot-card__meta">
          ${item.badges.map(renderBadge).join("")}
        </div>
        <h3 class="story-card__title">${item.title}</h3>
        <p class="story-card__summary">${item.summary}</p>
        <ul class="list">
          ${item.points.map((point) => `<li>${point}</li>`).join("")}
        </ul>
        <div class="cta-row cta-row--editorial">
          <a class="editorial-link" href="${item.mapUrl}" target="_blank" rel="noreferrer">지도 열기</a>
        </div>
      </div>
    </article>
  `;
}

function renderHospitalCard(hospital) {
  return `
    <article class="story-card story-card--textonly">
      <div class="story-card__content">
        <div class="spot-card__meta">
          <span class="badge badge--blue">${hospital.area}</span>
        </div>
        <h3 class="story-card__title">${hospital.name}</h3>
        <p class="story-card__summary">${hospital.summary}</p>
        <ul class="list">
          <li>${hospital.address}</li>
          <li>${hospital.phone}</li>
          <li>${hospital.note}</li>
        </ul>
      </div>
    </article>
  `;
}

function renderSafetyScenario(scenario, index) {
  return `
    <article class="feature-stop feature-stop--safety">
      <div class="feature-stop__header">
        <div class="feature-stop__number">${String(index + 1).padStart(2, "0")}</div>
        <div class="feature-stop__heading">
          <p class="feature-stop__kicker">${scenario.tag}</p>
          <h3 class="feature-stop__title">${scenario.title}</h3>
        </div>
      </div>
      <div class="feature-stop__layout">
        <div class="feature-stop__body">
          <section class="editorial-note editorial-note--rule">
            <h4 class="editorial-note__title">즉시 행동 순서</h4>
            <ol class="step-list">
              ${scenario.steps.map((step) => `<li>${step}</li>`).join("")}
            </ol>
          </section>
        </div>
        <aside class="feature-stop__aside">
          <div class="feature-stop__fact">
            <span>우선 행동</span>
            <strong>${scenario.steps[0]}</strong>
          </div>
          <div class="feature-stop__fact">
            <span>추천 연락</span>
            <strong>${getScenarioContact(scenario.tag)}</strong>
          </div>
        </aside>
      </div>
    </article>
  `;
}

function renderChecklistPanel(item) {
  return `
    <article class="checklist-card">
      <span class="checklist-card__tag">${item.tag}</span>
      <h3 class="checklist-card__title">${item.title}</h3>
      <ul class="list">
        ${item.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderLinkStory(link) {
  const isLocal = link.url.startsWith("./");
  return `
    <article class="story-card story-card--textonly">
      <div class="story-card__content">
        <h3 class="story-card__title">${link.title}</h3>
        <p class="story-card__summary">${link.text}</p>
        <div class="cta-row cta-row--editorial">
          <a class="editorial-link" href="${link.url}" ${isLocal ? "" : 'target="_blank" rel="noreferrer"'}>바로 열기</a>
        </div>
      </div>
    </article>
  `;
}

function renderBadge(text) {
  const className = text.includes("주의") || text.includes("혼잡")
    ? "badge badge--warn"
    : text.includes("낮음") || text.includes("회복") || text.includes("휴식") || text.includes("복귀 쉬움")
      ? "badge badge--good"
      : text.includes("사진") || text.includes("야간")
        ? "badge badge--blue"
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
    <section class="action-card article-section article-section--note">
      <span class="action-card__eyebrow">Editor's Note</span>
      <h2 class="action-card__title">지금 챙길 것</h2>
      <ol class="outline-list outline-list--ordered">
        ${panel.steps.map((step) => `<li class="outline-list__item">${step}</li>`).join("")}
      </ol>
      <div class="action-card__divider"></div>
      <p class="action-card__kicker">${panel.calloutTitle}</p>
      <p class="callout__text">${panel.calloutText}</p>
    </section>
  `;
}

function renderRelatedRoutes() {
  const pages = [
    { id: "index", href: "./index.html", label: "전체 일정", note: "여행 전체 구조와 준비 메모" },
    { id: "day1", href: "./day1.html", label: "Day 1", note: "도착 회복 · 대도정 · 닝샤" },
    { id: "day2", href: "./day2.html", label: "Day 2", note: "Beitou · Shilin 중심" },
    { id: "day3", href: "./day3.html", label: "Day 3", note: "Tamsui · Bali 강변 루트" },
    { id: "day4", href: "./day4.html", label: "Day 4", note: "귀국 전 마지막 운영 메모" },
    { id: "safety", href: "./safety.html", label: "안전 매뉴얼", note: "병원 · 분실 · 공항 대응" }
  ];

  return `
    <section class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">이어 읽기</p>
          <h2 class="section__title">다음에 펼칠 페이지</h2>
          <p class="section__desc">고정 하단 메뉴 대신, 기사형 흐름에 맞게 다음 페이지를 자연스럽게 이어 보도록 정리했습니다.</p>
        </div>
      </div>
      <div class="story-grid story-grid--compact">
        ${pages
          .filter((page) => page.id !== currentPage)
          .map(
            (page) => `
              <article class="story-card story-card--textonly">
                <div class="story-card__content">
                  <h3 class="story-card__title">${page.label}</h3>
                  <p class="story-card__summary">${page.note}</p>
                  <div class="cta-row cta-row--editorial">
                    <a class="editorial-link" href="${page.href}">페이지 열기</a>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderSourcesSection(sources) {
  return `
    <section class="article-section article-section--sources">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">취재 메모</p>
          <h2 class="section__title">마지막으로 확인한 출처</h2>
          <p class="section__desc">운영 시간과 긴급 연락처는 출발 직전에 한 번 더 확인하는 편이 가장 안전합니다.</p>
        </div>
      </div>
      <div class="article-meta-note">
        <span>최종 정리 ${UPDATED_AT}</span>
        <span>한국인 여행자 기준으로 재서술</span>
        <span>중국어 본문 표기 제외</span>
      </div>
      <div class="source-list source-list--editorial">
        ${sources
          .map(
            (source) => `
              <article class="source-card source-card--editorial">
                <h3 class="source-card__title">${source.title}</h3>
                <p class="source-card__text">${source.text}</p>
                <div class="cta-row cta-row--editorial">
                  <a class="editorial-link editorial-link--muted" href="${source.url}" target="_blank" rel="noreferrer">출처 보기</a>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function pickVisitTone(badges) {
  if (badges.some((badge) => badge.includes("회복") || badge.includes("휴식"))) {
    return "오래 머무르기";
  }

  if (badges.some((badge) => badge.includes("혼잡") || badge.includes("주의"))) {
    return "짧게 보고 빠지기";
  }

  return "천천히 둘러보기";
}

function getScenarioContact(tag) {
  if (tag.includes("공항") || tag.includes("변수")) {
    return "호텔 프런트 · 예약처 · 항공사";
  }

  if (tag.includes("도난") || tag.includes("분실")) {
    return "경찰 110";
  }

  if (tag.includes("공황")) {
    return "119 또는 가까운 응급실";
  }

  return "119 또는 가까운 병원";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
