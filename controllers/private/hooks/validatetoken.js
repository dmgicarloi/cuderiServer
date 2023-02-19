var jwt = require('jsonwebtoken')

module.exports = function (req, reply, done) {
    req.jwtVerify(function (err, decoded) {
        let token = req.query.token
        if (req.body) {
            if (req.body.data) {
                try {
                    const data = JSON.parse(req.body.data)
                    token = data.token
                    req.body = data
                } catch (e) {}
            }   
        }
        if (token) {
            try {
                jwt.verify(token, process.env.jwtSecretPass)
                done()
            } catch (e) {
                reply.send({
                    statusCode: 401,
                    error: "Unauthorized",
                    message: "Token de autorización es inválido."
                })
            }
        } else {
            if (decoded) {
                done()
            } else {
                reply.send(err)
            }
        }
    })
}