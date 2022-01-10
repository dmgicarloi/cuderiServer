'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (_this, opts) {
  _this.register(require('fastify-sensible'), {
    errorHandler: false
  })
})
