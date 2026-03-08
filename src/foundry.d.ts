/* Minimal FoundryVTT type declarations for this module */

interface SettingConfig<T = unknown> {
  name: string;
  hint?: string;
  scope: "world" | "client";
  config: boolean;
  type: typeof String | typeof Number | typeof Boolean;
  default: T;
  range?: { min: number; max: number; step: number };
  filePicker?: "image" | "audio" | "video" | "imagevideo" | "folder" | "font" | "graphics" | "text" | "any" | true;
  onChange?: (value: T) => void;
  requiresReload?: boolean;
}

interface ClientSettings {
  register(namespace: string, key: string, data: SettingConfig): void;
  get(namespace: string, key: string): unknown;
  set(namespace: string, key: string, value: unknown): Promise<unknown>;
}

interface User {
  id: string;
  name: string;
  isGM: boolean;
  active: boolean;
  character?: { name: string } | null;
}

interface Users extends Array<User> {
  filter(predicate: (user: User) => boolean): User[];
}

interface ChatMessageData {
  content: string;
  speaker?: { alias?: string };
}

interface ChatMessageClass {
  create(data: ChatMessageData): Promise<unknown>;
}

interface SocketInterface {
  emit(event: string, data: unknown): void;
  on(event: string, callback: (data: unknown) => void): void;
}

interface DialogButton {
  label: string;
  callback?: (html: HTMLElement | JQuery) => void;
  icon?: string;
}

interface DialogData {
  title: string;
  content: string;
  buttons: Record<string, DialogButton>;
  default?: string;
  close?: () => void;
}

declare class Dialog {
  constructor(data: DialogData);
  render(force?: boolean): this;
}

interface ContextMenuEntry {
  name: string;
  icon: string;
  callback: (target: JQuery) => void;
  condition?: boolean | (() => boolean);
}

declare class ContextMenu {
  constructor(
    container: JQuery | HTMLElement,
    selector: string,
    menuItems: ContextMenuEntry[],
    options?: Record<string, unknown>
  );
}

interface Game {
  user: User;
  users: Users;
  settings: ClientSettings;
  socket: SocketInterface;
  i18n: { localize(key: string): string };
  modules: Map<string, { id: string; active: boolean }>;
}

interface HooksClass {
  once(event: string, callback: (...args: unknown[]) => void): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
}

declare const Hooks: HooksClass;
declare const game: Game;
declare const ChatMessage: ChatMessageClass;

interface JQuery {
  find(selector: string): JQuery;
  val(): string;
}
