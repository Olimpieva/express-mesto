const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const ConflictError = require('../errors/conflict-error');
const { OK } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
    res.status(OK).send({ data: users });
  } catch (error) {
    next(error);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId ? req.params.userId : req.user._id;
    const user = await User.findById(userId)
      .orFail(() => next(new NotFoundError('Пользователь по указанному _id не найден.')));

    await res.send(user);
  } catch (error) {
    next(error);
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      name,
      about,
      avatar,
      email,
      password,
    } = req.body;
    let hash;

    try {
      hash = await bcrypt.hash(password, 10);
    } catch (error) {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }
      throw error;
    }

    try {
      await User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }
      if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже зарегистрирован.'));
      }
      throw error;
    }

    res.status(OK).send({
      data: {
        name,
        about,
        avatar,
        email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user;

    try {
      user = await User.findOne({ email }).select('+password');
    } catch (error) {
      next(new UnauthorizedError('Переданы некорректные данные при авторизации пользователя.'));
    }

    if (!user) {
      next(new UnauthorizedError('Переданы некорректные данные при авторизации пользователя.'));
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      next(new UnauthorizedError('Переданы некорректные ggg данные при авторизации пользователя.'));
    }

    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
      { expiresIn: '7d' },
    );

    await res.cookie('jwt', token, {
      maxAge: 3600000,
    });
    res.status(OK).json({ token, message: 'Авторизация прошла успешно.' });
  } catch (error) {
    next(error);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const { name, about } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        about,
      },
      {
        new: true,
        runValidators: true,
      },
    ).orFail(() => next(new BadRequestError('Переданы некорректные данные при обновлении профиля.')));

    res.status(OK).send({ data: user });
  } catch (error) {
    next(error);
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar,
      },
      {
        new: true,
        runValidators: true,
      },
    ).orFail(() => next(new BadRequestError('Переданы некорректные данные при обновлении аватара.')));

    res.status(OK).send(user);
  } catch (error) {
    next(error);
  }
};
