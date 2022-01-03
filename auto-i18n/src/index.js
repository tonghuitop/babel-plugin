const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core')

const autoI18nPlugin = require('./plugin/auto-i18n-plugin')

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
  encoding: 'utf-8'
})

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx']
})

const { code } = transformFromAstSync(ast, sourceCode, {
  plugins: [
    [autoI18nPlugin, {
      outputDir: path.resolve(__dirname, './output')
    }]
  ]
})

console.log(code)