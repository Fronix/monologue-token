export const MODULE_ID = "monologue-token";

export const SETTING_TOKEN_IMAGE = "tokenImage";
export const SETTING_TOKEN_SIZE = "tokenSize";
export const SETTING_ACTIVE = "active";
export const SETTING_ANNOUNCEMENT_TEXT = "announcementText";

export const SOCKET_NAME = `module.${MODULE_ID}`;

// Socket is only used for player -> GM deactivation + announcement broadcast
export interface SocketMessage {
  type: "playerSelected";
  playerName: string;
  characterName: string;
}
