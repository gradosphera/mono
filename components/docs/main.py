import os
import json

def define_env(env):
    """Инициализация макросов для MkDocs"""
    print("✅ Macros загружен!")  # Проверка загрузки

    # --- SDK LINKS ---
    sdk_docs_path = "docs/sdk"  # Фиксированный путь к SDK в MkDocs
    sdk_doc_links = {}

    SDK_LINK_PREFIX = "🛠️ SDK: "  # Префикс для ссылок на SDK

    # Сканируем директорию SDK
    for root, _, files in os.walk(sdk_docs_path):
        for file in files:
            if file.endswith(".html"):
                method_name = file[:-5]  # Убираем .html из имени файла

                # Формируем относительный путь (не от "docs/", а от корня MkDocs)
                rel_path = os.path.relpath(os.path.join(root, file), "docs/sdk")
                web_path = f"/sdk/{rel_path}".replace(os.sep, "/")  # Унификация пути

                sdk_doc_links[method_name] = web_path  # Сохраняем путь

    # --- GRAPHQL (SpectaQL) LINKS ---
    # Абсолютный путь от корня сайта MkDocs (файл лежит в docs/graphql/index.html).
    # Не использовать relpath("graphql/index.html", "docs") — даёт ../graphql и ломает href.
    graphql_web_path = "/graphql/index.html"

    # --- TYPE DOC LINKS ---
    typedoc_path_candidates = [
        os.path.join("docs", "sdk", "typedoc.json"),  # локальный сгенерированный TypeDoc
        os.path.join("mono", "components", "sdk", "docs", "typedoc.json"),  # исторический путь
    ]
    typedoc_path = next((p for p in typedoc_path_candidates if os.path.exists(p)), None)
    typedoc_data = {}

    if typedoc_path:
        with open(typedoc_path, "r", encoding="utf-8") as f:
            typedoc_data = json.load(f)
    else:
        print("⚠️ TypeDoc JSON не найден ни по одному пути, макросы работать не будут.")

    # ----------------------------------------------------------------
    # Вспомогательные функции
    # ----------------------------------------------------------------

    def get_sdk_doc(*args):
        """Генерирует ссылку на метод SDK, принимая любое количество аргументов"""
        full_name = ".".join(args)  # Склеиваем аргументы

        if full_name in sdk_doc_links:
            return f"{SDK_LINK_PREFIX}[{full_name}]({sdk_doc_links[full_name]})"

        modules_candidate = os.path.join("docs", "sdk", "modules", f"{full_name}.html")
        if os.path.isfile(modules_candidate):
            return f"{SDK_LINK_PREFIX}[{full_name}](/sdk/modules/{full_name}.html)"

        return f"⚠️ {SDK_LINK_PREFIX}{full_name} не найден"

    def get_graphql_doc(reference: str):
        """Генерирует ссылку на GraphQL Query, Mutation или Definition"""
        if not reference:
            return "⚠️ Некорректный GraphQL идентификатор"

        # Преобразуем reference из "Query.getAccount" → "query-getAccount"
        parts = reference.split(".")
        reference_link = "-".join([parts[0].lower()] + parts[1:])

        # Формируем ссылку на index.html#reference
        link = f"{graphql_web_path}#{reference_link}"

        # Отображаем первую букву reference в верхнем регистре
        display_text = reference[0].upper() + reference[1:]

        return f"[{display_text}]({link})"

    def get_graphql_definition(definition_name: str):
        """Генерирует ссылку на GraphQL-определение"""
        if not definition_name:
            return "⚠️ Некорректное имя определения"

        link = f"{graphql_web_path}#definition-{definition_name}"
        return f"[`{definition_name}`]({link})"

    def get_class_doc(*args):
        """Генерирует ссылку на класс или метод внутри класса в TypeDoc JSON"""
        if len(args) < 1:
            return "⚠️ Некорректный формат, используйте `Namespace.ClassName`"

        class_name = ".".join(args[:-1]) if len(args) > 1 else args[0]
        method_name = args[-1] if len(args) > 1 else None

        # Формируем путь
        class_link = f"/sdk/classes/{class_name}.html"
        if method_name:
            class_link += f"#{method_name}"

        # Формируем отображаемый текст
        display_text = f"{class_name}.{method_name}" if method_name else class_name

        return f"🛠️ [`{display_text}`]({class_link})"


    # ----------------------------------------------------------------
    # Функции для TypeDoc
    # ----------------------------------------------------------------

    def find_variable(namespace_path, variable_name, node):
        """
        Рекурсивный поиск переменной, метода или константы внутри вложенных неймспейсов
        """
        if "children" not in node:
            return None

        for child in node["children"]:
            # Если это namespace (kind = 4), рекурсивно углубляемся
            if child.get("kind") == 4:
                if namespace_path and child["name"] == namespace_path[0]:
                    return find_variable(namespace_path[1:], variable_name, child)

            # Переменная / функция / namespace / класс / интерфейс / type alias (см. ReflectionKind в TypeDoc)
            _DOC_KINDS = (32, 64, 4, 128, 256, 1024, 2097152)
            if child["name"] == variable_name and child.get("kind") in _DOC_KINDS:
                return child

        return None

    def typedoc_module_lookup_ref(ref: str) -> str:
        """
        Путь для поиска в typedoc.json. Пока в JSON есть только SaveWif, ссылки в доках — SetWif.
        После перегенерации TypeDoc при наличии SetWif ветка SaveWif не используется.
        """
        parts = ref.split(".")
        if len(parts) < 2:
            return ref
        ns_path, leaf = parts[:-1], parts[-1]
        if find_variable(ns_path, leaf, typedoc_data):
            return ref
        if ref == "Mutations.System.SetWif" or ref.startswith("Mutations.System.SetWif."):
            alt = ref.replace("Mutations.System.SetWif", "Mutations.System.SaveWif", 1)
            ap = alt.split(".")
            if find_variable(ap[:-1], ap[-1], typedoc_data):
                return alt
        return ref

    def typedoc_find_all_by_name(name_to_find: str, node: dict, path: list) -> list:
        """Все узлы typedoc с node[\"name\"] == name_to_find; (path[], node)."""
        results = []
        current_name = node.get("name")
        if current_name == name_to_find:
            results.append((path + [current_name], node))
        for child in node.get("children", []):
            child_name = child.get("name", "child")
            results.extend(typedoc_find_all_by_name(name_to_find, child, path + [child_name]))
        if "type" in node and "declaration" in node["type"]:
            decl = node["type"]["declaration"]
            decl_name = decl.get("name", "__decl__")
            results.extend(typedoc_find_all_by_name(name_to_find, decl, path + [decl_name]))
        return results

    def typedoc_pick_prefer_modeltypes(found_nodes: list):
        if not found_nodes:
            return None
        for _path_list, node in found_nodes:
            if "ModelTypes" in _path_list:
                return node
        return found_nodes[0][1]

    def debug_find_available_children(namespace_path, node):
        """Отладочная функция для показа доступных children в указанном пути"""
        current_node = node
        for i, ns in enumerate(namespace_path):
            print(f"🔍 Ищем namespace '{ns}' на уровне {i}")
            if "children" not in current_node:
                print(f"❌ Нет children на уровне {i}")
                return
            
            found = False
            print(f"📋 Доступные дети на уровне {i}:")
            for j, child in enumerate(current_node["children"][:20]):  # Показываем первые 20
                child_name = child.get("name", "unnamed")
                child_kind = child.get("kind", "unknown")
                print(f"  [{j}] name='{child_name}', kind={child_kind}")
                if child_name == ns:
                    current_node = child
                    found = True
                    print(f"✅ Найден namespace '{ns}'")
                    break
                    
            if not found:
                print(f"❌ Namespace '{ns}' не найден среди детей")
                return
                
        # Показываем финальные дети
        if "children" in current_node:
            print(f"📋 Финальные дети в {'/'.join(namespace_path)}:")
            for j, child in enumerate(current_node["children"][:20]):  # Показываем первые 20
                child_name = child.get("name", "unnamed")  
                child_kind = child.get("kind", "unknown")
                print(f"  [{j}] name='{child_name}', kind={child_kind}")

    def get_typedoc_desc(namespace_variable):
        """Извлекает описание (summary/@example) переменной/метода из TypeDoc JSON"""
        lookup_key = typedoc_module_lookup_ref(namespace_variable)
        parts = lookup_key.split(".")
        variable = None
        if len(parts) < 2:
            found = typedoc_find_all_by_name(lookup_key, typedoc_data, [])
            variable = typedoc_pick_prefer_modeltypes(found)
            if not variable:
                return f"⚠️ Описание для `{namespace_variable}` не найдено"
        else:
            namespace_path, variable_name = parts[:-1], parts[-1]
            variable = find_variable(namespace_path, variable_name, typedoc_data)
            if not variable:
                print(f"❌ Не найден объект для {namespace_variable}")
                debug_find_available_children(namespace_path, typedoc_data)
                return f"⚠️ Описание для `{namespace_variable}` не найдено"

        # Обрабатываем summary
        markdown_blocks = []
        if "comment" in variable and "summary" in variable["comment"]:
            for item in variable["comment"]["summary"]:
                if item["kind"] == "text":
                    markdown_blocks.append(item["text"].strip())
                elif item["kind"] == "code":
                    markdown_blocks.append(f"\n\n{item['text'].strip()}\n\n")

        # Извлекаем @example
        if "comment" in variable and "blockTags" in variable["comment"]:
            for tag in variable["comment"]["blockTags"]:
                if tag["tag"] == "@example":
                    for content in tag.get("content", []):
                        if content["kind"] == "code":
                            markdown_blocks.append(f"\n\n{content['text'].strip()}\n\n")

        return "\n\n".join(markdown_blocks) if markdown_blocks else ""

    def get_typedoc_value(namespace_variable):
        """Извлекает значение (const/var) из TypeDoc JSON"""
        parts = namespace_variable.split(".")
        if len(parts) < 2:
            return f"⚠️ Некорректный формат, используйте `Namespace.Variable`"

        namespace_path, variable_name = parts[:-1], parts[-1]
        variable = find_variable(namespace_path, variable_name, typedoc_data)

        if not variable:
            return f"⚠️ Значение для `{namespace_variable}` не найдено"

        # Если это константа (kind = 32 и isConst = true)
        if variable.get("kind") == 32 and variable.get("flags", {}).get("isConst", False):
            if "type" in variable and "value" in variable["type"]:
                return variable["type"]["value"]
            elif "defaultValue" in variable:
                return variable["defaultValue"]

        # Если это обычная переменная/метод
        if "defaultValue" in variable:
            return variable["defaultValue"]

        return f"⚠️ Значение для `{namespace_variable}` не найдено"

    # ----------------------------------------------------------------
    # Универсальные парсеры для интерфейсов
    # ----------------------------------------------------------------

    def find_interface(parent_node, interface_name, debug_print):
        """Внутри parent_node['children'] ищем объект c name=interface_name"""
        if "children" not in parent_node:
            return None
        for child in parent_node["children"]:
            debug_print(f"[DEBUG] Смотрим child: id={child.get('id')}, name={child.get('name')}")
            if child.get("name") == interface_name:
                debug_print(f"[DEBUG] Найден {interface_name}: id={child.get('id')}")
                return child
        return None

    def find_by_id(type_id, node, debug_print):
        """
        Рекурсивный поиск в typedoc_data по ID.
        Расширяем на type.declaration, если нужно.
        """
        if node.get("id") == type_id:
            debug_print(f"[DEBUG] find_by_id: Нашли: id={node['id']}, name={node.get('name')}")
            return node

        for c in node.get("children", []):
            found = find_by_id(type_id, c, debug_print)
            if found:
                return found

        if "type" in node and "declaration" in node["type"]:
            decl = node["type"]["declaration"]
            found_decl = find_by_id(type_id, decl, debug_print)
            if found_decl:
                return found_decl

        return None

    def build_reflection_obj(declaration, typedoc_data, debug_print, indent=2):
        """Формирует многострочный объект { ... } для reflection."""
        lines = ["{"]
        fields = extract_fields(declaration, typedoc_data, debug_print, indent + 2)
        lines.extend(fields)
        lines.append(f"{' ' * indent}}}")
        return "\n".join(lines)

    def get_type_string(type_obj, typedoc_data, debug_print, indent=0):
        """
        Возвращает строку типа (recursive):
         1) name
         2) union => "a | b | c"
         3) literal => "DocumentPackage"/"abc"/null
         4) reflection => build_reflection_obj(...)
         5) array => elementType[]
         6) indexedAccess => objectType[indexType]
         7) reference (id) => find_by_id(...) -> name/inline object
         8) unknown
        """
        # 1) Есть name?
        if "name" in type_obj:
            debug_print(f"[DEBUG] get_type_string: используем name={type_obj['name']}")
            return type_obj["name"]

        # 2) union
        if type_obj.get("type") == "union" and "types" in type_obj:
            subtypes = []
            for st in type_obj["types"]:
                subtypes.append(get_type_string(st, typedoc_data, debug_print, indent))
            union_str = " | ".join(subtypes)
            debug_print(f"[DEBUG] get_type_string: union => {union_str}")
            return union_str

        # 3) literal (например, null, "DocumentPackage")
        if type_obj.get("type") == "literal":
            val = type_obj.get("value")
            if val is None:
                return "null"
            if isinstance(val, str):
                return f"\"{val}\""
            return str(val)

        # 4) reflection
        if type_obj.get("type") == "reflection" and "declaration" in type_obj:
            debug_print("[DEBUG] get_type_string: reflection => строим объект")
            return build_reflection_obj(type_obj["declaration"], typedoc_data, debug_print, indent)

        # 5) array
        if type_obj.get("type") == "array" and "elementType" in type_obj:
            debug_print("[DEBUG] get_type_string: array => elementType[]")
            el_type_str = get_type_string(type_obj["elementType"], typedoc_data, debug_print, indent)
            return f"{el_type_str}[]"

        # 6) indexedAccess => obj[idx]
        if type_obj.get("type") == "indexedAccess":
            debug_print("[DEBUG] get_type_string: indexedAccess => objectType[indexType]")
            obj_type = type_obj.get("objectType", {})
            idx_type = type_obj.get("indexType", {})

            obj_str = get_type_string(obj_type, typedoc_data, debug_print, indent)
            idx_str = get_type_string(idx_type, typedoc_data, debug_print, indent)

            return f"{obj_str}[{idx_str}]"

        # 7) reference по id
        if "id" in type_obj:
            ref_id = type_obj["id"]
            debug_print(f"[DEBUG] get_type_string: ищем ref по id={ref_id}")
            ref_item = find_by_id(ref_id, typedoc_data, debug_print)
            if ref_item:
                debug_print(f"[DEBUG] ref_item найден: id={ref_item['id']}, name={ref_item.get('name')}")
                # Если есть ref_item["type"]["declaration"]
                if "type" in ref_item and "declaration" in ref_item["type"]:
                    debug_print("[DEBUG] ref_item содержит declaration => строим объект")
                    return build_reflection_obj(ref_item["type"]["declaration"], typedoc_data, debug_print, indent)
                return ref_item.get("name", "unknown")
            else:
                debug_print(f"[DEBUG] ref_item с id={ref_id} не найден!")
                return "unknown"

        # 8) Иначе unknown
        return "unknown"

    def extract_fields(declaration, typedoc_data, debug_print, indent=2):
        """
        Обходим declaration['children'], формируя строки вида:
          fieldName?: <type>; // comment
          ИЛИ
          fieldName?: {
            ...
          };
        """
        fields = []
        for field in declaration.get("children", []):
            field_name = field["name"]
            debug_print(f"[DEBUG] extract_fields: поле={field_name}")
            is_optional = field.get("flags", {}).get("isOptional", False)
            question_mark = "?" if is_optional else ""

            # Определяем строку типа
            field_type_str = get_type_string(field.get("type", {}), typedoc_data, debug_print, indent + 2)

            # Если у поля есть declaration, значит вложенный объект
            if "declaration" in field.get("type", {}):
                nested_lines = extract_fields(field["type"]["declaration"], typedoc_data, debug_print, indent + 2)
                fields.append(f"{' ' * indent}{field_name}{question_mark}: {{")
                fields.extend(nested_lines)
                fields.append(f"{' ' * indent}}};")
            else:
                # комментарий
                field_desc = ""
                if "comment" in field and "summary" in field["comment"]:
                    field_desc = " // " + " ".join(
                        item["text"] for item in field["comment"]["summary"] if "text" in item
                    )
                fields.append(f"{' ' * indent}{field_name}{question_mark}: <{field_type_str}>;{field_desc}")
        return fields

    # ----------------------------------------------------------------
    # Макрос 1: IInput + пример вызова
    # ----------------------------------------------------------------
    def get_typedoc_input(namespace_variable, interface_name="IInput"):
        """
        Генерирует пример использования (запрос/мутация):
          import { Mutations } from '@coopenomics/sdk';
          const variables = Mutations.[namespaceVariable].[interfaceName];
          const { ... } = await client.Mutation(...);

        По умолчанию ищет interface_name="IInput".
        """
        isDebug = False
        def debug_print(*args):
            if isDebug:
                print(*args)

        orig_ref = namespace_variable
        lookup_ref = typedoc_module_lookup_ref(namespace_variable)
        parts = lookup_ref.split(".")
        if len(parts) < 2:
            return f"⚠️ Некорректный формат, используйте `Namespace.Method`"

        root_namespace, *namespace_path, variable_name = parts
        if root_namespace not in {"Mutations", "Queries"}:
            return f"⚠️ Некорректный корневой namespace `{root_namespace}`"

        debug_print(f"[DEBUG] Ищем variable: {lookup_ref}")
        variable = find_variable([root_namespace] + namespace_path, variable_name, typedoc_data)
        if not variable:
            return f"⚠️ `{orig_ref}` не найден"

        # Ищем нужный интерфейс внутри variable
        interface_obj = find_interface(variable, interface_name, debug_print)
        if not interface_obj:
            return f"⚠️ `{interface_name}` для `{orig_ref}` не найден"

        debug_print(f"[DEBUG] Начинаем разбирать {interface_name}, id={interface_obj.get('id')}")
        interface_fields = extract_fields(interface_obj, typedoc_data, debug_print)

        # Решаем, Mutation или Query
        operation_type = "Query" if root_namespace == "Queries" else "Mutation"

        # Пути в примере — как в документации (SetWif), поиск мог идти по SaveWif в typedoc.json
        o_parts = orig_ref.split(".")
        o_root, *o_ns, o_var = o_parts
        interface_path = f"{o_root}.{'.'.join(o_ns)}.{o_var}.{interface_name}"

        ts_code = [
            "\n",
            "```typescript",
            f"import {{ {o_root} }} from '@coopenomics/sdk';\n",
            f"const variables: {interface_path} = {{",  # Указываем интерфейс для переменной variables
            *interface_fields,
            "};\n",
            f"const {{ [{o_root}.{'.'.join(o_ns)}.{o_var}.name]: result }} = await client.{operation_type}(",
            f"  {o_root}.{'.'.join(o_ns)}.{o_var}.{operation_type.lower()},",
            "  { variables }",
            ");",
            "```"
        ]
        return "\n".join(ts_code)

    # ----------------------------------------------------------------
    # Макрос 2: IOutput (или любой интерфейс) - только структура
    # ----------------------------------------------------------------
    def get_typedoc_definition(namespace_variable_or_interface_name, interface_name=None):
        """
        Универсальный поиск интерфейса.

        1) Если передан `namespace_variable_or_interface_name` вида "Mutations.Payments.CreateDepositPayment",
           ищем интерфейс `interface_name` (по умолчанию "IOutput") внутри этого объекта.

        2) Если передано просто "DocumentPackage", ищем по всему `typedoc_data`.

        Возвращает **структуру интерфейса без вызова**, например:
          ```typescript
          interface SomeInterface {
            ...
          }
          ```
        """

        isDebug = False
        def debug_print(*args):
            if isDebug:
                print(*args)

        # Если интерфейс не передан, используем название, которое передали
        if not interface_name:
            interface_name = namespace_variable_or_interface_name

        parts = typedoc_module_lookup_ref(namespace_variable_or_interface_name).split(".")
        if len(parts) >= 2 and parts[0] in {"Mutations", "Queries"}:
            # Ищем внутри Mutations/Queries
            root_namespace, *namespace_path, variable_name = parts

            debug_print(f"[DEBUG] (Definition) Ищем variable: {namespace_variable_or_interface_name}")
            variable = find_variable([root_namespace] + namespace_path, variable_name, typedoc_data)
            if not variable:
                return f"⚠️ `{namespace_variable_or_interface_name}` не найден"

            # Ищем нужный интерфейс внутри variable
            debug_print(f"[DEBUG] Ищем {interface_name} внутри {variable.get('name')}")
            interface_obj = find_interface(variable, interface_name, debug_print)
            if not interface_obj:
                return f"⚠️ `{interface_name}` для `{namespace_variable_or_interface_name}` не найден"

            debug_print(f"[DEBUG] Начинаем разбирать {interface_name}, id={interface_obj.get('id')}")

            return _extract_interface(interface_obj, interface_name, debug_print)

        else:
            # Глобальный поиск
            debug_print(f"[DEBUG] (Definition) Глобальный поиск {namespace_variable_or_interface_name}")
            return _get_typedoc_definition_global(namespace_variable_or_interface_name, debug_print)


    def _extract_interface(interface_obj, interface_name, debug_print):
        """
        Извлекает и формирует структуру интерфейса.
        Если у объекта есть type.reflection => заглядываем внутрь declaration.children
        Если у объекта единственный child => __type, заходим глубже
        """
        # Если у объекта type.reflection => уходим в declaration
        if "type" in interface_obj and "declaration" in interface_obj["type"]:
            debug_print(f"[DEBUG] У {interface_name} найден reflection => заглядываем в declaration")
            interface_obj = interface_obj["type"]["declaration"]

        # Если один child => погружаемся в __type
        if "children" in interface_obj and len(interface_obj["children"]) == 1:
            maybe_decl = interface_obj["children"][0]
            if "children" in maybe_decl:
                debug_print(f"[DEBUG] У {interface_name} один children (__type) → углубляемся")
                interface_obj = maybe_decl

        interface_fields = extract_fields(interface_obj, typedoc_data, debug_print)

        ts_code = [
            "\n",
            "```typescript",
            f"interface {interface_name} {{",
            *interface_fields,
            "}",
            "```"
        ]
        return "\n".join(ts_code)


    def _get_typedoc_definition_global(interface_name, debug_print):
        """
        Глобальный поиск интерфейса 'interface_name' во всем `typedoc_data`.
        Теперь собираем все совпадения, печатаем их пути, а берём первое.
        """

        found_nodes = typedoc_find_all_by_name(interface_name, typedoc_data, [])

        if not found_nodes:
            return f"⚠️ Интерфейс `{interface_name}` не найден в typedoc_data"

        debug_print(f"[DEBUG] Найдено совпадений: {len(found_nodes)}")
        for i, (path_list, node) in enumerate(found_nodes, start=1):
            path_str = " -> ".join(path_list)
            debug_print(f"[DEBUG] #{i}: path={path_str}, id={node.get('id')}")

        main_node = typedoc_pick_prefer_modeltypes(found_nodes)
        if main_node is None:
            return f"⚠️ Интерфейс `{interface_name}` не найден в typedoc_data"

        debug_print(f"[DEBUG] Используем ноду: id={main_node.get('id')}")
        return _extract_interface(main_node, interface_name, debug_print)

    def _find_by_name_deep(name_to_find, node, debug_print):
        """
        Рекурсивный поиск `name_to_find` внутри:
        - node["children"]
        - node["type"]["declaration"]["children"]
        """
        if node.get("name") == name_to_find:
            debug_print(f"[DEBUG] _find_by_name_deep: Нашли {name_to_find} в node id={node.get('id')}")
            return node

        for child in node.get("children", []):
            found = _find_by_name_deep(name_to_find, child, debug_print)
            if found:
                return found

        if "type" in node and "declaration" in node["type"]:
            decl = node["type"]["declaration"]
            found_decl = _find_by_name_deep(name_to_find, decl, debug_print)
            if found_decl:
                return found_decl

        return None

    def dev_schema_source():
        """Краткая отсылка к канонической GraphQL-схеме (для свёрнутых dev-блоков в MkDocs)."""
        return (
            "Канонические имена полей и типов — в файле `components/controller/schema.gql` монорепозитория; "
            "интерактивно — в [документации GraphQL-API](/graphql)."
        )

    def dev_blockchain_note():
        """Напоминание: часть действий совета/пайщика уходит в EOSIO через SDK, а не через отдельные поля Mutation."""
        bc = get_class_doc("Classes", "Blockchain")
        cl = get_class_doc("Classes", "Client")
        return (
            "Часть шагов (голос по решению совета, исполнение ряда решений) выполняется **подписью и отправкой транзакции** "
            "в блокчейн через `Client.Blockchain` / класс `Blockchain` в пакете `@coopenomics/sdk`, а не отдельной мутацией GraphQL; "
            f"см. {bc} и {cl}."
        )

    # ----------------------------------------------------------------
    # Регистрируем макросы
    # ----------------------------------------------------------------
    env.variables["dev_schema_source"] = dev_schema_source
    env.variables["dev_blockchain_note"] = dev_blockchain_note
    env.variables["get_sdk_doc"] = get_sdk_doc
    env.variables["get_graphql_doc"] = get_graphql_doc
    env.variables["get_graphql_definition"] = get_graphql_definition
    env.variables["get_class_doc"] = get_class_doc

    env.variables["get_typedoc_desc"] = get_typedoc_desc
    env.variables["get_typedoc_value"] = get_typedoc_value

    env.variables["get_typedoc_input"] = get_typedoc_input
    env.variables["get_typedoc_definition"] = get_typedoc_definition

    print(f"✅ Загружено {len(sdk_doc_links)} SDK методов!")  # Проверка
    print(f"✅ GraphQL ссылки теперь автоматически генерируются! ({graphql_web_path})")  # Проверка
    if typedoc_path:
        print(f"✅ TypeDoc JSON загружен из {typedoc_path}")  # Проверка
