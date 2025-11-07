add_contract(eosio.bios eosio.bios ${CMAKE_CURRENT_SOURCE_DIR}/src/eosio.bios.cpp)
if(IS_TESTNET)
    target_compile_definitions(eosio.bios PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()

target_include_directories(eosio.bios
   PUBLIC
   ${CMAKE_CURRENT_SOURCE_DIR}/include)

set_target_properties(eosio.bios
   PROPERTIES
   RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}")

configure_file( ${CMAKE_CURRENT_SOURCE_DIR}/ricardian/eosio.bios.contracts.md.in ${CMAKE_CURRENT_BINARY_DIR}/ricardian/eosio.bios.contracts.md @ONLY )

target_compile_options( eosio.bios PUBLIC -R${CMAKE_CURRENT_SOURCE_DIR}/ricardian -R${CMAKE_CURRENT_BINARY_DIR}/ricardian )
