namespace Meet {
  
/**
  * @brief Структура действий, хранящая данные о выполненных операциях.
  * \ingroup public_tables
  */
struct [[eosio::table, eosio::contract(MEET)]] meet {
    uint64_t id;                                 /// Идентификатор собрания.
    checksum256 hash;                            /// Внешний хэш-идентификатор собрания.
    name coopname;                               ///< Имя кооператива.
    name type;                                    ///< Тип общего собрания (annual | special)
    name initiator;                               ///< Имя пользователя, который инициировал собрание.
    name presider;                               ///< Имя аккаунта председателя собрания.
    name secretary;                               ///< Имя аккаунта секретаря собрания

    name status;                                 ///< Статус коммита (created | authorized | pending | opened | closed )
    
    time_point_sec created_at;                   ///< Дата создания предложения.
    time_point_sec open_at;                   ///< Дата начала собрания.
    time_point_sec close_at;                   ///< Дата завершения собрания.
    
    uint64_t quorum_percent = 75;                 /// Цель по кворуму, чтобы собрание считалось состоявшимся
    uint64_t signed_ballots;                     /// Общее количество подписанных бюллетеней
    uint64_t current_quorum_percent;             /// Текущий процент кворума
    uint64_t cycle = 1;                          /// Цикл общего собрания, который указывает на то, что были предыдущие собрания, которые не состоялись по кворуму
    bool quorum_passed;                          /// Флаг пройденного кворума
    
    document proposal;                         ///< Предложение
    document authorization;                    ///< Решение совета
    
    
    uint64_t primary_key() const { return id; } ///< Основной ключ.
    checksum256 by_hash() const { return hash;} ///< Хэш-ключ
    uint64_t by_initiator() const { return initiator.value; } ///< По имени пользователя.
    uint64_t by_open_at() const { return open_at.sec_since_epoch(); }///< По дате открытия
    uint64_t by_close_at() const { return close_at.sec_since_epoch(); }///< По дате закрытия
};

typedef eosio::multi_index<
    "meets"_n, meet,
    indexed_by<"byhash"_n, const_mem_fun<meet, checksum256, &meet::by_hash>>,
    indexed_by<"byinitiator"_n, const_mem_fun<meet, uint64_t, &meet::by_initiator>>,
    indexed_by<"byopenat"_n, const_mem_fun<meet, uint64_t, &meet::by_open_at>>,
    indexed_by<"bycloseat"_n, const_mem_fun<meet, uint64_t, &meet::by_close_at>>
> meets_index;

}
