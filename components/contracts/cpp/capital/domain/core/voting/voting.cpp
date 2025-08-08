#include "voting.hpp"
#include "../../entities/votes.hpp"
#include "../../entities/segments.hpp"
#include "../../entities/projects.hpp"

namespace Capital::Core::Voting {

    void initialize_project_voting(name coopname, checksum256 project_hash) {
        auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        auto st = Capital::get_global_state(coopname);
        
        // Устанавливаем параметры голосования из конфигурации
        Capital::project_index projects(_capital, coopname.value);
        auto proj = projects.find(project.id);
        projects.modify(proj, coopname, [&](auto &p) {
            p.voting.authors_voting_percent = st.config.authors_voting_percent;
            p.voting.creators_voting_percent = st.config.creators_voting_percent;
            p.voting.voting_deadline = time_point_sec(current_time_point().sec_since_epoch() + st.config.voting_period_in_days * 86400);
        });
        
        project = Capital::Projects::get_project_or_fail(coopname, project_hash);
        
        auto amounts = calculate_voting_amounts(
            project.fact.authors_bonus_pool,
            project.fact.creators_bonus_pool,
            project.counts.total_authors,
            project.voting.total_voters,
            project.voting.authors_voting_percent,
            project.voting.creators_voting_percent
        );
        
        // Инициализируем данные голосования в проекте
        Capital::Projects::initialize_voting_amounts(coopname, project_hash, amounts);
    }

    voting_amounts calculate_voting_amounts(const eosio::asset& authors_bonus_pool, 
                                           const eosio::asset& creators_bonus_pool,
                                           uint64_t total_authors,
                                           uint32_t total_voters,
                                           double authors_voting_percent,
                                           double creators_voting_percent) {
        voting_amounts result;
        
        // Рассчитываем процентные доли
        double authors_equal_percent = (100.0 - authors_voting_percent) / 100.0;  // 61.8%
        double creators_direct_percent = (100.0 - creators_voting_percent) / 100.0; // 61.8%
        double authors_voting_coeff = authors_voting_percent / 100.0;  // 38.2%
        double creators_voting_coeff = creators_voting_percent / 100.0; // 38.2%
        
        // Распределение авторских премий
        result.authors_equal_spread = eosio::asset(
            int64_t(static_cast<double>(authors_bonus_pool.amount) * authors_equal_percent),
            authors_bonus_pool.symbol
        );
        result.authors_bonuses_on_voting = eosio::asset(
            int64_t(static_cast<double>(authors_bonus_pool.amount) * authors_voting_coeff),
            authors_bonus_pool.symbol
        );
        
        // Рассчитываем равную сумму на каждого автора (61.8% авторских премий / количество авторов)
        if (total_authors > 0) {
          result.authors_equal_per_author = eosio::asset(
              result.authors_equal_spread.amount / total_authors,
              result.authors_equal_spread.symbol
          );
        } else {
            result.authors_equal_per_author = asset(0, authors_bonus_pool.symbol);
        }
        
        
        // Распределение создательских премий
        result.creators_direct_spread = eosio::asset(
            int64_t(static_cast<double>(creators_bonus_pool.amount) * creators_direct_percent),
            creators_bonus_pool.symbol
        );
        
        result.creators_bonuses_on_voting = eosio::asset(
            int64_t(static_cast<double>(creators_bonus_pool.amount) * creators_voting_coeff),
            creators_bonus_pool.symbol
        );
        
        // Рассчитываем общую сумму для распределения по Водянову
        result.total_voting_pool = result.authors_bonuses_on_voting + result.creators_bonuses_on_voting;
        
        // Рассчитываем общую голосующую сумму по формуле: total_voting_pool * (voters-1)/voters
        result.voting_amount = eosio::asset(
            int64_t(static_cast<double>(result.total_voting_pool.amount) * (total_voters - 1) / total_voters),
            result.total_voting_pool.symbol
        );
        
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
          
        // Итоговая сумма от голосования по Водянову
        // Формула: (сумма всех полученных голосов + голосующая сумма) / общее количество голосующих
        eosio::asset total_sum = total_votes_received + project.voting.amounts.total_voting_pool;
        eosio::asset total_vodyanov_amount = asset(
            total_sum.amount / project.voting.total_voters, 
            total_sum.symbol
        );
        
        // Прямые начисления будут выплачиваться отдельно, здесь только голосование
        
        return total_vodyanov_amount;
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
        
        return deadline_passed || someone_voted;
    }

} // namespace Capital::Core