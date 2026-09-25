import { Weekly, saveWeeklies, getNextWeeklyNumber, incrementNextWeeklyNumber } from "../data/weeklies";
import { state } from "../core/state";
import { escapeHtml } from "../core/utils";

let editingWeeklyId: string | null = null;
let deps = { renderProduction: () => {}, renderPublications: () => {} };
export function configureWeeklyModule(next: Partial<typeof deps>) { deps = { ...deps, ...next }; }

function createWeekly(form: HTMLFormElement) {
  const formData = new FormData(form);

  const weekly: Weekly = {
    id: `WEEKLY-${String(getNextWeeklyNumber()).padStart(3, "0")}`,
    
    name: String(
      formData.get("name") ?? ""
    ),

    wodId: String(
      formData.get("wodId") ?? ""
    ),

    date: String(
      formData.get("date") ?? ""
    ),

    description: String(
      formData.get("description") ?? ""
    ),

    score: String(
      formData.get("score") ?? ""
    ),

    production: {
      visual: "À faire",
      text: "À faire",
      publication: "À faire"
    },

    texts: {
      caption: "",
      hashtags: "",
      cta: ""
    },

    status: String(
      formData.get("status") ?? "À créer"
    ),
  };

  state.weeklies.push(weekly);

  incrementNextWeeklyNumber();

  saveWeeklies();

  renderWeeklies();
}

function updateWeekly(form: HTMLFormElement) {
  if (!editingWeeklyId) return;

  const weekly = state.weeklies.find(
    (item) => item.id === editingWeeklyId
  );

  if (!weekly) return;

  const formData = new FormData(form);

  weekly.name = String(
    formData.get("name") ?? ""
  );

  weekly.wodId = String(
    formData.get("wodId") ?? ""
  );

  weekly.date = String(
    formData.get("date") ?? ""
  );

  weekly.description = String(
    formData.get("description") ?? ""
  );

  weekly.score = String(
    formData.get("score") ?? ""
  );

  weekly.status = String(
    formData.get("status") ?? "À créer"
  );

  saveWeeklies();

  renderWeeklies();
}

export function setupWeeklyForm() {

  const openButton =
    document.querySelector<HTMLButtonElement>(
      "#open-weekly-form"
    );

  const closeButton =
    document.querySelector<HTMLButtonElement>(
      "#close-weekly-form"
    );

  const cancelButton =
    document.querySelector<HTMLButtonElement>(
      "#cancel-weekly-form"
    );

  const formPanel =
    document.querySelector<HTMLElement>(
      "#weekly-form-panel"
    );

  const form =
    document.querySelector<HTMLFormElement>(
      "#weekly-form"
    );

  function openForm() {

    populateWeeklyWodSelect();

    formPanel?.classList.add("visible");

    formPanel?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function closeForm() {
    formPanel?.classList.remove("visible");
  }

  openButton?.addEventListener(
    "click",
    openForm
  );

  closeButton?.addEventListener(
    "click",
    closeForm
  );

  cancelButton?.addEventListener(
    "click",
    closeForm
  );

  form?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      if (editingWeeklyId) {
        updateWeekly(form);
      } else {
        createWeekly(form);
      }

      form.reset();

      editingWeeklyId = null;

      closeForm();

      renderWeeklies();
    }
  );
}

function populateWeeklyWodSelect(
  selectedWodId: string = ""
) {

  const select =
    document.querySelector<HTMLSelectElement>(
      "#weekly-wod"
    );

  if (!select) return;

  select.innerHTML = `
    <option value="">
      Sélectionner un WOD
    </option>
  `;

  state.wods.forEach((wod) => {

    const option =
      document.createElement("option");

    option.value = wod.id;

    option.textContent =
      `${wod.id} — ${wod.name}`;

    if (wod.id === selectedWodId) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

export function renderWeeklies(
  weekliesToDisplay: Weekly[] = state.weeklies
) {

  const list =
    document.querySelector<HTMLElement>(
      "#weekly-list"
    );

  const counter =
    document.querySelector<HTMLElement>(
      "#weekly-counter"
    );

  if (!list) return;

  if (counter) {
    counter.textContent =
      `${state.weeklies.length} Weekly${
        state.weeklies.length > 1 ? "s" : ""
      }`;
  }

  if (weekliesToDisplay.length === 0) {

    list.innerHTML = `
      <div class="empty-state">
        <span>🏆</span>
        <strong>Aucun Weekly pour le moment</strong>
        <p>
          Commence par créer ton premier Weekly Challenge.
        </p>
      </div>
    `;

    return;
  }

  list.innerHTML =
    weekliesToDisplay
      .map((weekly) => {

        const wod =
          state.wods.find(
            (item) => item.id === weekly.wodId
          );

        const formattedDate =
          weekly.date
            ? new Date(
                `${weekly.date}T00:00:00`
              ).toLocaleDateString(
                "fr-FR"
              )
            : "-";

        return `
          <div class="wod-card">

            <div class="wod-card-id">
              ${weekly.id}
            </div>

            <div class="wod-card-main">

              <strong>
                ${escapeHtml(weekly.name)}
              </strong>

              <span>
                🏋️ ${
                  wod
                    ? `${wod.id} — ${escapeHtml(wod.name)}`
                    : "WOD non trouvé"
                }
                · ${formattedDate}
              </span>

            </div>

            <div
              class="wod-card-status"
              data-weekly-status="${weekly.id}"
            >
              ${escapeHtml(weekly.status)}
            </div>

            <div class="wod-card-actions">

              <button
                class="wod-edit-button wod-view-button"
                data-view-weekly="${weekly.id}"
              >
                Voir
              </button>

              <button
                class="wod-edit-button"
                data-edit-weekly="${weekly.id}"
              >
                Modifier
              </button>

              <button
                class="wod-delete-button"
                data-delete-weekly="${weekly.id}"
              >
                Supprimer
              </button>

            </div>

          </div>
        `;
      })
      .join("");

  setupWeeklyViewButtons();
  setupWeeklyEditButtons();
  setupWeeklyDeleteButtons();
}

function setupWeeklyViewButtons() {

  const buttons =
    document.querySelectorAll<HTMLButtonElement>(
      "[data-view-weekly]"
    );

  const modal =
    document.querySelector<HTMLElement>(
      "#weekly-detail-modal"
    );

  const overlay =
    document.querySelector<HTMLElement>(
      "#weekly-detail-overlay"
    );

  const closeButton =
    document.querySelector<HTMLButtonElement>(
      "#weekly-detail-close"
    );

  const title =
    document.querySelector<HTMLElement>(
      "#weekly-detail-title"
    );

  const content =
    document.querySelector<HTMLElement>(
      "#weekly-detail-content"
    );

  if (
    !modal ||
    !overlay ||
    !closeButton ||
    !title ||
    !content
  ) {
    return;
  }

  function closeModal() {
    modal?.classList.add("hidden");
  }

  function getProductionStatusClass(
    status: string
  ) {

    if (status === "Terminé") {
      return "production-status-done";
    }

    if (status === "En cours") {
      return "production-status-progress";
    }

    return "production-status-todo";
  }

  function updateWeeklyProduction(
    weekly: Weekly,
    task: "visual" | "text" | "publication"
  ) {

    const currentState =
      weekly.production[task];

    let nextState = "À faire";

    if (currentState === "À faire") {
      nextState = "En cours";
    } else if (currentState === "En cours") {
      nextState = "Terminé";
    }

    weekly.production[task] = nextState;

    const productionStates = [
      weekly.production.visual,
      weekly.production.text,
      weekly.production.publication
    ];

    const allDone =
      productionStates.every(
        (state) => state === "Terminé"
      );

    const anyStarted =
      productionStates.some(
        (state) =>
          state === "En cours" ||
          state === "Terminé"
      );

    if (allDone) {
      weekly.status = "Prêt";
    } else if (anyStarted) {
      weekly.status = "En cours";
    } else {
      weekly.status = "À créer";
    }

    saveWeeklies();

    deps.renderProduction();
    deps.renderPublications();

    return nextState;
  }

  function openWeekly(weeklyId: string) {

    const weekly =
      state.weeklies.find(
        (item) => item.id === weeklyId
      );

    if (!weekly) return;

    const wod =
      state.wods.find(
        (item) => item.id === weekly.wodId
      );

    const formattedDate =
      weekly.date
        ? new Date(
            `${weekly.date}T00:00:00`
          ).toLocaleDateString(
            "fr-FR"
          )
        : "-";

    title!.textContent =
      weekly.name;

    content!.innerHTML = `

      <div class="wod-detail-id">
        ${weekly.id}
      </div>

      <div class="wod-detail-grid">

        <div class="wod-detail-item">
          <span>WOD ASSOCIÉ</span>
          <strong>
            ${
              wod
                ? `${wod.id} — ${escapeHtml(wod.name)}`
                : "WOD non trouvé"
            }
          </strong>
        </div>

        <div class="wod-detail-item">
          <span>DATE</span>
          <strong>
            ${formattedDate}
          </strong>
        </div>

        <div class="wod-detail-item">
          <span>SCORE</span>
          <strong>
            ${escapeHtml(
              weekly.score || "-"
            )}
          </strong>
        </div>

        <div class="wod-detail-item">
          <span>STATUT</span>
          <strong id="weekly-detail-status">
            ${escapeHtml(
              weekly.status
            )}
          </strong>
        </div>

      </div>

      <div class="wod-detail-exercises">

        <span>RÈGLES / DESCRIPTION</span>

        <p>
          ${
            escapeHtml(
              weekly.description ||
              "Aucune description renseignée."
            )
          }
        </p>

      </div>

      <div class="wod-detail-production">

        <span>PRODUCTION</span>

        <div class="wod-detail-production-list">

          <div
            class="wod-detail-production-item"
            data-detail-weekly-production-task="visual"
            data-detail-weekly-id="${weekly.id}"
          >
            <span>🎨 Visuel</span>

            <strong
              class="${getProductionStatusClass(
                weekly.production.visual
              )}"
            >
              ${escapeHtml(
                weekly.production.visual
              )}
            </strong>
          </div>

          <div
            class="wod-detail-production-item"
            data-detail-weekly-production-task="text"
            data-detail-weekly-id="${weekly.id}"
          >
            <span>📝 Texte</span>

            <strong
              class="${getProductionStatusClass(
                weekly.production.text
              )}"
            >
              ${escapeHtml(
                weekly.production.text
              )}
            </strong>
          </div>

          <div
            class="wod-detail-production-item"
            data-detail-weekly-production-task="publication"
            data-detail-weekly-id="${weekly.id}"
          >
            <span>📱 Publication</span>

            <strong
              class="${getProductionStatusClass(
                weekly.production.publication
              )}"
            >
              ${escapeHtml(
                weekly.production.publication
              )}
            </strong>
          </div>

        </div>

      </div>

    `;

    modal?.classList.remove("hidden");
  }

  /* =========================
     BOUTONS VOIR
  ========================= */

  buttons.forEach((button) => {

    button.onclick = () => {

      const weeklyId =
        button.dataset.viewWeekly;

      if (!weeklyId) return;

      openWeekly(weeklyId);
    };

  });

  /* =========================
     PRODUCTION DANS LA FICHE
  ========================= */

  content.onclick = (event) => {

    const target =
      event.target as HTMLElement;

    const taskItem =
      target.closest<HTMLElement>(
        "[data-detail-weekly-production-task]"
      );

    if (!taskItem) return;

    const weeklyId =
      taskItem.dataset.detailWeeklyId;

    const task =
      taskItem.dataset
        .detailWeeklyProductionTask as
        | "visual"
        | "text"
        | "publication"
        | undefined;

    if (!weeklyId || !task) return;

    const weekly =
      state.weeklies.find(
        (item) => item.id === weeklyId
      );

    if (!weekly) return;

    const nextState =
      updateWeeklyProduction(
        weekly,
        task
      );

    const taskStatusElement =
      taskItem.querySelector<HTMLElement>(
        "strong"
      );

    if (taskStatusElement) {

      taskStatusElement.textContent =
        nextState;

      taskStatusElement.className =
        getProductionStatusClass(
          nextState
        );
    }

    const statusElement =
      content.querySelector<HTMLElement>(
        "#weekly-detail-status"
      );

    if (statusElement) {

      statusElement.textContent =
        weekly.status;
    }

    const weeklyCardStatus =
      document.querySelector<HTMLElement>(
        `[data-weekly-status="${weekly.id}"]`
      );

    if (weeklyCardStatus) {

      weeklyCardStatus.textContent =
        weekly.status;
    }

  };

  /* =========================
     FERMETURE
  ========================= */

  closeButton.onclick =
    closeModal;

  overlay.onclick =
    closeModal;
}

function setupWeeklyEditButtons() {

  const buttons =
    document.querySelectorAll<HTMLButtonElement>(
      "[data-edit-weekly]"
    );

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const weeklyId =
          button.dataset.editWeekly;

        if (!weeklyId) return;

        const weekly =
          state.weeklies.find(
            (item) => item.id === weeklyId
          );

        if (!weekly) return;

        editingWeeklyId = weekly.id;

        const form =
          document.querySelector<HTMLFormElement>(
            "#weekly-form"
          );

        const formPanel =
          document.querySelector<HTMLElement>(
            "#weekly-form-panel"
          );

        if (!form) return;

        populateWeeklyWodSelect(
          weekly.wodId
        );

        const setValue = (
          name: string,
          value: string
        ) => {

          const input =
            form.querySelector<
              HTMLInputElement |
              HTMLTextAreaElement |
              HTMLSelectElement
            >(
              `[name="${name}"]`
            );

          if (input) {
            input.value = value;
          }
        };

        setValue(
          "name",
          weekly.name
        );

        setValue(
          "wodId",
          weekly.wodId
        );

        setValue(
          "date",
          weekly.date
        );

        setValue(
          "description",
          weekly.description
        );

        setValue(
          "score",
          weekly.score
        );

        setValue(
          "status",
          weekly.status
        );

        formPanel?.classList.add(
          "visible"
        );

        formPanel?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    );
  });
}

function setupWeeklyDeleteButtons() {

  const buttons =
    document.querySelectorAll<HTMLButtonElement>(
      "[data-delete-weekly]"
    );

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const weeklyId =
          button.dataset.deleteWeekly;

        if (!weeklyId) return;

        const weekly =
          state.weeklies.find(
            (item) => item.id === weeklyId
          );

        if (!weekly) return;

        const confirmed =
          window.confirm(
            `Supprimer le ${weekly.id} "${weekly.name}" ?\n\nCette action est irréversible.`
          );

        if (!confirmed) return;

        const index =
          state.weeklies.findIndex(
            (item) => item.id === weeklyId
          );

        if (index === -1) return;

        state.weeklies.splice(index, 1);

        saveWeeklies();

        renderWeeklies();
      }
    );
  });
}

export function setupWeeklyFilters() {

  const search =
    document.querySelector<HTMLInputElement>(
      "#weekly-search"
    );

  const statusFilter =
    document.querySelector<HTMLSelectElement>(
      "#weekly-status-filter"
    );

  function applyFilters() {

    const searchValue =
      search?.value
        .toLowerCase()
        .trim() ?? "";

    const statusValue =
      statusFilter?.value ?? "";

    const filteredWeeklies =
      state.weeklies.filter((weekly) => {

        const matchesSearch =
          weekly.name
            .toLowerCase()
            .includes(searchValue) ||
          weekly.id
            .toLowerCase()
            .includes(searchValue) ||
          weekly.wodId
            .toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          !statusValue ||
          weekly.status === statusValue;

        return (
          matchesSearch &&
          matchesStatus
        );
      });

    renderWeeklies(
      filteredWeeklies
    );
  }

  search?.addEventListener(
    "input",
    applyFilters
  );

  statusFilter?.addEventListener(
    "change",
    applyFilters
  );
}
