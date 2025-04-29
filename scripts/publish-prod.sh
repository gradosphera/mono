#!/bin/bash
set -e

# Получаем дату в формате YYYY.M.D без лидирующих нулей
BASE_VERSION="$(date +%Y).$(date +%-m).$(date +%-d)"

# Получаем последний тег с сегодняшней датой
LAST_TAG=$(git tag --list | grep "^$BASE_VERSION" | sort -V | tail -n 1)

if [[ -z "$LAST_TAG" ]]; then
  VERSION="$BASE_VERSION"
else
  # Если есть точка после даты, увеличиваем суффикс
  if [[ "$LAST_TAG" =~ ^$BASE_VERSION\.(\d+)$ ]]; then
    SUFFIX=$(echo "$LAST_TAG" | awk -F. '{print $4}')
    VERSION="$BASE_VERSION.$((SUFFIX+1))"
  else
    # Первый инкремент
    VERSION="$BASE_VERSION.1"
  fi
fi

echo "Публикуем версию: $VERSION"

# Переходим на main и мержим testnet
git checkout main
git merge -X theirs testnet

# Публикуем с нужной версией
lerna publish "$VERSION" --yes

# Пушим изменения
git push

# Возвращаемся на dev и мержим main
git checkout dev
git merge main 