(function () {
  const STORAGE_KEY = "edimax-group-cms-content-v1";
  const COLLECTIONS = ["companies", "solutions", "cases"];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const seed = () => clone(window.CMS_SEED_DATA || {});
  const normalizeItems = (items) => (Array.isArray(items) ? items : []);

  const normalizeContent = (content) => {
    const next = seed();
    COLLECTIONS.forEach((collection) => {
      const seedItems = normalizeItems(next[collection]);
      const incomingItems = normalizeItems(content && content[collection]);
      const shouldRefreshSeedCopy = (content?.copyVersion || 0) < (next.copyVersion || 0);
      next[collection] = incomingItems.length
        ? incomingItems.map((item) => {
            const seedItem = seedItems.find((entry) => entry.id === item.id);
            if (!seedItem) return item;
            return shouldRefreshSeedCopy
              ? { ...item, ...seedItem, published: item.published }
              : { ...seedItem, ...item };
          })
        : seedItems;
    });
    return next;
  };

  const getContent = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return normalizeContent(stored ? JSON.parse(stored) : seed());
    } catch (error) {
      console.warn("CMS content fallback to seed data.", error);
      return seed();
    }
  };

  const saveContent = (content) => {
    const normalized = normalizeContent(content);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  };

  const slugify = (text) =>
    String(text || "item").trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "item";

  const uniqueId = (collection, title, existingItems) => {
    const base = `${collection.slice(0, -1)}-${slugify(title)}`;
    const used = new Set(existingItems.map((item) => item.id));
    if (!used.has(base)) return base;
    let index = 2;
    while (used.has(`${base}-${index}`)) index += 1;
    return `${base}-${index}`;
  };

  const splitList = (text) => String(text || "").split(",").map((item) => item.trim()).filter(Boolean);
  const findDuplicateTitle = (items, title, currentId) => items.some((item) => item.id !== currentId && item.title.trim() === title.trim());

  const upsertItem = (collection, payload) => {
    const content = getContent();
    const items = normalizeItems(content[collection]);
    const title = String(payload.title || "").trim();
    if (!title) throw new Error("請先輸入標題。");
    if (findDuplicateTitle(items, title, payload.id)) throw new Error("已有相同標題，請改用編輯既有內容。");
    const existing = items.find((item) => item.id === payload.id);
    const nextItem = { ...(existing || {}), ...payload, id: existing ? existing.id : uniqueId(collection, title, items), title };
    content[collection] = existing ? items.map((item) => (item.id === existing.id ? nextItem : item)) : [...items, nextItem];
    return saveContent(content);
  };

  const togglePublished = (collection, id) => {
    const content = getContent();
    content[collection] = normalizeItems(content[collection]).map((item) => item.id === id ? { ...item, published: !item.published } : item);
    return saveContent(content);
  };

  const getPublished = () => {
    const content = getContent();
    const published = {};
    COLLECTIONS.forEach((collection) => { published[collection] = normalizeItems(content[collection]).filter((item) => item.published); });
    return published;
  };

  window.CMSStore = { collections: COLLECTIONS, getContent, getPublished, saveContent, upsertItem, togglePublished, splitList };
})();
