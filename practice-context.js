/* URL-scoped practice sequences. No shared last-context storage. */
(function () {
  "use strict";
  function encode(value) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decode(token) {
    try {
      if (!token || token.length > 12000 || !/^[\w-]+$/.test(token)) return null;
      const value = JSON.parse(decodeURIComponent(escape(atob(token.replace(/-/g, "+").replace(/_/g, "/")))));
      if (!value || !["skill", "set", "search"].includes(value.kind)) return null;
      if (value.kind === "skill" && !/^[a-z-]+$/.test(value.slug || "")) return null;
      if (value.kind !== "skill" && (!Array.isArray(value.keys) || !value.keys.length || value.keys.length > 60 || value.keys.some(k => typeof k !== "string" || !/^level-[23]-[a-z-]+-20\d\d:[1-3][a-z]\d?$/.test(k)))) return null;
      return value;
    } catch (error) { return null; }
  }
  function withContext(href, value) {
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return href;
    const token = typeof value === "string" ? value : encode(value);
    if (decode(token)) url.searchParams.set("practice", token);
    return url.pathname + url.search + url.hash;
  }
  let cataloguePromise;
  function catalogue() {
    if (window.CALC_NZ_QUESTION_CATALOGUE) return Promise.resolve(window.CALC_NZ_QUESTION_CATALOGUE);
    if (!cataloguePromise) cataloguePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "question-catalogue.js?v=20261026-1";
      script.onload = () => window.CALC_NZ_QUESTION_CATALOGUE ? resolve(window.CALC_NZ_QUESTION_CATALOGUE) : reject(new Error("Catalogue unavailable"));
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return cataloguePromise;
  }
  function entries(data) {
    return data.levels.flatMap(level => level.standards.flatMap(standard => standard.papers.flatMap(paper => paper.questions.map(question => ({
      key: paper.id + ":" + question.id, href: question.href,
      label: paper.year + " " + standard.label + " · " + question.label,
      standard: standard.id, question: question
    })))));
  }
  async function resolve(token, currentKey) {
    const value = decode(token);
    if (!value) return null;
    const data = await catalogue();
    const all = entries(data), byKey = new Map(all.map(entry => [entry.key, entry]));
    let list, label, returnHref;
    if (value.kind === "skill") {
      list = all.filter(entry => (entry.question.skillSlugs || []).includes(value.slug)
        && (!value.filter || value.filter === "all" || value.filter === entry.standard || value.filter === entry.question.methodTitle));
      // Catalogue order is the same standard/year/part order as the collection.
      label = (window.CALC_NZ_SKILL_LABELS || {})[value.slug] || value.slug.replace(/-/g, " ");
      returnHref = "/skill-" + value.slug + ".html";
      if (value.filter && value.filter !== "all") returnHref += "?filter=" + encodeURIComponent(value.filter);
      if (!list.length) return null;
    } else {
      list = value.keys.map(key => byKey.get(key));
      if (list.some(entry => !entry) || new Set(value.keys).size !== value.keys.length) return null;
      label = value.kind === "set" ? "Practice set" : "Search results";
      returnHref = value.kind === "set" ? "/#saved-practice" : value.return;
      if (value.kind === "search" && (typeof returnHref !== "string" || !/^\/search\.html(?:\?|$)/.test(returnHref))) return null;
    }
    if (!list.some(entry => entry.key === currentKey)) return null;
    if (Number.isFinite(value.at) && value.at >= 0 && value.at <= 1000000) {const back = new URL(returnHref, location.origin);back.searchParams.set("at",String(Math.round(value.at)));returnHref = back.pathname + back.search + back.hash;}
    return { entries: list, label: label, returnHref: returnHref, token: token };
  }
  function rememberPosition() {
    try { history.replaceState(Object.assign({}, history.state, {calcScroll: scrollY}), ""); } catch (error) {}
  }
  function restorePosition() {
    if (document.body.classList.contains("question-page")) return;
    const fromUrl = Number(new URL(location.href).searchParams.get("at"));
    const position = history.state && Number.isFinite(history.state.calcScroll) ? history.state.calcScroll : fromUrl;
    if (Number.isFinite(position) && position >= 0 && position <= 1000000) requestAnimationFrame(() => scrollTo(0,position));
  }
  function prepareLink(event) {
    const link = event.target.closest("a[href]");
    if (!link) return;
    rememberPosition();
    if (document.body.classList.contains("search-page")) {
      const value = decode(new URL(link.href).searchParams.get("practice"));
      if (value && value.kind === "search") {value.at = scrollY; link.href = withContext(link.href,value);}
    }
    const root = link.closest("[data-skill-collection]");
    if (root && link.hasAttribute("data-skill-method")) {
      const active = root.querySelector('[data-skill-filter][aria-pressed="true"]');
      link.href = withContext(link.href, {kind:"skill", slug: document.body.dataset.skill, at:scrollY, filter: active ? active.dataset.skillFilter : "all"});
    }
  }
  document.addEventListener("pointerdown", prepareLink, true);
  document.addEventListener("click", prepareLink, true);
  addEventListener("pagehide", rememberPosition);
  addEventListener("pageshow", restorePosition);
  window.CalcNzPractice = {encode, decode, withContext, resolve, entries, restorePosition};
}());
