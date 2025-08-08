void capital::approvecmmt(eosio::name coopname, checksum256 commit_hash, document2 empty_document) {
  require_auth(_soviet);

  // Получаем коммит
  auto commit = Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  // Добавляем коммит к проекту
  Capital::Projects::add_commit(coopname, commit.project_hash, commit.amounts);

  // Обновляем или создаем сегмент создателя
  Capital::Core::upsert_creator_segment(coopname, commit.project_hash, commit.username, commit.amounts);

  // Распределяем авторские средства между всеми авторами проекта
  Capital::Core::increment_authors_crps_in_project(coopname, commit.project_hash, 
                                   commit.amounts.authors_base_pool, 
                                   commit.amounts.authors_bonus_pool);

  // Удаляем коммит после обработки
  Capital::Commits::delete_commit(coopname, commit_hash);  
};