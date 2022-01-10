(async (genClient, knex, env) => {

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

    await genClient.genClient(kn, nameTable)

})(require("./client/cliente"), require('knex'), require('./env'))

