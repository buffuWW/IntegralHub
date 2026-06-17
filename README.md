# Integral Hub

Integral Hub — русскоязычная образовательная платформа для самостоятельной практики интегралов. Пользователь решает задачу на бумаге, открывает ответ и решение, отмечает результат, ведёт локальную историю и повторяет сложные задания.

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

## Запуск

```bash
npm run dev
```

Откройте `http://localhost:3000`. Админ-панель находится на `/admin`.

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

Прогресс, история, открытие ответа/решения и статусы `SOLVED`/`REVIEW` хранятся только в localStorage текущего браузера. Регистрации и синхронизации между устройствами в первой версии нет.
