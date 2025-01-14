import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";

function extractMutationDescriptions(schemaPath: string): Record<string, string> {
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // 1. Выдёргиваем блоки type Query {...} и type Mutation {...}
  //    Флаг [\s\S]*? — жадный для любых символов, включая переносы
  //    "?" — чтобы матчить в "ленивом" режиме, не захватывая дальше следующей фигурной скобки
  //
  // Пример:
  //   type Query {
  //     """Док для getAccount"""
  //     getAccount(...): ...
  //   }
  const typeBlockRegex = /type\s+(Query|Mutation)\s*\{\s*([\s\S]*?)\}/g;

  let match;
  let blocks: { [key: string]: string } = {
    Query: "",
    Mutation: "",
  };

  while ((match = typeBlockRegex.exec(schema)) !== null) {
    const typeName = match[1]; // Query или Mutation
    const blockContent = match[2]; // содержимое скобок { ... }

    blocks[typeName] = blockContent;
  }

  // 2. Функция, чтобы распарсить **внутренности** типа
  //    Ищем пары:
  //    """
  //      многострочный
  //      комментарий
  //    """
  //    getAccount(...): ...
  //
  // или
  //
  //    """
  //      многострочный
  //    """
  //    getAccount(...): ...
  function parseBlock(content: string): Record<string, string> {
    let results: Record<string, string> = {};
    // Находим все подряд:
    // """  (что угодно, включая переносы)  """  (пробелы/переносы)  (methodName)   (   или   :
    //
    // Обрати внимание:
    // [\s\S]*?    -> ленивый, чтобы не "съесть" весь текст до следующего """
    // (\w+)       -> имя запроса/мутации
    // (?:\(|:)    -> либо '(' (вызов), либо ':' (может быть тип)
    const itemRegex = /"""([\s\S]*?)"""\s*(\w+)\s*(?:\(|:)/g;

    let m;
    while ((m = itemRegex.exec(content)) !== null) {
      let doc = m[1];
      let name = m[2];
      // Убираем лишние пробелы/переносы внутри doc
      doc = doc
        .replace(/\r/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      results[name] = doc;
    }
    return results;
  }

  // 3. Собираем итоговый словарь
  let descriptions: Record<string, string> = {};

  // Парсим блок Query
  const queryMap = parseBlock(blocks["Query"]);
  // Парсим блок Mutation
  const mutationMap = parseBlock(blocks["Mutation"]);

  // Склеиваем (если названия методов совпадут, Mutation перекроет)
  descriptions = {
    ...queryMap,
    ...mutationMap,
  };

  console.log("📜 Загружено описаний мутаций:", Object.keys(descriptions).length);
  return descriptions;
}



// 📌 2. Функция для обработки одного index.ts
function processIndexFile(filePath: string, descriptions: Record<string, string>) {
    
    let content = fs.readFileSync(filePath, "utf-8");
    let lines = content.split("\n");

    // Регулярка для ОДНОГО экспорта в строке (без якоря ^ и с ;? на конце):
    // "export * as SomeName from './someName';" (с пробелами/отступами, возможная ;)
    const exportRegex = /export\s+\*\s+as\s+(\w+)\s+from\s+["']\.\/([\w\d_-]+)["'];?/;

    let newLines: string[] = [];
    let modified = false;

    // Функция-проверка: является ли строка частью JSDoc/комментария
    function isDocComment(line: string) {
        const t = line.trim();
        return (
            t.startsWith("/**") ||
            t.startsWith("/*") ||
            t.startsWith("*") ||
            t.startsWith("*/") ||
            t.startsWith("//")
        );
    }

    for (let i = 0; i < lines.length; i++) {
        const originalLine = lines[i];
        const trimmedLine = originalLine.trim();

        // Проверяем, соответствует ли строка экспорт-паттерну
        const match = trimmedLine.match(exportRegex);

        // Если НЕ экспорт, копируем строку как есть
        if (!match) {
            newLines.push(originalLine);
            continue;
        }

        // Если это действительно экспорт, обрабатываем
        const [, exportName, fileName] = match;
        // Преобразуем первую букву в нижний регистр
        const exportNameKey = exportName.charAt(0).toLowerCase() + exportName.slice(1);
        const description = descriptions[exportNameKey];

        console.log(`  ✅ Найден экспорт: ${exportName} -> ${fileName}`);

        // 1) Удаляем ВСЕ комментарии, которые шли прямо над этим экспортом
        while (newLines.length > 0 && isDocComment(newLines[newLines.length - 1])) {
            newLines.pop();
            modified = true;
        }

        // 2) Если есть описание, добавляем новый комментарий
        if (description) {
            console.log(`    ➕ Добавляем (или обновляем) комментарий: "${description}"`);
            newLines.push(`/** ${description} */`);
            modified = true;
        } else {
            console.warn(`    ⚠️ Описание не найдено в schema.gql для "${exportName}" (ключ "${exportNameKey}")`);
        }

        // 3) Добавляем сам экспорт
        newLines.push(originalLine);
    }

    // Перезаписываем файл, только если что-то изменилось
    if (modified) {
        fs.writeFileSync(filePath, newLines.join("\n"), "utf-8");
    } else {
        // логов не добавляем
    }
}

// 📌 3. Функция для обхода подпапок `mutations` и `queries`, обработка всех index.ts
function processSubdirectories(sdkDirectory: string, schemaPath: string) {
    console.log("\n🚀 Запуск обработки `index.ts` файлов в подпапках...");
    const descriptions = extractMutationDescriptions(schemaPath);
    const subDirs = ["mutations", "queries"];

    subDirs.forEach((subDir) => {
        const baseDir = path.join(sdkDirectory, subDir);
        if (fs.existsSync(baseDir) && fs.statSync(baseDir).isDirectory()) {
            console.log(`📂 Поиск в: ${baseDir}`);

            // Получаем список всех подпапок
            const subfolders = fs
                .readdirSync(baseDir)
                .filter((folder) => fs.statSync(path.join(baseDir, folder)).isDirectory());

            subfolders.forEach((folder) => {
                const indexPath = path.join(baseDir, folder, "index.ts");
                if (fs.existsSync(indexPath)) {
                    processIndexFile(indexPath, descriptions);
                } else {
                    console.warn(`⚠️ Файл index.ts не найден в: ${path.join(baseDir, folder)}`);
                }
            });
        } else {
            console.warn(`⚠️ Директория отсутствует: ${baseDir}`);
        }
    });
}

// 📌 4. Запуск скрипта (эмуляция __dirname в ES-модулях)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../../controller/schema.gql");
const sdkDirectory = path.resolve(__dirname, "../src");

processSubdirectories(sdkDirectory, schemaPath);
