const Card = require('../models/card');
const {
  OK,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require('../utils/constants');

module.exports.getAllCards = async (req, res) => {
  let cards;

  try {
    cards = await Card.find({});
    res.status(OK).send({ data: cards });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    let card;

    try {
      card = await Card.create({ name, link, owner });
    } catch (error) {
      if (error.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
      }
      return;
    }

    res.status(OK).send(card);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.removeCard = async (req, res) => {
  try {
    const userId = req.user._id;
    let card;

    try {
      card = await Card.findById(req.params.cardId);
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Передан некорректный _id при удалении карточки.' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
      }
      return;
    }

    if (!card) {
      res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      return;
    }

    if (card.owner.toString() !== userId) {
      res.status(BAD_REQUEST).send({ message: 'Нет прав для удаления карточки.' });
      return;
    }

    await card.remove();
    res.status(OK).send({ data: card });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
  }
};

module.exports.likeCard = async (req, res) => {
  let card;
  try {
    card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
      return;
    }

    res.status(OK).send(card);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка. ' });
    } else {
      res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
    }
  }
};

module.exports.dislikeCard = async (req, res) => {
  let card;

  try {
    card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
      return;
    }

    res.status(OK).send(card);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для снятия лайка. ' });
    } else {
      res.status(INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка на сервере: ${error}.` });
    }
  }
};
