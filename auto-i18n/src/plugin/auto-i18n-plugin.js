const path = require('path')
const fse = require('fs-extra')

const { declare } = require('@babel/helper-plugin-utils')
const { nextIntlKey, getReplaceExpression, obtainSkipTransformAttrib, save } = require('./utils')

const autoI18nPlugin = declare((api, options, dirname) => {
  api.assertVersion(7)

  if (!options.outputDir) {
    throw new Error('outputDir in empty')
  }
  
  return {
    // pre 插件运行之前的方法
    pre(file) {
      file.set('allText', [])
    },
    visitor: {
      Program: {
        enter(path, state) {
          let imported
          path.traverse({
            ImportDeclaration(p) {
              const source = p.node.source.value
              if (source === 'intl') {
                imported = true
              }
            }
          })
          if (!imported) {
            const uid = path.scope.generateUid('intl')
            const importAst = api.template.ast(`import ${uid} from 'intl'`)
            path.node.body.unshift(importAst)
            state.intlUid = uid
          }
          path.traverse({
            'StringLiteral|TemplateLiteral'(path) {
              obtainSkipTransformAttrib(path)
            }
          })
        }
      },
      StringLiteral(path, state) {
        if (path.node.skipTransform) {
          return
        }
        let key = nextIntlKey()
        save(state.file, key, path.node.value)

        const replaceExpression = getReplaceExpression(api, path, key, state.intlUid)
        path.replaceWith(replaceExpression)
        path.skip()
      },
      TemplateLiteral(path, state) {
        if (path.node.skipTransform) {
          return
        }
        const value = path.get('quasis').map(item => item.node.value.raw).join('{placeholder}')
        if (value) {
          let key = nextIntlKey()
          save(state.file, key, value)

          const replaceExpression = getReplaceExpression(api, path, key, state.intlUid)
          path.replaceWith(replaceExpression)
          path.skip()
        }
      }
    },
    post(file) {
      const allText =  file.get('allText')
      const intlData = allText.reduce((obj, item) => {
        obj[item.key] = item.value
        return obj
      }, {})

      const content = `const resource = ${JSON.stringify(intlData, null, 4)}`
      fse.ensureDirSync(options.outputDir)
      fse.writeFileSync(path.join(options.outputDir, 'base.js'), content)
    }
  }
})

module.exports = autoI18nPlugin