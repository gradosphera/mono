#pragma once
#include <eosio/eosio.hpp>

using namespace eosio;

#include <type_traits>

namespace Action {
  template <typename ExpectedSignature, typename... Args>
  void send(name contract, name action_name, name actor, Args&&... args) {
    using DecayedSignature = void(std::decay_t<Args>...);
    static_assert(std::is_same_v<ExpectedSignature, DecayedSignature>,
                "Argument types do not match the expected action signature");

    
    action(
      permission_level{actor, "active"_n},
      contract,
      action_name,
      std::make_tuple(std::forward<Args>(args)...)
    ).send();
  }
}