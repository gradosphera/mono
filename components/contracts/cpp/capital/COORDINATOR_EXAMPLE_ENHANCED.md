# Пример использования координаторов с лимитом 100,000 RUB

## Сценарий: Накопление с лимитом и презентация

1. Координатор `alice` приводит инвестора `bob`
2. `bob` делает несколько инвестиций в один результат - `alice` накапливает до лимита
3. `alice` подает презентацию и получает выплату
4. Повторные инвестиции `bob` не приносят `alice` дополнительную выплату

## Последовательность действий

### 1. Первая инвестиция bob (10,000 RUB)
```cpp
// bob создает инвестицию 10,000 RUB
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (инвестор)
    project_hash_123,    // project_hash
    invest_hash_456,     // invest_hash
    asset(1000000, symbol("RUB", 4)), // amount = 10,000 RUB (в минимальных единицах)
    statement            // document2 statement
);

// Авторизация инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_456, authorization);

// Результат:
// alice.pending_coordinator_base = 400 RUB (4% от 10,000)
// Накопленная сумма за bob = 400 RUB
```

### 2. Вторая инвестиция bob (1,000,000 RUB)
```cpp
// bob создает крупную инвестицию
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (тот же инвестор)
    project_hash_123,    // project_hash (тот же проект)
    invest_hash_789,     // invest_hash
    asset(100000000, symbol("RUB", 4)), // amount = 1,000,000 RUB
    statement            // document2 statement
);

// Авторизация инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_789, authorization);

// Результат:
// 4% от 1,000,000 = 40,000 RUB
// alice.pending_coordinator_base = 400 + 40,000 = 40,400 RUB
// Накопленная сумма за bob = 40,400 RUB
```

### 3. Третья инвестиция bob (2,000,000 RUB) - превышение лимита
```cpp
// bob создает еще одну крупную инвестицию
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (тот же инвестор)
    project_hash_123,    // project_hash
    invest_hash_111,     // invest_hash
    asset(200000000, symbol("RUB", 4)), // amount = 2,000,000 RUB
    statement            // document2 statement
);

// Авторизация инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_111, authorization);

// Расчет:
// 4% от 2,000,000 = 80,000 RUB
// Уже накоплено за bob = 40,400 RUB
// Новая сумма = 40,400 + 80,000 = 120,400 RUB
// Лимит = 100,000 RUB
// Фактическое начисление = 100,000 - 40,400 = 59,600 RUB

// Результат:
// alice.pending_coordinator_base = 40,400 + 59,600 = 100,000 RUB
// Накопленная сумма за bob = 100,000 RUB (лимит достигнут)
```

### 4. Четвертая инвестиция bob (500,000 RUB) - после достижения лимита
```cpp
// bob создает еще одну инвестицию
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (тот же инвестор)
    project_hash_123,    // project_hash
    invest_hash_222,     // invest_hash
    asset(50000000, symbol("RUB", 4)), // amount = 500,000 RUB
    statement            // document2 statement
);

// Авторизация инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_222, authorization);

// Результат:
// Накопленная сумма за bob уже достигла лимита 100,000 RUB
// alice.pending_coordinator_base остается 100,000 RUB (без изменений)
```

### 5. Подача презентации координатором
```cpp
// alice подает презентацию об инвесторе bob в результате
capital.claimcoordntr(
    "cooperativ"_n,      // coopname
    "app"_n,             // application
    project_hash_123,    // project_hash  
    result_hash_555,     // result_hash
    "alice"_n,           // coordinator
    presentation         // document2 presentation
);

// Результат:
// 1. Создается запись в coordinator_payout:
//    - coordinator: alice
//    - investor: bob  
//    - result_hash: result_hash_555
//    - total_accumulated: 100,000 RUB
//    - amount_claimed: 100,000 RUB
// 2. alice.pending_coordinator_base = 0 RUB
// 3. alice.earned = 100,000 RUB
```

### 6. Попытка повторной инвестиции после презентации
```cpp
// bob создает инвестицию в новый результат
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (тот же инвестор)
    project_hash_456,    // project_hash (новый проект)
    invest_hash_333,     // invest_hash
    asset(30000000, symbol("RUB", 4)), // amount = 300,000 RUB
    statement            // document2 statement
);

// Авторизация инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_333, authorization);

// Результат:
// has_coordinator_received_payout(alice, bob) = true
// alice НЕ получает дополнительную выплату
// alice.pending_coordinator_base остается 0 RUB
```

### 7. Новый инвестор charlie
```cpp
// alice приводит нового инвестора charlie
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "charlie"_n,         // username (новый инвестор)
    project_hash_123,    // project_hash
    invest_hash_444,     // invest_hash
    asset(50000000, symbol("RUB", 4)), // amount = 500,000 RUB
    statement            // document2 statement
);

// Авторизация инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_444, authorization);

// Результат:
// has_coordinator_received_payout(alice, charlie) = false
// 4% от 500,000 = 20,000 RUB
// alice.pending_coordinator_base = 20,000 RUB (за charlie)
```

## Таблица coordinator_payout после примера

| coordinator | investor | result_hash | total_accumulated | amount_claimed | claimed_at |
|-------------|----------|-------------|-------------------|----------------|------------|
| alice       | bob      | result_555  | 100,000 RUB      | 100,000 RUB   | 2024-01-15 |

## Ключевые особенности

### 1. Накопление в рамках одного результата
- Координатор получает 4% с **всех инвестиций** одного инвестора в один результат
- Инвестиции: 10,000 + 1,000,000 + 2,000,000 + 500,000 = 3,510,000 RUB
- Потенциальные 4%: 140,400 RUB, но ограничено лимитом 100,000 RUB

### 2. Лимит 100,000 RUB
- Максимальная сумма за одного инвестора строго ограничена
- При превышении лимита начисление прекращается

### 3. Одна презентация на инвестора
- После подачи презентации повторные накопления за этого инвестора невозможны
- Новые инвесторы дают возможность получить дополнительные выплаты

### 4. Защита от злоупотреблений
- Система отслеживает все выплаты
- Невозможно получить повторную выплату за того же инвестора
- Лимит предотвращает чрезмерные накопления

## Сравнение с предыдущей логикой

**Предыдущая логика:**
- Координатор получал 4% только от первой инвестиции каждого инвестора
- Лимита на сумму не было

**Новая логика:**
- Координатор получает 4% с **всех инвестиций** одного инвестора в один результат
- Лимит 100,000 RUB за каждого инвестора
- Одна презентация на инвестора в системе 