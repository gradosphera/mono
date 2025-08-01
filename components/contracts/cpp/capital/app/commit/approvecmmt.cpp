void capital::approvecmmt(eosio::name coopname, checksum256 commit_hash, document2 empty_document) {
  require_auth(_soviet);

  // Получаем коммит
  auto commit = Capital::Commits::get_commit_or_fail(coopname, commit_hash);
  
  // Добавляем коммит к проекту
  Capital::Projects::add_commit(coopname, commit.project_hash, commit.amounts);

  // Добавляем вкладчику накопительные часы создателя
  Capital::Contributors::add_creator_hours_to_contributor(coopname, commit.project_hash, commit.username, commit.amounts.creators_hours);

  // Обновляем или создаем сегмент создателя
  Capital::Circle::upsert_creator_segment(coopname, commit.project_hash, commit.username, commit.amounts);

  // Распределяем авторские средства между всеми авторами проекта
  Capital::Core::distribute_author_rewards(coopname, commit.project_hash, commit.amounts);

  // Удаляем коммит после обработки
  Capital::Commits::delete_commit(coopname, commit_hash);  
};