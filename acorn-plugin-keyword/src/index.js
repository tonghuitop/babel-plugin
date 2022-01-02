const acorn = require('acorn')
const tonghuiKeywordPlugin = require('./tonghuiKeywordPlugin')

const { Parser } = acorn

const newParser = Parser.extend(tonghuiKeywordPlugin)

const program = 
`
  tonghui
  const a = 1
`

const ast = newParser.parse(program)

console.log(ast)