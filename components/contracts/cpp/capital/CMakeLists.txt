cmake_minimum_required(VERSION 3.5)

# Проект
project(capital)

find_package(cdt)

# Добавление контракта
add_contract(capital capital capital.cpp)
if(IS_TESTNET)
    target_compile_definitions(capital PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()
