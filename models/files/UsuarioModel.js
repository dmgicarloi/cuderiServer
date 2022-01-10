module.exports = async function (_this, opts) {
    _this.models.UsuarioModel = class {
        constructor() {
            this.name = 'usuario'
            const { knex } = _this
            this.knex = knex
        }
        create (params = {}, trx) {
            const query = this.knex(this.name).insert(params).returning(['id_usuario'])
            if(trx){
                query.transacting(trx)
            }
            return query
        }
        read (fields = []) {
            return this.knex(this.name).select(fields) 
        }
        readById (id_usuario, fields = []) {
            return this.knex(this.name).select(fields).where({ id_usuario }).first()
        }
        update (id_usuario, update, trx) {
            const query = this.knex(this.name).update(update).where({ id_usuario })
            if(trx){
                query.transacting(trx)
            }
            return query
        }
        delete (id_usuario) {
            return this.knex(this.name).where({ id_usuario }).del()
        }
        signIn ({ usuario, clave }) {
            const autor = this.knex.raw("(concat(per.nombre,' ',per.apellido)) as autor")
            const avatar = this.knex.raw("(concat(substring(per.nombre, 1, 1),substring(per.apellido, 1, 1))) as avatar")
            return this.knex('usuario as usu')
                .select(autor, avatar, 'per.id_persona')
                .innerJoin('persona as per', 'usu.id_usuario', 'per.id_usuario')
                .where({ usuario, clave, estado: 1 }).first()
        }
    }
}