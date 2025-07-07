import sys
import os
sys.path.append('.')
import main

# Имитируем env для макросов
class FakeEnv:
    def __init__(self):
        self.variables = {}

env = FakeEnv()
main.define_env(env)

# Получаем доступные SDK методы
sdk_doc_links = {}
try:
    # Перехватываем глобальные переменные из функции
    for key, value in env.variables.items():
        if hasattr(value, '__globals__') and 'sdk_doc_links' in value.__globals__:
            sdk_doc_links = value.__globals__['sdk_doc_links']
            break
except:
    pass

print("Найденные SDK методы:")
mutations_count = 0
queries_count = 0
classes_count = 0

for method in sorted(sdk_doc_links.keys()):
    if method.startswith('Mutations.'):
        mutations_count += 1
        if 'Account' in method or 'Payment' in method or 'Agreement' in method or 'Decision' in method or 'Fund' in method:
            print(f"  {method}")
    elif method.startswith('Queries.'):
        queries_count += 1
        if 'Account' in method or 'Payment' in method or 'Fund' in method:
            print(f"  {method}")
    elif method.startswith('Classes.'):
        classes_count += 1
        print(f"  {method}")

print(f"\nИтого:")
print(f"  Mutations: {mutations_count}")
print(f"  Queries: {queries_count}")
print(f"  Classes: {classes_count}")
print(f"  Всего: {len(sdk_doc_links)}")
