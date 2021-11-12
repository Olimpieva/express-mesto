const routerCards = require('express').Router();
const { getAllCards, createCard, removeCardById } = require('../controllers/cards');

routerCards.get('/cards', getAllCards);

routerCards.post('/cards', createCard);

routerCards.delete('/cards/:cardId', removeCardById);

module.exports = routerCards;
