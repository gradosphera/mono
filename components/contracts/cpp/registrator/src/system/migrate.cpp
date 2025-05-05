[[eosio::action]] void registrator::migrate() {
  require_auth(_registrator);

  cooperatives_index coops(_registrator, _registrator.value);
  // Миграция cooperative -> cooperative2
  cooperatives2_index coops2(_registrator, _registrator.value);
  
  for (auto coop_itr = coops.begin(); coop_itr != coops.end(); ++coop_itr) {
      // Проверяем, что запись еще не существует в cooperatives2
      if (coops2.find(coop_itr->username.value) == coops2.end()) {
          // Создаем новую запись в cooperative2
          coops2.emplace(_registrator, [&](auto& new_coop) {
              new_coop.username = coop_itr->username;
              new_coop.parent_username = coop_itr->parent_username;
              new_coop.announce = coop_itr->announce;
              new_coop.description = coop_itr->description;
              new_coop.is_cooperative = coop_itr->is_cooperative;
              new_coop.is_branched = coop_itr->is_branched;
              new_coop.is_enrolled = coop_itr->is_enrolled;
              new_coop.coop_type = coop_itr->coop_type;
              new_coop.registration = coop_itr->registration;
              new_coop.initial = coop_itr->initial;
              new_coop.minimum = coop_itr->minimum;
              
              if (coop_itr->org_registration.has_value())
                  new_coop.org_registration = coop_itr->org_registration;
              if (coop_itr->org_initial.has_value())
                  new_coop.org_initial = coop_itr->org_initial;
              if (coop_itr->org_minimum.has_value())
                  new_coop.org_minimum = coop_itr->org_minimum;
              if (coop_itr->status.has_value())
                  new_coop.status = coop_itr->status;
              if (coop_itr->created_at.has_value())
                  new_coop.created_at = coop_itr->created_at;
              
              // Если есть документ в кооперативе, преобразуем его в document2
              if (coop_itr->document.has_value()) {
                  document2 new_doc;
                  new_doc.version = "0";
                  new_doc.hash = coop_itr->document.value().hash;
                  new_doc.doc_hash = coop_itr->document.value().hash;
                  new_doc.meta_hash = eosio::checksum256();
                  new_doc.meta = coop_itr->document.value().meta;
                  
                  // Добавляем информацию о подписи
                  signature_info sig;
                  sig.id = 0;
                  sig.signer = coop_itr->username;
                  sig.public_key = coop_itr->document.value().public_key;
                  sig.signature = coop_itr->document.value().signature;
                  
                  // Используем created_at как время подписания, если доступно
                  if (coop_itr->created_at.has_value()) {
                      sig.signed_at = coop_itr->created_at.value();
                  } else {
                      // В противном случае используем текущее время
                      sig.signed_at = eosio::time_point_sec(eosio::current_time_point());
                  }
                  
                  new_doc.signatures.push_back(sig);
                  new_coop.document = new_doc;
              }
          });
      }
  }
}