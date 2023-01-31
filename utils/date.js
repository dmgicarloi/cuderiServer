module.exports = function (dateStringObject = new Date(), inputFormat = 'DD/MM/YYYY', delimiter = '/') {
  const getFormat = function (date = new Date()) {
    const hour = parseInt(getHour(date))
    return hour > 12 ? 'pm' : 'am'
  }

  const getYear = function (date = new Date()) {
    return date.getFullYear().toString()
  }

  const getMonth = function (date = new Date()) {
    return `0${(date.getMonth() + 1)}`.slice(-2)
  }

  const getDay = function (date = new Date()) {
    return `0${date.getDate()}`.slice(-2)
  }

  const getHour = function (date = new Date()) {
    return `0${date.getHours()}`.slice(-2)
  }

  const getDate = function (date = new Date()) {
    return `${getYear(date)}/${getMonth(date)}/${getDay(date)}`
  }

  const getDatePeru = function (date = new Date()) {
    return `${getDay(date)}/${getMonth(date)}/${getYear(date)}`
  }

  const getTime = function (date = new Date()) {
    return `${getHour(date)}:${getMinutes(date)}:${getSeconds(date)}`
  }

  const getTimePeru = function (date = new Date()) {
    const hour = parseInt(getHour(date))
    let resultado = hour
    if( hour > 12 ){
      resultado = hour - 12
    }
    return `${`0${resultado}`.slice(-2)}:${getMinutes(date)}:${getSeconds(date)} ${getFormat(date)}`
  }

  const getDateTime = function (date = new Date()) {
    return `${getDate(date)} ${getTime(date)}`
  }

  const getDateTimePeru = function (date = new Date()) {
    return `${getDatePeru(date)} ${getTimePeru(date)}`
  }

  const getIso = function (date = new Date()) {
    return date.toISOString()
  }

  const get = function (date = new Date()) {
    return date
  }

  const getMinutes = function (date = new Date()) {
    return `0${date.getMinutes()}`.slice(-2)
  }

  const getSeconds = function (date = new Date()) {
    return `0${date.getSeconds()}`.slice(-2)
  }

  const exportDates = function (date = new Date()) {
    return {
      day: getDay(date),
      month: getMonth(date),
      year: getYear(date),
      hour: getHour(date),
      minutes: getMinutes(date),
      seconds: getSeconds(date),
      date: getDate(date),
      time: getTime(date),
      dateTime: getDateTime(date),
      iso: getIso(date),
      get: get(date),
      datePeru: getDatePeru(date),
      timePeru: getTimePeru(date),
      dateTimePeru: getDateTimePeru(date)
    }
  }

  if (dateStringObject) {
    const regex = /^(([0-9]{4}|[0-9]{2})\/[0-9]{2}\/([0-9]{2}|[0-9]{4}))(\s[0-9]{2}:[0-9]{2}:[0-9]{2}\s[aA-zZ]{2})?$/
    if (dateStringObject.constructor === Date) {
      return exportDates(dateStringObject)
    } else if (regex.test(dateStringObject)) {
      const extractDate = dateStringObject.replace(regex, '$1')
      const extractTime = dateStringObject.replace(regex, '$4')
      const splitDate = extractDate.split(delimiter)
      const splitInputFormat = inputFormat.split(delimiter)
      const objDate = {
        isDate: true
      }
      for(let i = 0; i < splitInputFormat.length; i++) {
        const lettersFormat = splitInputFormat[i]
        const numberDate = splitDate[i]
        objDate[lettersFormat] = splitDate[i]
        if (lettersFormat.length === numberDate.length) {
          objDate[lettersFormat] = splitDate[i]
        } else {
          objDate.isDate = false
        }
      }
      if (objDate.isDate === true) {
        const d = new Date(`${objDate.YYYY}/${objDate.MM}/${objDate.DD} ${extractTime}`.trim())
        if (!isNaN(d)) {
          return exportDates(d)
        } else {
          return {}
        }
      } else {
        return {}
      }
    } else {
      const d = new Date(dateStringObject)
      if (!isNaN(d)) {
        return exportDates(d)
      } else {
        return {}
      }
    }
  }
  return {}
}