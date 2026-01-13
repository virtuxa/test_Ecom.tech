# Анализ логов

Требования к вывод:
- общее число строк
- количество ошибок (ERROR)
- топ-3 пользователей с ошибками

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
npm start -- --file path/to/log.txt --top 2
```

Запуск с помощью node
```bash
node dist/src/start.js --file path/to/log.txt
node dist/src/start.js path/to/log.txt --top 3
```

