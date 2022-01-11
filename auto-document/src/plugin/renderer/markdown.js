module.exports = function(docs) {
  let str = ''
  docs.forEach(doc => {
    const { type, name, doc: document, params, propertiesInfo, methodsInfo } = doc
    const { description, tags } = document || {}

    if (type === 'function') {
      str += `## ${name}\n${description}\n`

      if (tags) {
        tags.forEach(tag => {
          const { name: tagName, description: tagDescription } = tag
          str += `${tagName}: ${tagDescription}\n`
        })
      }

      str += `>${name}(`
      if (params) {
        str += params.map(param => {
          const { name: paramName, type: paramType } = param
          return `${paramName}: ${paramType}`
        }).join(', ')
      }
      str += ')\n'

      str += '#### Parameters:\n'
      if (params) {
        str += params.map(param => {
          const { name: paramName, type: paramType } = param
          return `- ${paramName}(${paramType})`
        }).join('\n')
      }
      str += '\n'

    } else if (type === 'class') {
      str += `## ${name}\n${description}\n`

      if (tags) {
        tags.forEach(tag => {
          const { name: tagName, description: tagDescription } = tag
          str += `${tagName}: ${tagDescription}\n`
        })
      }

      str += `> new ${name}(`
      if (params) {
        str += params.map(param => {
          const { name: paramName, type: paramType } = param
          return `${paramName}: ${paramType}`
        }).join(', ')
      }
      str += ')\n'

      str += '#### Parameters:\n'
      if (propertiesInfo) {
        propertiesInfo.forEach(param => {
          const { name: paramName, type: paramType } = param
          str += `- ${paramName}: ${paramType}\n`
        })
      }
      str += '#### Methods:\n'
      if (methodsInfo) {
        methodsInfo.forEach(param => {
          const { name: paramName } = param
          str += `- ${paramName}\n`
        })
      }
      str += '\n'
    }
    str += '\n'
  })
  return str
}