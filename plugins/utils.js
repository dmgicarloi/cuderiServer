"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (_this, opts) {
    _this.decorate("error", function (error, message) {
        error.message = message || error.message
        if (message) {
            delete error.detail
        }
        error['@@error'] = true
        return error
    })

    _this.decorate("success", function (type = '', result) {
        if(typeof result === 'object'){
            if(result['@@error']){
                return _this.badRequest(result.detail || result.message)
            }
        }
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

    _this.decorate('inserOrUpdate', function (data = [], keys = [], dataUpdate = [], trx) {
        const query = _this.knex('menu_usuario')
                            .insert(data)
                            .onConflict(keys)
                            .merge(dataUpdate)
        if (trx) {
            query.transacting()
        }
        return query
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
});
