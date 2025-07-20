# Пример использования координаторов согласно ТЗ БЛАГОРОСТ v0.1 (автоматическая регистрация)

## Сценарий с ограничением "один раз за инвестора"

1. Пайщик `alice` регистрирует инвестора `bob` в системе (становится его referer)
2. `alice` подписывает договор УХД для проекта `project_hash_123`
3. `bob` создает инвестицию 100,000 RUB в проект А - `alice` получает право на 4,000 RUB
4. `bob` создает еще одну инвестицию 50,000 RUB в проект Б - `alice` НЕ получает дополнительную выплату
5. `alice` приводит нового инвестора `charlie` - получает выплату за нового инвестора

## Последовательность действий

### 1. Регистрация инвестора с referer (в контракте registrator)
```cpp
// bob регистрируется в системе с alice как referer
// Это происходит в контракте registrator
// accounts.referer = "alice"_n для username = "bob"_n
```

### 2. Подписание договора УХД координатором
```cpp
// alice подписывает договор УХД для проекта (становится участником)
capital.regcontrib(
    "cooperativ"_n,      // coopname
    "app"_n,             // application
    "alice"_n,           // username
    project_hash_123,    // project_hash
    50,                  // convert_percent
    asset(2000, symbol("RUB", 4)), // rate_per_hour
    created_at,          // created_at
    agreement            // document2 agreement
);
```

### 3. Первая инвестиция (автоматическое определение координатора)
```cpp
// bob создает первую инвестицию в проект А
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (инвестор)
    project_hash_123,    // project_hash (проект А)
    invest_hash_456,     // invest_hash
    asset(100000, symbol("RUB", 4)), // amount = 100,000 RUB
    statement            // document2 statement
);

// Автоматически происходит:
// 1. Система находит accounts["bob"].referer = "alice"
// 2. Проверяет что alice имеет договор УХД по проекту
// 3. Автоматически добавляет alice как координатора
// 4. Связывает инвестицию с alice как координатором
```

### 4. Авторизация первой инвестиции
```cpp
// Совет авторизует первую инвестицию
capital.capauthinvst("cooperativ"_n, invest_hash_456, authorization);

// Система проверяет: has_coordinator_received_payout("alice", "bob") = false
// alice получает право на 4,000 RUB (4% от 100,000)
// coordinator.pending_coordinator_base = 4,000 RUB
```

### 5. Вторая инвестиция того же инвестора
```cpp
// bob создает вторую инвестицию в проект Б
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (тот же инвестор)
    project_hash_789,    // project_hash (проект Б)
    invest_hash_999,     // invest_hash
    asset(50000, symbol("RUB", 4)), // amount = 50,000 RUB
    statement            // document2 statement
);

// Авторизация второй инвестиции
capital.capauthinvst("cooperativ"_n, invest_hash_999, authorization);

// Система проверяет: has_coordinator_received_payout("alice", "bob") = false
// НО выплата за bob еще не была зафиксирована (только pending)
// alice НЕ получает дополнительную выплату за вторую инвестицию bob
// coordinator.pending_coordinator_base остается 4,000 RUB
```

### 6. Получение средств координатором
```cpp
// alice подает заявление с презентацией о приведенном инвесторе
capital.claimcoordntr(
    "cooperativ"_n,      // coopname
    "app"_n,             // application
    project_hash_123,    // project_hash  
    "alice"_n,           // coordinator
    presentation         // document2 presentation - презентация об инвесторе
);

// После этого:
// 1. Создается запись coordinator_payout: alice -> bob (4,000 RUB)
// 2. coordinator.pending_coordinator_base = 0 RUB
// 3. coordinator.earned = 4,000 RUB
// 4. has_coordinator_received_payout("alice", "bob") = true
```

### 7. Инвестиция от нового инвестора
```cpp
// alice приводит нового инвестора charlie
// charlie создает инвестицию
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "charlie"_n,         // username (новый инвестор)
    project_hash_123,    // project_hash
    invest_hash_111,     // invest_hash
    asset(200000, symbol("RUB", 4)), // amount = 200,000 RUB
    statement            // document2 statement
);

// Авторизация инвестиции от charlie
capital.capauthinvst("cooperativ"_n, invest_hash_111, authorization);

// Система проверяет: has_coordinator_received_payout("alice", "charlie") = false
// alice получает право на 8,000 RUB (4% от 200,000) за нового инвестора
// coordinator.pending_coordinator_base = 8,000 RUB
```

### 8. Попытка повторной инвестиции от bob (после фиксации выплаты)
```cpp
// bob создает третью инвестицию
capital.createinvest(
    "cooperativ"_n,      // coopname
    "app"_n,             // application  
    "bob"_n,             // username (тот же инвестор)
    project_hash_456,    // project_hash
    invest_hash_222,     // invest_hash
    asset(75000, symbol("RUB", 4)), // amount = 75,000 RUB
    statement            // document2 statement
);

// Авторизация третьей инвестиции от bob
capital.capauthinvst("cooperativ"_n, invest_hash_222, authorization);

// Система проверяет: has_coordinator_received_payout("alice", "bob") = true
// alice НЕ получает выплату, так как уже получала за bob ранее
// coordinator.pending_coordinator_base остается 8,000 RUB (только за charlie)
```

## Важные моменты

1. **Один раз за инвестора в системе**: Координатор получает 4% за каждого приведенного инвестора только один раз, независимо от количества его инвестиций
2. **Фиксация при claimcoordntr**: Выплата фиксируется только при вызове `claimcoordntr` с презентацией
3. **Защита от повторных выплат**: Система отслеживает все выплаты и предотвращает дублирование
4. **Новые инвесторы**: За каждого нового приведенного инвестора координатор может получить выплату

## Таблица coordinator_payout после примера

| coordinator | investor | amount | claimed_at |
|-------------|----------|---------|------------|
| alice       | bob      | 4,000   | 2024-01-15 |
| alice       | charlie  | 8,000   | 2024-01-20 |
