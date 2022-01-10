module.exports = async function (_this, opts) {
    _this.services.UsuarioService = class {
        constructor() {
            const { knex, getModel } = _this
            this.knex = knex
            this.getModel = getModel
        }
        create (params = {}) {
            const usuarioModel = this.getModel('UsuarioModel')
            return usuarioModel.create(params)
        }
        read (fields = []) {
            const usuarioModel = this.getModel('UsuarioModel')
            return usuarioModel.read(fields)
        }
        async readById (id_usuario, fields = []) {
            const usuarioModel = this.getModel('UsuarioModel')
            const result = await usuarioModel.readById(id_usuario, fields)
            return result || {}
        }
        update (id_usuario, update) {
            const usuarioModel = this.getModel('UsuarioModel')
            return usuarioModel.update(id_usuario, update)
        }
        delete (id_usuario) {
            const usuarioModel = this.getModel('UsuarioModel')
            return usuarioModel.delete(id_usuario)
        }
    }
}