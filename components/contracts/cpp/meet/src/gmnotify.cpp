void meet::gmnotify(name coopname, checksum256 hash, name username, document2 notification) {
    require_auth(coopname);

    // Проверяем документ уведомления
    verify_document_or_fail(notification);

    // Получаем собрание по хэшу
    Meet::meets_index genmeets(_meet, coopname.value);
    auto meet_idx = genmeets.get_index<"byhash"_n>();
    auto meet_itr = meet_idx.find(hash);
    eosio::check(meet_itr != meet_idx.end(), "Собрание не найдено");

    // Проверяем, что пользователь ещё не уведомлял
    const auto& notified = meet_itr->notified_users;
    eosio::check(std::find(notified.begin(), notified.end(), username) == notified.end(), "Пользователь уже подписал уведомление");

    // Добавляем пользователя
    meet_idx.modify(meet_itr, coopname, [&](auto& m) {
        m.notified_users.push_back(username);
    });
    
    Action::send<newlink_interface>(
      _soviet,
      "newlink"_n,
      _meet,
      coopname,
      username,
      get_valid_soviet_action("gmnotify"_n),
      hash,
      notification
    );
}
