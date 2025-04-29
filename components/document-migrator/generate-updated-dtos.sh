#!/bin/bash

# Скрипт для обновления DTO документов чтобы они использовали базовый класс

DOCUMENTS_DIR="components/controller/src/modules/document/documents-dto"
BASE_IMPORT="import { DocumentAggregateBaseDTO } from '~/modules/document/dto/document-aggregate.base';"

# Проверка наличия директории с документами
if [ ! -d "$DOCUMENTS_DIR" ]; then
  echo "Директория $DOCUMENTS_DIR не найдена"
  exit 1
fi

# Обработка каждого файла .dto.ts в директории
for file in "$DOCUMENTS_DIR"/*-document.dto.ts; do
  echo "Обработка файла $file"
  
  # Проверка, содержит ли файл уже импорт базового класса
  if grep -q "DocumentAggregateBaseDTO" "$file"; then
    echo "  Файл уже содержит импорт базового класса"
  else
    # Добавление импорта, если его еще нет
    sed -i '' -e '/import.*GeneratedDocumentDomainInterface/a\
'"$BASE_IMPORT"'' "$file"
    echo "  Добавлен импорт базового класса"
  fi
  
  # Получение имени агрегата документа из файла
  AGGREGATE_NAME=$(grep -o "[A-Za-z]*DocumentAggregateDTO" "$file" | head -1)
  META_NAME=$(grep -o "[A-Za-z]*MetaDocumentOutputDTO" "$file" | head -1)
  SIGNED_NAME=$(grep -o "[A-Za-z]*SignedDocumentDTO" "$file" | head -1)
  DOCUMENT_NAME=$(grep -o "[A-Za-z]*DocumentDTO" "$file" | grep -v "Signed" | grep -v "Aggregate" | grep -v "Meta" | head -1)
  
  if [ -z "$AGGREGATE_NAME" ] || [ -z "$META_NAME" ] || [ -z "$SIGNED_NAME" ] || [ -z "$DOCUMENT_NAME" ]; then
    echo "  Не удалось найти нужные имена классов, пропуск файла"
    continue
  fi
  
  echo "  Найден агрегат: $AGGREGATE_NAME"
  echo "  Найден мета: $META_NAME"
  echo "  Найден signed: $SIGNED_NAME"
  echo "  Найден документ: $DOCUMENT_NAME"
  
  # Проверка, содержит ли уже extends DocumentAggregateBaseDTO
  if grep -q "$AGGREGATE_NAME extends DocumentAggregateBaseDTO" "$file"; then
    echo "  Класс уже наследуется от базового класса"
  else
    # Замена реализации implements на extends
    sed -i '' -e "s/$AGGREGATE_NAME *implements *DocumentAggregateDomainInterface<.*>/$AGGREGATE_NAME extends DocumentAggregateBaseDTO<$META_NAME, $SIGNED_NAME, $DOCUMENT_NAME>/g" "$file"
    echo "  Заменен implements на extends"
    
    # Удаление поля hash
    sed -i '' -e "/@Field.*String.*\nhash!: string;/d" "$file"
    
    # Обновление поля signatures
    sed -i '' -e "s/@Field.*\( *=> *\[$SIGNED_NAME\]\)/@Field\1, { description: 'Подписи документа' }/g" "$file"
    sed -i '' -e "s/signatures!: $SIGNED_NAME\[\];/override signatures!: $SIGNED_NAME\[\];/g" "$file"
    
    # Обновление поля rawDocument
    sed -i '' -e "s/@Field.*\( *=> *$DOCUMENT_NAME, *{ *nullable: *true *}\)/@Field\1, { description: 'Исходный документ' }/g" "$file"
    sed -i '' -e "s/rawDocument?: $DOCUMENT_NAME;/override rawDocument?: $DOCUMENT_NAME;/g" "$file"
    
    echo "  Обновлены поля"
  fi
  
  echo "  Обработка завершена"
  echo ""
done

echo "Все файлы обработаны"
