import {
  MODULE_ID,
  SETTING_TOKEN_IMAGE,
  SETTING_TOKEN_SIZE,
  SETTING_ACTIVE,
} from "./types";
import { PlayerSelectionDialog } from "./player-dialog";

export class MonologueOverlay {
  private element: HTMLDivElement | null = null;
  private imgElement: HTMLImageElement | null = null;
  private active = true;

  render(): void {
    const el = document.createElement("div");
    el.id = "monologue-token-overlay";
    el.classList.add("monologue-token");

    const img = document.createElement("img");
    img.alt = "Monologue Token";
    el.appendChild(img);

    this.element = el;
    this.imgElement = img;

    this.updateAppearance();

    // Left-click: open player selection
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.active) return;
      PlayerSelectionDialog.show(this);
    });

    // Right-click: GM context menu
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!game.user.isGM) return;
      this.showContextMenu(e);
    });

    document.body.appendChild(el);
  }

  updateAppearance(): void {
    if (!this.imgElement || !this.element) return;

    const imagePath = game.settings.get(MODULE_ID, SETTING_TOKEN_IMAGE) as string;
    const size = game.settings.get(MODULE_ID, SETTING_TOKEN_SIZE) as number;

    this.imgElement.src = imagePath;
    this.element.style.setProperty("--monologue-token-size", `${size}px`);
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!this.element) return;

    if (active) {
      this.element.classList.remove("monologue-token--disabled");
      this.element.classList.add("monologue-token--active");
    } else {
      this.element.classList.add("monologue-token--disabled");
      this.element.classList.remove("monologue-token--active");
    }
  }

  private showContextMenu(e: MouseEvent): void {
    document.getElementById("monologue-context-menu")?.remove();

    const menu = document.createElement("div");
    menu.id = "monologue-context-menu";
    menu.classList.add("monologue-context-menu");

    const label = this.active ? "Deactivate" : "Activate";
    const icon = this.active ? "fa-toggle-off" : "fa-toggle-on";

    menu.innerHTML = `
      <div class="monologue-context-menu__item" data-action="toggle">
        <i class="fas ${icon}"></i> ${label}
      </div>
    `;

    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    menu.addEventListener("click", async (ev) => {
      const target = (ev.target as HTMLElement).closest("[data-action]") as HTMLElement | null;
      if (!target) return;

      // GM sets the setting directly — onChange propagates to all clients
      await game.settings.set(MODULE_ID, SETTING_ACTIVE, !this.active);
      menu.remove();
    });

    // Close menu on click elsewhere
    const closeMenu = (ev: MouseEvent) => {
      if (!menu.contains(ev.target as Node)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);

    document.body.appendChild(menu);
  }
}
