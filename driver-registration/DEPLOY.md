# Инструкция по деплою на Railway.app

## Шаг 1: Регистрация на Railway

1. Перейдите на https://railway.app
2. Нажмите **"Login"** → **"Login with GitHub"**
3. Авторизуйтесь через GitHub аккаунт

## Шаг 2: Создание проекта

1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Выберите репозиторий `driver-registration`
4. Нажмите **"Deploy Now"**

## Шаг 3: Настройка Backend сервиса

1. После создания проекта, нажмите на сервис
2. Перейдите в **"Settings"** → **"Source"**
3. Укажите **Root Directory**: `/backend`
4. Укажите **Build Command**: `npm install`
5. Укажите **Start Command**: `node src/app.js`

## Шаг 4: Добавление PostgreSQL базы данных

1. В проекте нажмите **"+ New"**
2. Выберите **"Database"** → **"PostgreSQL"**
3. Railway автоматически создаст базу данных
4. Скопируйте переменные окружения из PostgreSQL сервиса

## Шаг 5: Настройка переменных окружения

В сервисе backend перейдите в **"Variables"** и добавьте:

```
PORT=3001
NODE_ENV=production
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

## Шаг 6: Добавление диска для хранения файлов

1. В проекте нажмите **"+ New"**
2. Выберите **"Volume"**
3. Укажите **Mount Path**: `/app/uploads`
4. Укажите **Size**: 1 GB

## Шаг 7: Деплой Frontend

1. В проекте нажмите **"+ New"**
2. Выберите **"GitHub Repo"**
3. Выберите тот же репозиторий
4. Укажите **Root Directory**: `/frontend`
5. Укажите **Build Command**: `npm install && npm run build`
6. Укажите **Start Command**: `npx serve -s build -l 3000`

## Шаг 8: Настройка переменных Frontend

В сервисе frontend добавьте переменную:

```
REACT_APP_API_URL=https://ваш-backend-url.railway.app/api
```

## Шаг 9: Настройка домена (опционально)

1. В сервисе перейдите в **"Settings"** → **"Domains"**
2. Нажмите **"Generate Domain"** для бесплатного домена
3. Или добавьте свой кастомный домен

## Шаг 10: Проверка деплоя

1. Дождитесь завершения деплоя (зелёный статус)
2. Откройте URL вашего frontend сервиса
3. Проверьте работу приложения

## Полезные команды

### Просмотр логов
В Railway панели перейдите в **"Deployments"** → выберите деплой → **"View Logs"**

### Перезапуск сервиса
В **"Settings"** → нажмите **"Restart"**

### Обновление кода
Просто сделайте push в GitHub - Railway автоматически пересоберёт проект

## Стоимость

- **Free Trial**: $5 кредит на первый месяц
- **Hobby Plan**: $5/месяц (включает 8GB RAM, 80GB диска)
- **Pro Plan**: $20/месяц (больше ресурсов)

Для тестирования и небольших проектов бесплатного тира достаточно.

## Troubleshooting

### Ошибка "Module not found"
- Убедитесь что `npm install` выполнен в правильной директории
- Проверьте что `package.json` существует

### Ошибка подключения к БД
- Проверьте переменные окружения
- Убедитесь что PostgreSQL сервис запущен

### Ошибка загрузки файлов
- Проверьте что Volume подключён
- Убедитесь что директория `/app/uploads` существует