(async (genM, getS, genC, knex, env) => {

    'use strict'

    const [ nameTable ] = process.argv.slice(2)

    const kn = knex({
                client: "pg",
                connection: {
                    host: env.host,
                    user: env.user,
                    password: env.password,
                    database: env.database,
                }
            })

    await genM.genModel(kn, nameTable)
    await getS.genService(kn, nameTable)
    await genC.genController(kn, nameTable)

})(require("./model"), require("./service"), require("./controller"), require('knex'), require('./env'))

