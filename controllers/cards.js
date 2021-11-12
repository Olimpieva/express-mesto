const Card = require('../models/card');

module.exports.getAllCards = (req, res) => {
  Card.find({})
    .then((data) => res.status(200).send({ data }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка сервера' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.removeCardById = (req, res) => {
  const cardId = req.body._id;

  Card.findById(cardId)
    .then((card) => {
      if (card) {
        card.remove()
          .then(() => res.status(200).send({ data: card }));
      } else {
        res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};
