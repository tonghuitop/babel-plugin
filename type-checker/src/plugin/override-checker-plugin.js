const { declare } = require('@babel/helper-plugin-utils')

function getAllClassMethodNames(classDeclarationNodePath) {
  const state = {
    allSuperMethodNames: []
  }
  classDeclarationNodePath.traverse({
    ClassMethod(path) {
      state.allSuperMethodNames.push(path.get('key').toString())
    }
  })
  return state.allSuperMethodNames
}

const overrideCheckerPlugin = declare((api, options, dirname) => {
  api.assertVersion(7)

  return {
    pre(file) {
      file.set('errors', [])
    },
    visitor: {
      ClassDeclaration(path, state) {
        const semanticErrors = state.file.get('errors')
        const updateOperator = state.node.update.operator

        let shouldUpdateOperator
        if (['<', '<='].includes(testOperator)) {
          shouldUpdateOperator = '++'
        } else if (['>', '>='].includes(testOperator)) {
          shouldUpdateOperator = '--'
        }

        if (shouldUpdateOperator !== updateOperator) {
          // 报错： 遍历方向错误
        }
      }
    },
    post(file) {
      console.log(file.get('errors'))
    }
  }
})

module.exports = overrideCheckerPlugin