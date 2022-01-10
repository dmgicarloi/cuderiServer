const messages = {
  badRequestErrorMessage: "Formato de autorización debe ser Bearer [token]",
  noAuthorizationInHeaderMessage:
    "No se encuentra la cabecera de autorización.",
  authorizationTokenExpiredMessage: "Token de autorización ha expirado.",
  authorizationTokenInvalid: ({ message }) => {
    message = message === "jwt malformed" ? "Token está mal formado" : message;
    return `Token de autorización es inválido: ${message}`;
  },
};

module.exports = {
  secret: process.env.jwtSecretPass,
  messages,
  sign: {
    expiresIn: process.env.expiresIn,
  },
};
