"use strict";

const path = require("path");
const AutoLoad = require("fastify-autoload");
module.exports = async function (cuderi, opts) {
  // Prefijo para las apis
  opts.prefix = process.env.prefixPublic;
  // Carga carpeta del controlador de apis publicas
  cuderi.register(AutoLoad, {
    dir: path.join(__dirname, "controllers"),
    options: Object.assign({}, opts),
  });
};
