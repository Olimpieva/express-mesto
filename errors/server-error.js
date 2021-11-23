class ServerError extends Error {
  constructor(error) {
    super(`Произошла ошибка на сервере: ${error}`);
    this.statusCode = 500;
  }
}

module.exports = ServerError;
