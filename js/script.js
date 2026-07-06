(() => {
  "use strict";

  /* ---------------------------------------------------------
     Icon set (monoline SVG paths, 24x24 viewBox, stroke=currentColor)
     --------------------------------------------------------- */
  const ICONS = {
    profile: '<circle cx="12" cy="8.5" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    research: '<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.4"/><ellipse cx="12" cy="12" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.4" transform="rotate(120 12 12)"/>',
    projects: '<rect x="7" y="7" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    publications: '<path d="M6 3.5h9l3 3V20.5H6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 10h6M9 13.4h6M9 16.8h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    experience: '<rect x="3" y="8" width="18" height="11" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 13h18" stroke="currentColor" stroke-width="1.4"/>',
    contact: '<circle cx="12" cy="12" r="1.7" fill="currentColor"/><path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 15.8a5.4 5.4 0 0 0 0-7.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5.3 18.7a9.6 9.6 0 0 1 0-13.4M18.7 18.7a9.6 9.6 0 0 0 0-13.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
  };

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  const state = {
    lang: null,
    data: null,
    section: null,
    tab: null,
    history: [] // stack of view names for the back button
  };

  /* ---------------------------------------------------------
     DOM refs
     --------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const views = {
    welcome: $("view-welcome"),
    dashboard: $("view-dashboard"),
    section: $("view-section")
  };
  const backBtn = $("backBtn");

  /* ---------------------------------------------------------
     View management
     --------------------------------------------------------- */
  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
    backBtn.hidden = name === "welcome";
  }

  function goBack() {
    if (state.history.length === 0) return;
    const prev = state.history.pop();
    showView(prev);
  }

  /* ---------------------------------------------------------
     Language loading
     --------------------------------------------------------- */
  async function loadLanguage(lang) {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error("Unable to load language file: " + lang);
    state.data = await res.json();
    state.lang = lang;
    document.documentElement.lang = lang;
    document.title = state.data.meta.docTitle || state.data.meta.siteTitle;
    applyStaticText();
  }

  function applyStaticText() {
    const d = state.data;
    $("consoleTitle").textContent = d.meta.siteTitle;
    $("operatorTag").textContent = d.meta.operator;
    $("backLabel").textContent = d.ui.back;
    $("langPrompt").textContent = "> " + d.ui.chooseLang + "_";
    $("footerTag").textContent = d.ui.footerTag;
    d.ui.leds.forEach((label, i) => {
      const el = $("ledLabel" + i);
      if (el) el.textContent = label;
    });
    $("dashEyebrow").textContent = d.dashboard.eyebrow;
    $("dashTitle").textContent = d.dashboard.title;
  }

  /* ---------------------------------------------------------
     Welcome / boot sequence
     --------------------------------------------------------- */
  async function typeLine(element, text, speed = 5) {
    element.textContent = "";

    for (const char of text) {
      element.textContent += char;

      // Vitesse légèrement aléatoire pour un effet plus naturel
      const delay = speed + Math.random() * 20;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  async function playBoot() {
    const container = $("bootLines");
    container.innerHTML = "";

    const lines = state.data.ui.bootLines;
    const langChoice = $("langChoice");

    langChoice.classList.remove("ready");

    for (let i = 0; i < lines.length; i++) {

      const p = document.createElement("p");
      p.className = "boot-line";

      if (i === lines.length - 1) {
        p.classList.add("cursor");
      }

      container.appendChild(p);

      await typeLine(p, lines[i]);

      // Pause entre deux lignes
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    langChoice.classList.add("ready");
  }

  /* ---------------------------------------------------------
     Dashboard
     --------------------------------------------------------- */
  function renderDashboard() {
    const grid = $("tileGrid");
    grid.innerHTML = "";
    state.data.dashboard.tiles.forEach((tile) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.setAttribute("aria-label", tile.label);
      btn.innerHTML = `
        <span class="tile-led"></span>
        <span class="tile-core"><svg viewBox="0 0 24 24">${ICONS[tile.id] || ""}</svg></span>
        <span class="tile-label">${tile.label}</span>
      `;
      btn.addEventListener("click", () => openSection(tile.id));
      grid.appendChild(btn);
    });
  }

  /* ---------------------------------------------------------
     Section view
     --------------------------------------------------------- */
  function openSection(sectionId) {
    const section = state.data.sections[sectionId];
    if (!section) return;
    state.section = sectionId;

    $("sectionEyebrow").textContent = state.data.dashboard.eyebrow;
    $("sectionTitle").textContent = section.title;

    const tabsEl = $("sectionTabs");
    tabsEl.innerHTML = "";
    section.tabs.forEach((tab, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn" + (i === 0 ? " active" : "");
      btn.textContent = tab.label;
      btn.setAttribute("role", "tab");
      btn.addEventListener("click", () => selectTab(sectionId, tab.id, btn));
      tabsEl.appendChild(btn);
    });

    selectTab(sectionId, section.tabs[0].id, tabsEl.querySelector(".tab-btn"));
    state.history.push("dashboard");
    showView("section");
  }

  function selectTab(sectionId, tabId, btnEl) {
    const section = state.data.sections[sectionId];
    const tab = section.tabs.find((t) => t.id === tabId);
    if (!tab) return;
    state.tab = tabId;

    document.querySelectorAll("#sectionTabs .tab-btn").forEach((b) => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");

    const img = document.getElementById("tabImage");
    img.src = tab.image || "";
    img.style.display = tab.image ? "block" : "none";

    $("tabEyebrow").textContent = tab.eyebrow || "";
    $("tabHeading").textContent = tab.heading || tab.label;
    $("tabText").textContent = tab.text || "";

    const ul = $("tabBullets");
    ul.innerHTML = "";
    (tab.bullets || []).forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });

    // scroll text pane back to top on tab change
    const pane = document.querySelector(".textpane");
    if (pane) pane.scrollTop = 0;
  }

  /* ---------------------------------------------------------
     Wiring
     --------------------------------------------------------- */
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await loadLanguage(btn.dataset.lang);
      renderDashboard();
      state.history = ["welcome"];
      showView("dashboard");
    });
  });

  backBtn.addEventListener("click", goBack);

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  async function init() {
    // Pre-load English so the boot sequence + LED labels have text
    // even before the operator picks a language.
    await loadLanguage("en");
    showView("welcome");
    await playBoot();
  }

  init();
})();
