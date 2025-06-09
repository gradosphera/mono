#define NEWGDECISION_SIGNATURE \
  name coopname,               /* Имя кооператива */ \
  name presider,               /* Имя председателя */ \
  name secretary,              /* Имя секретаря */ \
  checksum256 hash,            /* Хэш собрания */ \
  std::vector<question_result> results, /* Итог по вопросам */ \
  uint64_t signed_ballots,     /* Число подписанных бюллетеней */ \
  double quorum_percent,     /* Процент кворума */ \
  bool quorum_passed,           /* Флаг достигнутого кворума */ \
  document2 decision          /* Протокол общего собрания */

using newgdecision_interface = void(NEWGDECISION_SIGNATURE);
