# SKALD Engine Frontend

## Обзор
Современный одностраничный веб-интерфейс на базе React 19 + Vite для платформы интерактивного сторителлинга и ролевых игр с ИИ **SKALD Engine**. Включает аутентификацию, чаты с потоковым SSE-стримингом, библиотеки знаний (лорбуки), персоны пользователей и панель администратора.

## Технологический стек
- React 19 с оптимизациями React Compiler (`babel-plugin-react-compiler`)
- Vite 8 (сервер разработки на порту 5000)
- TypeScript 5.9 (строгая типизация)
- React Router DOM v7
- Framer Motion 12 (анимации интерфейса)
- `react-markdown` + `remark-gfm` (рендеринг Markdown и таблиц)
- Pure CSS Modules + токены дизайн-системы (`src/theme/global/tokens.css`)

## Архитектура проекта
```
src/
  core/         # Общий API-клиент, контексты, хуки, типы и утилиты
  features/     # Модули функционала (Auth, Chat, CreateChat, Dashboard, Lorebooks, Personas, Profile, Admin)
  components/   # Переиспользуемые UI-компоненты и защищенные маршруты
  theme/        # Дизайн-система: токены, анимации и стили экранов
```

## Переменные окружения
Настраиваются в файле `.env` или секретах Replit:
- `VITE_CORE_API_URL` — базовый URL Core Service или API Gateway (по умолчанию: `http://localhost:8002/api/v1` или `http://localhost:8000/api/v1`)
- `VITE_AUTH_API_URL` — базовый URL Auth Service или API Gateway (по умолчанию: `http://localhost:8001/api/v1` или `http://localhost:8000/api/v1`)
- `VITE_LOG_LEVEL` — уровень логирования: `DEBUG`, `INFO`, `WARN`, `ERROR` (по умолчанию: `WARN`)

## Запуск
Приложение запускается стандартным скриптом разработки:
```bash
npm run dev
```

## Сборка и проверка качества
- Проверка типов и линтинг: `npm run lint`
- Продакшен-сборка: `npm run build`
- Предпросмотр сборки: `npm run preview`

## Особенности взаимодействия с бэкендом
- Аутентификация осуществляется по стандарту OAuth2 / JWT (токен хранится в `localStorage` и передается в заголовке `Authorization: Bearer <token>`).
- При получении ответа 401 генерируется событие `auth:session-expired` для автоматического выхода и очистки сессии.
- Потоковые ответы генерации ИИ принимаются через Server-Sent Events (SSE).
