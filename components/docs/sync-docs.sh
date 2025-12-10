#!/bin/bash

# Генерируем SDK документацию

# Копируем SDK документацию (без typedoc.json)
mkdir -p docs/sdk
rsync -av "../sdk/docs/" docs/sdk/

# Генерируем controller документацию
pnpm --dir ../controller run docs

# Копируем controller документацию
mkdir -p docs/graphql
rsync -av "../controller/docs/" docs/graphql/
