const path = require("path");
const AutoLoad = require("fastify-autoload");

module.exports = async function (cuderi, opts) {

    await cuderi.register(AutoLoad, {
        dir: path.join(__dirname, "files"),
        options: Object.assign({}, opts),
    });

}