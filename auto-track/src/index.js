const { transformFromAstSync } = require('@babel/core')
const parser = require('@babel/parser')
const autoTrackPlugin = require('./plugin/auto-plugin-track')
const fs = require('fs')
const path = require('path')

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
  encoding: 'utf-8'
})

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous'
})

const { code } = transformFromAstSync(ast, sourceCode, {
  plugins: [
    [autoTrackPlugin, {
      trackerPath: 'tracks'
    }]
  ]
})

console.log(code)