-- Исправление PRIMARY KEY в таблице payments

-- Сначала проверим текущую структуру
\d payments

-- Если таблица существует и у неё есть PK на hash, то:

-- 1. Удаляем старый PRIMARY KEY (если есть)
DO $$
DECLARE
    pk_name TEXT;
BEGIN
    SELECT conname INTO pk_name 
    FROM pg_constraint 
    WHERE conrelid = 'payments'::regclass AND contype = 'p';
    
    IF pk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE payments DROP CONSTRAINT ' || pk_name;
        RAISE NOTICE 'Удален PRIMARY KEY: %', pk_name;
    END IF;
END $$;

-- 2. Добавляем колонку id если её нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'id') THEN
        ALTER TABLE payments ADD COLUMN id uuid DEFAULT gen_random_uuid();
        UPDATE payments SET id = gen_random_uuid() WHERE id IS NULL;
        ALTER TABLE payments ALTER COLUMN id SET NOT NULL;
        RAISE NOTICE 'Добавлена колонка id';
    END IF;
END $$;

-- 3. Создаем новый PRIMARY KEY по id
ALTER TABLE payments ADD PRIMARY KEY (id);

-- 4. Делаем hash nullable
ALTER TABLE payments ALTER COLUMN hash DROP NOT NULL;

-- Проверяем результат
\d payments
