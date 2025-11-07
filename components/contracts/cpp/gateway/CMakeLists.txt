cmake_minimum_required(VERSION 3.5)

# Проект
project(gateway)

find_package(cdt)

# Добавление контракта
add_contract(gateway gateway gateway.cpp)
if(IS_TESTNET)
    target_compile_definitions(gateway PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()
# target_include_directories( fund PUBLIC ${CMAKE_SOURCE_DIR}/include )
