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
                                        eosio::name username, const generation_amounts &delta_amounts) {
      Segments::segments_index segments(_capital, coopname.value);
      auto exist_segment = Segments::get_segment(coopname, project_hash, username);

      if (!exist_segment.has_value()) {
          segments.emplace(_capital, [&](auto &g){
              g.id            = segments.available_primary_key();
              g.coopname      = coopname;
              g.project_hash  = project_hash;
              g.username      = username;
              g.creator_base = delta_amounts.creators_base_pool;
              g.creator_bonus = delta_amounts.creators_bonus_pool;
              g.is_creator = true;
          });
          
          // Увеличиваем счетчики
          Capital::Projects::increment_total_creators(coopname, project_hash);
          // Увеличиваем счетчик участников голосования, т.к. новый создатель имеет право голоса
          Capital::Projects::increment_total_voters(coopname, project_hash);
      
        } else {
          auto segment = segments.find(exist_segment->id);
          bool became_creator = (!exist_segment->is_creator);
          
          segments.modify(segment, _capital, [&](auto &g) {
              if (!g.is_creator) {
                  g.is_creator = true;
              }
              g.creator_base += delta_amounts.creators_base_pool;
              g.creator_bonus += delta_amounts.creators_bonus_pool;
          });
          
          if (became_creator) {
              Capital::Projects::increment_total_creators(coopname, project_hash);
              // Увеличиваем счетчик участников голосования, т.к. участник стал создателем
              Capital::Projects::increment_total_voters(coopname, project_hash);
          }
      }
      
  }
}// namespace Capital::Core