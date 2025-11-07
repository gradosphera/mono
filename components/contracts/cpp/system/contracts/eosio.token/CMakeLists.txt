add_contract(eosio.token eosio.token ${CMAKE_CURRENT_SOURCE_DIR}/src/eosio.token.cpp)
if(IS_TESTNET)
    target_compile_definitions(eosio.token PUBLIC IS_TESTNET=1)
else()
    # Не определяем IS_TESTNET для продакшн режима
endif()

target_include_directories(eosio.token
   PUBLIC
   ${CMAKE_CURRENT_SOURCE_DIR}/include)

set_target_properties(eosio.token
   PROPERTIES
   RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}")

configure_file( ${CMAKE_CURRENT_SOURCE_DIR}/ricardian/eosio.token.contracts.md.in ${CMAKE_CURRENT_BINARY_DIR}/ricardian/eosio.token.contracts.md @ONLY )

target_compile_options( eosio.token PUBLIC -R${CMAKE_CURRENT_SOURCE_DIR}/ricardian -R${CMAKE_CURRENT_BINARY_DIR}/ricardian )
