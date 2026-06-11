# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vue 3 application built with uni-app and Vite. Application code lives under `src/`:

- `src/pages/`: route-level uni-app pages; register new pages in `src/pages.json`.
- `src/components/`: reusable Vue components, such as `MyTabbar`.
- `src/api/`: feature-specific API wrappers.
- `src/utils/`: shared request, URL, date, WebSocket, and WeChat helpers.
- `src/static/`: images, fonts, and verification assets.

Global setup is in `src/main.js`, `src/App.vue`, `src/manifest.json`, and `src/uni.scss`. Vite proxy and build plugins are configured in `vite.config.js`. Do not commit `dist/` or `node_modules/`.

## Build, Test, and Development Commands

Use Node.js 24 to match the deployment workflow.

- `npm ci`: install the exact versions recorded in `package-lock.json`.
- `npm run dev:h5`: start the H5 development server on port `8081`.
- `npm run dev:mp-weixin`: build and watch the WeChat Mini Program target.
- `npm run build:h5`: create the production H5 bundle in `dist/build/h5`.
- `npm run build:mp-weixin`: create a production WeChat Mini Program build.

No automated test or lint script is configured. Before submitting changes, run the relevant production build and manually verify affected pages on the intended target.

## Coding Style & Naming Conventions

Use Vue 3 `<script setup>` and Composition API patterns. Keep changes consistent with the surrounding file; Vue templates and scripts generally use 2-space indentation and semicolons. Use:

- `PascalCase` for reusable component files and component names.
- `camelCase` for variables, functions, API methods, and utility files.
- Feature-based page and API names, for example `src/pages/integraEdu/` and `src/api/integraEdu.js`.

Prefer shared helpers from `src/utils/` over duplicating request or resource-URL logic.

## Testing Guidelines

There is no test framework or coverage requirement yet. Treat successful builds plus focused manual checks as required. Verify navigation, API errors, responsive H5 layout, and Mini Program behavior when relevant. If adding tests, place them beside the feature or under `tests/` and add an npm script.

## Commit & Pull Request Guidelines

History contains short Chinese summaries and merge commits. Use a concise, descriptive subject that states the actual change, preferably `feat:`, `fix:`, or `chore:` followed by a focused summary. Avoid vague messages such as `提交` or `修改`.

Pull requests should describe the change, affected targets, manual verification steps, and linked issues. Include screenshots for UI changes and note required environment or deployment changes. Never commit credentials, including in `.env.*`; keep deployment secrets in GitHub Actions secrets.
