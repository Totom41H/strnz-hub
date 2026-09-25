import { state } from "../core/state";
import { escapeHtml } from "../core/utils";

let deps = { showPage: (_pageId: string) => {} };
export function configureDashboardModule(next: Partial<typeof deps>) { deps = { ...deps, ...next }; }

export function setupDashboardButton() {
  const button =
    document.querySelector<HTMLButtonElement>(
      "#new-wod-button"
    );

  button?.addEventListener("click", () => {
    deps.showPage("wod");

    setTimeout(() => {
      const wodButton =
        document.querySelector<HTMLButtonElement>(
          "#open-wod-form"
        );

      wodButton?.click();
    }, 100);
  });
}

export function setupDashboardStats() {
  const statsSection =
    document.querySelector<HTMLElement>(
      ".stats-section"
    );

  if (!statsSection) return;

  statsSection.addEventListener("click", (event) => {
    const target =
      event.target as HTMLElement;

    const card =
      target.closest<HTMLElement>(
        ".stat-card"
      );

    if (!card) return;

    const id = card.querySelector("strong")?.id;

    if (!id) return;

    if (id.startsWith("dashboard-wod-")) {
      let status: string | undefined;

      if (id === "dashboard-wod-todo") {
        status = "À créer";
      }

      if (id === "dashboard-wod-progress") {
        status = "En cours";
      }

      if (id === "dashboard-wod-validated") {
        status = "Prêt";
      }

      if (id === "dashboard-wod-published") {
        status = "Publié";
      }

      deps.showPage("wod");

      setTimeout(() => {
        const statusFilter =
          document.querySelector<HTMLSelectElement>(
            "#wod-status-filter"
          );

        if (statusFilter) {
          statusFilter.value =
            status ?? "";

          statusFilter.dispatchEvent(
            new Event("change")
          );
        }
      }, 100);

      return;
    }

    if (id.startsWith("dashboard-weekly-")) {
      let status: string | undefined;

      if (id === "dashboard-weekly-todo") {
        status = "À créer";
      }

      if (id === "dashboard-weekly-progress") {
        status = "En cours";
      }

      if (id === "dashboard-weekly-validated") {
        status = "Prêt";
      }

      if (id === "dashboard-weekly-published") {
        status = "Publié";
      }

      deps.showPage("weekly");

      setTimeout(() => {
        const statusFilter =
          document.querySelector<HTMLSelectElement>(
            "#weekly-status-filter"
          );

        if (statusFilter) {
          statusFilter.value =
            status ?? "";

          statusFilter.dispatchEvent(
            new Event("change")
          );
        }
      }, 100);
    }
  });
}

export function renderDashboardPublications() {
  const container =
    document.querySelector<HTMLElement>("#dashboard-publications");

  if (!container) return;

  const upcomingWods = [...state.wods]
    .filter(
      (wod) =>
        wod.date &&
        wod.status !== "Publié"
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (upcomingWods.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>📅</span>
        <strong>Aucune publication prévue</strong>
        <p>Ajoute une date à tes WOD pour les voir apparaître ici.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = upcomingWods
    .map((wod) => {
      const date = new Date(`${wod.date}T00:00:00`);

      const day = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
      });

      const month = date
        .toLocaleDateString("fr-FR", {
          month: "short",
        })
        .replace(".", "")
        .toUpperCase();

      return `
        <div class="publication-item">
          <div class="publication-date">
            <strong>${day}</strong>
            <span>${month}</span>
          </div>

          <div class="publication-info">
            <strong>${wod.id}</strong>
            <span>${wod.name}</span>
          </div>

          <div class="publication-status status-${wod.status
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/à/g, "a")
            .replace(/ê/g, "e")
            .replace(/é/g, "e")}"
          >
            ${wod.status}
          </div>
        </div>
      `;
    })
    .join("");
}

export function renderDashboardTasks() {
  const actionContainer =
    document.querySelector<HTMLElement>(
      "#dashboard-action-tasks"
    );

  if (!actionContainer) return;

  const actionTasks = state.wods
    .filter(
      (wod) =>
        wod.status === "À créer" ||
        wod.status === "En cours" ||
        wod.status === "Prêt"
    )
    .slice(0, 5);

  if (actionTasks.length === 0) {
    actionContainer.innerHTML = `
      <div class="empty-state">
        <span>✅</span>
        <strong>Aucune action en attente</strong>
        <p>Tout est à jour.</p>
      </div>
    `;
    return;
  }

  actionContainer.innerHTML = actionTasks
    .map((wod) => {
      let label = "";
      let indicator = "";

      if (wod.status === "À créer") {
        label = "À préparer";
        indicator = `<span class="status-line status-à-faire"></span>`;
      } else if (wod.status === "En cours") {
        label = "En préparation";
        indicator = `<span class="status-line status-en-cours"></span>`;
      } else if (wod.status === "Prêt") {
        label = "Prêt à publier";
        indicator = `<span class="status-line status-prêt"></span>`;
      }

      return `
        <div
          class="dashboard-task"
          data-action-wod="${wod.id}"
        >
          <span class="task-indicator">${indicator}</span>

          <div>
            <strong>${wod.id}</strong>
            <span>
              ${label} — ${escapeHtml(wod.name)}
            </span>
          </div>
        </div>
      `;
    })
    .join("");

  const actionButtons =
    actionContainer.querySelectorAll<HTMLElement>(
      "[data-action-wod]"
    );

  actionButtons.forEach((task) => {
    task.addEventListener("click", () => {
      const wodId = task.dataset.actionWod;

      if (!wodId) return;

      deps.showPage("wod");

      setTimeout(() => {
        const viewButton =
          document.querySelector<HTMLButtonElement>(
            `[data-view-wod="${wodId}"]`
          );

        viewButton?.click();
      }, 100);
    });
  });
}
