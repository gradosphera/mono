//TODO: кажется удалить
[[eosio::action]] void soviet::newbatch(eosio::name coopname, eosio::name action, uint64_t batch_id) {
  require_auth(_soviet);

  require_recipient(coopname);
};
