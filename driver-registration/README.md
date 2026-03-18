# Система регистрации водителей и транспортных средств

Полнофункциональное веб-приложение для регистрации водителей и транспортных средств с автоматическим распознаванием документов.

## Функциональность

- **Загрузка документов**: Поддержка загрузки изображений и PDF файлов
- **OCR распознавание**: Автоматическое извлечение данных из документов (Tesseract.js)
- **Сжатие изображений**: Автоматическое сжатие фото до 1MB без потери качества
- **Конвертация в PDF**: Автоматическая конвертация сканов в PDF формат
- **Автозаполнение форм**: Заполнение полей на основе распознанных данных
- **Валидация данных**: Проверка обязательных полей
- **Сохранение в БД**: Хранение всех данных в PostgreSQL

## Технологический стек

### Backend
- Node.js + Express
- PostgreSQL
- Tesseract.js (OCR)
- Sharp (сжатие изображений)
- pdf-lib (работа с PDF)

### Frontend
- React 18
- Bootstrap 5
- Axios
- react-dropzone

## Установка

### Требования
- Node.js 18+
- PostgreSQL 12+

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd driver-registration
```

### 2. Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb driver_registration

# Инициализируйте таблицы
cd backend
npm install
npm run db:init
```

### 3. Настройка переменных окружения
Создайте файл `backend/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=driver_registration
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Установка зависимостей Backend
```bash
cd backend
npm install
```

### 5. Установка зависимостей Frontend
```bash
cd frontend
npm install
```

## Запуск

### Backend
```bash
cd backend
npm run dev
```
Сервер запустится на http://localhost:3001

### Frontend
```bash
cd frontend
npm start
```
Приложение запустится на http://localhost:3000

## API Endpoints

### Документы
- `POST /api/documents/upload` - Загрузка документа
- `GET /api/documents/:id` - Получение документа
- `DELETE /api/documents/:id` - Удаление документа

### Водители
- `POST /api/drivers` - Создание водителя
- `GET /api/drivers/:id` - Получение водителя
- `PUT /api/drivers/:id` - Обновление водителя

### Транспортные средства
- `POST /api/vehicles` - Создание ТС
- `GET /api/vehicles/:id` - Получение ТС
- `PUT /api/vehicles/:id` - Обновление ТС
- `POST /api/vehicles/:id/photos` - Загрузка фото ТС

## Структура проекта

```
driver-registration/
├── backend/
│   ├── src/
│   │   ├── routes/          # API маршруты
│   │   ├── controllers/     # Контроллеры
│   │   ├── services/        # Сервисы (OCR, сжатие, PDF)
│   │   ├── models/          # Модели БД
│   │   └── app.js           # Главный файл сервера
│   ├── uploads/             # Загруженные файлы
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── services/        # API сервисы
│   │   ├── App.jsx          # Главный компонент
│   │   └── index.js         # Точка входа
│   └── package.json
├── database/
│   └── schema.sql           # Схема БД
└── README.md
```

## Использование

1. Откройте приложение в браузере
2. Загрузите документы на лендинге
3. Проверьте распознанные данные
4. Заполните/отредактируйте форму водителя
5. Заполните/отредактируйте форму транспортного средства
6. Загрузите фотографии ТС
7. Отправьте заявку

## Лицензия

MIT