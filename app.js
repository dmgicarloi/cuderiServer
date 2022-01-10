"use strict";

const path = require("path");
const AutoLoad = require("fastify-autoload");
const configJwt = require("./config/jwt");
const configKnex = require("./config/knex")
const configCors = require("./config/cors")

module.exports = async function (_this, opts) {
  // Registrando knex constructor de queries
  _this.register(require("fastify-knexjs"), configKnex);
  // Registrando jwt(JSON WEB TOKEN)
  _this.register(require("fastify-jwt"), configJwt);
  // Registrando fastify cors
  _this.register(require('fastify-cors'), configCors)

  // Objeto para preparar el DTO
  const dto = {
    models: {},
    services: {}
  }
  Object.assign(_this, dto)
  // Cargar Clases
  await _this.register(require("./models/app"));
  await _this.register(require("./services/app"));
  // Carpeta de apis con uso restringido
  await _this.register(require("./controllers/private/app"));
  // Carpeta de apis públicas
  await _this.register(require("./controllers/public/app"));

  await _this.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });
};
