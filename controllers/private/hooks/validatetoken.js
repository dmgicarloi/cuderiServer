module.exports = function (req, reply, done) {
    const exclude = [
        '/documentation'
    ]
    req.jwtVerify(function (err, decoded) {
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
                    reply.send(err);
                }
            }
        } catch (e) {
            console.log("ERROR")
            reply.send(e);
        }
    });
}