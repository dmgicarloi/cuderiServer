'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (_this, opts) {
  _this.decorate('getModel', function (name = '') {
    try {
      if (name) {
        return new _this.models[name]
      }
    } catch (e) {
      console.error(`El modelo ${name} no existe.`)
      return _this.httpErrors.internalServerError(`El modelo ${name} no existe.`)
    }    
  })
})