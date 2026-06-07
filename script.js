const header = document.querySelector(".site-header");

if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  });
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderTags = (tags = []) => tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

const solutionImages = {
  "solution-smart-building": "images/solutions-pages/smart-building-network.jpg",
  "solution-broadband": "images/solutions-pages/broadband-communication.jpg",
  "solution-aiot": "images/solutions-pages/aiot-field-application.jpg",
  "solution-enterprise-security": "images/solutions-pages/enterprise-security-network.jpg",
};

const solutionVisuals = {
  "solution-smart-building":
    "linear-gradient(135deg, rgba(17, 24, 39, 0.22), rgba(215, 25, 32, 0.28)), linear-gradient(145deg, #dbeafe 0%, #ffffff 46%, #ffe4e6 100%)",
  "solution-broadband":
    "linear-gradient(135deg, rgba(17, 24, 39, 0.22), rgba(29, 78, 216, 0.3)), linear-gradient(145deg, #e0f2fe 0%, #ffffff 50%, #dbeafe 100%)",
  "solution-aiot":
    "linear-gradient(135deg, rgba(17, 24, 39, 0.22), rgba(16, 185, 129, 0.3)), linear-gradient(145deg, #dcfce7 0%, #ffffff 48%, #e0f2fe 100%)",
  "solution-enterprise-security":
    "linear-gradient(135deg, rgba(17, 24, 39, 0.3), rgba(55, 65, 81, 0.24)), linear-gradient(145deg, #e5e7eb 0%, #ffffff 46%, #dbeafe 100%)",
};

const renderFrontPage = () => {
  if (!window.CMSStore) return;

  const { companies, solutions, cases } = window.CMSStore.getPublished();
  const companyMatrix = document.querySelector("#companyMatrix");
  const companyLinks = document.querySelector("#companyLinks");
  const solutionGrid = document.querySelector("#solutionGrid");
  const caseLayout = document.querySelector("#caseLayout");

  if (companyMatrix) {
    companyMatrix.innerHTML = companies
      .map(
        (company, index) => `
          <article class="company-card">
            <span class="company-index">${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(company.title)}</h3>
            <p>${escapeHtml(company.summary)}</p>
            <div class="tag-row">${renderTags(company.tags)}</div>
          </article>
        `,
      )
      .join("");
  }

  if (companyLinks) {
    companyLinks.innerHTML = companies
      .map((company) => {
        const name = `<strong class="brand-wordmark">${escapeHtml(company.shortName || company.title)}</strong>`;
        const body = `${name}<small>${escapeHtml((company.tags || []).slice(0, 2).join("與") || company.summary)}</small>`;
        return company.url
          ? `<a href="${escapeHtml(company.url)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(company.shortName || company.title)}">${body}</a>`
          : `<span aria-label="${escapeHtml(company.shortName || company.title)}">${body}</span>`;
      })
      .join("");
  }

  if (solutionGrid) {
    solutionGrid.innerHTML = solutions
      .map((solution, index) => {
        const image = solution.image || solutionImages[solution.id] || "";
        const visual = solutionVisuals[solution.id] || (image ? `url('${escapeHtml(image)}')` : "");
        const imageStyle = visual ? ` style="--solution-image: ${visual}"` : "";

        return `
          <article class="solution-card"${imageStyle}>
            <div class="solution-icon ${escapeHtml(solution.accent || "")}">${String(index + 1).padStart(2, "0")}</div>
            <h3>${escapeHtml(solution.title)}</h3>
            <p>${escapeHtml(solution.summary)}</p>
            <div class="participants">${escapeHtml((solution.participants || []).join(" · "))}</div>
          </article>
        `;
      })
      .join("");
  }

  if (caseLayout) {
    const visibleCases = [...cases];
    const featuredCase = visibleCases.find((item) => item.featured) || visibleCases[0];
    const sideCases = visibleCases.filter((item) => item.id !== featuredCase?.id).slice(0, 3);

    caseLayout.innerHTML = featuredCase
      ? `
        <article class="case-card large case-with-bg" style="--case-image: ${escapeHtml(featuredCase.background)}">
          <div class="case-content">
            <span class="case-type">${escapeHtml(featuredCase.type)}</span>
            <h3>${escapeHtml(featuredCase.title)}</h3>
            <p>${escapeHtml(featuredCase.summary)}</p>
            <div class="case-meta">
              <span>參與公司：${escapeHtml((featuredCase.participants || []).join(" / "))}</span>
              <span>狀態：${escapeHtml(featuredCase.displayStatus || "可對外展示")}</span>
            </div>
          </div>
        </article>
        <div class="case-stack">
          ${sideCases
            .map(
              (item) => `
                <article class="case-card case-with-bg" style="--case-image: ${escapeHtml(item.background)}">
                  <div class="case-content">
                    <span class="case-type">${escapeHtml(item.type)}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.summary)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      `
      : `<div class="empty-state">目前沒有已發布的合作案例。</div>`;
  }

  bindCardHover();
};

const bindCardHover = () => {
  document.querySelectorAll(".company-card, .solution-card, .case-card").forEach((card) => {
    card.addEventListener("pointerenter", () => {
      card.style.transform = "translateY(-3px)";
      card.style.transition = "transform 180ms ease, border-color 180ms ease";
      card.style.borderColor = "rgba(215, 25, 32, 0.28)";
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "translateY(0)";
      card.style.borderColor = "";
    });
  });
};

renderFrontPage();
