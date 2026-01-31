#include "voting.hpp"
#include "../../entities/votes.hpp"
#include "../../entities/segments.hpp"
#include "../../entities/projects.hpp"

namespace Capital::Core::Voting {

    void initialize_project_voting(name coopname, checksum256 project_hash) {
        auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        auto st = Capital::State::get_global_state(coopname);

        auto amounts = calculate_voting_amounts(
          project.fact.authors_bonus_pool,
          project.fact.creators_bonus_pool,
          project.counts.total_authors,
          project.voting.total_voters,
          st.config.authors_voting_percent,
          st.config.creators_voting_percent
      );
      
        // Устанавливаем параметры голосования из конфигурации
        Capital::project_index projects(_capital, coopname.value);
        auto proj = projects.find(project.id);
        projects.modify(proj, coopname, [&](auto &p) {
            p.voting.authors_voting_percent = st.config.authors_voting_percent;
            p.voting.creators_voting_percent = st.config.creators_voting_percent;
            p.voting.voting_deadline = time_point_sec(current_time_point().sec_since_epoch() + st.config.voting_period_in_days * 86400);
            p.voting.amounts = amounts;
        });
        
    }

    voting_amounts calculate_voting_amounts(const eosio::asset& authors_bonus_pool, 
                                       const eosio::asset& creators_bonus_pool,
                                       uint64_t total_authors,
                                       uint32_t total_voters,
                                       double authors_voting_percent,
                                       double creators_voting_percent) {
    voting_amounts result;
    
    // Коэффициенты
    double authors_equal_percent = (100.0 - authors_voting_percent) / 100.0;
    double creators_direct_percent = (100.0 - creators_voting_percent) / 100.0;
    double authors_voting_coeff = authors_voting_percent / 100.0;
    double creators_voting_coeff = creators_voting_percent / 100.0;
    
    // Авторские премии
    result.authors_equal_spread = eosio::asset(
        int64_t(static_cast<double>(authors_bonus_pool.amount) * authors_equal_percent),
        authors_bonus_pool.symbol
    );
    result.authors_bonuses_on_voting = eosio::asset(
        int64_t(static_cast<double>(authors_bonus_pool.amount) * authors_voting_coeff),
        authors_bonus_pool.symbol
    );
    
    if (total_authors > 0) {
        result.authors_equal_per_author = eosio::asset(
            result.authors_equal_spread.amount / total_authors,
            result.authors_equal_spread.symbol
        );
    } else {
        result.authors_equal_per_author = eosio::asset(0, authors_bonus_pool.symbol);
    }
    
    // Исполнительские премии
    result.creators_direct_spread = eosio::asset(
        int64_t(static_cast<double>(creators_bonus_pool.amount) * creators_direct_percent),
        creators_bonus_pool.symbol
    );
    result.creators_bonuses_on_voting = eosio::asset(
        int64_t(static_cast<double>(creators_bonus_pool.amount) * creators_voting_coeff),
        creators_bonus_pool.symbol
    );
    
    // Общий пул для голосования
    result.total_voting_pool = result.authors_bonuses_on_voting + result.creators_bonuses_on_voting;
    
    // Активная голосующая сумма
    result.active_voting_amount = eosio::asset(
        int64_t(static_cast<double>(result.total_voting_pool.amount) * (total_voters - 1) / total_voters),
        result.total_voting_pool.symbol
    );
    
    // Равная сумма на каждого
    result.equal_voting_amount = eosio::asset(
        int64_t(static_cast<double>(result.total_voting_pool.amount) / total_voters),
        result.total_voting_pool.symbol
    );
    
    // ---- Корректировка хвостика ----
    int64_t distributed = result.equal_voting_amount.amount * total_voters;
    int64_t diff = result.total_voting_pool.amount - distributed;
    if (diff != 0) {
        result.equal_voting_amount.amount += diff;  
    }
    
    return result;
  }


    eosio::asset calculate_voting_final_amount(name coopname, checksum256 project_hash, name participant) {
        auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
        // Получаем сегмент участника для определения его ролей
        auto segment = Capital::Segments::get_segment_or_fail(coopname, project_hash, participant, "Сегмент участника не найден");
        
        // Получаем все голоса за данного участника от других участников
        auto votes = Capital::Votes::get_votes_for_recipient(coopname, project_hash, participant);
        
        // Рассчитываем общую сумму голосов от других участников
        eosio::asset total_votes_received = asset(0, project.voting.amounts.total_voting_pool.symbol);
        for (const auto& vote : votes) {
            total_votes_received += vote.amount;
        }

        // Формула: (сумма всех полученных голосов + средняя сумма на каждого) / общее количество голосующих
        eosio::asset total_sum = (total_votes_received + project.voting.amounts.equal_voting_amount) / project.voting.total_voters;
        
        // Итоговая сумма от голосования по Водянову
        return total_sum;
    }

    eosio::asset calculate_equal_author_bonus(const Capital::project& project, const Capital::Segments::segment& segment) {
        // Если участник является автором, возвращаем равную премию
        if (segment.is_author) {
            return project.voting.amounts.authors_equal_per_author;
        }
        return asset(0, project.voting.amounts.authors_equal_per_author.symbol);
    }

    eosio::asset calculate_direct_creator_bonus(const Capital::project& project, const Capital::Segments::segment& segment) {
        // Если участник является создателем, рассчитываем прямую премию
        if (segment.is_creator) {
            double direct_percent = (100.0 - project.voting.creators_voting_percent) / 100.0;
            return eosio::asset(
                int64_t(static_cast<double>(segment.creator_bonus.amount) * direct_percent),
                segment.creator_bonus.symbol
            );
        }
        return asset(0, segment.creator_bonus.symbol);
    }

    bool is_voting_completed(const Capital::project& project) {
        bool deadline_passed = current_time_point().sec_since_epoch() > project.voting.voting_deadline.sec_since_epoch();
        bool someone_voted = project.voting.votes_received > 0;
        bool all_voted = project.voting.total_voters > 0 && project.voting.votes_received >= project.voting.total_voters;
        
        // Досрочное завершение: все проголосовали
        if (all_voted) {
            return true;
        }
        
        // Завершение по дедлайну: дедлайн истек И хотя бы кто-то проголосовал
        return deadline_passed && someone_voted;
    }

    /**
     * @brief Обновляет статус сегмента участника, предоставляя ему право голоса, если это необходимо
     * @param coopname Имя кооператива
     * @param project_hash Хэш проекта
     * @param username Имя пользователя
     * @return true если участник стал новым голосующим, false в противном случае
     */
    bool update_voting_status(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
        Capital::Segments::segments_index segments(_capital, coopname.value);
        auto idx = segments.get_index<"byprojuser"_n>();
        auto key = combine_checksum_ids(project_hash, username);
        auto segment_itr = idx.find(key);

        if (segment_itr == idx.end()) {
            return false; // Сегмент не найден
        }

        bool had_vote_before = segment_itr->has_vote;
        bool should_have_vote = segment_itr->is_author || segment_itr->is_creator;

        // Обновляем статус голосования только если участник получил право голоса
        if (!had_vote_before && should_have_vote) {
            idx.modify(segment_itr, _capital, [&](auto &s) {
                s.has_vote = true;
            });

            // Возвращаем true, что участник стал новым голосующим
            return true;
        }

        // Участник уже имел право голоса или не должен его иметь
        return false;
    }

} // namespace Capital::Core