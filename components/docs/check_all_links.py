import os
import re
import sys
sys.path.append('.')

# Импортируем main.py для получения доступа к sdk_doc_links
import main

# Настройка
class FakeEnv:
    def __init__(self):
        self.variables = {}

env = FakeEnv()
main.define_env(env)

# Получаем функцию get_sdk_doc
get_sdk_doc = env.variables['get_sdk_doc']

# Сканируем все .md файлы
docs_dir = 'docs'
problems = []

for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Ищем все вызовы get_sdk_doc
                pattern = r'{{ get_sdk_doc\("([^"]+)", "([^"]+)", "([^"]+)"\) }}'
                matches = re.findall(pattern, content)
                
                for match in matches:
                    namespace, module, method = match
                    result = get_sdk_doc(namespace, module, method)
                    if "не найден" in result:
                        problems.append(f"{filepath}: {namespace}.{module}.{method}")
            except Exception as e:
                print(f"Ошибка при обработке {filepath}: {e}")

print("Проблемные ссылки в документации:")
for problem in problems:
    print(f"  ❌ {problem}")

print(f"\nВсего проблем: {len(problems)}")
