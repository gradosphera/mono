#include "crps.hpp"

namespace Capital::Core {

  /**
  * @brief Создает или обновляет запись генератора для создателя в таблице segments.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param username Имя пользователя создателя.
  * @param creator_base Себестоимость создателя для данного коммита.
  */
  void upsert_creator_segment(eosio::name coopname, const checksum256 &project_hash, 
                                        eosio::name username, const pools &delta_pools) {
      Circle::segments_index segments(_capital, coopname.value);
      auto exist_segment = Circle::get_segment(coopname, project_hash, username);

      if (!exist_segment.has_value()) {
          segments.emplace(_capital, [&](auto &g){
              g.id            = segments.available_primary_key();
              g.project_hash  = project_hash;
              g.username      = username;
              g.creator_base = delta_pools.creators_base_pool;
              g.creator_bonus = delta_pools.creators_bonus_pool;
              g.creator_shares = 1;
              g.has_vote = true; // Создатель имеет право голоса
              // сумма, которая доступна для получения ссуды и используется в качества залога
              g.provisional_amount = delta_pools.creators_base_pool;
              
          });
          
          // Увеличиваем счетчики
          Capital::Projects::increment_total_creator_shares(coopname, project_hash);
          // Увеличиваем счетчик участников голосования, т.к. новый создатель имеет право голоса
          Capital::Projects::increment_total_voters(coopname, project_hash);
      
        } else {
          auto segment = segments.find(exist_segment->id);
          bool became_creator = (exist_segment->creator_shares == 0);
          
          segments.modify(segment, _capital, [&](auto &g) {
              if (g.creator_shares == 0) {
                  g.creator_shares = 1;
                  g.has_vote = true; // Становится создателем - получает право голоса
              }
              g.creator_base += delta_pools.creators_base_pool;
              g.creator_bonus += delta_pools.creators_bonus_pool;
              g.provisional_amount += delta_pools.creators_base_pool;
              
          });
          
          if (became_creator) {
              Capital::Projects::increment_total_creator_shares(coopname, project_hash);
              // Увеличиваем счетчик участников голосования, т.к. участник стал создателем
              Capital::Projects::increment_total_voters(coopname, project_hash);
          }
      }
  }
}// namespace Capital::Core