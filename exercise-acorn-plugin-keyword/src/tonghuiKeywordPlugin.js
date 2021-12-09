const acorn = require('acorn')

const { Parser, tokTypes, TokenType } = acorn

Parser.acorn.keywordTypes['tonghui'] = new TokenType('tonghui', { keyword: 'tonghui'})

module.exports = function(Parser) {
  return class extends Parser {
    parse(program) {
      let newKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this const class extends export import super"
      newKeywords += " tonghui"
      this.keywords = new RegExp('^(?:' + newKeywords.replace(/ /g, '|') + ')$' )
      return (super.parse(program))
    }

    parseStatement(context, topLevel, exports) {
      const startType = this.type
      if (startType == Parser.acorn.keywordTypes["tonghui"]) {
        const node = this.startNode()
        return this.parseTonghuiStatement(node)
      } else {
        return (super.parseStatement(context, topLevel, exports))
      }
    }

    parseTonghuiStatement() {
      this.next()
      return this.finishNode({value: 'tonghui'}, 'tonghuiStatement')
    }
  }
}