import {
  MODULE_ID,
  SETTING_TOKEN_IMAGE,
  SETTING_TOKEN_SIZE,
  SETTING_ACTIVE,
  SETTING_ANNOUNCEMENT_TEXT,
  SOCKET_NAME,
  type SocketMessage,
} from "./types";
import { MonologueOverlay } from "./monologue-overlay";
import { showAnnouncement } from "./announcement";

let overlay: MonologueOverlay | null = null;

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, SETTING_TOKEN_IMAGE, {
    name: "Token Image",
    hint: "The image displayed as the monologue token.",
    scope: "world",
    config: true,
    type: String,
    default: `modules/${MODULE_ID}/assets/default-token.svg`,
    filePicker: "image",
    onChange: () => overlay?.updateAppearance(),
  });

  game.settings.register(MODULE_ID, SETTING_TOKEN_SIZE, {
    name: "Token Size",
    hint: "The size of the monologue token in pixels.",
    scope: "world",
    config: true,
    type: Number,
    default: 100,
    range: { min: 50, max: 500, step: 10 },
    onChange: () => overlay?.updateAppearance(),
  });

  game.settings.register(MODULE_ID, SETTING_ANNOUNCEMENT_TEXT, {
    name: "Announcement Text",
    hint: "Text shown on screen when a player is selected. Use {player} and {character} as placeholders.",
    scope: "world",
    config: true,
    type: String,
    default: "{player}, share what {character} is thinking right now!",
  });

  game.settings.register(MODULE_ID, SETTING_ACTIVE, {
    name: "Token Active",
    hint: "Whether the monologue token is currently active.",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
    // Foundry auto-syncs world settings to all clients and fires onChange on each
    onChange: (value: unknown) => overlay?.setActive(value as boolean),
  });
});

Hooks.once("ready", () => {
  overlay = new MonologueOverlay();
  overlay.render();

  const isActive = game.settings.get(MODULE_ID, SETTING_ACTIVE) as boolean;
  overlay.setActive(isActive);

  // Socket is only used for: player selected someone -> show announcement + GM deactivates
  game.socket.on(SOCKET_NAME, async (data: unknown) => {
    const msg = data as SocketMessage;
    if (msg.type !== "playerSelected") return;

    // Show announcement on this client
    const template = game.settings.get(MODULE_ID, SETTING_ANNOUNCEMENT_TEXT) as string;
    const text = template
      .replace(/\{player\}/g, msg.playerName)
      .replace(/\{character\}/g, msg.characterName);
    showAnnouncement(text);

    // GM persists the deactivation — onChange will sync to all clients
    if (game.user.isGM) {
      await game.settings.set(MODULE_ID, SETTING_ACTIVE, false);
    }
  });
});
