const generate = require('@babel/generator').default

let intlIndex = 0

function nextIntlKey() {
  ++intlIndex;
  return `intl${intlIndex}`
}

function getReplaceExpression(api, path, value, intlUid) {
  const expressionParams = path.isTemplateLiteral() ? path.node.expressions.map(item => generate(item).code) : null
  let replaceExpression = api.template.ast(`${intlUid}.t('${value}'${expressionParams ? ',' + expressionParams.join(','): ''})`).expression
  if (path.findParent(p => p.isJSXAttribute()) && !path.findParent(p => p.isJSXExpressionContainer())) {
    replaceExpression = api.types.JSXExpressionContainer(replaceExpression)
  }
  return replaceExpression
}

function obtainSkipTransformAttrib(path) {
  if (path.node.leadingComments) {
    path.node.leadingComments = path.node.leadingComments.filter((comment, index) => {
      if (comment.value.includes('i18n-disable')) {
        path.node.skipTransform = true
        return false
      }
      return true
    })
  }

  if (path.findParent(p => p.isImportDeclaration())) {
    path.node.skipTransform = true
  }
  if (path.findParent(p => p.isJSXAttribute()) && !path.findParent(p => p.isJSXExpressionContainer())) {
    path.node.skipTransform = true
  }
}

function save(file, key, value) {
  const allText = file.get('allText')
  allText.push({
    key, value
  })
  file.set('allText', allText)
}

module.exports = {
  nextIntlKey,
  getReplaceExpression,
  obtainSkipTransformAttrib,
  save
}