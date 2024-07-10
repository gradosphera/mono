#!/bin/bash

# Сохраняем изменения в основном репозитории
git stash

# Сохраняем изменения во всех подмодулях
git submodule foreach git stash

