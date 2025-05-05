void meet::declmeet(name coopname, checksum256 hash, std::string reason) {
  require_auth(_soviet);
  
  auto exist_meet = get_meet(coopname, hash);
  
  if (exist_meet.has_value()) {
    Meet::meets_index genmeets(_meet, coopname.value);
    auto genmeet = genmeets.find(exist_meet -> id);
    genmeets.erase(genmeet);    
  };
   
};
