using namespace eosio;
using std::string;

namespace Capital {

struct [[eosio::table, eosio::contract(CAPITAL)]] debt {
  uint64_t         id;
  eosio::name      coopname;
  eosio::name      username;
  eosio::name      status = "created"_n;
  checksum256      debt_hash;
  checksum256      project_hash;
  time_point_sec   repaid_at;
  asset            amount;
  document2         statement;
  document2         approved_statement;
  document2         authorization;
  std::string      memo;
  
  uint64_t primary_key() const { return id; }

  uint64_t by_username() const { return username.value; }
  checksum256 by_debt_hash() const { return debt_hash; }
  checksum256 by_project_hash() const { return project_hash; }
};

typedef eosio::multi_index<
  "debts"_n,
  debt,
  indexed_by<"byusername"_n, const_mem_fun<debt, uint64_t, &debt::by_username>>,
  indexed_by<"bydebthash"_n, const_mem_fun<debt, checksum256, &debt::by_debt_hash>>,
  indexed_by<"byprojhash"_n, const_mem_fun<debt, checksum256, &debt::by_project_hash>>
> debts_index;

inline std::optional<debt> get_debt(eosio::name coopname, const checksum256 &debt_hash) {
  debts_index debts(_capital, coopname.value);
  auto hash_index = debts.get_index<"bydebthash"_n>();

  auto itr = hash_index.find(debt_hash);
  if (itr == hash_index.end()) {
      return std::nullopt;
  }

  return *itr;
}


}// namespace Capital