cmake_minimum_required(VERSION 3.5)

# Проект
project(test)

find_package(cdt)

# Добавление контракта
add_contract(test test test.cpp)
target_compile_definitions(test PUBLIC IS_TESTNET=${IS_TESTNET})

# target_include_directories( fund PUBLIC ${CMAKE_SOURCE_DIR}/include )
