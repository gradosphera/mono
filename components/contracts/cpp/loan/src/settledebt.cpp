void loan::settledebt(name coopname, name username, checksum256 debt_hash, asset quantity) {
  require_auth(_loan);
  check(quantity.amount > 0, "Сумма должна быть положительной");

  auto debt_opt = get_debt(coopname, debt_hash);
  check(debt_opt.has_value(), "Долг не найден");

  auto debt = debt_opt.value();
  check(debt.username == username, "Неверный пользователь");
  check(debt.amount.amount >= quantity.amount, "Погашаемая сумма превышает долг");

  Loan::debts_index debts(_loan, coopname.value);
  auto it = debts.find(debt.id);
  check(it != debts.end(), "Долг не найден по ID");

  if (debt.amount == quantity) {
    debts.erase(it);
  } else {
    debts.modify(it, same_payer, [&](auto& d) {
      d.amount -= quantity;
    });
  }

  Loan::summaries_index summaries(_loan, coopname.value);
  auto sum_itr = summaries.find(username.value);
  check(sum_itr != summaries.end(), "Сводная запись не найдена");

  if (sum_itr->total == quantity) {
    summaries.erase(sum_itr);
  } else {
    summaries.modify(sum_itr, same_payer, [&](auto& s) {
      s.total -= quantity;
    });
  }
}