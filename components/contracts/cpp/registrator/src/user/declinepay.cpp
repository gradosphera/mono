void registrator::declinepay(name coopname, checksum256 registration_hash, std::string reason){
  require_auth(_gateway);
  
  auto exist_candidate = Registrator::get_candidate_by_hash(coopname, registration_hash);
  
  eosio::check(!exist_candidate.has_value(), "Кандидат не найден");
  
  Registrator::candidates_index candidates(_registrator, coopname.value);
  
  auto candidate = candidates.find(exist_candidate -> username.value);
  
  candidates.erase(candidate);
    
}