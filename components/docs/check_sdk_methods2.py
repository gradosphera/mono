import sys
import os
sys.path.append('.')
import main

# Имитируем env для макросов
class FakeEnv:
    def __init__(self):
        self.variables = {}

env = FakeEnv()

# Обходим проблему с импортом глобальных переменных
import importlib
importlib.reload(main)

# Запускаем define_env
main.define_env(env)

# Пробуем вызвать тестовые методы
test_methods = [
    ("Mutations", "Accounts", "RegisterAccount"),
    ("Mutations", "Account", "DeleteAccount"),
    ("Mutations", "Payments", "CreateDepositPayment"),
    ("Mutations", "Gateway", "CreateDepositPayment"),
    ("Mutations", "Wallet", "CreateDepositPayment"),
    ("Classes", "Account"),
    ("Classes", "Canvas"),
]

print("Тестирование SDK методов:")
for method_args in test_methods:
    try:
        result = env.variables['get_sdk_doc'](*method_args)
        if "не найден" in result:
            print(f"❌ {'.'.join(method_args)}: {result}")
        else:
            print(f"✅ {'.'.join(method_args)}: найден")
    except Exception as e:
        print(f"💥 {'.'.join(method_args)}: ошибка - {e}")
