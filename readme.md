# Mediashare / PocketPT Source Library

Shared React Native source library (UI, Redux state, API clients, business logic). Consumed as a **git submodule** by two app wrappers:

- [bluecollardev/mediashare-app](https://github.com/bluecollardev/mediashare-app) — Mediashare (original)
- [Armos51/ppt_mediashare-subscription](https://github.com/Armos51) — PocketPT (adds in-app purchase / subscriptions)

This is **not a standalone project**. There is no `package.json` here — the wrapper installs its own dependencies and resolves `mediashare/*` (path alias) to `./src/*` via the wrapper's `babel.config.js` and `tsconfig.json`. Run all commands (install, start, test, lint) from the wrapper repo.

## Backend

- [bluecollardev/mediashare-api](https://github.com/bluecollardev/mediashare-api) — Mediashare API (NestJS / MongoDB / Cognito)
- (PocketPT variant: `ppt_mediashare-platform`)

## Layout

- `src/Application.tsx` — root entry (imported as `mediashare/main` from the wrapper)
- `src/main.tsx`, `src/routes.tsx` — wrapper entry helpers + React Navigation route registry
- `src/components/`
  - `pages/` — screen components (Login, Feed, Playlists, MediaItemDetail, Search, AccountManagement, ManageUsers, ReportedContent, LatestReports, ReportsByUser, AccountSuspended, …)
  - `layout/` — shared layout primitives (AppHeader, InviteModal, MyQrCodeDialog, DraggableMediaList, ReportContentDialog, MediaCard, TrendingSection, TagBlocks, …)
  - `hoc/` — `withSearchComponent`, etc.
- `src/store/modules/` — Redux Toolkit slices (auth, user, mediaItems, mediaItem, playlists, playlist, playlistItem, adminUsers, reportedContent, search, shareItems, tags, …)
- `src/apis/{media-svc,user-svc,tags-svc}/rxjs-api/` — OpenAPI-generated TypeScript/RxJS clients (see *OpenAPI client generation* below)
- `src/core/aws/` — S3 upload/download (`uploadMediaToS3`, `getFromStorage`, `listStorage`, `key-factory`), Cognito auth utilities
- `src/core/utils/` — pure helpers (`qr-invite`, `qr-download`) + jest specs in `__tests__/`
- `src/hooks/` — custom hooks (`useUploader`, `useUser`, `useProfile`, …)
- `src/config.ts` — reads runtime config from `Constants.expoConfig.extra` (populated by the wrapper's `app.config.js` from `.env`)
- `patches/` — patch-package patches (Ruby 3.x / OpenSSL 3 / pod install fixes — applied by the wrapper's `postinstall`)

## How it's consumed

The wrapper registers `mediashare` as a path alias to `./app/src` via `babel-plugin-module-resolver` and TypeScript `paths`, then imports `mediashare/main` (and any other module under `src/`). All wrapper-specific concerns — entry point, native build, env files, packaging, deep-link scheme — live in the wrapper repo.

## OpenAPI client generation

The `src/apis/*/rxjs-api/` clients are **not handwritten** — they're generated from the backend's OpenAPI specs:

1. Each NestJS service (`mediashare-api/apps/<svc>/src/main.ts`) emits its spec to `openapi/<svc>.json` at startup (dev only).
2. `npm run gen:openapi` in the API repo runs `openapi-generator-cli generate` per `openapitools.json` → `openapi/clients/<svc>/rxjs-api/`.
3. The generated clients are then **manually copied** into `src/apis/{media-svc,user-svc,tags-svc}/rxjs-api/`. There is no automated sync — keep this in mind when updating API contracts.

Legacy note: an older single-client layout under `src/apis/rxjs-api/` pointed at a unified service on `:5000` that no longer exists. Stale submodule pins in older wrapper branches may still reference it.

## Local development gotchas

- **macOS AirPlay holds `:5000`.** Nothing in these projects runs on `:5000` anymore — if you see requests going there, something is pointing at a stale base URL. Either repoint or disable AirPlay Receiver (System Settings → General → AirDrop & Handoff).
- **Web auth cookie domain.** `Application.tsx` configures Amplify `cookieStorage`. Browsers reject `Set-Cookie` when `Domain=localhost`, so on local web the app falls back to default `localStorage` when `Config.CookieDomain` is unset or `'localhost'`. For staging/prod, set `CookieDomain` in the relevant `.env` to the real domain.

## Tests

Jest specs live next to the code they cover:

- `src/core/utils/__tests__/qr-invite.test.ts` — `buildInviteUrl` / `buildQrImageUrl` / `parseInviteUrl`
- `src/core/utils/__tests__/qr-download.test.ts` — `downloadQrImageWeb`
- `src/store/modules/__tests__/playlist.selectors.test.ts`

Run from the wrapper:

```shell
yarn test
```
