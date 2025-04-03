struct [[eosio::table, eosio::contract(CAPITAL)]] debt {
  uint64_t         id;
  eosio::name      coopname;
  eosio::name      username;
  eosio::name      status = "created"_n;
  checksum256      debt_hash;
  checksum256      result_hash;
  checksum256      project_hash;
  asset            amount;
  document         statement;
  document         approved_statement;
  std::string      memo;
  
  uint64_t primary_key() const { return id; }

  uint64_t by_username() const { return username.value; }
  checksum256 by_debt_hash() const { return debt_hash; }
  checksum256 by_result_hash() const { return result_hash; }
  checksum256 by_project_hash() const { return project_hash; }
};

typedef eosio::multi_index<
  "debts"_n,
  debt,
  indexed_by<"byusername"_n, const_mem_fun<debt, uint64_t, &debt::by_username>>,
  indexed_by<"bydebthash"_n, const_mem_fun<debt, checksum256, &debt::by_debt_hash>>,
  indexed_by<"byresulthash"_n, const_mem_fun<debt, checksum256, &debt::by_result_hash>>,
  indexed_by<"byprojhash"_n, const_mem_fun<debt, checksum256, &debt::by_project_hash>>
> debts_index;
