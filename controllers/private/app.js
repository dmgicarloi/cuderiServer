"use strict";

const path = require("path");
const AutoLoad = require("fastify-autoload");
const configSwagger = require('../../config/swagger')
const validatetoken = require('./hooks/validatetoken')

module.exports = async function (_this, opts) {
  // Registrando swagger
  _this.register(require('fastify-swagger'), configSwagger)
  // Prefijo para las apis
  opts.prefix = process.env.prefix;

  //Valida que el token sea válido
  _this.addHook('preHandler', validatetoken)

  // Carga carpeta del controlador de apis privadas
  _this.register(AutoLoad, {
    dir: path.join(__dirname, "controllers"),
    options: Object.assign({}, opts),
  });
};
