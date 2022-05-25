((fs, path, colors) => {

    'use strict'

    exports.genController = async (kn, model) => {
        try {
            colors.enable()

            const validateTypes = (row) => {
                if (/^character|text/.test(row.type)) {
                    row.type = '\'string\''
                } else if (/^integer|bigint|smallint|numeric/.test(row.type)) {
                    row.type = '\'number\''
                } else if (/^(timestamp|date|datetime)/.test(row.type)) {
                    row.type = '\'date\''
                }
            }
        
            let params = ''
            let pathParams = ''
            let required = ''
            let properties = ''
            let arregloProperties = []
            let requiredNotNull = ''
            let propertiesNotNull = ''
            let arregloPropertiesNotNull = []
            try {
                let { rows } = await kn.raw(`
                    SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type
                    FROM
                        pg_class AS c
                        JOIN pg_index AS i ON c.oid = i.indrelid AND i.indisprimary
                        JOIN pg_attribute AS a ON c.oid = a.attrelid AND a.attnum = ANY(i.indkey)
                    WHERE c.oid = '${model}'::regclass
                `)
        
                const res = await kn.raw(`
                SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type
                FROM
                    pg_class AS c
                    JOIN pg_index AS i ON c.oid = i.indrelid AND i.indisprimary
                    JOIN pg_attribute AS a ON c.oid = a.attrelid AND a.attnum = ANY(i.indkey)
                WHERE c.oid = '${model}'::regclass and a.attname in (select kcu.column_name
                from information_schema.table_constraints tco
                join information_schema.key_column_usage kcu
                          on tco.constraint_schema = kcu.constraint_schema
                          and tco.constraint_name = kcu.constraint_name
                join information_schema.referential_constraints rco
                          on tco.constraint_schema = rco.constraint_schema
                          and tco.constraint_name = rco.constraint_name
                join information_schema.table_constraints rel_tco
                          on rco.unique_constraint_schema = rel_tco.constraint_schema
                          and rco.unique_constraint_name = rel_tco.constraint_name
                where tco.constraint_type = 'FOREIGN KEY' and kcu.table_name = '${model}'
                order by kcu.table_schema,
                         kcu.table_name)
                union
                SELECT column_name as name, data_type as type
                            FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE is_nullable = 'NO' and table_name = '${model}' and column_name IS NOT NULL and column_name not in (
                            SELECT a.attname AS name
                                        FROM
                                            pg_class AS c
                                            JOIN pg_index AS i ON c.oid = i.indrelid AND i.indisprimary
                                            JOIN pg_attribute AS a ON c.oid = a.attrelid AND a.attnum = ANY(i.indkey)
                                        WHERE c.oid = '${model}'::regclass)
                `)
        
                let rowsNotNull = res.rows
                
                const rowsParams = rows.map(row => {
                    return row.name
                })
                const rowsPath = rows.map(row => {
                    if (rows.length > 1) {
                        const path = row.name.replace(/_?cod_?|_?id_?|_?codigo_?/g, '')
                        return `${path}/:${row.name}`
                    } else {
                        return `:${row.name}`
                    }
                })
                required = rows.map(row => {
                    return `'${row.name}'`
                })
                requiredNotNull = rowsNotNull.map(row => {
                    return `'${row.name}'`
                })
                params = rowsParams.join(', ')
                pathParams = rowsPath.join('/')
                
                rows.map(row => {
                    validateTypes(row)
                    arregloProperties.push(`${row.name}: { type: ${row.type} }`)
                })
        
                rowsNotNull.map(row => {
                    validateTypes(row)
                    arregloPropertiesNotNull.push(`${row.name}: { type: ${row.type} }`)
                })
        
                properties = `${arregloProperties.join(', ')}`
                propertiesNotNull = `${arregloPropertiesNotNull.join(', ')}`
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
            const nameController = name + 'Controller'
        
            let ruta = path.normalize(__dirname + "/..")
            ruta = `${ruta}/controllers/private/controllers/${nameController}.js`
        
            if (fs.existsSync(ruta)) {
                console.warn("Este controlador ya existe.".red)
                return
                // process.exit()
            }
        
            const nameServiceCamelCase = nameService.substr(0, 1).toLowerCase() + nameService.substr(1, nameService.length - 1)
            const nameModelCamelCase = nameModel.substr(0, 1).toLowerCase() + nameModel.substr(1, nameModel.length - 1)

            const requiredRequiredNotNull = required.slice()
            requiredNotNull.map(item => {
                if (requiredRequiredNotNull.indexOf(item) === -1) {
                    requiredRequiredNotNull.push(item)
                }
            })

            const propertiesPropertiesNotNull = arregloProperties.slice()
            arregloPropertiesNotNull.map(item => {
                if (propertiesPropertiesNotNull.indexOf(item) === -1) {
                    propertiesPropertiesNotNull.push(item)
                }
            })

            let controllerTxt = fs.readFileSync(`${__dirname}/templateController.txt`, { encoding: "utf8" })
            controllerTxt = controllerTxt.replace(/\{\{api\}\}/g, model.replace(/\_/g, '-'))
                                    .replace(/\{\{required\}\}/g, required)
                                    .replace(/\{\{nameModel\}\}/g, nameModel)
                                    .replace(/\{\{instanceService\}\}/g, nameServiceCamelCase)
                                    .replace(/\{\{instanceModel\}\}/g, nameModelCamelCase)
                                    .replace(/\{\{service\}\}/g, nameService)
                                    .replace(/\{\{params\}\}/g, params)
                                    .replace(/\{\{path\}\}/g, pathParams)
                                    .replace(/\{\{properties\}\}/g, properties)
                                    .replace(/\{\{propertiesNotNull\}\}/g, propertiesNotNull)
                                    .replace(/\{\{requiredNotNull\}\}/g, requiredNotNull)
                                    .replace(/\{\{requiredRequiredNotNull\}\}/, requiredRequiredNotNull)
                                    .replace(/\{\{propertiesPropertiesNotNull\}\}/, propertiesPropertiesNotNull)
        
            fs.writeFileSync(ruta , controllerTxt, { encoding: "utf8" } )
            console.log(`Servicio ${nameController} ha sido generado con éxito.`.green)
            process.exit()
        } catch (e) {
            console.log(e)
            process.exit()
        }
    }

})(require('fs'), require("path"), require('colors'))