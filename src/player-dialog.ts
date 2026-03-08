import { showAnnouncement } from "./announcement";
import type { MonologueOverlay } from "./monologue-overlay";
import {
  MODULE_ID,
  SETTING_ANNOUNCEMENT_TEXT,
  SOCKET_NAME,
  type SocketMessage,
} from "./types";

export class PlayerSelectionDialog {
  static show(overlay: MonologueOverlay): void {
    const players = game.users.filter((u: User) => !u.isGM && u.active && u.id !== game.user.id);

    if (players.length === 0) {
      new Dialog({
        title: "Monologue Token",
        content: "<p>No active players found.</p>",
        buttons: {
          ok: { label: "OK" },
        },
      }).render(true);
      return;
    }

    const playerButtons = players
      .map(
        (p) =>
          `<button class="monologue-player-btn" data-user-id="${p.id}">
            <i class="fas fa-user"></i> ${p.name}
          </button>`
      )
      .join("");

    const content = `
      <div class="monologue-player-dialog">
        <p>Who should share what their character is thinking?</p>
        <div class="monologue-player-list">
          ${playerButtons}
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Monologue Token",
      content,
      buttons: {
        cancel: {
          label: "Cancel",
          icon: '<i class="fas fa-times"></i>',
        },
      },
    });
    dialog.render(true);

    // Wait for dialog to render, then attach button listeners
    setTimeout(() => {
      const el = document.querySelector(".monologue-player-dialog");
      if (!el) return;

      el.querySelectorAll<HTMLButtonElement>(".monologue-player-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = btn.dataset.userId;
          const user = game.users.find((u: User) => u.id === userId);
          if (!user) return;

          const playerName = user.name;
          const characterName = user.character?.name ?? user.name;

          // Show announcement locally (socket doesn't echo back to sender)
          const template = game.settings.get(MODULE_ID, SETTING_ANNOUNCEMENT_TEXT) as string;
          const text = template
            .replace(/\{player\}/g, playerName)
            .replace(/\{character\}/g, characterName);
          showAnnouncement(text);

          // Deactivate locally (setting onChange will also fire when GM persists it)
          overlay.setActive(false);

          // Notify other clients: show announcement + GM will deactivate via settings
          game.socket.emit(SOCKET_NAME, {
            type: "playerSelected",
            playerName,
            characterName,
          } satisfies SocketMessage);

          // Close the dialog
          const dialogEl = btn.closest(".app");
          if (dialogEl) {
            const closeBtn = dialogEl.querySelector<HTMLElement>(".header-button.close");
            closeBtn?.click();
          }
        });
      });
    }, 100);
  }
}
