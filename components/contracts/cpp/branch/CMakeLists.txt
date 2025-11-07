cmake_minimum_required(VERSION 3.5)

# Проект
project(branch)

find_package(cdt)

# Добавление контракта
add_contract(branch branch branch.cpp)
if(IS_TESTNET)
    target_compile_definitions(branch PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()

# target_include_directories( fund PUBLIC ${CMAKE_SOURCE_DIR}/include )
