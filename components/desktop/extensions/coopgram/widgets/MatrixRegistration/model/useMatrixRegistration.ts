import { ref, computed } from 'vue';
import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';

export function useMatrixRegistration() {
  const username = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const usernameAvailable = ref<boolean | null>(null);
  const checkingUsername = ref(false);

  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  const validateForm = (): boolean => {
    if (!username.value || !password.value || !confirmPassword.value) {
      error.value = 'Заполните все поля';
      return false;
    }

    if (usernameAvailable.value === false) {
      error.value = 'Пользователь с таким именем уже существует';
      return false;
    }

    if (password.value !== confirmPassword.value) {
      error.value = 'Пароли не совпадают';
      return false;
    }

    error.value = null;
    return true;
  };

  const resetForm = () => {
    username.value = '';
    password.value = '';
    confirmPassword.value = '';
    usernameAvailable.value = null;
    error.value = null;
  };

  // Асинхронная проверка доступности username
  const checkUsernameAvailability = async (value: string): Promise<boolean> => {
    if (!value || value.length < 3) return false;

    checkingUsername.value = true;
    try {
      const { [Queries.Coopgram.CheckUsernameAvailability.name]: result } = await client.Query(
        Queries.Coopgram.CheckUsernameAvailability.query,
        {
          variables: {
            data: { username: value },
          },
        }
      );
      usernameAvailable.value = result;
      return result;
    } catch (err) {
      console.error('Failed to check username availability:', err);
      usernameAvailable.value = false; // В случае ошибки считаем недоступным
      return false;
    } finally {
      checkingUsername.value = false;
    }
  };

  // Правило валидации для username
  const validateUsernameAsync = async (val: string): Promise<string | boolean> => {
    if (!val) {
      usernameAvailable.value = null;
      return 'Введите имя пользователя';
    }

    if (val.length < 3) {
      usernameAvailable.value = null;
      return 'Имя пользователя должно содержать минимум 3 символа';
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(val)) {
      usernameAvailable.value = null;
      return 'Имя пользователя может содержать только буквы, цифры, подчеркивания и дефисы';
    }

    const available = await checkUsernameAvailability(val);
    return available || 'Пользователь с таким именем уже существует';
  };

  return {
    username,
    password,
    confirmPassword,
    usernameAvailable: computed(() => usernameAvailable.value),
    checkingUsername: computed(() => checkingUsername.value),
    isSubmitting,
    error,
    validateForm,
    resetForm,
    checkUsernameAvailability,
    validateUsernameAsync,
  };
}
