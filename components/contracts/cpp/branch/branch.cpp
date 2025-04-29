#include "branch.hpp"

#include "src/addtrusted.cpp"
#include "src/createbranch.cpp"
#include "src/deletebranch.cpp"
#include "src/deltrusted.cpp"
#include "src/editbranch.cpp"

using namespace eosio;

[[eosio::action]] void branch::migrate() {
  require_auth(_branch);
}


[[eosio::action]] void branch::init()
{
  require_auth(_system);  
};

