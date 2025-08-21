/**
 * @brief Создание нового решения собрания.
 * Сервисное действие для создания решения по итогам собрания
 * @param coopname Наименование кооператива
 * @param presider Председатель собрания
 * @param secretary Секретарь собрания
 * @param hash Хэш собрания
 * @param results Результаты голосования по вопросам
 * @param signed_ballots Количество подписанных бюллетеней
 * @param quorum_percent Процент кворума
 * @param quorum_passed Флаг прохождения кворума
 * @param decision Документ решения
 * @ingroup public_actions
 * @ingroup public_meet_actions
 * @anchor meet_newgdecision
 * @note Авторизация требуется от аккаунта: @p meet
 */
void meet::newgdecision(NEWGDECISION_SIGNATURE) {
    require_auth(_meet);
    require_recipient(coopname);
}