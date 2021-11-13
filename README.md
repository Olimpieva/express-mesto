# Проект Mesto фронтенд + бэкенд  

> REST API with Express, Node and MongoDB

## Директории

      /routes             файлы роутера 
      /controllers        файлы контроллеров пользователей и карточек
      /models             файлы описания схем пользователя и карточки 
      /utils              статусы ошибок


## Запуск проекта

`npm i` — обновление зависимостей  
`npm run start` — запуск сервера  
`npm run dev` — запуск сервера с hot-reload  


#### Роуты пользователей

`GET /users` — возвращает всех пользователей из базы;  
`GET /users/:userId` — возвращает пользователя по _id;  
`POST /users` — создаёт пользователя с переданными в теле запроса name, about и avatar;  
`PATCH /users/me` — обновляет профиль;  
`PATCH /users/me/avatar` — обновляет аватар;  
#### Роуты карточек

`GET /cards` — возвращает все карточки из базы;  
`POST /cards` — создаёт карточку с переданными в теле запроса name и link, устанавливает поле owner для карточки;  
`DELETE /cards/:cardId` — удаляет карточку по _id;  
`PUT /cards/:cardId/likes` — ставит лайк карточке;  
`DELETE /cards/:cardId/likes` — убирает лайк с карточки.  
