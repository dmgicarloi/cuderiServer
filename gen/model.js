((fs, path, colors) => {

    'use strict'

    exports.genModel = async (kn, model) => {
        try {
            colors.enable()    
            let returning = ''
            let params = ''
            let paramsData = '{}'
            try {
                let { rows } = await kn.raw(`
                    SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type
                    FROM
                        pg_class AS c
                        JOIN pg_index AS i ON c.oid = i.indrelid AND i.indisprimary
                        JOIN pg_attribute AS a ON c.oid = a.attrelid AND a.attnum = ANY(i.indkey)
                    WHERE c.oid = '${model}'::regclass
                `)
                const rowsParams = rows.map(row => {
                    return row.name
                })
                const rowsReturning = rows.map(row => {
                    return `'${row.name}'`
                })
                returning = rowsReturning.join(', ')
                params = rowsParams.join(', ')
                paramsData = `{ ${params} }`
            } catch (e) {
                console.warn("La tabla ingresada no existe.".red)
                // process.exit()
                return
            }
    
            //
            let nameModel = model.split('_')
            nameModel = nameModel.map(item => {
                return item.substr(0, 1).toUpperCase() + item.substr(1, item.length - 1)
            })
            nameModel = nameModel.join('') + 'Model'
    
            let ruta = path.normalize(__dirname + "/..")
            ruta = `${ruta}/models/files/${nameModel}.js`
    
            if (!model) {
                console.warn("Debe agregar un modelo.".red)
                // process.exit()
                return
            }
    
            if (fs.existsSync(ruta)) {
                console.warn("Este modelo ya existe.".red)
                return
                // process.exit()
            }
    
            let modelTxt = fs.readFileSync(`${__dirname}/templateModel.txt`, { encoding: "utf8" })
            modelTxt = modelTxt.replace('{{model}}', nameModel)
                                .replace('{{name}}', model)
                                .replace(/\{\{params\}\}/g, params)
                                .replace(/\{\{paramsData\}\}/g, paramsData)
                                .replace(/\{\{returning\}\}/g, returning)
            fs.writeFileSync(ruta , modelTxt, { encoding: "utf8" } )
    
            console.warn(`El modelo ${nameModel} ha sido generado con éxito.`.green)
            return
            // process.exit()
        } catch (e) {
            console.log(e)
            process.exit()
        }
    }

})(require('fs'), require("path"), require('colors'))