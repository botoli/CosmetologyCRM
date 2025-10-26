# 📁 Структура проекта Cosmetology Booking Site

## Общая архитектура

```
cosmetology-booking-site/
├── index.html                    # HTML точка входа
├── package.json                  # Зависимости проекта
├── tsconfig.json                 # TypeScript конфигурация
├── vite.config.ts                # Vite конфигурация
├── README.md                     # Документация
└── src/
    ├── main.tsx                  # Точка входа приложения
    ├── App.tsx                   # Главный компонент с маршрутизацией
    ├── index.css                 # Глобальные стили
    │
    ├── layouts/                  # Layout компоненты
    │   ├── ClientLayout.tsx      # Layout для клиентской части
    │   ├── AdminLayout.tsx       # Layout для администратора
    │   └── Layout.css            # Стили layouts
    │
    ├── pages/                    # Страницы приложения
    │   ├── client/               # Страницы для клиента
    │   │   ├── BookingStep1.tsx  # Шаг 1: Авторизация/Регистрация
    │   │   ├── BookingStep1.css
    │   │   ├── BookingStep2.tsx  # Шаг 2: Выбор процедуры и даты
    │   │   ├── BookingStep2.css
    │   │   ├── BookingStep3.tsx  # Шаг 3: Подтверждение
    │   │   ├── BookingSuccess.tsx # Шаг 4: Успешная запись
    │   │   ├── ClientDashboard.tsx # Личный кабинет
    │   │   ├── ClientHistory.tsx   # История записей
    │   │   └── ClientSettings.tsx  # Настройки
    │   │
    │   └── admin/                  # Страницы для администратора
    │       ├── AdminDashboard.tsx # Главная панель
    │       ├── ScheduleManagement.tsx    # Управление расписанием
    │       ├── ServicesManagement.tsx     # Управление услугами
    │       ├── ClientsManagement.tsx      # Управление клиентами
    │       └── NotificationsManagement.tsx # Управление уведомлениями
    │
    ├── components/               # React компоненты
    │   └── common/              # Общие компоненты
    │       ├── ProtectedRoute.tsx    # Защита маршрутов
    │       ├── PublicRoute.tsx       # Публичные маршруты
    │       ├── LoadingSpinner.tsx    # Индикатор загрузки
    │       ├── ErrorMessage.tsx      # Сообщение об ошибке
    │       ├── Modal.tsx             # Модальное окно
    │       └── Modal.css
    │
    ├── store/                    # Redux State Management
    │   ├── index.ts              # Настройка store
    │   └── slices/               # Redux slices
    │       ├── authSlice.ts           # Авторизация
    │       ├── bookingSlice.ts        # Бронирование
    │       ├── servicesSlice.ts       # Услуги
    │       ├── clientsSlice.ts        # Клиенты
    │       ├── scheduleSlice.ts       # Расписание
    │       └── notificationsSlice.ts  # Уведомления
    │
    ├── services/                 # API сервисы
    │   ├── api.ts                # Настройка Axios
    │   ├── authService.ts        # API авторизации
    │   ├── bookingService.ts     # API бронирования
    │   ├── servicesService.ts    # API услуг
    │   ├── clientsService.ts     # API клиентов
    │   ├── scheduleService.ts    # API расписания
    │   ├── notificationsService.ts # API уведомлений
    │   └── telegramService.ts    # API Telegram
    │
    ├── hooks/                    # Custom hooks
    │   └── redux.ts             # Redux hooks
    │
    ├── utils/                    # Утилиты
    │   ├── constants.ts         # Константы и маршруты
    │   └── formatters.ts        # Форматирование данных
    │
    ├── types/                    # TypeScript типы
    │   └── index.ts             # Общие типы
    │
    └── assets/                   # Статические ресурсы
        └── (images, fonts, etc.)
```

## 🔑 Ключевые файлы

### Маршрутизация (App.tsx)
- Публичные маршруты: `/booking/step1` (авторизация)
- Клиентские маршруты: `/client/*` (требуют авторизации)
- Админские маршруты: `/admin/*` (требуют права администратора)

### Redux Store
- 6 slices для управления состоянием приложения
- Автоматическая обработка токенов в API запросах
- Персистентное хранение токена авторизации

### API Services
- Централизованная настройка Axios
- Автоматическое добавление токена в запросы
- Обработка ошибок 401 (автоматический logout)

## 🚀 Команды

```bash
npm install    # Установка зависимостей
npm run dev    # Запуск dev сервера
npm run build  # Сборка для production
npm run preview # Просмотр сборки
```

## 📋 Следующие шаги разработки

1. Реализовать формы в BookingStep3.tsx
2. Завершить функционал BookingSuccess.tsx
3. Реализовать все admin страницы
4. Добавить Telegram бот интеграцию
5. Настроить SMS интеграцию
6. Добавить валидацию форм
7. Написать тесты

