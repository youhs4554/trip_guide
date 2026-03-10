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
    { id: "day1", href: "./day1.html", label: "Day1" },
    { id: "day2", href: "./day2.html", label: "Day2" },
    { id: "day3", href: "./day3.html", label: "Day3" },
    { id: "day4", href: "./day4.html", label: "Day4" },
    { id: "safety", href: "./safety.html", label: "Safety" }
  ];

  return `
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__row">
          <a class="brand" href="./index.html" aria-label="${data.site.title} 홈으로 이동">
            <span class="brand__eyebrow">Taipei Couple Guide</span>
            <strong class="brand__title">타이베이 가이드북</strong>
          </a>
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
      title: "천천히 보고 오래 남기는 타이베이 3박 4일",
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
      { id: "route", label: "루트" },
      { id: "practical", label: "준비" },
      { id: "links", label: "링크" }
    ])}

    ${renderActionPanel(data)}

    <section id="overview" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">여행 개요</p>
          <h2 class="section__title">첫 장에서 읽는 여행의 결</h2>
          <p class="section__desc">처음 화면에서는 핵심 선택 기준만 빠르게 읽히게 정리합니다.</p>
        </div>
      </div>
      <div class="editorial-grid">
        ${renderArticleBrief(
          "편집 노트",
          "첫 장면은 대도정, 둘째 날은 Beitou와 Shilin, 마지막은 Tamsui 강변으로 정리했습니다.",
          [
            "장거리 도보와 급한 환승을 줄였습니다.",
            "식사는 좌석 확보와 회복 가능성을 우선했습니다.",
            "피로가 올라오면 바로 대안 동선으로 내릴 수 있습니다."
          ]
        )}
        ${renderArticleBrief(
          "느리게 움직이는 규칙",
          "여행의 완성도보다 하루를 끝낼 때의 표정을 먼저 보는 일정입니다.",
          [
            "야간 무리 일정은 추가하지 않기",
            "30~60분마다 앉을 곳 먼저 확보하기",
            "야시장은 숙소 복귀 쉬운 날에만 짧게 넣기"
          ]
        )}
      </div>
    </section>

    <section id="route" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">루트 요약</p>
          <h2 class="section__title">날짜별 장면과 리듬</h2>
          <p class="section__desc">테마와 핵심 포인트를 먼저 보고, 세부는 펼쳐서 확인합니다.</p>
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
          <h2 class="section__title">출발 전에 챙길 핵심만</h2>
          <p class="section__desc">건강 메모와 체크리스트도 요약 우선으로 구성합니다.</p>
        </div>
      </div>
      <div class="editorial-grid editorial-grid--compact">
        ${data.healthProfiles.map(renderHealthProfile).join("")}
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
          <p class="section__desc">지도와 안전 페이지를 짧은 카드로 유지합니다.</p>
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
      { id: "practical", label: "메모" }
    ])}

    ${renderActionPanel(data)}

    <section id="overview" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">오늘의 개요</p>
          <h2 class="section__title">오늘의 무드와 운영 포인트</h2>
          <p class="section__desc">핵심 선택지만 먼저 읽고 동선을 시작할 수 있게 구성합니다.</p>
        </div>
      </div>
      <div class="editorial-grid">
        ${renderArticleBrief("오늘의 루트", day.routeSummary, day.headlines)}
        ${renderStaticBrief(
          "이동 메모",
          "흐름이 끊기면 택시로 전환하는 것이 기본값입니다.",
          `<div class="cta-row cta-row--editorial"><a class="editorial-link" href="${day.dayMapUrl}" target="_blank" rel="noreferrer">전체 동선 Google Maps</a></div>`
        )}
      </div>
    </section>

    <section id="route" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">루트 요약</p>
          <h2 class="section__title">시간대별 장면</h2>
          <p class="section__desc">구간별 한 줄 요약과 핵심 1개만 기본 노출합니다.</p>
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
          <h2 class="section__title">앉아서 쉬기 좋은 곳만 남기기</h2>
          <p class="section__desc">식당과 카페도 기본 화면에서는 한 줄 요약만 보여줍니다.</p>
        </div>
      </div>
      <div class="story-grid story-grid--compact">
        ${day.foodSpots.map(renderEditorialSpot).join("")}
      </div>
    </section>

    <section id="practical" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">실전 메모</p>
          <h2 class="section__title">오늘을 부드럽게 끝내는 기준</h2>
          <p class="section__desc">체크리스트도 핵심 한 줄과 펼쳐보기 구조로 정리합니다.</p>
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
      title: "당황하지 않도록 행동 순서를 미리 고정",
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
          <p class="section__desc">번호는 기본 화면에 그대로 두고 설명은 짧게 정리합니다.</p>
        </div>
      </div>
      <div class="table-list">
        ${data.safety.emergencyContacts.map(renderEmergencyRow).join("")}
      </div>
    </section>

    <section id="scenarios" class="article-section">
      <div class="section__header section__header--stacked">
        <div>
          <p class="section__kicker">상황별 대응</p>
          <h2 class="section__title">증상별 즉시 행동 순서</h2>
          <p class="section__desc">첫 행동만 기본 노출하고, 전체 절차는 펼쳐서 확인합니다.</p>
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
          <p class="section__desc">병원 정보도 한 줄 요약 후 연락처를 펼쳐보는 방식으로 정리합니다.</p>
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
          <p class="section__desc">체크인 수하물에 넣지 말아야 할 것 중심으로 압축했습니다.</p>
        </div>
      </div>
      <div class="editorial-grid editorial-grid--compact">
        ${data.safety.preventionCards.map(renderChecklistPanel).join("")}
      </div>
      <p class="footnote">의학적 진단이 아니라 여행 운영 기준입니다. 증상이 빠르게 악화되면 즉시 의료기관과 긴급전화 이용을 우선합니다.</p>
    </section>

    ${renderRelatedRoutes()}
    ${renderSourcesSection(data.safety.sourceRefs)}
  `;
}

function renderArticleHeader(config) {
  const lead = getCoreText(config.lead, 82);
  const facts = pickCoreItems(config.facts, 3);

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
          <h1 class="article-head__title">${config.title}</h1>
          <p class="article-head__lead">${lead}</p>
          <div class="article-head__facts">
            ${facts
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
  const coreSummary = getCoreText(summary, 74);
  const visiblePoints = pickCoreItems(points, 1);
  const hiddenPoints = points.slice(visiblePoints.length);

  return `
    <article class="article-brief">
      <span class="article-brief__label">${label}</span>
      <p class="article-brief__summary">${coreSummary}</p>
      ${visiblePoints.length ? renderList(visiblePoints, "outline-list") : ""}
      ${hiddenPoints.length ? renderDisclosure("메모 더 보기", renderList(hiddenPoints, "list list--detail")) : ""}
    </article>
  `;
}

function renderStaticBrief(label, summary, content = "") {
  return `
    <article class="article-brief article-brief--muted">
      <span class="article-brief__label">${label}</span>
      <p class="article-brief__summary">${getCoreText(summary, 72)}</p>
      ${content}
    </article>
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
                <p>${getCoreText(item.summary, 70)}</p>
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
  const keyPoints = pickCoreItems(day.headlines, 1);
  const detailContent = `
    <p class="detail-note">${getDetailText(day.routeSummary, 136)}</p>
    <div class="cta-row cta-row--editorial">
      <a class="editorial-link" href="./${day.id}.html">상세 일정 보기</a>
      <a class="editorial-link editorial-link--muted" href="${day.dayMapUrl}" target="_blank" rel="noreferrer">Google Maps</a>
    </div>
  `;

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
        ${keyPoints.length ? renderList(keyPoints, "list") : ""}
        ${renderDisclosure("오늘 루트 펼치기", detailContent)}
      </div>
    </article>
  `;
}

function renderFeatureStop(item, index) {
  const summary = getCoreText(item.summary, 78);
  const visibleHighlights = pickCoreItems(item.highlights, 1);
  const detailContent = `
    ${renderFactGrid([
      { label: "시간대", value: item.time },
      { label: "이동 수단", value: item.transport },
      { label: "추천 체류", value: pickVisitTone(item.badges) },
      { label: "복귀 판단", value: item.backupPlan ? "대안 동선 확보" : "현 루트 유지" }
    ])}
    ${item.highlights.length ? renderList(item.highlights, "list list--detail") : ""}
    ${renderDetailCopy([
      { label: "커플 포인트", text: item.coupleTip },
      { label: "컨디션 운영", text: item.healthTip },
      item.backupPlan ? { label: "대안 동선", text: item.backupPlan } : null
    ])}
    <div class="cta-row cta-row--editorial">
      <a class="editorial-link editorial-link--muted" href="${item.mapUrl}" target="_blank" rel="noreferrer">Google Maps 열기</a>
    </div>
  `;

  return `
    <article class="feature-stop">
      <div class="feature-stop__header">
        <div class="feature-stop__number">${String(index + 1).padStart(2, "0")}</div>
        <div class="feature-stop__heading">
          <p class="feature-stop__kicker">${item.time} · ${item.transport}</p>
          <h3 class="feature-stop__title">${item.title}</h3>
        </div>
      </div>
      <div class="feature-stop__image">
        ${renderImage(item.image, item.title)}
      </div>
      <div class="feature-stop__meta">
        ${pickCoreItems(item.badges, 2).map(renderBadge).join("")}
      </div>
      <p class="feature-stop__summary">${summary}</p>
      ${visibleHighlights.length ? renderList(visibleHighlights, "list") : ""}
      ${renderDisclosure("이 구간 자세히 보기", detailContent)}
    </article>
  `;
}

function renderEditorialSpot(item) {
  const summary = getCoreText(item.summary, 72);
  const visiblePoints = pickCoreItems(item.points, 1);
  const detailContent = `
    ${item.points.length ? renderList(item.points, "list list--detail") : ""}
    <div class="cta-row cta-row--editorial">
      <a class="editorial-link editorial-link--muted" href="${item.mapUrl}" target="_blank" rel="noreferrer">지도 열기</a>
    </div>
  `;

  return `
    <article class="story-card story-card--compact">
      <div class="story-card__visual">
        ${renderImage(item.image, item.title)}
      </div>
      <div class="story-card__content">
        <div class="spot-card__meta">
          ${pickCoreItems(item.badges, 2).map(renderBadge).join("")}
        </div>
        <h3 class="story-card__title">${item.title}</h3>
        <p class="story-card__summary">${summary}</p>
        ${visiblePoints.length ? renderList(visiblePoints, "list") : ""}
        ${renderDisclosure("메뉴·휴식 포인트 보기", detailContent)}
      </div>
    </article>
  `;
}

function renderHospitalCard(hospital) {
  const summary = getCoreText(hospital.summary, 68);
  const detailContent = `
    ${renderList([hospital.address, hospital.phone, hospital.note], "list list--detail")}
  `;

  return `
    <article class="story-card story-card--textonly">
      <div class="story-card__content">
        <div class="spot-card__meta">
          <span class="badge badge--blue">${hospital.area}</span>
        </div>
        <h3 class="story-card__title">${hospital.name}</h3>
        <p class="story-card__summary">${summary}</p>
        ${renderDisclosure("연락처·위치 보기", detailContent)}
      </div>
    </article>
  `;
}

function renderSafetyScenario(scenario, index) {
  const detailContent = `
    ${renderFactGrid([
      { label: "우선 행동", value: scenario.steps[0] },
      { label: "추천 연락", value: getScenarioContact(scenario.tag) }
    ])}
    <ol class="step-list step-list--detail">
      ${scenario.steps.map((step) => `<li>${step}</li>`).join("")}
    </ol>
  `;

  return `
    <article class="feature-stop feature-stop--safety">
      <div class="feature-stop__header">
        <div class="feature-stop__number">${String(index + 1).padStart(2, "0")}</div>
        <div class="feature-stop__heading">
          <p class="feature-stop__kicker">${scenario.tag}</p>
          <h3 class="feature-stop__title">${scenario.title}</h3>
        </div>
      </div>
      <p class="feature-stop__summary">${getCoreText(scenario.steps[0], 68)}</p>
      ${renderDisclosure("대응 순서 펼치기", detailContent)}
    </article>
  `;
}

function renderHealthProfile(profile) {
  const summary = getCoreText(profile.points[0], 74);
  const detailContent = `
    ${renderList(profile.points, "list list--detail")}
  `;

  return `
    <article class="checklist-card checklist-card--soft">
      <span class="checklist-card__tag">${profile.role} · ${profile.age}</span>
      <h3 class="checklist-card__title">${profile.title}</h3>
      <p class="story-card__summary">${summary}</p>
      ${renderDisclosure("건강 메모 펼치기", detailContent)}
    </article>
  `;
}

function renderChecklistPanel(item) {
  const summary = getCoreText(item.points[0], 72);
  const detailContent = `
    ${renderList(item.points, "list list--detail")}
  `;

  return `
    <article class="checklist-card">
      <span class="checklist-card__tag">${item.tag}</span>
      <h3 class="checklist-card__title">${item.title}</h3>
      <p class="story-card__summary">${summary}</p>
      ${renderDisclosure("체크포인트 펼치기", detailContent)}
    </article>
  `;
}

function renderEmergencyRow(item) {
  return `
    <article class="table-row">
      <div>
        <h3 class="table-row__title">${item.title}</h3>
        <p class="table-row__text">${getCoreText(item.text, 62)}</p>
      </div>
      <div class="table-row__meta">${item.value}</div>
    </article>
  `;
}

function renderLinkStory(link) {
  const isLocal = link.url.startsWith("./");
  const summary = getCoreText(link.text, 62);
  return `
    <article class="story-card story-card--textonly">
      <div class="story-card__content">
        <h3 class="story-card__title">${link.title}</h3>
        <p class="story-card__summary">${summary}</p>
        <div class="cta-row cta-row--editorial">
          <a class="editorial-link" href="${link.url}" ${isLocal ? "" : 'target="_blank" rel="noreferrer"'}>바로 열기</a>
        </div>
      </div>
    </article>
  `;
}

function renderActionPanel(data) {
  const panel = currentPage === "index"
    ? data.actionPanels.index
    : currentPage === "safety"
      ? data.actionPanels.safety
      : data.actionPanels[currentPage];
  const steps = pickCoreItems(panel.steps, 3);
  const calloutText = getCoreText(panel.calloutText, 68);

  return `
    <section class="action-card article-section article-section--note">
      <span class="action-card__eyebrow">Quick Note</span>
      <h2 class="action-card__title">지금 챙길 것</h2>
      <p class="callout__text">${calloutText}</p>
      <ol class="outline-list outline-list--ordered">
        ${steps.map((step) => `<li class="outline-list__item">${step}</li>`).join("")}
      </ol>
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
          <p class="section__desc">관련 페이지도 짧은 링크 리스트로 정리해 모바일에서 빠르게 이동할 수 있게 둡니다.</p>
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
          <p class="section__desc">출처도 한 줄 요약만 먼저 보이고, 링크는 펼쳐서 확인합니다.</p>
        </div>
      </div>
      <div class="article-meta-note">
        <span>최종 정리 ${UPDATED_AT}</span>
        <span>한국인 여행자 기준으로 재서술</span>
        <span>중국어 본문 표기 제외</span>
      </div>
      <div class="source-list source-list--editorial">
        ${sources.map(renderSourceCard).join("")}
      </div>
    </section>
  `;
}

function renderSourceCard(source) {
  const detailContent = `
    <div class="cta-row cta-row--editorial">
      <a class="editorial-link editorial-link--muted" href="${source.url}" target="_blank" rel="noreferrer">출처 보기</a>
    </div>
  `;

  return `
    <article class="source-card source-card--editorial">
      <h3 class="source-card__title">${source.title}</h3>
      <p class="source-card__text">${getCoreText(source.text, 70)}</p>
      ${renderDisclosure("링크 펼치기", detailContent)}
    </article>
  `;
}

function renderDisclosure(label, content) {
  return `
    <details class="expandable">
      <summary class="expandable__summary">
        <span>${label}</span>
      </summary>
      <div class="expandable__content">
        ${content}
      </div>
    </details>
  `;
}

function renderList(items, className = "list") {
  return `
    <ul class="${className}">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderFactGrid(items) {
  return `
    <div class="fact-grid">
      ${items
        .map(
          (item) => `
            <div class="fact-grid__item">
              <span class="fact-grid__label">${item.label}</span>
              <strong class="fact-grid__value">${item.value}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderDetailCopy(items) {
  const rows = items.filter(Boolean);
  if (!rows.length) {
    return "";
  }

  return `
    <div class="detail-copy">
      ${rows
        .map(
          (row) => `
            <div class="detail-copy__row">
              <span class="detail-copy__label">${row.label}</span>
              <p class="detail-copy__text">${getDetailText(row.text, 136)}</p>
            </div>
          `
        )
        .join("")}
    </div>
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

function pickCoreItems(items, limit = 3) {
  return Array.isArray(items) ? items.filter(Boolean).slice(0, limit) : [];
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function getCoreText(value, maxLength = 96) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  const sentenceMatch = normalized.match(/^.+?[.!?](?=\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[0] : normalized;

  if (sentence.length <= maxLength) {
    return sentence;
  }

  const clause = sentence
    .split(/(?:,|·| 그리고 | 하지만 | 그러면 | 이후 )/)[0]
    ?.trim();

  if (clause && clause.length >= Math.min(30, maxLength - 10)) {
    return `${clause}…`;
  }

  return `${sentence.slice(0, maxLength).trimEnd()}…`;
}

function getDetailText(value, maxLength = 160) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
