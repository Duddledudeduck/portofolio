/* Portfolio JS — XP chrome: clock, start menu, taskbar, dialogs, email copy */

/* ===== Taskbar clock ===== */
const clock = document.getElementById("clock");
function tickClock() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, "0");
  clock.textContent = `${h}:${m} ${now.getHours() < 12 ? "AM" : "PM"}`;
}
tickClock();
setInterval(tickClock, 10000);

/* ===== Start menu ===== */
const startBtn = document.getElementById("startBtn");
const startMenu = document.getElementById("startMenu");

function toggleStartMenu(forceClose = false) {
  const isOpen = !startMenu.hidden;
  startMenu.hidden = forceClose ? true : isOpen;
  startBtn.classList.toggle("active", !startMenu.hidden);
}
startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStartMenu();
});
document.addEventListener("click", (e) => {
  if (!startMenu.hidden && !startMenu.contains(e.target)) toggleStartMenu(true);
});
startMenu.querySelectorAll(".start-item").forEach((item) =>
  item.addEventListener("click", () => toggleStartMenu(true))
);

/* ===== Status: start menu opens like a real window on taskbar click ===== */

/* ===== Minimize / close buttons: hide the window (taskbar brings it back) ===== */
document.querySelectorAll("[data-min]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const win = document.getElementById(btn.dataset.min);
    if (win) win.classList.add("is-hidden");
  });
});

/* Taskbar tabs + start items: restore hidden windows, then scroll */
document.querySelectorAll("[data-task]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const win = document.getElementById(tab.dataset.task);
    if (win) {
      win.classList.remove("is-hidden");
      setTimeout(() => win.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  });
});
document.querySelectorAll(".start-menu-items a[href^='#win-']").forEach((item) => {
  item.addEventListener("click", () => {
    const win = document.querySelector(item.getAttribute("href"));
    if (win) win.classList.remove("is-hidden");
  });
});

/* Synchronize active taskbar tab with scroll position */
const tabs = [...document.querySelectorAll("[data-task]")];
const tabWins = tabs.map((t) => document.getElementById(t.dataset.task));
window.addEventListener("scroll", () => {
  let best = 0, bestDist = Infinity;
  tabWins.forEach((win, i) => {
    if (!win || win.classList.contains("is-hidden")) return;
    const dist = Math.abs(win.getBoundingClientRect().top);
    if (dist < bestDist) { bestDist = dist; best = i; }
  });
  tabs.forEach((t, i) => t.classList.toggle("active", i === best));
}, { passive: true });

/* ===== Active window highlight on click (XP feels focused) ===== */
document.querySelectorAll(".window").forEach((win) => {
  win.addEventListener("click", () => {
    document.querySelectorAll(".window").forEach((w) => w.classList.remove("z-top"));
    win.classList.add("z-top");
  });
});

/* ===== "Turn Off Computer" — playful dialog ===== */
const turnOff = document.getElementById("turnOff");
if (turnOff) {
  turnOff.addEventListener("click", () => {
    toggleStartMenu(true);
    const dialog = document.createElement("div");
    dialog.className = "xp-dialog";
    dialog.innerHTML = `
      <div class="xp-dialog-box">
        <div class="xp-dialog-body">
          <span class="big">🦆</span>
          <p>Could not shut down: too many unfinished projects.</p>
          <p><em>(Nice try, though.)</em></p>
        </div>
        <div class="xp-dialog-actions">
          <button class="xp-btn">Try again (no)</button>
          <button class="xp-btn" id="dialogOk">OK</button>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.id === "dialogOk" || e.target.tagName === "BUTTON") {
        dialog.remove();
      }
    });
  });
}

/* ===== Email copy button ===== */
const emailBtn = document.getElementById("emailBtn");
if (emailBtn) {
  emailBtn.addEventListener("click", async () => {
    const email = emailBtn.dataset.email;
    const label = document.getElementById("emailLabel");
    const old = label.textContent;
    try {
      await navigator.clipboard.writeText(email);
      label.textContent = "Copied!";
      setTimeout(() => (label.textContent = old), 1500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

/* ===== Windows fade in ===== */
const windows = document.querySelectorAll(".window");
const appear = () => windows.forEach((w) => w.classList.add("visible"));
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  windows.forEach((w) => w.classList.add("visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    }),
    { threshold: 0.08 }
  );
  windows.forEach((w) => io.observe(w));
  setTimeout(appear, 2500); // safety: never leave windows invisible
}
