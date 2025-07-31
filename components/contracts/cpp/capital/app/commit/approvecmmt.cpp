void capital::approvecmmt(eosio::name coopname, checksum256 commit_hash, document2 empty_document) {
  require_auth(_soviet);

  // Получаем коммит
  auto commit = Capital::get_commit(coopname, commit_hash);
  eosio::check(commit.has_value(), "Коммит не найден");
  
  // Используем уже рассчитанные при создании коммита фактические показатели
  auto calculated_fact = commit -> amounts;
  
  // Добавляем коммит к проекту
  Capital::Projects::add_commit(coopname, commit -> project_hash, calculated_fact);

  // Добавляем вкладчику накопительные часы создателя
  Capital::Contributors::add_creator_hours_to_contributor(coopname, commit -> project_hash, commit -> username, commit -> creator_hours);

  // Обновляем или создаем сегмент создателя
  Capital::Circle::upsert_creator_segment(coopname, commit -> project_hash, commit -> username, commit -> creator_base);

  // Удаляем коммит после обработки
  Capital::delete_commit(coopname, commit_hash);  
};