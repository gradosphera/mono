#!/bin/bash

# Получаем текущую дату и время
CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")

# Коммитим и пушим изменения в основном репозитории
git add .
git commit -m "Автоматическое обновление подмодулей - $CURRENT_DATE"
git push origin main

# Проходим по всем подмодулям
git submodule foreach "
  git add .
  git commit -m 'Автоматическое обновление - $CURRENT_DATE'
  git push origin main
"

# Коммитим и пушим обновленные ссылки на подмодули
git add .
git commit -m "Обновление ссылок на подмодули - $CURRENT_DATE"
git push origin main

