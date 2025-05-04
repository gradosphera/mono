#!/bin/bash
set -e

# Получаем дату в формате vYYYY.M.D без лидирующих нулей
BASE_VERSION="v$(date +%Y).$(date +%-m).$(date +%-d)"

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

echo "Версионируем: $VERSION"

# Убираем v для lerna
LERNA_VERSION="${VERSION#v}"

# Переходим на main и мержим testnet
git checkout -f main
git merge -X theirs testnet

# Только версия и тег, без публикации
lerna version "$LERNA_VERSION" --yes --no-push=false --no-git-tag-version=false --force-publish

git push --follow-tags

# Возвращаемся на dev и мержим main
git checkout dev
git merge main 