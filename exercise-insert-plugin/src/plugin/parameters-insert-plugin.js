/**
 * babel 支持transform插件，形式是函数返回一个对象，对象有visitor属性
 * 在console.log等api中插入文件名和行列号的参数，方便定位代码。
 */

const targetCalleeName = ['log', 'error', 'info', 'debug', 'warn'].map(item => `console.${item}`)

module.exports = function ({ types, template }, options, dirname) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (path.node.isNew) {
          return
        }
        const calleeName = path.get('callee').toString()
        if(targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start
          const newNode = template.expression(`console.log("${state.filename || 'unkown filename'}: (${line}, ${column})")`)()
          newNode.isNew = true

          if (path.findParent(path => path.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]))
            path.skip()
          } else {
            path.insertBefore(newNode)
          }
        }
      }
    }
  }
}