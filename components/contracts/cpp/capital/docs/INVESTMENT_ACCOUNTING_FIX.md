# Исправление учета инвестиций в fact.total

## Проблема

При расчете долей участников в проекте сумма долей превышала 100%, потому что фактически используемая часть инвестиций (`investor_base`) учитывалась в стоимости сегментов участников, но НЕ учитывалась в общей сумме результата проекта (`fact.total`).

### Пример проблемы

**Данные проекта:**
- `fact.total` = 26179.24 RUB
- Инвестиции: 10000 RUB
- `use_invest_percent` = 80.9%
- Фактически используется: 10000 * 0.809 = 8090 RUB

**Сегменты участников:**
- ant: `total_segment_cost` = 28984.98 RUB (включая `investor_base` = 8090 RUB)
- qrajhdhglcag: `total_segment_cost` = 5284.26 RUB
- **Сумма сегментов** = 34269.24 RUB

**Расчет долей:**
- ant: 28984.98 / 26179.24 = **110.72%** ❌
- qrajhdhglcag: 5284.26 / 26179.24 = **20.18%** ❌
- **Сумма** = **130.9%** ❌

### Корневая причина

`fact.total` формировался как:
```cpp
fact.total = fact.total_contribution + fact.used_expense_pool
```

где `total_contribution` включал только:
- `total_generation_pool` (базовые и бонусные пулы создателей, авторов, координаторов)
- `contributors_bonus_pool`

Но НЕ включал фактически используемую часть инвестиций (`total_used_investments`).

## Решение

Добавлено новое поле `total_used_investments` в структуру `fact_pool` для явного учета фактически используемой части всех инвестиций.

### Изменения в структуре fact_pool

**Файл:** `domain/entities/fact_pool.hpp`

Добавлено поле:
```cpp
eosio::asset total_used_investments = asset(0, _root_govern_symbol); 
///< Фактически используемая часть всех инвестиций (total_received_investments * use_invest_percent / 100)
```

Обновлен комментарий к полю `total`:
```cpp
eosio::asset total = asset(0, _root_govern_symbol); 
///< Общая фактическая сумма генерации с участниками (total_contribution + used_expense_pool + total_used_investments)
```

### Формула расчета

```cpp
// Рассчитываем фактически используемую часть инвестиций
p.fact.total_used_investments = eosio::asset(
    static_cast<int64_t>(
        static_cast<double>(p.fact.total_received_investments.amount) * 
        (p.fact.use_invest_percent / 100.0)
    ), 
    _root_govern_symbol
);

// Обновляем total с учетом используемых инвестиций
p.fact.total = p.fact.total_contribution + p.fact.used_expense_pool + p.fact.total_used_investments;
```

### Где применяется расчет

Расчет `total_used_investments` добавлен во все функции, обновляющие `fact.total`:

1. **`add_commit`** (`domain/entities/projects.hpp`) - при добавлении коммита
2. **`add_property`** (`domain/entities/projects.hpp`) - при внесении имущества
3. **`add_investments`** (`domain/entities/projects.hpp`) - при получении инвестиций
4. **`add_coordinator_funds`** (`domain/core/generation/generation.cpp`) - при добавлении координаторских средств

## Результат

После исправления доли участников рассчитываются корректно:

**Данные проекта (после исправления):**
- `fact.total_contribution` = 26179.24 RUB
- `fact.total_used_investments` = 10000 * 0.809 = 8090 RUB
- `fact.total` = 26179.24 + 0 + 8090 = **34269.24 RUB**

**Расчет долей (после исправления):**
- ant: 28984.98 / 34269.24 = **84.58%** ✓
- qrajhdhglcag: 5284.26 / 34269.24 = **15.42%** ✓
- **Сумма** = **100%** ✓

## Обоснование формулы

`use_invest_percent` показывает какая доля всех полученных инвестиций фактически используется для покрытия затрат:

```cpp
use_invest_percent = (total_costs / total_received_investments) * 100.0
```

где `total_costs` = `creators_base_pool + authors_base_pool + coordinators_base_pool + accumulated_expense_pool + used_expense_pool`

Таким образом, фактически используемая часть инвестиций:
```cpp
total_used_investments = total_received_investments * (use_invest_percent / 100.0)
```

Это соответствует сумме всех `investor_base` в сегментах участников, потому что для каждого инвестора:
```cpp
investor_base = investor_amount * (use_invest_percent / 100.0)
```

## Семантика

- `total_contribution` - вклады участников (трудозатраты, имущество, но БЕЗ инвестиций)
- `total_used_investments` - фактически используемая часть инвестиций
- `used_expense_pool` - фактически потраченные расходы
- `total` = `total_contribution` + `used_expense_pool` + `total_used_investments` - полная стоимость результата проекта

## Связь с сегментами

Каждый сегмент участника содержит:
- `investor_base` - фактически используемая часть инвестиций этого инвестора
- `creator_base`, `author_base`, `coordinator_base` - базовые вклады
- `creator_bonus`, `author_bonus`, `contributor_bonus` и др. - бонусные вклады
- `total_segment_cost` = сумма всех вкладов

**Инвариант:** 
```
fact.total == sum(все total_segment_cost по всем сегментам)
```

Это обеспечивает корректный расчет долей:
```
доля_участника = total_segment_cost / fact.total
```

## Момент применения

Расчет `total_used_investments` выполняется каждый раз, когда:
1. Добавляется коммит (изменяются затраты → изменяется `use_invest_percent`)
2. Добавляются инвестиции (изменяется `total_received_investments`)
3. Добавляется имущество (изменяются затраты → изменяется `use_invest_percent`)
4. Добавляются координаторские средства (изменяются затраты → изменяется `use_invest_percent`)

После каждого из этих событий `use_invest_percent` пересчитывается, и на его основе пересчитывается `total_used_investments`.

## Влияние на возврат неиспользованных инвестиций

При возврате неиспользованных инвестиций через `returnunused`:
- `total_returned_investments` увеличивается
- `investor_base` в сегменте инвестора корректируется до фактически используемой суммы
- `total_used_investments` остается неизменным, так как формула использует `total_received_investments` (полученные инвестиции до возврата) и `use_invest_percent` (который учитывает фактические затраты)

Формула корректна, потому что:
```
total_used_investments = total_received_investments * use_invest_percent / 100
```
где `use_invest_percent = total_costs / total_received_investments * 100`

Следовательно:
```
total_used_investments = total_costs (при use_invest_percent ≤ 100%)
```

Это означает, что `total_used_investments` фактически равен сумме затрат (когда инвестиций достаточно для их покрытия), что семантически правильно.
