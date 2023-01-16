module.exports = function process_RS(tempExcel = '', book) {
  return new Promise((resolve, rejects) => {
    try {
      var buffers = []
      index = book || 0
      const XLSX = require('xlsx')
      const fs = require("fs")
      const path = require('path')
      const pathXslx = path.join(process.cwd(), `/public`, tempExcel)
      const readerStream = fs.createReadStream(pathXslx)
      readerStream.on("data", function(data) { buffers.push(data) })
      readerStream.on("end", function() {
        var buffer = Buffer.concat(buffers)
        var workbook = XLSX.read(buffer, {type:"buffer"})
        const ws = workbook.Sheets[workbook.SheetNames[index]]
        const json = XLSX.utils.sheet_to_json(ws, { range: 1, header: 1 })
        resolve({ worksheet: workbook, data: json })
      })
    } catch (e) {
      rejects(e)
    }
  })
}