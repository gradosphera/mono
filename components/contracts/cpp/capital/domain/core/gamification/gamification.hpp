#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

#include "../../entities/global_state.hpp"
#include "../../entities/segments.hpp"

namespace Capital::Gamification {

  /**
   * @brief Рассчитывает требуемую сумму вкладов для достижения указанного уровня
   * @param level Уровень, для которого нужно рассчитать требования
   * @param config Конфигурация контракта с параметрами геймификации
   * @return Требуемая сумма в микротокенах
   */
  inline uint64_t calculate_level_requirement(uint32_t level, const Capital::config& config);

  /**
   * @brief Рассчитывает прирост энергии от вклада
   * @param contribution_amount Сумма вклада
   * @param current_level Текущий уровень участника
   * @param config Конфигурация контракта с параметрами геймификации
   * @return Прирост энергии (0.0 - 100.0)
   */
  inline double calculate_energy_gain(eosio::asset contribution_amount, uint32_t current_level, const Capital::config& config);

  /**
   * @brief Обновляет энергию участника с учетом естественного снижения (decay)
   * @param coopname Имя кооператива
   * @param username Имя участника
   */
  inline void update_energy_with_decay(eosio::name coopname, eosio::name username);

  /**
   * @brief Добавляет энергию участнику и проверяет переход на новый уровень
   * @param coopname Имя кооператива
   * @param username Имя участника
   * @param energy_gain Прирост энергии
   */
  inline void add_energy_and_check_levelup(eosio::name coopname, eosio::name username, double energy_gain);

  /**
   * @brief Обновляет геймификацию (уровень и энергию) на основе вкладов из сегмента
   * @param coopname Имя кооператива
   * @param segment Сегмент с данными о вкладах участника
   */
  inline void update_gamification_from_segment(eosio::name coopname, const Capital::Segments::segment& segment);

} // namespace Capital::Gamification
