cmake_minimum_required(VERSION 3.5)

# Проект
project(meet)

find_package(cdt)

# Добавление контракта
add_contract(meet meet meet.cpp)
