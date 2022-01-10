"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (_this, opts) {

    _this.decorate("success", function (type = '', result) {
        let message = ''
        switch (type) {
            case 'create':
                message = typeof (result === 'object' || result >= 1) ? 'Registro agregado correctamente.' : 'Ningún registro se agregó.'
                if (result) {
                    if (result.constructor === Array) {
                        result = result[0]
                    }
                }
                break
            case 'update':
                message = result >= 1 ? 'Registro actualizado correctamente.' : 'Ningún registro se actulizó.'
                break
            case 'delete':
                message = result >= 1 ? 'Registro eliminado correctamente.' : 'Ningún registro se eliminó.'
                break
            default :
                message = result >= 1 ? 'Proceso completado correctamente.' : 'Ningún proceso se completó.'
                break
        }

        if (!!result === false) {
            return _this.httpErrors.badRequest(message)
        } else {
            return {
                response: !!result,
                message,
                result
            }
        }
    })

    _this.decorate('badRequest', function (message) {
        return _this.httpErrors.badRequest(message)
    })

    _this.decorate("pagination", async function (query = null, page = 1, rowsPerPage = 5) {
        try {
            page = parseInt(page)
            let queryCount = _this.knex.raw(`select count(1) from (${query.toString()}) as tmp`).toString()
                // .replace(/^select\s.+\sfrom/, 'select count(1) as total from')
                // .replace(/order by .+$/, '')
            let [ { total } ] = (await _this.knex.raw(queryCount)).rows
            total = parseInt(total)
            const totalPagination = Math.ceil(total / rowsPerPage)
            page = page < 1 ? 1 : page
            const pagination = (page - 1) * rowsPerPage
            query.limit(rowsPerPage).offset(pagination)
            const data = await query
            return { page, rowsPerPage, total, totalPagination, data }
        } catch (e) {
            console.log(e)
            return _this.httpErrors.badRequest('Ocurrio un problema con la paginación')
        }
    })

    _this.decorate("$info", async function (req) {
       return req.jwtVerify()
    })

    _this.decorate("updateOrInsert", async function (fieldsKeys = [], records = []) {
        try {
            console.log(_this.knex.raw(
                `? ON CONFLICT (${fieldsKeys.join(',')})
                        DO NOTHING
                      RETURNING *;`,
                [this.knex("menu_usuario").insert(records)],
              ).toString())
            return _this.knex.raw(
                `? ON CONFLICT (${fieldsKeys.join(',')})
                        DO NOTHING
                      RETURNING *;`,
                [this.knex("menu_usuario").insert(records)],
              )
        } catch (e) {
            console.log(e)
            return _this.httpErrors.badRequest('Ocurrio un problema con el proceso.')
        }
    })

});
