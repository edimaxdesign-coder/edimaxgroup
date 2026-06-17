(function () {
  const labels = {
    pageSettings: "首頁設定",
    companies: "公司資料",
    solutions: "解決方案",
    cases: "合作案例",
    contacts: "聯絡我們",
  };

  const fieldSets = {
    pageSettings: [
      "eyebrow",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref",
      "companiesEyebrow",
      "companiesTitle",
      "companiesSummary",
      "solutionsEyebrow",
      "solutionsTitle",
      "solutionsSummary",
      "contactEyebrow",
      "contactTitle",
    ],
    companies: ["shortName", "logo", "url", "tags"],
    solutions: ["accent", "scenarios", "capabilities", "participants", "relatedCases", "image"],
    cases: [
      "type",
      "displayStatus",
      "participants",
      "relatedSolutions",
      "background",
      "featured",
      "publicVisible",
      "anonymous",
    ],
    contacts: ["email", "department"],
  };

  let activeCollection = "pageSettings";
  let editingItem = null;
  let cmsInitialized = false;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const setMessage = (element, text, type = "") => {
    element.textContent = text;
    element.dataset.type = type;
  };

  const renderAccountRows = () => {
    const currentUser = window.AdminAuth.getSession();
    const rows = $("#accountRows");
    rows.innerHTML = window.AdminAuth.getUsers()
      .map(
        (user) => `
          <div class="account-row">
            <span>
              <strong>${escapeHtml(user.name)}</strong>
              <small>${escapeHtml(user.email)} · ${escapeHtml(window.AdminAuth.roles[user.role])}</small>
            </span>
            <span class="status ${user.active ? "published" : "draft"}">${user.active ? "啟用" : "停用"}</span>
            <button
              type="button"
              data-user-action="toggle"
              data-user-id="${escapeHtml(user.id)}"
              ${user.id === currentUser?.id ? "disabled" : ""}
            >${user.active ? "停用" : "啟用"}</button>
          </div>
        `,
      )
      .join("");
  };

  const openAccountDialog = () => {
    renderAccountRows();
    setMessage($("#accountMessage"), "");
    $("#accountDialog").showModal();
  };

  const showAdmin = (user) => {
    $("#authGate").hidden = true;
    $("#adminApp").hidden = false;
    $("#currentUserLabel").textContent = `${user.name} · ${window.AdminAuth.roles[user.role]}`;
    $("#manageUsersButton").hidden = user.role !== "admin";
    if (!cmsInitialized) initCMS();
  };

  const showAuthGate = () => {
    const users = window.AdminAuth.getUsers();
    const isSetup = users.length === 0;
    $("#authGate").hidden = false;
    $("#adminApp").hidden = true;
    $("#authNameField").hidden = !isSetup;
    $("#authNameInput").required = isSetup;
    $("#authPasswordInput").autocomplete = isSetup ? "new-password" : "current-password";
    $("#authTitle").textContent = isSetup ? "建立第一位管理員" : "後台登入";
    $("#authDescription").textContent = isSetup
      ? "首次使用請建立管理員帳號。密碼只保存在這個瀏覽器。"
      : "請使用管理帳號登入後台。";
    $("#authSubmitButton").textContent = isSetup ? "建立管理員並進入" : "登入";
    $("#authForm").reset();
    setMessage($("#authMessage"), "");
  };

  $("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const users = window.AdminAuth.getUsers();
    const isSetup = users.length === 0;
    const authMessage = $("#authMessage");
    try {
      const user = isSetup
        ? await window.AdminAuth.createUser(
            {
              name: $("#authNameInput").value,
              email: $("#authEmailInput").value,
              password: $("#authPasswordInput").value,
              role: "admin",
            },
            { loginAfterCreate: true },
          )
        : await window.AdminAuth.login($("#authEmailInput").value, $("#authPasswordInput").value);
      showAdmin(user);
    } catch (error) {
      setMessage(authMessage, error.message || "登入失敗，請再試一次。", "error");
    }
  });

  $("#logoutButton").addEventListener("click", () => {
    window.AdminAuth.logout();
    showAuthGate();
  });

  $("#manageUsersButton").addEventListener("click", openAccountDialog);
  $("#closeAccountDialogButton").addEventListener("click", () => $("#accountDialog").close());

  $("#accountForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const accountForm = event.currentTarget;
    const accountMessage = $("#accountMessage");
    try {
      await window.AdminAuth.createUser({
        name: $("#accountNameInput").value,
        email: $("#accountEmailInput").value,
        password: $("#accountPasswordInput").value,
        role: $("#accountRoleInput").value,
      });
      accountForm.reset();
      renderAccountRows();
      setMessage(accountMessage, "帳號已建立。", "success");
    } catch (error) {
      setMessage(accountMessage, error.message || "帳號建立失敗。", "error");
    }
  });

  $("#accountRows").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-user-action]");
    if (!button) return;
    try {
      window.AdminAuth.toggleUser(button.dataset.userId);
      renderAccountRows();
    } catch (error) {
      setMessage($("#accountMessage"), error.message || "權限更新失敗。", "error");
    }
  });

  const initCMS = () => {
    cmsInitialized = true;
    const form = $("#contentForm");
    const rows = $("#contentRows");
    const message = $("#formMessage");

    const getItems = () => window.CMSStore.getContent()[activeCollection] || [];

    const setVisibleFields = () => {
      const visible = new Set(fieldSets[activeCollection]);
      $$("[data-field]").forEach((field) => {
        field.hidden = !visible.has(field.dataset.field);
      });
      $("#summaryLabel").textContent =
        activeCollection === "pageSettings"
          ? "Hero 說明"
          : activeCollection === "contacts"
            ? "備註"
            : "摘要";
      $("#publishedLabel").textContent =
        activeCollection === "contacts" || activeCollection === "pageSettings" ? "顯示在前台" : "發布到前台";
      $("#titleInput").closest("label").querySelector("span").textContent =
        activeCollection === "pageSettings"
          ? "Hero 標題"
          : activeCollection === "contacts"
            ? "顯示名稱"
            : "標題";
      $("#newContentButton").hidden = activeCollection === "pageSettings";
    };

    const resetForm = () => {
      editingItem = null;
      form.reset();
      $("#contentId").value = "";
      $("#publishedInput").checked = true;
      $("#accentInput").value = "red";
      $("#imageInput").value = "";
      $("#backgroundInput").value = "linear-gradient(135deg, #edf4ff, #ffffff)";
      $("#displayStatusInput").value = "可對外展示";
      $("#publicVisibleInput").checked = true;
      $("#anonymousInput").checked = true;
      if (activeCollection === "pageSettings") {
        const homeSettings = getItems()[0];
        if (homeSettings) fillForm(homeSettings);
      }
      setMessage(message, "");
    };

    const fillForm = (item) => {
      editingItem = item;
      $("#contentId").value = item.id;
      $("#titleInput").value = item.title || "";
      $("#eyebrowInput").value = item.eyebrow || "";
      $("#shortNameInput").value = item.shortName || "";
      $("#typeInput").value = item.type || "";
      $("#accentInput").value = item.accent || "red";
      $("#displayStatusInput").value = item.displayStatus || "";
      $("#primaryCtaLabelInput").value = item.primaryCtaLabel || "";
      $("#primaryCtaHrefInput").value = item.primaryCtaHref || "";
      $("#secondaryCtaLabelInput").value = item.secondaryCtaLabel || "";
      $("#secondaryCtaHrefInput").value = item.secondaryCtaHref || "";
      $("#emailInput").value = item.email || "";
      $("#departmentInput").value = item.department || "";
      $("#logoInput").value = item.logo || "";
      $("#urlInput").value = item.url || "";
      $("#imageInput").value = item.image || "";
      $("#summaryInput").value = item.summary || "";
      $("#tagsInput").value = (item.tags || []).join(", ");
      $("#scenariosInput").value = (item.scenarios || []).join(", ");
      $("#capabilitiesInput").value = (item.capabilities || []).join(", ");
      $("#participantsInput").value = (item.participants || []).join(", ");
      $("#relatedCasesInput").value = (item.relatedCases || []).join(", ");
      $("#relatedSolutionsInput").value = (item.relatedSolutions || []).join(", ");
      $("#backgroundInput").value = item.background || "";
      $("#featuredInput").checked = Boolean(item.featured);
      $("#publicVisibleInput").checked = item.publicVisible !== false;
      $("#anonymousInput").checked = item.anonymous !== false;
      $("#companiesEyebrowInput").value = item.companiesEyebrow || "";
      $("#companiesTitleInput").value = item.companiesTitle || "";
      $("#companiesSummaryInput").value = item.companiesSummary || "";
      $("#solutionsEyebrowInput").value = item.solutionsEyebrow || "";
      $("#solutionsTitleInput").value = item.solutionsTitle || "";
      $("#solutionsSummaryInput").value = item.solutionsSummary || "";
      $("#contactEyebrowInput").value = item.contactEyebrow || "";
      $("#contactTitleInput").value = item.contactTitle || "";
      $("#publishedInput").checked = Boolean(item.published);
      setMessage(message, `正在編輯：${item.title}`);
    };

    const buildPayload = () => {
      const payload = {
        id: $("#contentId").value || undefined,
        title: $("#titleInput").value,
        summary: $("#summaryInput").value.trim(),
        published: $("#publishedInput").checked,
      };

      if (activeCollection === "pageSettings") {
        payload.id = "page-home";
        payload.eyebrow = $("#eyebrowInput").value.trim();
        payload.primaryCtaLabel = $("#primaryCtaLabelInput").value.trim();
        payload.primaryCtaHref = $("#primaryCtaHrefInput").value.trim();
        payload.secondaryCtaLabel = $("#secondaryCtaLabelInput").value.trim();
        payload.secondaryCtaHref = $("#secondaryCtaHrefInput").value.trim();
        payload.companiesEyebrow = $("#companiesEyebrowInput").value.trim();
        payload.companiesTitle = $("#companiesTitleInput").value.trim();
        payload.companiesSummary = $("#companiesSummaryInput").value.trim();
        payload.solutionsEyebrow = $("#solutionsEyebrowInput").value.trim();
        payload.solutionsTitle = $("#solutionsTitleInput").value.trim();
        payload.solutionsSummary = $("#solutionsSummaryInput").value.trim();
        payload.contactEyebrow = $("#contactEyebrowInput").value.trim();
        payload.contactTitle = $("#contactTitleInput").value.trim();
      }

      if (activeCollection === "companies") {
        payload.shortName = $("#shortNameInput").value.trim();
        payload.logo = $("#logoInput").value.trim();
        payload.url = $("#urlInput").value.trim();
        payload.tags = window.CMSStore.splitList($("#tagsInput").value);
      }

      if (activeCollection === "solutions") {
        payload.accent = $("#accentInput").value;
        payload.image = $("#imageInput").value.trim();
        payload.scenarios = window.CMSStore.splitList($("#scenariosInput").value);
        payload.capabilities = window.CMSStore.splitList($("#capabilitiesInput").value);
        payload.participants = window.CMSStore.splitList($("#participantsInput").value);
        payload.relatedCases = window.CMSStore.splitList($("#relatedCasesInput").value);
      }

      if (activeCollection === "cases") {
        payload.type = $("#typeInput").value.trim();
        payload.displayStatus = $("#displayStatusInput").value.trim();
        payload.participants = window.CMSStore.splitList($("#participantsInput").value);
        payload.relatedSolutions = window.CMSStore.splitList($("#relatedSolutionsInput").value);
        payload.background = $("#backgroundInput").value.trim();
        payload.featured = $("#featuredInput").checked;
        payload.publicVisible = $("#publicVisibleInput").checked;
        payload.anonymous = $("#anonymousInput").checked;
      }

      if (activeCollection === "contacts") {
        payload.email = $("#emailInput").value.trim();
        payload.department = $("#departmentInput").value.trim();
      }

      return payload;
    };

    const renderSummary = (items) => {
      const published = items.filter((item) => item.published).length;
      $("#adminTitle").textContent = labels[activeCollection];
      $("#adminSummary").textContent =
        activeCollection === "pageSettings"
          ? "首頁固定文案、CTA 與各區標題"
          : `已發布 ${published} · 草稿 ${items.length - published} · 全部 ${items.length}`;
    };

    const renderRows = () => {
      const items = getItems();
      renderSummary(items);

      rows.innerHTML = items
        .map((item) => {
          const meta =
            activeCollection === "pageSettings"
              ? "Hero、區塊標題、CTA"
              : activeCollection === "companies"
              ? (item.tags || []).join(", ")
              : activeCollection === "solutions"
                ? `${(item.scenarios || []).join(", ")} · ${(item.participants || []).join(", ")}`
                : activeCollection === "cases"
                  ? `${item.type || "案例"} · ${item.publicVisible === false ? "不公開" : "可公開"} · ${(item.participants || []).join(", ")}`
                  : `${item.department || "一般聯絡"} · ${item.email || ""}`;

          return `
            <div class="admin-row" role="row" data-id="${escapeHtml(item.id)}">
              <span>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.summary)}</small>
              </span>
              <span>${escapeHtml(meta || "尚未設定")}</span>
              <span class="status ${item.published ? "published" : "draft"}">${item.published ? "已發布" : "草稿"}</span>
              <span class="row-actions">
                <button type="button" data-action="edit" data-id="${escapeHtml(item.id)}">編輯</button>
                ${
                  activeCollection === "pageSettings"
                    ? ""
                    : `<button type="button" data-action="toggle" data-id="${escapeHtml(item.id)}">${item.published ? "下架" : "發布"}</button>`
                }
              </span>
            </div>
          `;
        })
        .join("");
    };

    const setActiveCollection = (collection) => {
      activeCollection = collection;
      $$(".admin-menu button[data-collection]").forEach((button) => {
        button.classList.toggle("active", button.dataset.collection === collection);
      });
      setVisibleFields();
      resetForm();
      renderRows();
    };

    $$(".admin-menu button[data-collection]").forEach((button) => {
      button.addEventListener("click", () => setActiveCollection(button.dataset.collection));
    });

    $("#newContentButton").addEventListener("click", resetForm);
    $("#cancelEditButton").addEventListener("click", resetForm);

    rows.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const item = getItems().find((entry) => entry.id === button.dataset.id);
      if (!item) return;

      if (button.dataset.action === "edit") fillForm(item);

      if (button.dataset.action === "toggle") {
        window.CMSStore.togglePublished(activeCollection, item.id);
        renderRows();
        setMessage(message, `${item.title} 已${item.published ? "下架" : "發布"}。`, "success");
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const payload = buildPayload();
        if (activeCollection === "cases" && payload.featured) {
          const content = window.CMSStore.getContent();
          content.cases = content.cases.map((item) =>
            item.id === payload.id ? item : { ...item, featured: false },
          );
          window.CMSStore.saveContent(content);
        }
        window.CMSStore.upsertItem(activeCollection, payload);
        const savedTitle = payload.title.trim();
        resetForm();
        renderRows();
        setMessage(message, `${savedTitle} 已儲存。前台會讀取已發布內容。`, "success");
      } catch (error) {
        setMessage(message, error.message || "儲存失敗，請再試一次。", "error");
      }
    });

    setActiveCollection(activeCollection);
  };

  const session = window.AdminAuth.getSession();
  if (session) showAdmin(session);
  else showAuthGate();
})();
