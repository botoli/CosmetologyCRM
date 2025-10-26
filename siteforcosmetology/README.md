# 🎨 Кабинет косметологии - Система онлайн записи

Современное веб-приложение для управления записями в косметологическом кабинете с поддержкой темной темы и интеграцией Telegram.

## ✨ Возможности

- 🌓 **Светлая и темная тема** с автоматическим определением
- 📱 **32 услуги** с ценами и длительностью
- 📅 **Выбор свободных дней** (не календарь)
- 📱 **Telegram интеграция** для уведомлений
- 📊 **Админ панель** для управления
- 📱 **Адаптивный дизайн** для всех устройств
- 🎨 **Нежная пастельная палитра** без градиентов

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build
```

Откройте http://localhost:5177

**Для тестирования:**
- Клиент: любой логин на `/login`
- Админ: логин содержит "admin" (например: "admin@test.com")

## 📁 Структура проекта

### Разделенные SCSS стили

```
src/styles/
├── main.scss          # Главный файл + переменные
├── components.scss     # Кнопки, формы, карточки
├── layout.scss        # Header, navigation
├── booking.scss        # Стили для бронирования
├── grid.scss          # Сетка и таблицы
└── responsive.scss    # Медиа-запросы
```

### Компоненты (10 файлов)

```
src/
├── App.tsx                    # Маршрутизация
├── main.tsx                   # Точка входа
├── components/Layout.tsx      # Layout + переключатель темы
├── pages/                     # 5 страниц
│   ├── LoginPage.tsx          # Авторизация
│   ├── BookingPage.tsx         # 3 шага бронирования
│   ├── ClientDashboard.tsx     # Клиентская панель
│   ├── ClientSettings.tsx     # Настройки + Telegram
│   └── AdminDashboard.tsx     # Админ панель
├── store/index.ts            # Redux store
├── services/
│   ├── api.ts                # Axios
│   ├── apiEndpoints.ts       # Endpoints для backend
│   └── telegram.ts           # Telegram Bot API
├── hooks/redux.ts            # Redux хуки
└── styles/                    # SCSS модули
```

## 💆 Услуги (32)

См. полный список в `src/pages/BookingPage.tsx`

## 📱 API Endpoints

Все endpoints в `src/services/apiEndpoints.ts`:
- `POST /api/bookings` - создание записей
- `GET /api/services` - услуги
- `POST /api/telegram/link` - привязка Telegram
- И другие...

См. полную документацию в `API_ENDPOINTS.md` и `TELEGRAM_SETUP.md`

## 🎨 Стили

Стили разделены на модули:
- Импорт через `@import` в `main.scss`
- Использование классов в компонентах
- Готовые стили для всех компонентов

## 📱 Адаптивность

- Desktop (>1024px) - полный функционал
- Tablet (768-1024px) - адаптированное меню
- Mobile (<768px) - одноколоночный layout
- Small (<480px) - компактный интерфейс

## 🛠️ Технологии

- React 18 + TypeScript
- Redux Toolkit
- React Router
- Vite
- SCSS (модульный)
- React Icons
- Axios
- Telegram Bot API

## ✅ Исправлено

- Все ошибки линтера устранены
- Удалены неиспользуемые импорты
- SCSS стили разделены на модули
- Привязка Telegram работает
- Адаптивный дизайн
- Нежная пастельная палитра
- 32 услуги с ценами
