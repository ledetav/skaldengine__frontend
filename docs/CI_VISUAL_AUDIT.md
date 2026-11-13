# Визуальный аудит интерфейса и Fullstack CI (SKALD Engine)

## Назначение

Скрипт `scripts/ui_audit.py` и workflow `.github/workflows/agent-verify.yml` обеспечивают автоматическую сквозную проверку фронтенда в связке с бэкендом `ledetav/skaldengine__backend`.

## Как работает пайплайн

1. **Склейка веток:** CI ищет в `ledetav/skaldengine__backend` ветку с таким же именем, как текущая фронтовая ветка (с фолбэком на `main`), и поднимает API рядом с собранным фронтендом (`vite preview`).
2. **Playwright-обход:** скрипт `scripts/ui_audit.py` открывает ключевые маршруты в десктопном (`1440x900`) и мобильном (`390x844`) разрешениях, проверяет отсутствие горизонтального скролла, битых изображений, ошибок консоли и ответов `4xx/5xx`.
3. **Публикация отчетов:** скриншоты (`desktop_*.png`, `mobile_*.png`), `ui-report.json` и `ci-summary.md` пушатся в техническую ветку `ci-reports` (папка `latest/`), а текстовая сводка дублируется комментарием в Pull Request.

## Секреты репозитория

- `CROSS_REPO_TOKEN` — токен для доступа к приватному/парному репозиторию `ledetav/skaldengine__backend`.
- `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` *(опционально)* — для отправки отчетов и скриншотов в Telegram.
