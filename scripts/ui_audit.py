"""
Модуль автоматического визуального и DOM-аудита фронтенда SKALD Engine.

Назначение:
    Запускает headless-браузер Chromium через Playwright, обходит ключевые
    маршруты приложения в десктопном (1440x900) и мобильном (390x844)
    разрешениях, фиксирует ошибки консоли и сетевых запросов, проверяет
    горизонтальное переполнение и битые изображения, а также сохраняет
    скриншоты и сводный отчет для анализа в GitHub Actions и через GitHub MCP.

Связи с системой:
    Вызывается из workflow `.github/workflows/agent-verify.yml` после сборки
    и запуска `vite preview`. Результаты записываются в директорию `audit_out/`
    и публикуются в техническую ветку `ci-reports` (`latest/`).
"""

import argparse
import json
import os
from pathlib import Path
from typing import Any
from playwright.sync_api import Page, sync_playwright

# Целевые разрешения экрана для проверки адаптивности интерфейса
VIEWPORTS: dict[str, dict[str, int]] = {
    "desktop": {"width": 1440, "height": 900},
    "mobile": {"width": 390, "height": 844},
}

# Ключевые публичные и базовые маршруты SKALD Engine для визуального обхода
ROUTES: list[tuple[str, str]] = [
    ("landing", "/"),
    ("login", "/login"),
]


def audit_page(
    page: Page,
    base_url: str,
    slug: str,
    route: str,
    vp_name: str,
    vp_size: dict[str, int],
    out_dir: Path,
) -> dict[str, Any]:
    """
    Выполняет проверку одного маршрута в заданном разрешении экрана.

    Args:
        page: Активный экземпляр страницы Playwright.
        base_url: Базовый адрес запущенного фронтенд-сервера.
        slug: Короткий идентификатор маршрута для имени файла скриншота.
        route: Относительный путь страницы (например, "/" или "/login").
        vp_name: Название профиля разрешения ("desktop" или "mobile").
        vp_size: Словарь с ключами `width` и `height` в пикселях.
        out_dir: Директория для сохранения PNG-скриншотов.

    Returns:
        Словарь с результатами проверки: списки ошибок консоли/сети,
        результаты DOM-проверок и имя сохраненного файла скриншота.
    """
    console_errors: list[str] = []
    page_errors: list[str] = []
    failed_requests: list[str] = []

    # Перехватываем ошибки уровня console.error, необработанные исключения и HTTP 4xx/5xx
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    page.on(
        "response",
        lambda res: failed_requests.append(f"{res.status} {res.url}")
        if res.status >= 400 and "favicon" not in res.url
        else None,
    )

    page.set_viewport_size(vp_size)
    target_url = f"{base_url.rstrip('/')}{route}"
    page.goto(target_url, wait_until="networkidle", timeout=30000)

    # Небольшая пауза для завершения стартовых CSS-переходов и анимаций рендера
    page.wait_for_timeout(800)

    # Проверяем в DOM наличие горизонтального скролла и незагруженных изображений
    dom_checks: dict[str, Any] = page.evaluate(
        """() => {
            const doc = document.documentElement;
            const hasHorizontalOverflow = doc.scrollWidth > doc.clientWidth;
            const brokenImages = Array.from(document.images)
                .filter(img => !img.complete || img.naturalWidth === 0)
                .map(img => img.src || img.alt || 'unnamed-img');
            return {
                hasHorizontalOverflow,
                scrollWidth: doc.scrollWidth,
                clientWidth: doc.clientWidth,
                brokenImagesCount: brokenImages.length,
                brokenImages
            };
        }"""
    )

    screenshot_name = f"{vp_name}_{slug}.png"
    page.screenshot(path=str(out_dir / screenshot_name), full_page=True)

    return {
        "route": route,
        "viewport": vp_name,
        "screenshot": screenshot_name,
        "console_errors": console_errors,
        "page_errors": page_errors,
        "failed_requests": failed_requests,
        "dom_checks": dom_checks,
    }


def build_markdown_summary(results: list[dict[str, Any]]) -> str:
    """
    Формирует человекочитаемую Markdown-сводку по результатам визуального аудита.

    Args:
        results: Список словарей с результатами проверок по всем страницам.

    Returns:
        Отформатированная строка отчета для `ci-summary.md` и комментария в PR.
    """
    lines: list[str] = ["# Отчет UI-аудита и сборки (SKALD Engine)\n"]

    for item in results:
        total_errors = (
            len(item["console_errors"])
            + len(item["page_errors"])
            + len(item["failed_requests"])
        )
        overflow = item["dom_checks"]["hasHorizontalOverflow"]
        broken_imgs = item["dom_checks"]["brokenImagesCount"]
        status_label = "OK" if (total_errors == 0 and not overflow and broken_imgs == 0) else "WARN"

        lines.append(
            f"## [{status_label}] `{item['route']}` ({item['viewport']}) — скриншот: `{item['screenshot']}`"
        )
        lines.append(
            f"- Горизонтальный скролл: **{'ДА' if overflow else 'нет'}** "
            f"({item['dom_checks']['scrollWidth']}px / {item['dom_checks']['clientWidth']}px)"
        )
        lines.append(f"- Битые изображения: **{broken_imgs}**")
        lines.append(
            f"- Ошибки JS / консоли: **{len(item['console_errors']) + len(item['page_errors'])}**"
        )
        lines.append(f"- Ошибки сети (4xx/5xx): **{len(item['failed_requests'])}**\n")

        # Если есть конкретные сообщения об ошибках, выводим их списком для быстрой диагностики
        if item["console_errors"] or item["page_errors"] or item["failed_requests"]:
            lines.append("**Детали ошибок:**")
            for err in item["console_errors"] + item["page_errors"] + item["failed_requests"]:
                lines.append(f"- `{err}`")
            lines.append("")

    return "\n".join(lines)


def main() -> None:
    """
    Точка входа CLI-скрипта визуального аудита.

    Разбирает аргументы `--url` и `--out-dir` (или переменную окружения
    `AUDIT_BASE_URL`), запускает обход всех комбинаций разрешений и маршрутов,
    сохраняет `ui-report.json` и `ci-summary.md`.
    """
    parser = argparse.ArgumentParser(description="Playwright UI Audit для SKALD Engine")
    parser.add_argument(
        "--url",
        default=os.environ.get("AUDIT_BASE_URL", ""),
        help="Базовый адрес стенда (или переменная окружения AUDIT_BASE_URL)",
    )
    parser.add_argument("--out-dir", default="audit_out", help="Папка для отчетов и скриншотов")
    args = parser.parse_args()

    if not args.url:
        raise ValueError("Не указан адрес стенда: передайте --url или задайте AUDIT_BASE_URL")

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict[str, Any]] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for vp_name, vp_size in VIEWPORTS.items():
            context = browser.new_context()
            page = context.new_page()
            for slug, route in ROUTES:
                audit_result = audit_page(page, args.url, slug, route, vp_name, vp_size, out_dir)
                results.append(audit_result)
            context.close()
        browser.close()

    (out_dir / "ui-report.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (out_dir / "ci-summary.md").write_text(
        build_markdown_summary(results),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
