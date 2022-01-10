'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (_this, opts) {
  _this.decorate('someSupport', function () {
    return 'hugs'
  })
})
