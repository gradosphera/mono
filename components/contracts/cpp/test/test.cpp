#include "test.hpp"

/**
 * @brief Инициализирует тестовую запись
 */
void test::init(uint64_t record_id) {
  require_auth(get_self());
  
  testrecords_index records(get_self(), get_self().value);
  
  // Проверяем, что записи еще нет
  auto existing = records.find(record_id);
  eosio::check(existing == records.end(), "Запись уже существует");
  
  // Создаем новую запись
  records.emplace(get_self(), [&](auto &r) {
    r.id = record_id;
    r.counter = 0;
    r.value = 100;
    r.status = "initialized";
  });
  
  print("Инициализирована запись ID: ", record_id, " со значением: 100\n");
}

/**
 * @brief Тестирует множественные обновления одной записи
 */
void test::testmultimod(uint64_t record_id) {
  require_auth(get_self());
  
  testrecords_index records(get_self(), get_self().value);
  auto record_itr = records.find(record_id);
  
  eosio::check(record_itr != records.end(), "Запись не найдена. Сначала выполните init");
  
  print("=== ТЕСТ МНОЖЕСТВЕННЫХ ОБНОВЛЕНИЙ ===\n");
  print("Начальное состояние - ID: ", record_itr->id, 
        ", counter: ", record_itr->counter, 
        ", value: ", record_itr->value, 
        ", status: ", record_itr->status, "\n");
  
  // ПЕРВОЕ ОБНОВЛЕНИЕ
  print("Выполняем ПЕРВОЕ обновление...\n");
  records.modify(record_itr, get_self(), [&](auto &r) {
    r.counter += 1;
    r.value += 10;
    r.status = "first_update";
  });
  
  // Перечитываем запись для проверки
  record_itr = records.find(record_id);
  print("После первого обновления - counter: ", record_itr->counter, 
        ", value: ", record_itr->value, 
        ", status: ", record_itr->status, "\n");
  
  // ВТОРОЕ ОБНОВЛЕНИЕ
  print("Выполняем ВТОРОЕ обновление...\n");
  records.modify(record_itr, get_self(), [&](auto &r) {
    r.counter += 1;
    r.value += 20;
    r.status = "second_update";
  });
  
  // Перечитываем запись для проверки
  record_itr = records.find(record_id);
  print("После второго обновления - counter: ", record_itr->counter, 
        ", value: ", record_itr->value, 
        ", status: ", record_itr->status, "\n");
  
  // ТРЕТЬЕ ОБНОВЛЕНИЕ
  print("Выполняем ТРЕТЬЕ обновление...\n");
  records.modify(record_itr, get_self(), [&](auto &r) {
    r.counter += 1;
    r.value += 30;
    r.status = "third_update";
  });
  
  // Финальная проверка
  record_itr = records.find(record_id);
  print("=== ФИНАЛЬНЫЙ РЕЗУЛЬТАТ ===\n");
  print("Итоговое состояние - counter: ", record_itr->counter, 
        ", value: ", record_itr->value, 
        ", status: ", record_itr->status, "\n");
  
  print("ОЖИДАЕМЫЕ ЗНАЧЕНИЯ: counter=3, value=160, status=third_update\n");
  
  // Проверяем корректность
  if (record_itr->counter == 3 && record_itr->value == 160 && record_itr->status == "third_update") {
    print("✅ ТЕСТ ПРОЙДЕН: Все обновления применились корректно!\n");
  } else {
    print("❌ ТЕСТ НЕ ПРОЙДЕН: Обнаружена проблема с множественными обновлениями!\n");
    print("Получено: counter=", record_itr->counter, ", value=", record_itr->value, ", status=", record_itr->status, "\n");
  }
}

/**
 * @brief Очищает тестовые данные
 */
void test::clear() {
  require_auth(get_self());
  
  testrecords_index records(get_self(), get_self().value);
  
  auto itr = records.begin();
  while (itr != records.end()) {
    itr = records.erase(itr);
  }
  
  print("Все тестовые записи очищены\n");
}
