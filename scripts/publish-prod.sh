#!/bin/bash
set -e

# Получаем дату в формате vYYYY.M.D без лидирующих нулей
BASE_VERSION="v$(date +%Y).$(date +%-m).$(date +%-d)"

# Получаем все теги с сегодняшней датой
TAGS=($(git tag --list | grep "^$BASE_VERSION" | sort -V))

MAX_SUFFIX=0
for TAG in "${TAGS[@]}"; do
  if [[ "$TAG" =~ ^$BASE_VERSION-(\d+)$ ]]; then
    SUFFIX=${BASH_REMATCH[1]}
    if (( SUFFIX > MAX_SUFFIX )); then
      MAX_SUFFIX=$SUFFIX
    fi
  elif [[ "$TAG" == "$BASE_VERSION" ]]; then
    if (( MAX_SUFFIX < 0 )); then
      MAX_SUFFIX=0
    fi
  fi
done

if (( ${#TAGS[@]} == 0 )); then
  VERSION="$BASE_VERSION"
elif (( MAX_SUFFIX == 0 )) && [[ ! " ${TAGS[@]} " =~ " $BASE_VERSION " ]]; then
  VERSION="$BASE_VERSION"
else
  VERSION="$BASE_VERSION-$((MAX_SUFFIX+1))"
fi

echo "Версионируем: $VERSION"

# Переходим на main и мержим testnet
git checkout -f main
git merge -X theirs testnet

# Только версия и тег, без публикации
lerna version "$VERSION" --yes --no-push=false --no-git-tag-version=false --force-publish

git push --follow-tags

# Возвращаемся на dev и мержим main
git checkout dev
git merge main 