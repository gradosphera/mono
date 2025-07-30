using namespace eosio;
using std::string;

namespace Capital {

inline void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level) {
  eosio::check(level < 12, "Превышено максимальное количество уровней распределения (12)");

  Capital::project_index projects(_capital, coopname.value);
  auto project = projects.find(project_id);
  eosio::check(project != projects.end(), "Проект не найден");

  double ratio = project -> parent_distribution_ratio;

  int64_t membership_parent_fund_amount = static_cast<int64_t>(amount.amount * ratio);
  int64_t membership_current_fund_amount = amount.amount - membership_parent_fund_amount;

  asset membership_parent_fund(membership_parent_fund_amount, amount.symbol);
  asset membership_current_fund(membership_current_fund_amount, amount.symbol);

  projects.modify(project, coopname, [&](auto &p) {
      p.membership_funded += amount;
      p.membership_available += membership_current_fund;

      if (project -> total_share_balance.amount > 0) {
          int64_t delta = (membership_current_fund.amount * REWARD_SCALE) / project->total_share_balance.amount;
          p.membership_cumulative_reward_per_share += delta;
      };
  });

  if (ratio > 0 && project -> parent_project_hash != checksum256()) {
      auto parent_project = Capital::get_project(coopname, project -> parent_project_hash);
      eosio::check(parent_project.has_value(), "Родительский проект не найден");

      distribute_project_membership_funds(coopname, parent_project->id, membership_parent_fund, level + 1);
  };
};

} // namespace Capital