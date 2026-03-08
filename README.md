# Monologue Token

A FoundryVTT module that adds a clickable token to the canvas. When clicked, players can select another player to share what their character is thinking.

## How it works

- A token appears at the bottom-left of the screen, visible to all players
- Any player can click the token and select another player
- A customizable announcement appears on screen for everyone
- The token is then disabled until the GM reactivates it
- The GM can right-click the token to manually activate or deactivate it

## Settings

The GM can configure the following in the module settings:

- **Token Image** - Pick any image from the server's file browser
- **Token Size** - Adjust the size with a slider (50px to 500px)
- **Announcement Text** - Customize the text shown when a player is selected. Supports `{player}` and `{character}` placeholders

## Development

```bash
pnpm install
pnpm build
pnpm link-foundry
```

Set `FOUNDRY_DATA` in a `.env` file to point to your FoundryVTT data directory:

```
FOUNDRY_DATA=D:\path\to\FoundryVTT\Data
```

Use `pnpm dev` for watch mode during development.

## Compatibility

- FoundryVTT v12+
- Verified on v13
