#include "gamification.hpp"
#include "../../entities/contributors.hpp"

namespace Capital::Gamification {

  inline uint64_t calculate_level_requirement(uint32_t level, const Capital::config& config) {
    if (level == 1) {
      return config.level_depth_base;
    }

    // level_requirement(N) = level_depth_base × level_growth_coefficient^(N-1)
    double multiplier = 1.0;
    for (uint32_t i = 1; i < level; i++) {
      multiplier *= config.level_growth_coefficient;
    }

    return static_cast<uint64_t>(config.level_depth_base * multiplier);
  }

  inline double calculate_energy_gain(eosio::asset contribution_amount, uint32_t current_level, const Capital::config& config) {
    if (contribution_amount.amount <= 0) {
      return 0.0;
    }

    uint64_t level_requirement = calculate_level_requirement(current_level, config);

    // gain = (contribution_amount / level_requirement) × energy_gain_coefficient
    double gain = (static_cast<double>(contribution_amount.amount) / static_cast<double>(level_requirement)) * config.energy_gain_coefficient;

    return gain;
  }

  inline void update_energy_with_decay(eosio::name coopname, eosio::name username) {
    Capital::contributor_index contributors(_capital, coopname.value);
    auto username_index = contributors.get_index<"byusername"_n>();
    auto itr = username_index.find(username.value);

    eosio::check(itr != username_index.end(), "Участник не найден");

    auto config = Capital::State::get_global_state(coopname).config;
    auto current_time = eosio::current_time_point();

    username_index.modify(itr, _capital, [&](auto &c) {
      // Рассчитываем сколько дней прошло с последнего обновления
      uint32_t seconds_passed = current_time.sec_since_epoch() - c.last_energy_update.sec_since_epoch();
      double days_passed = static_cast<double>(seconds_passed) / 86400.0;

      // Применяем процентное затухание энергии
      double decay = c.energy * config.energy_decay_rate_per_day * days_passed;
      c.energy = std::max(0.0, c.energy - decay);

      // Обновляем время последнего обновления
      c.last_energy_update = current_time;
    });
  }

  inline void add_energy_and_check_levelup(eosio::name coopname, eosio::name username, double energy_gain) {
    if (energy_gain <= 0.0) {
      return;
    }

    Capital::contributor_index contributors(_capital, coopname.value);
    auto username_index = contributors.get_index<"byusername"_n>();
    auto itr = username_index.find(username.value);

    eosio::check(itr != username_index.end(), "Участник не найден");

    uint32_t prev_level = itr->level;

    username_index.modify(itr, _capital, [&](auto &c) {
      // Добавляем энергию
      c.energy += energy_gain;

      // Обновляем время последнего обновления
      c.last_energy_update = eosio::current_time_point();

      // Проверяем переход на новый уровень (поддержка перескока через несколько уровней)
      if (c.energy >= 100.0) {
        uint32_t levels_gained = static_cast<uint32_t>(c.energy / 100.0);
        c.level += levels_gained;
        c.energy = std::fmod(c.energy, 100.0);
      }
    });

    // Если уровень изменился, отправляем уведомление
    auto new_itr = username_index.find(username.value);
    if (new_itr->level > prev_level) {
      // Вызываем inline action для уведомления о переходе на новый уровень
      eosio::action(
        eosio::permission_level{_capital, "active"_n},
        _capital,
        "lvlnotify"_n,
        std::make_tuple(coopname, username, prev_level, new_itr->level)
      ).send();
    }
  }

  inline void update_gamification_from_segment(eosio::name coopname, const Capital::Segments::segment& segment) {
    auto contributor = Capital::Contributors::get_contributor(coopname, segment.username);
    if (!contributor.has_value()) {
      return;
    }

    auto config = Capital::State::get_global_state(coopname).config;

    // Собираем все вклады из сегмента
    eosio::asset total_contribution = asset(0, _root_govern_symbol);

    if (segment.is_investor) {
      total_contribution += segment.investor_base;
    }

    if (segment.is_author) {
      total_contribution += (segment.author_base + segment.author_bonus);
    }

    if (segment.is_creator) {
      total_contribution += (segment.creator_base + segment.creator_bonus);
    }

    if (segment.is_coordinator) {
      total_contribution += segment.coordinator_base;
    }

    if (segment.is_contributor) {
      total_contribution += segment.contributor_bonus;
    }

    if (segment.is_propertor) {
      total_contribution += segment.property_base;
    }

    // Рассчитываем прирост энергии
    double energy_gain = calculate_energy_gain(total_contribution, contributor->level, config);

    // Добавляем энергию и проверяем переход уровня
    add_energy_and_check_levelup(coopname, segment.username, energy_gain);
  }

} // namespace Capital::Gamification
