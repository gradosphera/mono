#!/bin/bash

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "Укажи версию: ./publish-release.sh v2.2.11"
  exit 1
fi

if [ ! -f changelog-release.md ]; then
  echo "Файл changelog-release.md не найден."
  exit 1
fi

gh release create "$VERSION" -F changelog-release.md -t "Release $VERSION" --verify-tag

echo "🎉 Release $VERSION опубликован."

