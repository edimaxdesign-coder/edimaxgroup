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

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value) element.textContent = value;
};

const setLink = (selector, label, href) => {
  const element = document.querySelector(selector);
  if (!element) return;
  if (label) element.textContent = label;
  if (href) element.setAttribute("href", href);
};

const migrateDefaultText = (value, legacyValue, nextValue) => (value === legacyValue ? nextValue : value);

const uniqueList = (items = []) => [...new Set(items.filter(Boolean))];

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

  const content = window.CMSStore.getContent();
  const { companies, solutions, cases, contacts } = window.CMSStore.getPublished();
  const pageSettings = (content.pageSettings || [])[0] || {};
  const companyMatrix = document.querySelector("#companyMatrix");
  const solutionGrid = document.querySelector("#solutionGrid");
  const contactLinks = document.querySelector("#contactLinks");

  setText("#heroEyebrow", pageSettings.eyebrow);
  setText("#heroTitle", pageSettings.title);
  setText("#heroSummary", pageSettings.summary);
  setLink("#primaryCta", pageSettings.primaryCtaLabel, pageSettings.primaryCtaHref);
  setLink("#secondaryCta", pageSettings.secondaryCtaLabel, pageSettings.secondaryCtaHref);
  setText(
    "#companiesEyebrow",
    migrateDefaultText(pageSettings.companiesEyebrow, "Group Companies", "Group Capabilities"),
  );
  setText(
    "#companiesTitle",
    migrateDefaultText(pageSettings.companiesTitle, "集團成員與角色定位", "集團成員與能力矩陣"),
  );
  setText(
    "#companiesSummary",
    migrateDefaultText(
      pageSettings.companiesSummary,
      "先認識各團隊負責的產品線與服務範圍，再依需求進一步查看能力矩陣與方案內容。",
      "整合各公司角色、產品線與專業能力，讓客戶能快速判斷需求應由哪個團隊承接。",
    ),
  );
  setText("#solutionsEyebrow", pageSettings.solutionsEyebrow);
  setText("#solutionsTitle", pageSettings.solutionsTitle);
  setText("#solutionsSummary", pageSettings.solutionsSummary);
  setText("#contactEyebrow", pageSettings.contactEyebrow);
  setText("#contactTitle", pageSettings.contactTitle);

  if (companyMatrix) {
    companyMatrix.innerHTML = companies
      .map(
        (company) => {
          const tagName = company.url ? "a" : "article";
          const linkAttrs = company.url
            ? ` href="${escapeHtml(company.url)}" target="_blank" rel="noreferrer" aria-label="前往 ${escapeHtml(company.title)} 官網"`
            : "";

          return `
          <${tagName} class="company-card${company.url ? " linked" : ""}"${linkAttrs}>
            <h3>${escapeHtml(company.title)}</h3>
            <p>${escapeHtml(company.summary)}</p>
            <div class="tag-row">${renderTags(company.tags)}</div>
          </${tagName}>
        `;
        },
      )
      .join("");
  }

  if (solutionGrid) {
    solutionGrid.innerHTML = solutions
      .map((solution, index) => {
        const image = solution.image || solutionImages[solution.id] || "";
        const visual = solutionVisuals[solution.id] || (image ? `url('${escapeHtml(image)}')` : "");
        const imageStyle = visual ? ` style="--solution-image: ${visual}"` : "";
        const relatedCaseIds = uniqueList([
          ...(solution.relatedCases || []),
          ...cases
            .filter((item) => (item.relatedSolutions || []).includes(solution.id))
            .map((item) => item.id),
        ]);
        const relatedCases = relatedCaseIds
          .map((caseId) => cases.find((item) => item.id === caseId && item.publicVisible !== false))
          .filter(Boolean);

        return `
          <article class="solution-card"${imageStyle}>
            <div class="solution-card-main">
              <div class="solution-icon ${escapeHtml(solution.accent || "")}">${String(index + 1).padStart(2, "0")}</div>
              <h3>${escapeHtml(solution.title)}</h3>
              <p>${escapeHtml(solution.summary)}</p>
            </div>
            <div class="solution-detail">
              <div>
                <strong>適用場景</strong>
                <div class="tag-row light">${renderTags(solution.scenarios || [])}</div>
              </div>
              <div>
                <strong>能力組合</strong>
                <div class="tag-row light">${renderTags(solution.capabilities || [])}</div>
              </div>
              <div class="participants">參與公司：${escapeHtml((solution.participants || []).join(" · "))}</div>
              ${
                relatedCases.length
                  ? `<div class="related-cases">
                      <strong>導入實績</strong>
                      ${relatedCases
                        .map(
                          (item) => `
                            <div class="related-case">
                              <span>${escapeHtml(item.type || "案例")}</span>
                              <b>${escapeHtml(item.anonymous ? `${item.title}（匿名）` : item.title)}</b>
                              <small>${escapeHtml(item.summary)}</small>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>`
                  : `<div class="related-cases empty">目前尚未設定可公開案例。</div>`
              }
            </div>
          </article>
        `;
      })
      .join("");
  }

  if (contactLinks) {
    const contactEmails = [
      ...new Set(
        contacts
          .map((contact) => contact.email?.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    contactLinks.innerHTML = contactEmails.length
      ? `<a class="contact-button primary-button" href="mailto:${escapeHtml(contactEmails.join(","))}">聯絡我們</a>`
      : `<a class="contact-button primary-button" href="https://www.edimax.com/edimax/form/contact_us/data/edimax/global/contact_us/" target="_blank" rel="noreferrer">聯絡我們</a>`;
    contactLinks.hidden = false;
  }

  bindCardHover();
};

const bindCardHover = () => {
  document.querySelectorAll(".company-card, .solution-card").forEach((card) => {
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
