using namespace eosio;
using std::string;

namespace Capital {

  inline program get_capital_program_or_fail(eosio::name coopname) {
    auto program = get_program_or_fail(coopname, _capital_program_id);
    return program;
  }


  inline program get_source_program_or_fail(eosio::name coopname) {
    auto program = get_program_or_fail(coopname, _source_program_id);
    return program;
  };

} // namespace Capital