cmake_minimum_required(VERSION 3.5)

# Проект
project(ledger)

find_package(cdt)

# Добавление контракта
add_contract(ledger ledger ledger.cpp)
if(IS_TESTNET)
    target_compile_definitions(ledger PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()
