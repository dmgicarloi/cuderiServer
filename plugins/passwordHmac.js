"use strict";

const fp = require("fastify-plugin")
const crypto = require('crypto')

module.exports = fp(async function (_this, opts) {
    _this.decorate("passwordHmac", function (passwordBase64) {
        let password = new Buffer.from(passwordBase64, 'base64')
        password = crypto
                .createHmac('sha256', process.env.secretPassword)
                .update(decodeURIComponent(password.toString('ascii')))
                .digest('hex')
        return password
    })
})
