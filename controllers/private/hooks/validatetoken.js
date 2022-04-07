var jwt = require('jsonwebtoken')

module.exports = function (req, reply, done) {
    const exclude = [
        '/documentation'
    ]
    req.jwtVerify(function (err, decoded) {
        const { token } = req.query
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
            try {
                if (decoded) {
                    done()
                } else {
                    let pass = false
                    for(let i = 0; i < exclude.length; i++) {
                        if (new RegExp(`^${exclude[i]}`).test(req.url)) {
                            pass = true
                            break
                        }
                    }
                    if (pass) {
                        done()
                    } else {
                        reply.send(err)
                    }
                }
            } catch (e) {
                reply.send(e)
            }
        }
    })
}