cmake_minimum_required(VERSION 3.5)

# Проект
project(wallet)

find_package(cdt)

# Добавление контракта
add_contract(wallet wallet wallet.cpp)
target_compile_definitions(wallet PUBLIC IS_TESTNET=${IS_TESTNET})
# target_include_directories( fund PUBLIC ${CMAKE_SOURCE_DIR}/include )
