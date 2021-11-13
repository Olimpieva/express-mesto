const routerCards = require('express').Router();
const {
  getAllCards,
  createCard,
  removeCardById,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

routerCards.get('/cards', getAllCards);

routerCards.post('/cards', createCard);

routerCards.delete('/cards/:cardId', removeCardById);

routerCards.put('/cards/:cardId/likes', likeCard);

routerCards.delete('/cards/:cardId/likes', dislikeCard);

module.exports = routerCards;
