((fs, path, colors) => {

    'use strict'

    exports.genClient = async (kn, model) => {
        try {
            colors.enable()
            let congifColumns = ''
            let reactiveParams = ''
            let loadParamsUpdate = ''
            let multiPathParams = ''
            let updateParams = ''
            let createParams = ''
            let inputsTemplate = ''
            const fields = []

            let nameModelUpperCamelCase = (model.split('_')).map(item => {
                return item.substr(0, 1).toUpperCase() + (item.substr(1, item.length - 1)).toLowerCase()
            })
            nameModelUpperCamelCase = nameModelUpperCamelCase.join('')

            try {

                // Lista todos los campos de una tabla         
                let { rows } = await kn.raw(`
                    SELECT column_name as name, data_type as type
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = '${model}'
                `)

                congifColumns = rows.map(row => {
                    return `                { name: '${row.name}', label: '${row.name}', field: '${row.name}', align: 'left ' }`
                })


                // Lista las llaves primarias de una tabla
                let data = await kn.raw(`
                    SELECT a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type
                    FROM
                        pg_class AS c
                        JOIN pg_index AS i ON c.oid = i.indrelid AND i.indisprimary
                        JOIN pg_attribute AS a ON c.oid = a.attrelid AND a.attnum = ANY(i.indkey)
                    WHERE c.oid = '${model}'::regclass
                `)

                rows = data.rows
                // await this.$http.delete(`api/permiso/${row.permisoid}`)
                const rowsPath = rows.map(row => {
                    row.isPrimary = true
                    fields.push(row)
                    if (rows.length > 1) {
                        const path = row.name.replace(/_?cod_?|_?id_?|_?codigo_?/g, '')
                        return path + "/${row."+ row.name +"}"
                    } else {
                        return "${row."+ row.name +"}"
                    }
                })

                multiPathParams = rowsPath.join('/')

                // Lista todos los campos excepto las llaves primarias
                data = await kn.raw(`
                    SELECT column_name as name, data_type as type
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE  table_name = '${model}' and column_name IS NOT NULL and column_name not in (
                    SELECT a.attname AS name
                    FROM
                        pg_class AS c
                        JOIN pg_index AS i ON c.oid = i.indrelid AND i.indisprimary
                        JOIN pg_attribute AS a ON c.oid = a.attrelid AND a.attnum = ANY(i.indkey)
                    WHERE c.oid = '${model}'::regclass)
                `)

                rows = data.rows

                reactiveParams = rows.map(row => {
                    row.isPrimary = false
                    fields.push(row)
                    return `        ${row.name}: null`
                })

                loadParamsUpdate = rows.map(row => {
                    return `            this.form.${row.name} = this.row${nameModelUpperCamelCase}.${row.name}`
                })

                updateParams = fields.map(item => {
                    if (item.isPrimary === true) {
                        return `                ${item.name}: row.${item.name}`
                    } else {
                        return `                ${item.name}: this.form.${item.name}`
                    }
                })

                createParams = fields.map(item => {
                    if (item.isPrimary === true) {
                        return `                ${item.name}: result.${item.name}`
                    } else {
                        return `                ${item.name}: this.form.${item.name}`
                    }
                })

                // q-input(dense outlined v-model="form.${item.name}" label="${item.name}")
                inputsTemplate = rows.map(item => {
                    return `\n                .col-xs-12.col-sm-6\n                    q-input(dense outlined v-model='form.${item.name}' label='${item.name}')`
                })

                congifColumns = congifColumns.join(',\n')
                reactiveParams = reactiveParams.join(',\n')
                loadParamsUpdate = loadParamsUpdate.join(',\n')
                updateParams = updateParams.join(',\n')
                createParams = createParams.join(',\n')
                inputsTemplate = inputsTemplate.join('')
            } catch (e) {
                console.warn("La tabla ingresada no existe.".red)
                // process.exit()
                return
            }
    
            let nameModel = model.split('_')
            nameModel = nameModel.join('')

            const rutaFolder = path.normalize(`${__dirname}/components/${nameModel}`)
            let rutaConfig = path.normalize(`${rutaFolder}/config.js`)
            let rutaScript = path.normalize(`${rutaFolder}/script.js`)
            let rutaTemplate = path.normalize(`${rutaFolder}/template.pug`)

            let rutaIndex = path.normalize(`${rutaFolder}/Index.vue`)
            let rutaScss = path.normalize(`${rutaFolder}/style.scss`)

            if (!fs.existsSync(rutaFolder)){
                fs.mkdirSync(rutaFolder, { recursive: true });
            }

            if (fs.existsSync(rutaConfig)) {
                console.warn(`El archivo config para ${model} ya existe.`.red)
                return
                // process.exit()
            }
    
           let configTxt = fs.readFileSync(`${__dirname}/config.txt`, { encoding: "utf8" })
           let scriptTxt = fs.readFileSync(`${__dirname}/script.txt`, { encoding: "utf8" })
           let templateTxt = fs.readFileSync(`${__dirname}/template.txt`, { encoding: "utf8" })

           let indexTxt = fs.readFileSync(`${__dirname}/index.txt`, { encoding: "utf8" })
           let scssTxt = fs.readFileSync(`${__dirname}/style.txt`, { encoding: "utf8" })

            // SCRIPT
            scriptTxt = scriptTxt.replace(/\{\{reactiveParams\}\}/g, reactiveParams)
                                    .replace(/\{\{upperCamelCaseModel\}\}/g, nameModelUpperCamelCase)
                                    .replace(/\{\{loadParamsUpdate\}\}/g, loadParamsUpdate)
                                    .replace(/\{\{multiPathParams\}\}/g, multiPathParams)
                                    .replace(/\{\{updateParams\}\}/g, updateParams)
                                    .replace(/\{\{createParams\}\}/g, createParams)
                                    .replace(/\{\{paramsPath\}\}/g, (model.replace(/\_/g, '-')).toLowerCase())
                                    
            // CONFIG
            configTxt = configTxt.replace(/\{\{congifColumns\}\}/g, congifColumns)

            // TEMPLATE
            templateTxt = templateTxt.replace(/\{\{upperCamelCaseModel\}\}/g, nameModelUpperCamelCase)
                                        .replace(/\{\{inputsTemplate\}\}/g, inputsTemplate)

            fs.writeFileSync(rutaConfig , configTxt, { encoding: "utf8" } )
            fs.writeFileSync(rutaScript , scriptTxt, { encoding: "utf8" } )
            fs.writeFileSync(rutaTemplate, templateTxt, { encoding: "utf8" } )

            fs.writeFileSync(rutaIndex, indexTxt, { encoding: "utf8" } )
            fs.writeFileSync(rutaScss, scssTxt, { encoding: "utf8" } )
    
            console.warn(`El componente ${nameModel} ha sido generado con éxito.`.green)
            // return
            process.exit()
        } catch (e) {
            console.log(e)
            process.exit()
        }
    }

})(require('fs'), require("path"), require('colors'))