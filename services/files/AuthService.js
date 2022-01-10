module.exports = async function (_this, opts) {
    _this.services.AuthService = class {
        constructor() {
            const { knex, httpErrors } = _this
            this.knex = knex
            this.error = httpErrors
        }
        async login ({ usuario, clave }) {
            const usuarioModel = _this.getModel('UsuarioModel')
            const dataUsuario = await usuarioModel.signIn({ usuario, clave })
            if (dataUsuario) {
              // const menuUsuarioService = _this.getService('MenuUsuarioService')
              // const menus = await menuUsuarioService.getMenus(usuario.id_usuario)
              const menus = [
                {
                  menuid : 1,
                  orden : 1,
                  descripcion : 'Gestiones',
                  parent_menuid: null, 
                  ruta : '/gestiones',
                  icono : 'fas fa-clipboard',
                  permisoid: 3,
                  submenu : [
                    // {
                    //   menuid : 2,
                    //   orden : 1,
                    //   descripcion : 'Sub Gestión',
                    //   parent_menuid: 1, 
                    //   ruta : '/sub-gestion/1',
                    //   icono : 'fas fa-clipboard-list',
                    //   permisoid: 3,
                    //   submenu : [],
                    //   active : false,
                    //   principal: false,
                    //   padding: '20px'
                    // }
                  ],
                  active : false,
                  principal: true,
                  padding: '15px'
                },
                {
                  menuid : 3,
                  orden : 2,
                  descripcion : 'Asignado a mi usuario',
                  parent_menuid: null, 
                  ruta : '/gestiones/asignado-a-mi-usuario',
                  icono : 'fas fa-user-tag',
                  permisoid: 3,
                  submenu : [],
                  active : false,
                  principal: true,
                  padding: '15px'
                },
                {
                  menuid : 4,
                  orden : 3,
                  descripcion : 'Creado por mi usuario',
                  parent_menuid: null, 
                  ruta : '/gestiones/creado-por-mi-usuario',
                  icono : 'fas fa-user-check',
                  permisoid: 3,
                  submenu : [],
                  active : false,
                  principal: true,
                  padding: '15px'
                },
                {
                  menuid : 5,
                  orden : 3,
                  descripcion : 'Creado recientemente',
                  parent_menuid: null, 
                  ruta : '/gestiones/creado-recientemente',
                  icono : 'far fa-clock',
                  permisoid: 3,
                  submenu : [],
                  active : false,
                  principal: true,
                  padding: '15px'
                },
                {
                  menuid : 6,
                  orden : 3,
                  descripcion : 'Creado en el pasado',
                  parent_menuid: null, 
                  ruta : '/gestiones/creado-en-el-pasado',
                  icono : 'fas fa-history',
                  permisoid: 3,
                  submenu : [],
                  active : false,
                  principal: true,
                  padding: '15px'
                },
                // {
                //   menuid : 7,
                //   orden : 3,
                //   descripcion : 'Autores',
                //   parent_menuid: null, 
                //   ruta : '/gestiones/autores',
                //   icono : 'far fa-address-book',
                //   permisoid: 3,
                //   submenu : [],
                //   active : false,
                //   principal: true,
                //   padding: '15px'
                // }
              ]
              // return { token: _this.jwt.sign({ usuario, menus })}
              return { token: _this.jwt.sign({
                usuario,
                autor: dataUsuario.autor,
                avatar: dataUsuario.avatar,
                id_persona: dataUsuario.id_persona
              }), menus}
            } else {
              return this.error.badRequest('Usuario no existe.')
            }
          }
    }
}