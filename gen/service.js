((fs, path, colors) => {

    'use strict'

    exports.genService = async (kn, model) => {
        try {
            colors.enable()

            let params = ''
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
                params = rowsParams.join(', ')
            } catch (e) {
                console.warn("La tabla ingresada no existe.".red)
                return
                // process.exit()
            }
        
            let nameModel = model.split('_')
            nameModel = nameModel.map(item => {
                return item.substr(0, 1).toUpperCase() + item.substr(1, item.length - 1)
            })
            const name = nameModel.join('')
            nameModel = name + 'Model'
            const nameService = name + 'Service'
        
            let ruta = path.normalize(__dirname + "/..")
            ruta = `${ruta}/services/files/${nameService}.js`
        
            if (fs.existsSync(ruta)) {
                console.warn("Este servicio ya existe.".red)
                return
                // process.exit()
            }
        
        
            const nameModelCamelCase = nameModel.substr(0, 1).toLowerCase() + nameModel.substr(1, nameModel.length - 1)
            let serviceTxt = fs.readFileSync(`${__dirname}/templateService.txt`, { encoding: "utf8" })
            serviceTxt = serviceTxt.replace('{{service}}', nameService)
                                    .replace(/\{\{nameModel\}\}/g, nameModel)
                                    .replace(/\{\{instanceModel\}\}/g, nameModelCamelCase)
                                    .replace(/\{\{params\}\}/g, params)
        
            fs.writeFileSync(ruta , serviceTxt, { encoding: "utf8" } )
            console.log(`Servicio ${nameService} ha sido generado con éxito.`.green)
            return
            // process.exit()
        } catch (e) {
            console.log(e)
            process.exit()
        }
    }


})(require('fs'), require("path"), require('colors'))