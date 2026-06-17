# Integral Hub

Integral Hub — русскоязычная образовательная платформа для самостоятельной практики интегралов. Пользователь решает задачу на бумаге, открывает ответ и решение, отмечает результат, ведёт локальную историю и повторяет сложные задания.

Платформа поддерживает гостевой режим и аккаунты обычных пользователей. Гость хранит прогресс в браузере, авторизованный пользователь хранит прогресс в PostgreSQL и видит его после входа с другого устройства.

## Стек

Next.js App Router, React, TypeScript strict, PostgreSQL, Prisma, Tailwind CSS, KaTeX, react-markdown, remark-math, rehype-katex, rehype-sanitize, Zod, PapaParse, JSZip, bcryptjs, jose, Vitest.

## Установка

```bash
npm install
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Windows cmd.exe:

```cmd
copy .env.example .env
```

Заполните `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/integral_hub"
ADMIN_LOGIN="admin"
ADMIN_PASSWORD_HASH=""
SESSION_SECRET="минимум-32-символа"
CRON_SECRET="секрет-для-cron"
UPLOAD_DIR="./storage/uploads"
NEXT_PUBLIC_APP_NAME="Integral Hub"
```

Создайте хеш пароля:

```bash
npm run hash-password
```

Скопируйте результат в `ADMIN_PASSWORD_HASH`.

## База данных

Нужен PostgreSQL. После создания базы выполните:

Через Docker:

```bash
docker compose up -d
```

Если PostgreSQL установлен локально без Docker, убедитесь, что сервер запущен на `localhost:5432`, а база `integral_hub` существует.

Затем выполните миграции и seed:

```bash
npm run db:migrate
npm run db:seed
```

Seed создаёт 9 категорий и 30 опубликованных математически корректных заданий.

Для уже существующей базы применяйте только миграции:

```bash
npm run db:migrate
```

В production/Railway используйте:

```bash
npx prisma migrate deploy
```

Повторный seed в production не нужен.

## Запуск

```bash
npm run dev
```

Откройте `http://localhost:3000`. Админ-панель находится на `/admin`.

Пользовательские страницы:

- `/register` — регистрация обычного пользователя.
- `/login` — вход.
- `/profile` — профиль.
- `/progress` — статистика прогресса.
- `/history` и `/review` — работают для гостя и для авторизованного пользователя.

Production:

```bash
npm run build
npm run start
```

Проверки:

```bash
npm run lint
npm run typecheck
npm run test
```

## CSV

CSV должен быть UTF-8 или UTF-8 BOM. Разделитель определяется автоматически: `;` или `,`.

Обязательные колонки:

`category`, `difficulty`, `condition`, `expression_latex`, `answer`, `solution`.

Необязательные:

`number`, `source`, `published`, `image_filenames`, `image_alt_texts`.

Сложность: `easy`, `лёгкий`, `легкий`, `medium`, `средний`, `hard`, `сложный`.

Опубликованность: `true`, `1`, `yes`, `да`, `false`, `0`, `no`, `нет`. Пустое значение импортируется как скрытое задание.

Изображения перечисляются через `|`, alt-тексты в том же порядке.

## ZIP

ZIP должен содержать:

```text
tasks.csv
images/area-102.png
images/graph-205.webp
```

Поддерживаются PNG, JPG, JPEG, WEBP, SVG. SVG проверяется на скрипты, обработчики событий и внешние ресурсы. CSV/ZIP ограничены 50 МБ, изображение — 5 МБ, до 1000 задач за импорт и до 10 изображений на задачу.

Примеры находятся в `examples/import`:

- `tasks-example.csv`
- `tasks-example.zip`
- `tasks-bad-latex.csv`
- `tasks-duplicate-number.csv`
- `tasks-unknown-category.csv`
- `tasks-missing-image.csv`
- `tasks-missing-image.zip`

## LaTeX и Markdown

`expression_latex` проверяется через KaTeX. В `condition`, `answer`, `solution` проверяются блоки `$...$`, `$$...$$`, `\(...\)`, `\[...\]`. Markdown рендерится через sanitize-пайплайн без выполнения HTML и JavaScript.

## Изображения

Файлы сохраняются через абстрактный storage-сервис в `UPLOAD_DIR`, по умолчанию `storage/uploads/tasks/{taskId}`. Директория `storage` не добавляется в Git.

## Архив и cron

При архивировании выставляется `archivedAt = now` и `purgeAt = now + 24h`. Очистка вызывается при открытии админского архива, после административных операций и через:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/purge-archive
```

Для гарантированного удаления сразу после 24 часов в production настройте внешний планировщик cron. Без него удаление произойдёт при следующем административном запросе.

## Прогресс пользователя

Гостевой прогресс, история, открытие ответа/решения и статусы `SOLVED`/`REVIEW` хранятся в localStorage текущего браузера.

После регистрации или входа приложение предлагает перенести гостевой прогресс в аккаунт. Перенос выполняется одним запросом `POST /api/progress/import` и объединяет данные:

- `answerOpened` и `solutionOpened` через OR;
- `viewCount` складывается;
- `firstViewedAt` берётся самое раннее;
- `lastViewedAt` берётся самое позднее;
- статус берётся из более свежей записи.

Для авторизованного пользователя прогресс хранится в PostgreSQL в таблице `UserTaskProgress`.

## Пользовательские сессии

Административная и пользовательская авторизация разделены. Пользовательская cookie хранит случайный токен, а в базе хранится только SHA-256-хеш токена. Срок пользовательской сессии — 30 дней.

Обычные пользователи не получают доступа к `/admin`.

## Railway

Для Railway задайте те же переменные окружения, что и локально:

```env
DATABASE_URL=
ADMIN_LOGIN=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
CRON_SECRET=
UPLOAD_DIR=
NEXT_PUBLIC_APP_NAME=
```

Перед запуском новой версии применяйте миграции:

```bash
npx prisma migrate deploy
```

Не используйте `prisma migrate dev` и не запускайте повторный seed на production-базе.
