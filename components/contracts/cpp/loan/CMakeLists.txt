cmake_minimum_required(VERSION 3.5)

# Проект
project(loan)

find_package(cdt)

# Добавление контракта
add_contract(loan loan loan.cpp)
target_compile_definitions(loan PUBLIC IS_TESTNET=${IS_TESTNET})
# target_include_directories( fund PUBLIC ${CMAKE_SOURCE_DIR}/include )
