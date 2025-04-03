using namespace Loan;

void loan::createdebt(name coopname, name username, checksum256 debt_hash, time_point_sec repaid_at, asset quantity) {
  require_auth(_loan);

  check(quantity.amount > 0, "Сумма должна быть положительной");
  check(repaid_at > time_point_sec(current_time_point()), "Дата погашения должна быть в будущем");

  auto exist = get_debt(coopname, debt_hash);
  check(!exist.has_value(), "Долг с таким хэшем уже существует");

  Loan::debts_index debts(_loan, coopname.value);
  uint64_t new_id = get_global_id_in_scope(_loan, coopname, "debts"_n);

  debts.emplace(_loan, [&](auto& d) {
    d.id = new_id;
    d.coopname = coopname;
    d.username = username;
    d.debt_hash = debt_hash;
    d.amount = quantity;
    d.created_at = time_point_sec(current_time_point());
    d.repaid_at = repaid_at;
  });

  Loan::summaries_index summaries(_loan, coopname.value);
  auto sum_itr = summaries.find(username.value);
  if (sum_itr == summaries.end()) {
    summaries.emplace(_loan, [&](auto& s) {
      s.username = username;
      s.total = quantity;
    });
  } else {
    summaries.modify(sum_itr, same_payer, [&](auto& s) {
      s.total += quantity;
    });
  }
}
