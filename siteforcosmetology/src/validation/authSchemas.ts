import * as yup from 'yup';

export const loginSchema = yup.object({
  phoneOrEmail: yup
    .string()
    .required('Телефон или email обязателен')
    .test('is-phone-or-email', 'Введите корректный телефон или email', (value) => {
      if (!value) return false;

      // Проверка email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) return true;

      // Проверка телефона (российский формат)
      const phoneRegex =
        /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      return phoneRegex.test(cleanPhone);
    }),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Имя обязательно')
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя должно содержать максимум 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/, 'Имя может содержать только буквы и дефисы'),

  surname: yup
    .string()
    .required('Фамилия обязательна')
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(50, 'Фамилия должна содержать максимум 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/, 'Фамилия может содержать только буквы и дефисы'),

  phone: yup
    .string()
    .required('Телефон обязателен')
    .matches(
      /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
      'Введите корректный номер телефона',
    ),

  email: yup.string().required('Email обязателен').email('Введите корректный email'),

  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру',
    ),
});

export const bookingSchema = yup.object({
  serviceId: yup.string().required('Выберите услугу'),
  date: yup.string().required('Выберите дату'),
  time: yup.string().required('Выберите время'),
});

export const adminLoginSchema = yup.object({
  email: yup.string().required('Email обязателен').email('Введите корректный email'),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
});
