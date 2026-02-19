#!/bin/bash

# Конфигурация
TOTAL_RUNS=100
LOG_FILE="stress-test-$(date +%Y%m%d-%H%M%S).log"
FAILED=false
SUCCESS_COUNT=0
FAILED_COUNT=0
START_TIME=$(date +%s)

# Функция для отображения прогресса
show_progress() {
    local current=$1
    local total=$2
    local success=$3
    local failed=$4

    local percent=0
    if [ $total -gt 0 ]; then
        percent=$((current * 100 / total))
    fi
    local progress_bar=""
    local bar_width=50
    local filled=0
    if [ $total -gt 0 ]; then
        filled=$((current * bar_width / total))
    fi

    for ((j=1; j<=bar_width; j++)); do
        if [ $j -le $filled ]; then
            progress_bar="${progress_bar}█"
        else
            progress_bar="${progress_bar}░"
        fi
    done

    echo "Прогресс: [${progress_bar}] ${percent}% (${current}/${total}) | ✅ ${success} | ❌ ${failed}"
}

echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "  СТРЕСС-ТЕСТИРОВАНИЕ CAPITAL CONTRACT" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "Запуск: $(date)" | tee -a "$LOG_FILE"
echo "Количество прогонов: $TOTAL_RUNS" | tee -a "$LOG_FILE"
echo "Лог-файл: $LOG_FILE" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

for ((i=1; i<=TOTAL_RUNS; i++)); do
    RUN_START=$(date +%s)

    echo "════════════════════════════════════════" | tee -a "$LOG_FILE"
    echo "📊 Запуск #$i из $TOTAL_RUNS" | tee -a "$LOG_FILE"
    echo "════════════════════════════════════════" | tee -a "$LOG_FILE"

    # Запускаем тест и сохраняем вывод
    npx vitest run capital.test --run --testTimeout=60000 2>&1 | tee -a "$LOG_FILE"
    TEST_EXIT_CODE=${PIPESTATUS[0]}

    if [ $TEST_EXIT_CODE -eq 0 ]; then
        RUN_END=$(date +%s)
        RUN_DURATION=$((RUN_END - RUN_START))
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "✅ Запуск #$i успешен (время: ${RUN_DURATION}с)" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
    else
        RUN_END=$(date +%s)
        RUN_DURATION=$((RUN_END - RUN_START))
        FAILED_COUNT=$((FAILED_COUNT + 1))
        echo "❌ ТЕСТ УПАЛ НА ЗАПУСКЕ #$i (время: ${RUN_DURATION}с)" | tee -a "$LOG_FILE"
        echo "⚠️  Проверка на access violation или другие ошибки..." | tee -a "$LOG_FILE"
        FAILED=true
        break
    fi

    # Обновляем прогресс после каждого успешного теста
    show_progress $((SUCCESS_COUNT + FAILED_COUNT)) $TOTAL_RUNS $SUCCESS_COUNT $FAILED_COUNT
    echo "" | tee -a "$LOG_FILE"
done

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
AVG_DURATION=$((SUCCESS_COUNT > 0 ? TOTAL_DURATION / SUCCESS_COUNT : 0))

# Финальный показ прогресса
echo "" | tee -a "$LOG_FILE"
show_progress $((SUCCESS_COUNT + FAILED_COUNT)) $TOTAL_RUNS $SUCCESS_COUNT $FAILED_COUNT
echo "" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "  ИТОГОВАЯ СТАТИСТИКА" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "Завершено: $(date)" | tee -a "$LOG_FILE"
echo "Успешных прогонов: $SUCCESS_COUNT" | tee -a "$LOG_FILE"
echo "Проваленных прогонов: $FAILED_COUNT" | tee -a "$LOG_FILE"
echo "Всего прогонов: $((SUCCESS_COUNT + FAILED_COUNT)) из $TOTAL_RUNS" | tee -a "$LOG_FILE"
echo "Общее время: ${TOTAL_DURATION}с ($(($TOTAL_DURATION / 60))м)" | tee -a "$LOG_FILE"
if [ $SUCCESS_COUNT -gt 0 ]; then
    echo "Среднее время на прогон: ${AVG_DURATION}с" | tee -a "$LOG_FILE"
fi

if [ "$FAILED" = true ]; then
    echo "Статус: ❌ ПРОВАЛЕН" | tee -a "$LOG_FILE"
    echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "⚠️  Тестирование прервано из-за ошибки на запуске #$i" | tee -a "$LOG_FILE"
    echo "📋 Полный лог сохранен в: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 1
else
    echo "Статус: ✅ УСПЕШНО" | tee -a "$LOG_FILE"
    echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "🎉 Все $TOTAL_RUNS запусков успешны!" | tee -a "$LOG_FILE"
    echo "📋 Полный лог сохранен в: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 0
fi