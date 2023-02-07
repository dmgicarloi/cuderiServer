module.exports = async function (req, reply) {
    const ruta = req.headers.ruta
    if (!ruta && process.env.dev === 'true') {
        return
    }
    const menuUsuarioService = this.getService('MenuUsuarioService')
    const { id_usuario, id_tipo_socio, id_organizacion, id_empresa, id_sede, id_almacen } = await this.$info(req)
    const error = { message: 'No tienes permisos suficientes', statusCode: 'No Action', code: 'noAction' }
    if (!req.headers.ruta) {
        const menus = await menuUsuarioService.getMenus(id_usuario, id_tipo_socio, id_organizacion, id_empresa, id_sede, id_almacen)
        error.menus = menus
        error.permission = null
        reply.code(401)
        reply.send(error)
    }
    let { id_permiso, metodo } = (await menuUsuarioService.validateMenuUsuario({ id_usuario, id_tipo_socio, id_organizacion, id_empresa, id_sede, id_almacen, ruta: req.headers.ruta })) || {}
    id_permiso = id_permiso || -1
    metodo = metodo || ''
    const methods = metodo.split(',')
    if (!methods.includes(req.method)) {
        const menus = await menuUsuarioService.getMenus(id_usuario, id_tipo_socio, id_organizacion, id_empresa, id_sede, id_almacen)
        error.menus = menus
        error.permission = id_permiso === -1 ? null : id_permiso
        reply.code(401)
        reply.send(error)
    }
}