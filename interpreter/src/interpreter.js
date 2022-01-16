const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const parser = require('@babel/parser')
const { codeFrameColumns } = require('@babel/code-frame')
const Scope = require('./Scope')

const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
  encoding: 'utf-8'
})

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
})

function getIdentifierValue(node, scope) {
  if(node.type === 'Identifier') {
    return scope.get(node.name)
  } else {
    return evaluator(node, scope)
  }
}

const evaluator = (function() {
  const astInterpreters = {
    Program(node, scope) {
      node.body.forEach((item) => {
        evaluate(item, scope)
      })
    },
    VariableDeclaration(node, scope) {
      node.declarations.forEach(item => {
        evaluate(item, scope)
      })
    },
    FunctionDeclaration(node, scope) {
      const declareName = evaluate(node.id)
      if (scope[declareName]) {
        throw Error('duplicate declare variable:' + declareName)
      } else {
        scope.set(declareName, function(...args) {
          const funcScope = new Scope()
          funcScope.parent = scope

          node.params.forEach((item, index) => {
            funcScope.set(item.name, args[index])
          })
          funcScope.set('this', this)
          return evaluate(node.body, funcScope)
        })
      }
    },
    // const a = ****
    VariableDeclarator(node, scope) {
      const declareName = evaluate(node.id, scope)
      if (scope[declareName]) {
        throw Error('duplicate declare variable:' + declareName)
      } else {
        scope.set(declareName, evaluate(node.init, scope))
      }
    },
    BlockStatement(node, scope) {
      for (let i = 0; i < node.body.length; i++) {
        if (node.body[i].type === 'ReturnStatement') {
          return evaluate(node.body[i], scope)
        }
        evaluate(node.body[i], scope)
      }
    },
    ReturnStatement(node, scope) {
      return evaluate(node.argument, scope)
    },
    ExpressionStatement(node, scope) {
      return evaluate(node.expression, scope)
    },
    //console.log('999')
    CallExpression(node, scope) {
      const args = node.arguments.map(item => {
        if (item.type === 'Identifier') {
          return scope.get(item.name)
        }
        return evaluate(item, scope)
      })
      if (node.callee.type === 'MemberExpression') {
        const fn = evaluate(node.callee, scope)
        const obj = evaluate(node.callee.object)
        return fn.apply(obj, args)
      } else {
        const fn = scope.get(evaluate(node.callee, scope))
        return fn.apply(null, args)
      }
    },
    // console.log
    MemberExpression(node, scope){
      // console
      const obj = scope.get(evaluate(node.object))
      // console[log]
      return obj[evaluate(node.property)]
    },
    BinaryExpression(node, scope) {
      const leftValue = getIdentifierValue(node.left, scope)
      const rightValue = getIdentifierValue(node.right, scope)
      switch(node.operator) {
        case '+':
          return leftValue + rightValue
        case '-':
          return leftValue - rightValue
        case '*':
          return leftValue * rightValue
        case '/':
          return leftValue / rightValue
        default:
          throw Error('unsupported operator: ' + node.operator)
      }
    },
    Identifier(node, scope) {
      return node.name
    },
    NumericLiteral(node, scope) {
      return node.value
    }
  }
  const evaluate = (node, scope) => {
    try {
      return astInterpreters[node.type](node, scope)
    } catch(e) {
      if (e && e.message && e.message.indexOf('astInterpreters[node.type] is not a function') !== -1) {
        console.error('unsupported ast type: ' + node.type);
        console.error(codeFrameColumns(sourceCode, node.loc, {
            highlightCode: true
        }))
      } else {
        console.error(e.message);
        console.error(codeFrameColumns(sourceCode, node.loc, {
            highlightCode: true
        }))
      }
    }
  }
  return {
    evaluate
  }
})()

const globalScope = new Scope()
globalScope.set('console', {
  log: function (...args) {
      console.log(chalk.green(...args));
  },
  error: function (...args) {
      console.log(chalk.red(...args));
  },
  error: function (...args) {
      console.log(chalk.orange(...args));
  }})
evaluator.evaluate(ast.program, globalScope)
// console.log(globalScope)