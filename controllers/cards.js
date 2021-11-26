const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');
const { OK } = require('../utils/constants');

module.exports.getAllCards = async (req, res, next) => {
  let cards;
  try {
    cards = await Card.find({});
    res.status(OK).send({ data: cards });
  } catch (error) {
    next(error);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    let card;

    try {
      card = await Card.create({ name, link, owner });
    } catch (error) {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      }
      throw error;
    }

    res.status(OK).send(card);
  } catch (error) {
    next(error);
  }
};

module.exports.removeCard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const card = await Card.findById(req.params.cardId)
      .orFail(() => next(new NotFoundError('Карточка с указанным _id не найдена.')));

    if (card.owner.toString() !== userId) {
      next(new ForbiddenError('Нет прав для удаления карточки.'));
    }

    await card.remove();
    res.status(OK).send({ data: card });
  } catch (error) {
    next(error);
  }
};

module.exports.likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    ).orFail(() => next(new NotFoundError('Карточки с переданным _id не найдено.')));

    res.status(OK).send(card);
  } catch (error) {
    next(error);
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).orFail(() => next(new NotFoundError('Карточки с переданным _id не найдено.')));

    res.status(OK).send(card);
  } catch (error) {
    next(error);
  }
};
