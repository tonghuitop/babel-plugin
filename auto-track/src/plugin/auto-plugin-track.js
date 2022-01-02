/**
 * babel 函数插桩插件
 * 原理：visitor 模式
 *   在traverse（遍历）AST的时候，调用注册的visitor来对其进行处理。
 */

const { declare } = require('@babel/helper-plugin-utils')
const importModule = require('@babel/helper-module-imports')

const autoTrackPlugin = declare((api, options, dirname) => {
  api.assertVersion(7)

  return {
    visitor: {
      Program: {
        enter(path, state) {
          // babel会在traverse的过程中在path里维护节点的父节点引用，在其中保存scope(作用域)的信息，同时也会提供增删改AST的方法。
          path.traverse({
            ImportDeclaration(curPath) {
              const requirePath = curPath.get('source').node.value
              if (requirePath === options.trackerPath) {
                const specifierPath = curPath.get('specifiers.0')
                if (specifierPath.isImportSpecifier()) {
                  state.trackerImportId = specifierPath.toString()
                } else if (specifierPath.isImportNamespaceSpecifier()) {
                  state.trackerImportId = specifierPath.get('local').toString()
                }
                path.stop()
              }
            }
          })
          if(!state.trackerImportId) {
            state.trackerImportId = importModule.addDefault(path, options.trackerPath, {
              nameHint: path.scope.generateUid(options.trackerPath)
            }).name
            state.trackerAST = api.template.statement(`${state.trackerImportId}()`)();
          }
        }
      },
      'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
        const bodyPath = path.get('body')
        if (bodyPath.isBlockStatement()) {
          bodyPath.node.body.unshift(state.trackerAST)
        } else {
          // 如果是箭头函数直接返回，没有函数体的情况下
          // 例如: const c = () => 'ccc'
          const ast = api.template.statement(`{${state.trackerImportId}(); return PREV_BODY;}`)({PREV_BODY: bodyPath.node})
          bodyPath.replaceWith(ast)
        }
      }
    }
  }
})

module.exports = autoTrackPlugin
