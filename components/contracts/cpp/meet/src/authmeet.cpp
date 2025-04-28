void meet::authmeet(eosio::name coopname, checksum256 hash, document authorization) {
  require_auth(_soviet);
  
  auto exist_meet = get_meet(coopname, hash);
  eosio::check(exist_meet.has_value(), "Собрание не найдено");
  
  Meet::meets_index genmeets(_meet, coopname.value);
  auto genmeet = genmeets.find(exist_meet -> id);
  
  if (!TEST_MODE)
    eosio::check(genmeet -> open_at.sec_since_epoch() >= current_time_point().sec_since_epoch() + MIN_OPEN_AGM_DELAY_SEC,
             "Дата открытия должна быть по крайней мере через 15 дней от момента решения совета");

  //TODO: change payer to coopname
  genmeets.modify(genmeet, _meet, [&](auto &gm){
    gm.status = "authorized"_n;
    gm.authorization = authorization;
  });
};
