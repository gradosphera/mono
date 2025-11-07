cmake_minimum_required(VERSION 3.5)

# Проект
project(contributor)

find_package(cdt)

# Добавление контракта
add_contract(contributor contributor contributor.cpp)
if(IS_TESTNET)
    target_compile_definitions(contributor PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()
