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

    _this.decorate("sleep", function (timeout) {
        return new Promise(resolve => {
            setTimeout(() => {
              resolve(true)
            }, timeout)
        })
    })

    _this.decorate("batchInsert", function ({ knex, table, data, returning = [], chunkSize = 50, trx }) {
        return new Promise(function (resolve, reject) {
            const query = knex.batchInsert(table, data, chunkSize)
            .returning(returning)
            if (trx) {
                query.transacting(trx)
            }
            query.then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            })
        })
    })

    _this.decorate("group", function ({ data = [], callbackData = function () {}, chunkSize = 50 }) {
        const totalRegistros = data.length
        const result = []
        let j = -1
        for (let i = 0; i < totalRegistros; i++) {
          if (i % chunkSize === 0) {
            j++
            if (!result[j]) {
              result.push([])
            }
          }
          callbackData.call(result[j], data[i], result[j], i, j)
        }
        return result
    })

    _this.decorate("groupQueryIn", function ({ query, whereIn = '', groups = [] }) {
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i]
            if (i === 0) {
                query = query.whereIn(whereIn, group)
            } else {
                query = query.orWhereIn(whereIn, group)
            }
        }
        return query
    })

    _this.decorate("success", function (type = '', result) {
        if(typeof result === 'object'){
            if(result['@@error']){
                return _this.badRequest(result.detail || result.message)
            }
        }
        if (result) {
            if (result.constructor.name === 'BadRequestError' || result.constructor.name === 'DatabaseError') {
                return _this.badRequest(result.message)
            }
        }
        if (result) {
            if (result.constructor.name === 'Error') {
                return _this.badRequest(result.message)
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

    _this.decorate('insertOrUpdate', function ({ table = '', data = [], keys = [], dataUpdate = [], trx }) {
        let message = "Se requiere la propiedad table para especificar el nombre de la tabla a usar."
        if (!table) {
            console.log(message)
            return _this.httpErrors.badRequest(message)
        }
        if (!Array.isArray(data) && !Array.isArray(keys) && !Array.isArray(dataUpdate)) {
            let message = "Las propiedades data, keys y dataUpdate deben de ser un arreglo."
            console.log(message)
            return _this.httpErrors.badRequest(message)
        }
        if (data.length < 1 && keys.length < 1 && dataUpdate.length < 1) {
            let message = "Se requiere las propiedades { data, keys, dataUpdate }."
            console.log(message)
            return _this.httpErrors.badRequest(message)
        }
        const query = _this.knex(table)
                            .insert(data)
                            .onConflict(keys)
                            .merge(dataUpdate)
        if (trx) {
            query.transacting(trx)
        }
        return query
    })

    _this.decorate('deleteMasivo', async function ({ data = [], table = '', keys = [], trx, knex, chunkSize = 100 }) {
        // EJEMPLO
        // await _this.deleteMasivo({
        //     data,
        //     table,
        //     keys: ['key1', 'key2', 'key3'],
        //     trx,
        //     knex
        // })
        try {
            table =  table ? (String(table)).toLowerCase() : ''
            const groupQuery = []
            // agrupando el arreglo de datos
            const groups = _this.group(data, function (item) {
                let newItem = {}
                // Cambiando llaves a minúsculas
                for (const key in item) {
                    newItem[(String(key)).toLowerCase()] = item[key]
                }
                // Generando el nuevo objeto con las llaves en minúsculas
                const obj = {}
                keys.map(key => {
                    key = (String(key)).toLowerCase()
                    if (!obj[key]) {
                        obj[key] = newItem[key]
                    }
                })
                this.push(obj)
            }, chunkSize)
            // Recorriendo los grupos para generar el query agrupado
            for (const group of groups) {
                const query = knex(table).delete()
                group.map((item, index)=>{
                    if (index === 0) {
                    query.where(item)
                    } else {
                    query.orWhere(item)
                    }
                })
                if (trx) {
                    query.transacting(trx)
                }
                groupQuery[groupQuery.length] = query
            }
            // Ejecutando los queries generados
            for (const query of groupQuery) {
                await query
            }
            // Retorno de los queries agrupados
            return groupQuery
        } catch (e) {
            return e
        }
    })
    
    _this.decorate("pagination", async function (query = null, page = 1, rowsPerPage = 5) {
        try {
            page = parseInt(page)
            let [ { total } ] = (await _this.knex.raw(`select count(1) from (${query.toString()}) as tmp`)).rows
            total = parseInt(total)
            const totalPagination = Math.ceil(total / rowsPerPage)
            page = page < 1 ? 1 : page
            const pagination = (page - 1) * rowsPerPage
            query.limit(rowsPerPage).offset(pagination)
            const data = await query
            let de = 0
            de = page >= totalPagination ? total : page * rowsPerPage
            return { page, rowsPerPage, total, totalPagination, de: `${de} de ${total}`, data }
        } catch (e) {
            console.log(e)
            return _this.httpErrors.badRequest('Ocurrio un problema con la paginación')
        }
    })

    _this.decorate("transformFields", function (fields = [], fields_full = {}) {
        let hasApelativo = false
        for (const key in fields) {
            const field = fields[key]
            const apelativo = field.split('as')
            if (apelativo.length > 1) {
                hasApelativo = true
                break
            }
        }
        if (hasApelativo) {
            return fields
        }
        try {
            const result = []
            if (fields.length > 0) {
                fields.map(field => {
                    let campo = field
                    if (fields_full[field]) {
                        result.push(fields_full[campo])
                    } else {
                        console.log('No existe el campo ' +'"'+campo+'"'+ ', revisa los fields del cliente, tiene que coincidir con el obj del model.')
                    }
                })
            }
            else {
                for (const item in fields_full) {
                    result.push(fields_full[item])
                }
            }
            return result
        } catch (e) {
            return _this.httpErrors.badRequest('Ocurrio un problema con la transformación de campos')
        }
    })

    _this.decorate("readExcel", function (streamExcel) {
        const excel = require("../utils/excel")
        return excel(streamExcel)
    })

    _this.decorate("$info", async function (req) {
       return req.jwtVerify()
    })
});
