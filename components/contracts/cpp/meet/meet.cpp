// meet.cpp
#include "meet.hpp"
#include "src/vote.cpp"
#include "src/createmeet.cpp"
#include "src/authmeet.cpp"
#include "src/declmeet.cpp"
#include "src/restartmeet.cpp"
#include "src/signbysecr.cpp"
#include "src/signbypresid.cpp"
#include "src/newgdecision.cpp"
#include "src/gmnotify.cpp"

#include <optional>

[[eosio::action]]
void meet::migrate(){
  require_auth(_meet);
};

[[eosio::action]]
void meet::delmeet(eosio::name coopname, uint64_t meet_id) {
  require_auth(_meet);
  
  Meet::meets_index genmeets(_meet, coopname.value);
  auto meet = genmeets.find(meet_id);
  
  eosio::check(genmeets.end() != meet, "Собрание не найдено");
  
  genmeets.erase(meet);
};

std::optional<Meet::meet> meet::get_meet(eosio::name coopname, const checksum256 &hash) {
    Meet::meets_index genmeets(_meet, coopname.value);
    auto hash_index = genmeets.get_index<"byhash"_n>();

    auto itr = hash_index.find(hash);
    if (itr == hash_index.end()) {
        return std::nullopt;
    }

    return *itr;
}
