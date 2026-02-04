Правило 0. Secondary index используется ровно один раз — для получения primary key. Любые чтения и все изменения состояния выполняются только по primary key.

Запреты
- ❌ Повторный get_*_by_hash() после emplace/modify
- ❌ Передача hash в write-функции
- ❌ Возврат row-объектов для дальнейшей мутации

Разрешено
✅ find(id) сколько угодно раз
✅ modify(id) после любых изменений
✅ Передача id между всеми слоями

В прикладной форме
- checksum256 / secondary_id — только вход
- uint64_t (primary key) — вся внутренняя логика

В одном action:
- byhash.find() → получить id
- дальше запрещены любые повторные lookup по secondary index

Правило 1. Поиск по secondary_index'ам должен быть однократным. Запрещено в рамках одного действия повторно обращаться к поиску по secondary_index. 

ПРАВИЛЬНО:
auto project = get_project_or_fail(coopname, project_hash);
uint64_t project_id = project.id;

// дальше ВЕЗДЕ
set_master(coopname, project_id, master);
increment_total_authors(coopname, project_id);
upsert_author_segment(coopname, project_id, master);


НЕ ПРАВИЛЬНО:
increment_total_authors(coopname, project_hash); // внутри снова lookup

Правило 3. При работе с итераторами не используй перевод в объект
segments_index segments(_capital, coopname.value);
auto segment = segments.find(segment_id);

auto amount = segment->debt_amount // ПРАВИЛЬНО

auto segment_ = *segment  // НЕ ПРАВИЛЬНО
auto amount = segment.amount
  