# Анализ логов

Требования к вывод:
- общее число строк
- количество ошибок (ERROR)
- топ-3 пользователей с ошибками

Поддерживаемые аргументы:
```
--help
--file <Путь>
--top <Число>
--strict
--max-invalid <Число>
```

## Запуск

1. Установить зависимости:

```bash
npm install
```

2. Собрать проект

```bash
npm run build
```

3. Запустить тесты

```bash
npm run test
```

4. Запустить анализ логов из файла

Запуск с помощью npm
```bash
npm start -- --file path/to/log.txt
```

Запуск с помощью node
```bash
node dist/src/start.js --file path/to/log.txt
node dist/src/start.js path/to/log.txt
```

## Docker

1. Собрать проект:

```bash
docker build -t log-analyzer .
```

2. Запуск анализа логов

Из файла:

```bash
docker run --rm -v "%cd%:/data" log-analyzer --file /data/logs.txt
```

Из консоли:

```bash
type logs.txt | docker run --rm -i log-analyzer --file -
```