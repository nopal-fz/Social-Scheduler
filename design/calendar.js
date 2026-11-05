(() => {
  "use strict";

  const ACCOUNTS = [
    { id: "threads", platform: "threads", label: "Threads", handle: "@naufal.core", short: "@naufal", state: "active" },
    { id: "ig", platform: "instagram", label: "Instagram", handle: "@naufal.core", short: "@naufal", state: "active" },
    { id: "ig2", platform: "instagram", label: "Instagram", handle: "@studio.kecil", short: "@studio", state: "active" },
    { id: "tiktok", platform: "tiktok", label: "TikTok", handle: "@naufal.core", short: "@naufal", state: "reconnect" },
  ];

  // shortcut: satu minggu data, tanpa same-slot stacking; tambah saat dua post berbagi menit yang sama.
  const POSTS = [
    { id: "p01", day: 0, time: "08:30", targets: ["threads"], status: "published", caption: "Tiga hal yang saya pelajari waktu pindah ke Next.js." },
    { id: "p02", day: 0, time: "12:00", targets: ["threads", "ig"], status: "scheduled", caption: "Behind the desk, minggu ini." },
    { id: "p03", day: 0, time: "19:30", targets: ["tiktok"], status: "failed", caption: "Potongan proses bikin konten minggu ini.", error: "Token TikTok kedaluwarsa. Sambungkan ulang akun, lalu coba lagi." },
    { id: "p04", day: 1, time: "09:00", targets: ["threads"], status: "published", caption: "Catatan rilis 0.4: kalender, retry, token." },
    { id: "p05", day: 1, time: "13:30", targets: ["ig"], status: "scheduled", caption: "Reel: 3 alat yang bikin kerja lebih cepat." },
    { id: "p06", day: 1, time: "18:00", targets: ["threads", "ig"], status: "scheduled", caption: "Kenapa saya berhenti posting tiap hari." },
    { id: "p07", day: 2, time: "07:30", targets: ["threads"], status: "published", caption: "Rangkuman minggu: 3 platform, 21 post." },
    { id: "p08", day: 2, time: "13:00", targets: ["ig", "tiktok"], status: "scheduled", caption: "Carousel: alur kerja dari brief sampai terbit." },
    { id: "p09", day: 2, time: "16:00", targets: ["ig2"], status: "scheduled", caption: "Studio kecil, proses panjang." },
    { id: "p10", day: 3, time: "10:00", targets: ["threads"], status: "published", caption: "Satu jam di meja, tiga ide." },
    { id: "p11", day: 3, time: "14:05", targets: ["ig"], status: "publishing", caption: "Reel: sebelum dan sesudah pindah ke scheduler." },
    { id: "p12", day: 3, time: "15:30", targets: ["threads", "ig"], status: "scheduled", caption: "Proses pindah dari spreadsheet ke scheduler: apa yang berubah, apa yang masih manual, dan kenapa saya tidak buru-buru menambah platform baru." },
    { id: "p13", day: 4, time: "09:30", targets: ["tiktok"], status: "scheduled", caption: "Video: jawab tiga pertanyaan paling sering." },
    { id: "p14", day: 4, time: "08:00", targets: ["threads", "ig", "tiktok"], status: "partial", caption: "Peluncuran minggu ini: satu video, tiga platform.", error: "TikTok gagal karena token kedaluwarsa." },
    { id: "p15", day: 4, time: "17:00", targets: ["threads"], status: "failed", caption: "Kenapa kalender lebih berguna dari daftar ide.", error: "Post tidak terbit: batas post harian Threads tercapai. Coba lagi besok." },
    { id: "p16", day: 5, time: "08:00", targets: ["threads"], status: "published", caption: "Meja kerja pagi ini." },
    { id: "p17", day: 5, time: "10:30", targets: ["ig2"], status: "published", caption: "Carousel: tiga hal yang saya ubah di studio." },
    { id: "p18", day: 5, time: "11:00", targets: ["tiktok"], status: "scheduled", caption: "Video: proses edit 60 detik." },
    { id: "p19", day: 5, time: "15:00", targets: ["ig"], status: "published", caption: "Reel: satu menit di studio." },
    { id: "p20", day: 6, time: "10:00", targets: ["ig", "threads"], status: "scheduled", caption: "Minggu ini: 12 ide, 3 platform, 21 post." },
    { id: "p21", day: 6, time: "19:00", targets: ["threads"], status: "scheduled", caption: "Catatan kecil sebelum minggu baru." },
  ];

  const STATUS = {
    scheduled: { label: "Terjadwal", shape: "scheduled" },
    publishing: { label: "Sedang terbit", shape: "publishing" },
    published: { label: "Terbit", shape: "published" },
    partial: { label: "Sebagian", shape: "partial" },
    failed: { label: "Gagal", shape: "failed" },
  };
  const LEGEND_ORDER = ["scheduled", "publishing", "published", "partial", "failed"];

  const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const DAYS_FULL = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const MONTHS_FULL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const WEEK_BASE = Date.UTC(2026, 10, 2);
  const DAY_MS = 86400000;
  const TODAY = Date.UTC(2026, 10, 5);
  const NOW_MIN = 14 * 60 + 12;
  const NOW_TOP = ((NOW_MIN - 360) / 30) * 44;
  const ROW = 44;
  const GUTTER = 52;

  let offset = 0;
  let agendaDay = 3;
  let selected = new Set(ACCOUNTS.map((a) => a.id));
  let selectedPostId = null;
  let lastDragAt = 0;
  let toastTimer = 0;

  const $ = (id) => document.getElementById(id);
  const railList = $("railList");
  const accountBar = $("accountBar");
  const dayHead = $("dayHead");
  const gridBody = $("gridBody");
  const dayStrip = $("dayStrip");
  const agendaTitle = $("agendaTitle");
  const agendaCount = $("agendaCount");
  const agendaList = $("agendaList");
  const summaryEl = $("summary");
  const legendEl = $("legend");
  const filterEmpty = $("filterEmpty");
  const toastEl = $("toast");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  const slotTop = (time) => {
    const [h, m] = time.split(":").map(Number);
    return ((h * 60 + m - 360) / 30) * ROW;
  };
  const weekDates = () => Array.from({ length: 7 }, (_, i) => new Date(WEEK_BASE + offset * 7 * DAY_MS + i * DAY_MS));
  const includesToday = () => offset === 0;
  const postsForWeek = () => (offset === 0 ? POSTS : []);
  const visible = () => postsForWeek().filter((p) => p.targets.some((t) => selected.has(t)));
  const countFor = (id) => POSTS.filter((p) => p.targets.includes(id)).length;
  const totalPosts = POSTS.length;

  function icon(platform) {
    return `<svg class="mark mark--${platform}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${platform}"></use></svg>`;
  }
  function shape(status) {
    return `<span class="shape shape--${status}" aria-hidden="true"></span>`;
  }
  function warn() {
    return `<svg class="mark-warn" aria-hidden="true"><use href="#i-warn"></use></svg>`;
  }
  function marksHTML(targets) {
    return targets.map((id) => {
      const a = ACCOUNTS.find((x) => x.id === id);
      const badge = a.state === "reconnect" ? warn() : "";
      return `<span class="markwrap" title="${esc(a.label + " " + a.handle)}">${icon(a.platform)}${badge}</span>`;
    }).join("");
  }
  function a11yFor(p, targets, dates) {
    const d = dates[p.day];
    const names = targets.map((id) => {
      const a = ACCOUNTS.find((x) => x.id === id);
      return `${a.label} ${a.handle}${a.state === "reconnect" ? " perlu reconnect" : ""}`;
    }).join(", ");
    return `${DAYS_FULL[p.day]} ${d.getUTCDate()} ${MONTHS_FULL[d.getUTCMonth()]}, ${p.time}, ${names}, ${STATUS[p.status].label}. ${p.caption}${p.error ? " " + p.error : ""}`;
  }

  function rangeLabel(dates) {
    const a = dates[0], b = dates[6];
    const y = b.getUTCFullYear();
    if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${y}`;
    if (a.getUTCFullYear() === b.getUTCFullYear()) return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} – ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${y}`;
    return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} ${a.getUTCFullYear()} – ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${y}`;
  }

  function renderRail() {
    const rows = ACCOUNTS.map((a) => {
      const note = a.state === "reconnect"
        ? `<div class="acct-note"><p><b>Token ${a.label} kedaluwarsa.</b> Post ke akun ini tidak akan terbit sampai disambungkan.</p><button class="btn btn--warn btn--xs">Sambungkan ulang</button></div>`
        : "";
      return `<label class="acct" data-acct="${a.id}">
        <input type="checkbox" checked data-filter="${a.id}">
        <span class="acct__mark">${icon(a.platform)}</span>
        <span class="acct__handle">${esc(a.handle)}</span>
        ${a.state === "reconnect" ? '<span class="acct__warn" title="Perlu reconnect"></span>' : ""}
        <span class="acct__n mono">${countFor(a.id)}</span>
      </label>${note}`;
    }).join("");
    railList.innerHTML = `<label class="acct acct--all">
      <input type="checkbox" id="allAccounts" checked>
      <span class="acct__name">Semua akun</span>
      <span class="acct__n mono">${totalPosts}</span>
    </label><div class="rail__rule"></div>${rows}`;
  }

  function renderAccountBar() {
    const all = `<button class="chip chip--all is-on" data-filter="all" aria-pressed="true" aria-label="Semua akun"><span>Semua</span><span class="chip__n mono">${totalPosts}</span></button>`;
    const chips = ACCOUNTS.map((a) => `<button class="chip is-on" data-filter="${a.id}" aria-pressed="true" title="${esc(a.label + " " + a.handle)}" aria-label="${esc(a.label + " " + a.handle + ", " + countFor(a.id) + " post")}">
      ${icon(a.platform)}<span class="chip__handle">${esc(a.handle)}</span><span class="chip__short">${esc(a.short)}</span><span class="chip__n mono">${countFor(a.id)}</span>
      ${a.state === "reconnect" ? '<span class="acct__warn" title="Perlu reconnect"></span>' : ""}
    </button>`).join("");
    accountBar.innerHTML = all + chips;
  }

  let drag = null;

  function blockHTML(p, dates) {
    const targets = p.targets.filter((t) => selected.has(t));
    if (!targets.length) return "";
    const on = p.id === selectedPostId;
    const top = slotTop(p.time) + 2;
    const draggable = p.status === "scheduled" || p.status === "failed" ? "true" : "false";
    return `<button class="block st--${p.status}${on ? " is-selected" : ""}" style="top:${top}px" data-id="${p.id}" data-draggable="${draggable}" aria-pressed="${on}" aria-label="${esc(a11yFor(p, targets, dates))}" title="${esc(p.caption + (p.error ? "\n" + p.error : ""))}">
      <span class="block__time mono">${p.time}</span>
      <span class="block__sep"></span>
      <span class="block__caption">${esc(p.caption)}</span>
      <span class="block__meta"><span class="block__marks">${marksHTML(targets)}</span><span class="block__status">${shape(p.status)}</span></span>
    </button>`;
  }

  function agendaRowHTML(p, dates) {
    const targets = p.targets.filter((t) => selected.has(t));
    if (!targets.length) return "";
    const on = p.id === selectedPostId;
    return `<button class="agenda-row st--${p.status}${on ? " is-selected" : ""}" data-id="${p.id}" aria-pressed="${on}" aria-label="${esc(a11yFor(p, targets, dates))}">
      <span class="agenda-row__time mono">${p.time}</span>
      <span class="agenda-row__sep"></span>
      <span class="agenda-row__body">
        <span class="agenda-row__caption">${esc(p.caption)}</span>
        <span class="agenda-row__meta">
          <span class="agenda-row__marks">${marksHTML(targets)}</span>
          <span class="agenda-row__status">${shape(p.status)}${STATUS[p.status].label}</span>
        </span>
      </span>
    </button>`;
  }

  function gutterHTML() {
    let out = "";
    for (let hour = 6; hour <= 23; hour++) {
      if (includesToday() && Math.abs(hour * 60 - NOW_MIN) < 25) continue;
      const top = ((hour * 60 - 360) / 30) * ROW + 3;
      out += `<span class="gutter__h mono" style="top:${top}px">${String(hour).padStart(2, "0")}:00</span>`;
    }
    return out;
  }

  function render(opts = {}) {
    const dates = weekDates();
    $("weekRange").textContent = rangeLabel(dates);
    const vis = visible();

    dayHead.innerHTML = `<div class="gutter-head"></div>` + dates.map((d, i) => {
      const today = includesToday() && i === 3;
      const n = vis.filter((p) => p.day === i).length;
      return `<div class="dayhead${today ? " is-today" : ""}">
        <span class="dayhead__dow">${DAYS[i]}</span>
        <span class="dayhead__num">${d.getUTCDate()}</span>
        <span class="dayhead__count mono">${n} post</span>
      </div>`;
    }).join("");

    const prevScroll = gridBody.scrollTop;
    let html = `<div class="gutter" aria-hidden="true">${gutterHTML()}</div>`;
    dates.forEach((d, i) => {
      const today = includesToday() && i === 3;
      const blocks = vis.filter((p) => p.day === i).sort((a, b) => a.time.localeCompare(b.time)).map((p) => blockHTML(p, dates)).join("");
      const dot = today ? `<span class="nowdot" style="top:${NOW_TOP}px"></span>` : "";
      html += `<div class="daycol${today ? " is-today" : ""}" data-day="${i}">${blocks}${dot}</div>`;
    });
    if (includesToday()) html += `<div class="nowline" style="top:${NOW_TOP}px"><span class="nowline__label mono">14:12</span></div>`;
    gridBody.innerHTML = html;

    gridBody.scrollTop = opts.scroll === "8" ? 176 : opts.scroll === "now" ? 0 : prevScroll;
    measureScrollbar();
    if (opts.scroll === "now") {
      const target = Math.max(0, NOW_TOP - gridBody.clientHeight * 0.55);
      gridBody.scrollTop = Math.floor(target / ROW) * ROW;
    }

    renderSummary(vis);
    renderAgenda(dates);
    syncFilters();
  }

  function renderSummary(vis) {
    if (selected.size === 0) summaryEl.innerHTML = `<b>0</b> post minggu ini`;
    else if (vis.length === 0) summaryEl.textContent = "Belum ada post minggu ini.";
    else summaryEl.innerHTML = `<b>${vis.length}</b> post minggu ini`;

    legendEl.innerHTML = LEGEND_ORDER.map((s) => {
      const n = vis.filter((p) => p.status === s).length;
      return `<li>${shape(s)}<span>${STATUS[s].label}</span><span class="n mono">${n}</span></li>`;
    }).join("");
    legendEl.hidden = vis.length === 0;
    filterEmpty.hidden = selected.size !== 0;
  }

  function renderAgenda(dates) {
    const vis = visible();
    const d = dates[agendaDay];
    const posts = vis.filter((p) => p.day === agendaDay).sort((a, b) => a.time.localeCompare(b.time));
    agendaTitle.textContent = `${DAYS_FULL[agendaDay]}, ${d.getUTCDate()} ${MONTHS_FULL[d.getUTCMonth()]}`;
    agendaCount.textContent = `${posts.length} post`;
    agendaList.innerHTML = posts.length
      ? posts.map((p) => agendaRowHTML(p, dates)).join("")
      : `<p class="agenda-empty">${selected.size === 0 ? "Semua akun disembunyikan." : "Belum ada post hari ini."}</p>`;

    dayStrip.innerHTML = dates.map((dd, i) => {
      const today = includesToday() && i === 3;
      const n = vis.filter((p) => p.day === i).length;
      return `<button class="daychip${today ? " is-today" : ""}${i === agendaDay ? " is-on" : ""}" data-day="${i}" aria-pressed="${i === agendaDay}">
        <span class="daychip__dow">${DAYS[i]}</span>
        <span class="daychip__n">${dd.getUTCDate()}</span>
        <span class="daychip__c mono">${n}</span>
      </button>`;
    }).join("");
  }

  function syncFilters() {
    const all = selected.size === ACCOUNTS.length;
    const some = selected.size > 0;
    const allBox = $("allAccounts");
    if (allBox) {
      allBox.checked = all;
      allBox.indeterminate = some && !all;
    }
    document.querySelectorAll(".acct input[data-filter]").forEach((cb) => {
      cb.checked = selected.has(cb.dataset.filter);
    });
    document.querySelectorAll(".chip[data-filter]").forEach((chip) => {
      const on = chip.dataset.filter === "all" ? all : selected.has(chip.dataset.filter);
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", String(on));
    });
  }

  function measureScrollbar() {
    const w = gridBody.offsetWidth - gridBody.clientWidth;
    document.documentElement.style.setProperty("--sbw", Math.max(0, w) + "px");
  }

  function selectPost(id) {
    selectedPostId = selectedPostId === id ? null : id;
    document.querySelectorAll(".block.is-selected, .agenda-row.is-selected").forEach((el) => {
      el.classList.remove("is-selected");
      el.setAttribute("aria-pressed", "false");
    });
    if (selectedPostId) {
      document.querySelectorAll(`[data-id="${selectedPostId}"]`).forEach((el) => {
        el.classList.add("is-selected");
        el.setAttribute("aria-pressed", "true");
      });
    }
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 3200);
  }

  function beginDrag() {
    const r = drag.rect;
    const clone = drag.block.cloneNode(true);
    clone.classList.add("block--clone");
    clone.classList.remove("is-selected");
    clone.style.left = r.left + "px";
    clone.style.top = r.top + "px";
    clone.style.width = r.width + "px";
    clone.style.height = r.height + "px";
    document.body.appendChild(clone);

    const ghost = document.createElement("div");
    ghost.className = "ghost";
    ghost.innerHTML = '<span class="mono"></span>';
    gridBody.appendChild(ghost);

    drag.block.classList.add("is-dragging");
    document.body.classList.add("is-dragging");
    drag.clone = clone;
    drag.ghost = ghost;
  }

  function onMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      beginDrag();
    }
    drag.clone.style.left = drag.rect.left + dx + "px";
    drag.clone.style.top = drag.rect.top + dy + "px";

    const cols = [...gridBody.querySelectorAll(".daycol")];
    let day = 0;
    for (let i = 0; i < cols.length; i++) {
      if (e.clientX >= cols[i].getBoundingClientRect().left) day = i;
    }
    const bodyRect = gridBody.getBoundingClientRect();
    const y = e.clientY - bodyRect.top + gridBody.scrollTop - drag.grabY;
    // shortcut: snap 15 menit bisa membuat blok berdekatan bertumpuk; butuh lane stacking saat data nyata.
    let mins = 360 + Math.round(y / 22) * 15;
    mins = Math.max(360, Math.min(1350, mins));
    drag.day = day;
    drag.minutes = mins;

    const col = cols[day];
    const ghost = drag.ghost;
    ghost.style.left = col.offsetLeft + 6 + "px";
    ghost.style.width = col.offsetWidth - 12 + "px";
    ghost.style.top = ((mins - 360) / 30) * ROW + 2 + "px";
    ghost.firstElementChild.textContent = fmtTime(mins);
  }

  function cleanupDrag() {
    if (!drag) return;
    if (drag.clone) drag.clone.remove();
    if (drag.ghost) drag.ghost.remove();
    if (drag.block) drag.block.classList.remove("is-dragging");
    document.body.classList.remove("is-dragging");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    drag = null;
  }

  function onUp() {
    if (!drag) return;
    const d = drag;
    if (d.moved) {
      lastDragAt = performance.now();
      const p = POSTS.find((x) => x.id === d.id);
      if (p && d.day !== null && (p.day !== d.day || p.time !== fmtTime(d.minutes))) {
        const oldDay = p.day;
        p.day = d.day;
        p.time = fmtTime(d.minutes);
        selectedPostId = p.id;
        cleanupDrag();
        render();
        showToast(oldDay === p.day ? `Jadwal dipindah ke ${p.time}` : `Jadwal dipindah ke ${DAYS_FULL[p.day]}, ${p.time}`);
        return;
      }
    }
    cleanupDrag();
  }

  /* events */
  railList.addEventListener("change", (e) => {
    const cb = e.target;
    if (cb.id === "allAccounts") {
      selected = cb.checked ? new Set(ACCOUNTS.map((a) => a.id)) : new Set();
    } else if (cb.dataset.filter) {
      if (cb.checked) selected.add(cb.dataset.filter);
      else selected.delete(cb.dataset.filter);
    }
    render();
  });

  accountBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const id = chip.dataset.filter;
    if (id === "all") {
      selected = selected.size === ACCOUNTS.length ? new Set() : new Set(ACCOUNTS.map((a) => a.id));
    } else if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    render();
  });

  $("showAll").addEventListener("click", () => {
    selected = new Set(ACCOUNTS.map((a) => a.id));
    render();
  });

  dayStrip.addEventListener("click", (e) => {
    const chip = e.target.closest(".daychip");
    if (!chip) return;
    agendaDay = Number(chip.dataset.day);
    renderAgenda(weekDates());
  });

  gridBody.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const block = e.target.closest(".block");
    if (!block || block.dataset.draggable !== "true") return;
    const rect = block.getBoundingClientRect();
    drag = {
      block, id: block.dataset.id,
      startX: e.clientX, startY: e.clientY,
      moved: false, rect, grabY: e.clientY - rect.top,
      clone: null, ghost: null, day: null, minutes: null,
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });

  gridBody.addEventListener("click", (e) => {
    const block = e.target.closest(".block");
    if (!block) return;
    if (performance.now() - lastDragAt < 300) return;
    selectPost(block.dataset.id);
  });

  agendaList.addEventListener("click", (e) => {
    const row = e.target.closest(".agenda-row");
    if (row) selectPost(row.dataset.id);
  });

  $("prevWeek").addEventListener("click", () => {
    offset -= 1;
    render({ scroll: includesToday() ? "now" : "8" });
  });
  $("nextWeek").addEventListener("click", () => {
    offset += 1;
    render({ scroll: includesToday() ? "now" : "8" });
  });
  $("todayBtn").addEventListener("click", () => {
    offset = 0;
    agendaDay = 3;
    render({ scroll: "now" });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (drag && drag.moved) cleanupDrag();
    else if (selectedPostId) selectPost(selectedPostId);
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#newPost, #addAccount, .avatar, .reconnect-strip .btn, .acct-note .btn")) {
      showToast("Aksi ini belum tersedia di prototipe.");
    }
  });

  window.addEventListener("resize", measureScrollbar);

  renderRail();
  renderAccountBar();
  syncFilters();
  render({ scroll: "now" });
  measureScrollbar();
})();

