#include "crps.hpp"

namespace Capital::Core {

  /**
  * @brief Создает или обновляет запись пропертора с имущественным взносом в таблице segments.
  * @param coopname Имя кооператива (scope таблицы).
  * @param project_hash Хэш проекта.
  * @param username Имя пользователя.
  * @param property_amount Стоимость имущественного взноса.
  */
  void upsert_propertor_segment(eosio::name coopname, const checksum256 &project_hash, 
                                        eosio::name username, const eosio::asset &property_amount) {
      Segments::segments_index segments(_capital, coopname.value);
      auto exist_segment = Segments::get_segment(coopname, project_hash, username);

      if (!exist_segment.has_value()) {
        segments.emplace(_capital, [&](auto &g){
            g.id            = get_global_id_in_scope(_capital, coopname, "segments"_n);
            g.coopname      = coopname;
            g.project_hash  = project_hash;
            g.username      = username;
            g.property_base = property_amount;
            // Участник с имущественным взносом становится пропертором
            g.is_propertor = true;
        });

          // Увеличиваем счетчики для нового участника
          Capital::Projects::increment_total_unique_participants(coopname, project_hash);
          Capital::Projects::increment_total_propertors(coopname, project_hash);
      
        } else {
          auto segment = segments.find(exist_segment->id);
          bool became_contributor = (!exist_segment->is_propertor);
          
          segments.modify(segment, _capital, [&](auto &g) {
              if (!g.is_propertor) {
                  g.is_propertor = true;
              }
              g.property_base += property_amount;
          });
          
          if (became_contributor) {
              Capital::Projects::increment_total_propertors(coopname, project_hash);
          }
      }
      
      // Обновляем общую стоимость сегмента после добавления имущественного взноса
      Segments::update_segment_total_cost(coopname, project_hash, username);
  }
}// namespace Capital::Core
