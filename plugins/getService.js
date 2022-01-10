'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (_this, opts) {
  _this.decorate('getService', function (name = '') {
    try {
      if (name) {
        return new _this.services[name]
      }
    } catch (e) {
      console.error(`El servicio ${name} no existe.`)
      return _this.httpErrors.internalServerError(`El servicio ${name} no existe.`)
    }    
  })
})