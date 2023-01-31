"use strict";

const path = require("path")
const AutoLoad = require("fastify-autoload")
const configJwt = require("./config/jwt")
const configKnex = require("./config/knex")
const knex = require('knex')
const types = require('pg').types
const configCors = require("./config/cors")
const jsonStream = require("./utils/jsonStream")
const Etag = require('@fastify/etag')
const $http = require('axios')

$http.interceptors.response.use(response => {
  return response.data
}, async ({ response }) => {
  return Promise.reject(response.data)
})

module.exports = async function (_this, opts) {
  // Convirtiendo enteros y decimales de cadena a numéricos
  types.setTypeParser(20, val => parseInt(val, 10))
  types.setTypeParser(1700, val => parseFloat(val))
  // Registrando knex constructor de queries
  _this.knex = knex(configKnex)
  // Registrando jwt(JSON WEB TOKEN)
  _this.register(require("fastify-jwt"), configJwt)
  // Registrando fastify cors
  _this.register(require('fastify-cors'), configCors)
  // Agergando Etag
  _this.register(Etag)
  // Agregando la clase jsonStream
  _this.jsonStream = jsonStream
  // Agregando Axios
  _this.$http = $http

  // Objeto para preparar el DTO
  const dto = {
    models: {},
    services: {}
  }
  Object.assign(_this, dto)
  // Cargar Clases
  await _this.register(require("./models/app"))
  await _this.register(require("./services/app"))
  // Carpeta de apis con uso restringido
  await _this.register(require("./controllers/private/app"))
  // Carpeta de apis públicas
  await _this.register(require("./controllers/public/app"))

  await _this.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });
};
