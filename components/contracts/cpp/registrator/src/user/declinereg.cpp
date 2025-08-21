/**
 * @brief Отклонение регистрации пользователя.
 * Отклоняет регистрацию кандидата советом
 * @param coopname Наименование кооператива
 * @param registration_hash Хэш регистрации
 * @param reason Причина отклонения регистрации
 * @ingroup public_actions
 * @ingroup public_registrator_actions
 * @anchor registrator_declinereg
 * @note Авторизация требуется от аккаунта: @p soviet
 */
void registrator::declinereg(name coopname, checksum256 registration_hash, std::string reason) {
  //событие отклонения регистрации советом
}