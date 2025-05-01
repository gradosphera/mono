# Документация «Цифровой Кооператив»

## Установка

1. **Установите Python (3.8+)**  
   Убедитесь, что Python установлен в системе:
   ```sh
   python --version
   ```

2. **Установите mkdocs и необходимые плагины:**  
   Рекомендуется использовать виртуальное окружение:
   ```sh
   python -m venv venv
   source venv/bin/activate
   pip install mkdocs-material mkdocs-macros-plugin mkdocs-section-index mkdocs-blog pymdown-extensions
   ```
   > **Примечание:**
   > Если используются дополнительные плагины, проверьте их наличие в `mkdocs.yml` и установите их через pip.

3. **Установите Node.js-зависимости (только для публикации):**
   ```sh
   pnpm install
   ```

## Сборка и запуск

- **Локальный запуск документации:**
  ```sh
  mkdocs serve
  ```
  Откройте [http://localhost:8000](http://localhost:8000) в браузере.


## Структура

- `mkdocs.yml` — конфигурация сайта
- `docs/` — исходные markdown-файлы и ресурсы
- `main.py` — макросы для mkdocs-macros-plugin
- `site/` — собранная статика (автоматически создаётся)
