const today = new Date();

const STORAGE_KEY = "grindset-state-v1";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {
        goals: [],
        month: today.getMonth(),
        year: today.getFullYear(),
        lastTier: ""
      };
    }

    const data = JSON.parse(saved);

    return {
      goals: Array.isArray(data.goals) ? data.goals : [],
      month: Number.isInteger(data.month)
        ? data.month
        : today.getMonth(),
      year: Number.isInteger(data.year)
        ? data.year
        : today.getFullYear(),
      lastTier: ""
    };
  } catch (error) {
    console.error("HustLr load error:", error);

    return {
      goals: [],
      month: today.getMonth(),
      year: today.getFullYear(),
      lastTier: ""
    };
  }
}

const state = loadState();

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        goals: state.goals,
        month: state.month,
        year: state.year
      })
    );

    console.log("HustLr: data saved");
  } catch (error) {
    console.error("HustLr save error:", error);
  }
}

const monthNames = Array.from(
  { length: 12 },
  (_, i) =>
    new Date(2020, i, 1).toLocaleString("en-US", {
      month: "long"
    })
);

const motivationPools = {
  brutal: [
    "You do not need more time. You need a first check-in.",
    "The month is moving whether you are or not. Start now.",
    "Your goals cannot carry themselves. Put in one honest rep.",
    "A blank tracker is still a decision. Make a better one today.",
    "Waiting for motivation is how the month disappears.",
    "Your future self gets the bill for every day you skip.",
    "No dramatic reset required. Just stop negotiating with today.",
    "The standard is waiting. Meet it with one small win."
  ],

  push: [
    "You can still turn this month around. One check changes the story.",
    "The comeback starts on an ordinary day. Make today useful.",
    "You have momentum available. Spend it on the next check-in.",
    "Progress is not gone; it is one deliberate choice away.",
    "A stronger week can rewrite the shape of this month.",
    "Do the next right thing, then let the numbers follow.",
    "Your pace can change before the calendar does.",
    "Small effort now has a surprisingly long reach."
  ],

  steady: [
    "You are building real consistency. Keep the rhythm protected.",
    "This is what sustainable progress looks like in real time.",
    "The quiet work is adding up. Stay with the process.",
    "You are becoming someone who follows through. Keep proving it.",
    "A steady pace beats a heroic burst. You are on the right track.",
    "The habit is getting stronger because you keep returning to it.",
    "Your consistency has a pulse. Give it another good day.",
    "Keep stacking ordinary wins until they look extraordinary."
  ],

  hype: [
    "You are locked in. This month is taking notes.",
    "That is not luck. That is you showing up again and again.",
    "The scoreboard is glowing because you earned every point.",
    "You are in the zone now. Protect this standard.",
    "High performance is a habit, and you are making it yours.",
    "Look at that consistency. Keep the pressure beautifully steady.",
    "You came to collect wins. The month is yours to finish.",
    "This is the energy. Stay sharp and keep climbing."
  ]
};

const $ = (selector) => document.querySelector(selector);

const daysInMonth = () =>
  new Date(state.year, state.month + 1, 0).getDate();

const key = () =>
  `${state.year}-${String(state.month + 1).padStart(2, "0")}`;

const checksFor = (goal) => {
  if (!goal.checks) {
    goal.checks = {};
  }

  return goal.checks[key()] || {};
};

const tierFor = (percent) => {
  if (percent < 10) return "brutal";
  if (percent < 40) return "push";
  if (percent < 70) return "steady";
  return "hype";
};

const percentFor = (goal) => {
  return Math.round(
    (Object.values(checksFor(goal)).filter(Boolean).length /
      daysInMonth()) *
      100
  );
};

const overall = () => {
  if (!state.goals.length) {
    return 0;
  }

  const totalChecks = state.goals.reduce(
    (sum, goal) =>
      sum + Object.values(checksFor(goal)).filter(Boolean).length,
    0
  );

  return Math.round(
    (totalChecks / (state.goals.length * daysInMonth())) * 100
  );
};

const randomMessage = (tier) => {
  const pool = motivationPools[tier];

  return pool[Math.floor(Math.random() * pool.length)];
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };

    return entities[char];
  });
}

function setupSelectors() {
  const monthSelect = $("#monthSelect");
  const yearSelect = $("#yearSelect");

  if (!monthSelect || !yearSelect) {
    console.error("HustLr: month/year selectors not found.");
    return;
  }

  monthSelect.innerHTML = monthNames
    .map(
      (name, i) =>
        `<option value="${i}">${name}</option>`
    )
    .join("");

  yearSelect.innerHTML = Array.from(
    { length: 5 },
    (_, i) => state.year - 2 + i
  )
    .map(
      (year) =>
        `<option value="${year}">${year}</option>`
    )
    .join("");

  monthSelect.value = state.month;
  yearSelect.value = state.year;
}

function renderGrid() {
  const trackerGrid = $("#trackerGrid");

  if (!trackerGrid) return;

  const days = daysInMonth();

  const columns =
    `<div class="grid-header">Goal</div>` +
    `<div class="grid-header">Score</div>` +
    Array.from({ length: days }, (_, i) => {
      const date = new Date(
        state.year,
        state.month,
        i + 1
      );

      return `
        <div class="grid-header ${
          date.getDay() % 6 === 0 ? "weekend" : ""
        }">
          ${i + 1}
        </div>
      `;
    }).join("") +
    `<div class="grid-header">%</div>`;

  const rows = state.goals
    .map((goal) => {
      const checks = checksFor(goal);

      return `
        <div class="goal-label">
          <span>${escapeHtml(goal.name)}</span>

          <button
            data-delete="${goal.id}"
            title="Delete goal"
            aria-label="Delete ${escapeHtml(goal.name)}"
          >
            ×
          </button>
        </div>

        <div class="grid-cell percent">
          ${percentFor(goal)}%
        </div>

        ${Array.from({ length: days }, (_, i) => {
          const date = new Date(
            state.year,
            state.month,
            i + 1
          );

          return `
            <div class="grid-cell ${
              date.getDay() % 6 === 0 ? "weekend" : ""
            }">

              <button
                class="check-button ${
                  checks[i + 1] ? "checked" : ""
                }"
                data-goal="${goal.id}"
                data-day="${i + 1}"
                aria-label="${escapeHtml(
                  goal.name
                )} day ${i + 1}"
              ></button>

            </div>
          `;
        }).join("")}

        <div class="grid-cell percent">
          ${percentFor(goal)}%
        </div>
      `;
    })
    .join("");

  trackerGrid.style.setProperty("--days", days);

  trackerGrid.innerHTML =
    columns +
    (rows ||
      `
        <div class="empty-state">
          Add your first goal below to start the scoreboard.
        </div>
      `);
}

function renderTrend() {
  const trendChart = $("#trendChart");

  if (!trendChart) return;

  const days = daysInMonth();

  trendChart.innerHTML = Array.from(
    { length: days },
    (_, i) => {
      const completed = state.goals.reduce(
        (sum, goal) => {
          const checks = checksFor(goal);

          return sum + (checks[i + 1] ? 1 : 0);
        },
        0
      );

      const height = state.goals.length
        ? Math.max(
            3,
            (completed / state.goals.length) * 100
          )
        : 3;

      return `
        <i
          class="trend-bar ${
            completed ? "active" : ""
          }"
          style="height:${height}%"
          title="Day ${i + 1}: ${completed}/${state.goals.length} goals"
        ></i>
      `;
    }
  ).join("");
}

function renderSummary() {
  const sorted = [...state.goals].sort(
    (a, b) => percentFor(b) - percentFor(a)
  );

  const total = overall();

  const summaryOverall = $("#summaryOverall");
  const summaryTier = $("#summaryTier");
  const rankingMeta = $("#rankingMeta");
  const rankingList = $("#rankingList");

  if (summaryOverall) {
    summaryOverall.textContent = `${total}%`;
  }

  if (summaryTier) {
    summaryTier.textContent = `${tierFor(total)} tier`;
  }

  if (rankingMeta) {
    rankingMeta.textContent =
      `${sorted.length} goal${
        sorted.length === 1 ? "" : "s"
      }`;
  }

  if (rankingList) {
    rankingList.innerHTML = sorted.length
      ? sorted
          .map(
            (goal, i) => `
              <div class="ranking-item">

                <span class="rank-number">
                  ${String(i + 1).padStart(2, "0")}
                </span>

                <div>

                  <div class="rank-name">
                    ${escapeHtml(goal.name)}
                  </div>

                  <div class="bar-track">
                    <i style="width:${percentFor(goal)}%"></i>
                  </div>

                </div>

                <span class="rank-percent">
                  ${percentFor(goal)}%
                </span>

              </div>
            `
          )
          .join("")
      : `
          <div class="empty-state">
            Your ranked goals will appear here.
          </div>
        `;
  }

  const strong = sorted[0];
  const weak = sorted[sorted.length - 1];

  const strongestGoal = $("#strongestGoal");
  const strongestPercent = $("#strongestPercent");
  const weakestGoal = $("#weakestGoal");
  const weakestPercent = $("#weakestPercent");

  if (strongestGoal) {
    strongestGoal.textContent =
      strong?.name || "—";
  }

  if (strongestPercent) {
    strongestPercent.textContent = strong
      ? `${percentFor(strong)}% complete`
      : "No check-ins yet";
  }

  if (weakestGoal) {
    weakestGoal.textContent =
      weak?.name || "—";
  }

  if (weakestPercent) {
    weakestPercent.textContent = weak
      ? `${percentFor(weak)}% complete`
      : "No check-ins yet";
  }

  renderTrend();
}

function render() {
  const total = overall();
  const tier = tierFor(total);

  const heroMonth = $("#heroMonth");
  const summaryMonth = $("#summaryMonth");
  const daysStat = $("#daysStat");
  const todayStat = $("#todayStat");
  const overallPercent = $("#overallPercent");
  const overallBar = $("#overallBar");
  const tierLabel = $("#tierLabel");
  const checksStat = $("#checksStat");
  const goalsStat = $("#goalsStat");
  const statusStat = $("#statusStat");
  const motivationText = $("#motivationText");

  if (heroMonth) {
    heroMonth.textContent =
      `${monthNames[state.month]} ${state.year}`;
  }

  if (summaryMonth) {
    summaryMonth.textContent =
      `${monthNames[state.month]} ${state.year}`;
  }

  if (daysStat) {
    daysStat.textContent = daysInMonth();
  }

  const isCurrentPeriod =
    state.month === today.getMonth() &&
    state.year === today.getFullYear();

  if (todayStat) {
    todayStat.textContent = isCurrentPeriod
      ? `Today, ${today.toLocaleString("en-US", {
          month: "short",
          day: "numeric"
        })}`
      : `${monthNames[state.month]} ${state.year}`;
  }

  if (overallPercent) {
    overallPercent.textContent = `${total}%`;
  }

  if (overallBar) {
    overallBar.style.width = `${total}%`;
  }

  if (tierLabel) {
    tierLabel.textContent =
      `${tier.toUpperCase()} TIER`;

    tierLabel.style.color =
      tier === "brutal"
        ? "var(--red)"
        : tier === "push"
          ? "var(--amber)"
          : "var(--green)";
  }

  if (checksStat) {
    checksStat.textContent =
      state.goals.reduce(
        (sum, goal) =>
          sum +
          Object.values(
            checksFor(goal)
          ).filter(Boolean).length,
        0
      );
  }

  if (goalsStat) {
    goalsStat.textContent =
      state.goals.length;
  }

  if (statusStat) {
    statusStat.textContent =
      total >= 70
        ? "On track"
        : total
          ? "In progress"
          : "Not started";
  }

  if (
    motivationText &&
    tier !== state.lastTier
  ) {
    motivationText.textContent =
      randomMessage(tier);

    state.lastTier = tier;
  }

  renderGrid();
  renderSummary();
}

function exportState() {
  const payload = {
    app: "HustLr",
    exportedAt: new Date().toISOString(),
    period: {
      month: state.month,
      year: state.year
    },
    goals: state.goals
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    {
      type: "application/json"
    }
  );

  const link =
    document.createElement("a");

  const url =
    URL.createObjectURL(blob);

  link.href = url;

  link.download =
    `grindset-${state.year}-${String(
      state.month + 1
    ).padStart(2, "0")}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}


/* ADD GOAL */

const goalForm = $("#goalForm");

if (goalForm) {
  goalForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const input = $("#goalInput");

      if (!input) return;

      const name =
        input.value.trim();

      if (!name) return;

      state.goals.push({
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        name,
        checks: {}
      });

      saveState();

      input.value = "";

      render();

      input.focus();
    }
  );
}


/* CHECK / DELETE */

const trackerGrid =
  $("#trackerGrid");

if (trackerGrid) {
  trackerGrid.addEventListener(
    "click",
    (event) => {
      const check =
        event.target.closest(
          ".check-button"
        );

      const remove =
        event.target.closest(
          "[data-delete]"
        );

      if (check) {
        const goal =
          state.goals.find(
            (item) =>
              String(item.id) ===
              String(check.dataset.goal)
          );

        if (!goal) return;

        if (!goal.checks) {
          goal.checks = {};
        }

        if (!goal.checks[key()]) {
          goal.checks[key()] = {};
        }

        const day =
          check.dataset.day;

        goal.checks[key()][day] =
          !goal.checks[key()][day];

        saveState();

        render();

        return;
      }

      if (remove) {
        state.goals =
          state.goals.filter(
            (goal) =>
              String(goal.id) !==
              String(remove.dataset.delete)
          );

        saveState();

        render();
      }
    }
  );
}


/* MONTH */

const monthSelect =
  $("#monthSelect");

if (monthSelect) {
  monthSelect.addEventListener(
    "change",
    (event) => {
      state.month =
        Number(event.target.value);

      state.lastTier = "";

      saveState();

      render();
    }
  );
}


/* YEAR */

const yearSelect =
  $("#yearSelect");

if (yearSelect) {
  yearSelect.addEventListener(
    "change",
    (event) => {
      state.year =
        Number(event.target.value);

      state.lastTier = "";

      saveState();

      render();
    }
  );
}


/* MOTIVATION */

const refreshMotivation =
  $("#refreshMotivation");

if (refreshMotivation) {
  refreshMotivation.addEventListener(
    "click",
    () => {
      const tier =
        tierFor(overall());

      const motivationText =
        $("#motivationText");

      if (motivationText) {
        motivationText.textContent =
          randomMessage(tier);
      }
    }
  );
}


/* EXPORT BUTTONS */

const exportButton =
  $("#exportButton");

if (exportButton) {
  exportButton.addEventListener(
    "click",
    exportState
  );
}

const summaryExport =
  $("#summaryExport");

if (summaryExport) {
  summaryExport.addEventListener(
    "click",
    exportState
  );
}


/* TABS */

document
  .querySelectorAll(".tab")
  .forEach((tab) => {
    tab.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(".tab")
          .forEach((item) => {
            item.classList.toggle(
              "active",
              item === tab
            );
          });

        const trackerView =
          $("#trackerView");

        const summaryView =
          $("#summaryView");

        if (trackerView) {
          trackerView.classList.toggle(
            "hidden",
            tab.dataset.view !==
              "tracker"
          );
        }

        if (summaryView) {
          summaryView.classList.toggle(
            "hidden",
            tab.dataset.view !==
              "summary"
          );
        }
      }
    );
  });


/* START */

setupSelectors();
render();

console.log("HustLr: script loaded");
const importFile = document.getElementById("importFile");

if (importFile) {
  importFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (
        imported.app !== "HustLr" ||
        !Array.isArray(imported.goals)
      ) {
        alert("Bu dosya geçerli bir HustLr yedeği değil.");
        return;
      }

      const confirmed = confirm(
        "Bu yedek mevcut HustLr verilerinin yerine geçecek. Devam edilsin mi?"
      );

      if (!confirmed) {
        importFile.value = "";
        return;
      }

      state.goals = imported.goals;

      if (
        imported.period &&
        Number.isInteger(imported.period.month) &&
        Number.isInteger(imported.period.year)
      ) {
        state.month = imported.period.month;
        state.year = imported.period.year;
      }

      state.lastTier = "";

      saveState();
      setupSelectors();
      render();

      alert("HustLr yedeği başarıyla geri yüklendi.");

    } catch (error) {
      console.error("HustLr import error:", error);

      alert(
        "Yedek dosyası okunamadı. Dosyanın HustLr JSON dosyası olduğundan emin ol."
      );
    }

    importFile.value = "";
  });
}