"""
Проверка макросов документации: SDK, TypeDoc, GraphQL.

Соответствует тому, что видно на собранных страницах MkDocs (префикс ⚠️ у макросов).
"""
import contextlib
import io
import os
import re
import sys

sys.path.append(".")

import main


class FakeEnv:
    def __init__(self):
        self.variables = {}


env = FakeEnv()
main.define_env(env)

get_sdk_doc = env.variables["get_sdk_doc"]
get_graphql_doc = env.variables["get_graphql_doc"]
get_typedoc_desc = env.variables["get_typedoc_desc"]
get_typedoc_input = env.variables["get_typedoc_input"]
get_typedoc_definition = env.variables["get_typedoc_definition"]

def _is_macro_problem(result: str) -> bool:
    if not isinstance(result, str):
        return False
    return result.strip().startswith("⚠️")


def _call_macro(fn, *args):
    """Вызов макроса без мусора в stdout (get_typedoc_desc печатает отладку при промахе)."""
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        return fn(*args)


# Сканируем все .md файлы
docs_dir = "docs"
problems: list[str] = []
seen: set[tuple[str, str, str]] = set()


def _add(filepath: str, macro: str, detail: str) -> None:
    key = (filepath, macro, detail)
    if key in seen:
        return
    seen.add(key)
    problems.append(f"{filepath}: {macro} → {detail}")


for root, _dirs, files in os.walk(docs_dir):
    for file in files:
        if not file.endswith(".md"):
            continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, encoding="utf-8") as f:
                content = f.read()
        except OSError as e:
            print(f"Ошибка при чтении {filepath}: {e}")
            continue

        # --- get_sdk_doc ---
        for match in re.findall(
            r'{{\s*get_sdk_doc\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\)\s*}}',
            content,
        ):
            namespace, module, method = match
            full = f"{namespace}.{module}.{method}"
            result = _call_macro(get_sdk_doc, namespace, module, method)
            if _is_macro_problem(result):
                _add(filepath, "get_sdk_doc", full)

        # --- get_graphql_doc ---
        for match in re.findall(
            r'{{\s*get_graphql_doc\("([^"]+)"\)\s*}}',
            content,
        ):
            ref = match
            result = _call_macro(get_graphql_doc, ref)
            if _is_macro_problem(result):
                _add(filepath, "get_graphql_doc", ref)

        # --- get_typedoc_desc ---
        for match in re.findall(
            r'{{\s*get_typedoc_desc\("([^"]+)"\)\s*}}',
            content,
        ):
            ref = match
            result = _call_macro(get_typedoc_desc, ref)
            if _is_macro_problem(result):
                _add(filepath, "get_typedoc_desc", ref)

        # --- get_typedoc_input (второй аргумент опционален) ---
        for m in re.finditer(
            r'{{\s*get_typedoc_input\(\s*"([^"]+)"\s*(?:,\s*"([^"]+)"\s*)?\)\s*}}',
            content,
        ):
            ref, iface = m.group(1), m.group(2) or "IInput"
            result = _call_macro(get_typedoc_input, ref, iface)
            if _is_macro_problem(result):
                _add(filepath, "get_typedoc_input", f"{ref} ({iface})")

        # --- get_typedoc_definition ---
        for m in re.finditer(
            r'{{\s*get_typedoc_definition\(\s*"([^"]+)"\s*(?:,\s*"([^"]+)"\s*)?\)\s*}}',
            content,
        ):
            ref, iface = m.group(1), m.group(2)
            if iface:
                result = _call_macro(get_typedoc_definition, ref, iface)
                detail = f"{ref} ({iface})"
            else:
                result = _call_macro(get_typedoc_definition, ref)
                detail = ref
            if _is_macro_problem(result):
                _add(filepath, "get_typedoc_definition", detail)

print("Проблемные макросы в документации (SDK / TypeDoc / GraphQL):")
for problem in problems:
    print(f"  ❌ {problem}")

print(f"\nВсего проблем: {len(problems)}")
