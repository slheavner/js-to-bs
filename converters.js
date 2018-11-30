const formatParams = params => {
  return params.map(node => node.bs).join(', ')
}
module.exports = {
  StringLiteral: node => {
    return `"${node.value.replace(/"/g, '""')}"`
  },
  Identifier: node => {
    return node.name
  },
  VariableDeclarator: node => {
    return node.init ? `${node.id.bs}= ${node.init.bs}` : `${node.id.bs} = invalid`
  },
  VariableDeclaration: node => {
    return node.declarations.map(node => node.bs).join('\n')
  },
  TemplateElement: node => {
    return `"${node.value.raw}"`
  },
  TemplateLiteral: node => {
    return node.expressions
      .concat(node.quasis)
      .sort((a, b) => {
        return a.start - b.start
      })
      .map(node => node.bs)
      .join(' + ')
  },
  ArrowFunctionExpression: node => {
    return `function(${formatParams(node.params)})
    ${node.body.bs}
end function`.trim()
  },
  FunctionExpression: this.ArrowFunctionExpression,
  NumericLiteral: node => {
    return node.value
  },
  CallExpression: node => {
    return `${node.callee.bs}(${formatParams(node.arguments)})`
  },
  ExpressionStatement: node => {
    return node.expression.bs
  },
  MemberExpression: node => {
    if (node.computed) {
      return `${node.object.bs}[${node.property.bs}]`
    } else {
      return `${node.object.bs}.${node.property.bs}`
    }
  },
  IfStatement: node => {
    const alternate = node.alternate
      ? `else ${node.alternate.bs.startsWith('if') ? '' : '\n  '}${node.alternate.bs}${
          node.alternate.bs.endsWith('end if') ? '' : '\nend if'
        }`
      : '\nend if'

    return `if ${node.test.bs} then
 ${node.consequent.bs}
${alternate}`
  },
  FunctionDeclaration: node => {
    return `
function ${node.id.bs}(${formatParams(node.params)})
${node.body.bs}
end function`.trim()
  },
  BlockStatement: node => {
    return node.body.map(node => node.bs).join('\n')
  },
  BinaryExpression: node => {
    let op = formatOperator(node.operator)
    return `${node.left.bs} ${op} ${node.right.bs}`
  },
  ReturnStatement: node => {
    return `return ${node.argument.bs}`
  },
  ObjectProperty: node => {
    return `${node.key.bs}: ${node.value.bs}`
  },
  ObjectExpression: node => {
    return `{
${node.properties.map(node => node.bs).join(',\n')}
}`
  },
  ArrayExpression: node => {
    return `[
${node.elements.map(node => node.bs).join(',\n')}
]`
  },
  AssignmentExpression: node => {
    return `${node.left.bs} ${node.operator} ${node.right.bs}`
  },
  NullLiteral: node => {
    return 'invalid'
  },
  ObjectPattern: () => {
    return
  },
  ThisExpression: node => {
    return 'm'
  },
  BooleanLiteral: node => {
    return `${node.value}`
  },
  ForStatement: node => {
    return `for ${node.init.bs},to ${node.test.bs},step ${node.update.bs}
     ${node.body.bs}
    end for`
  },
  UpdateExpression: node => {
    return `${node.argument.bs}${node.operator}`
  },
  WhileStatement: node => {
    return `while ${node.test.bs}
     ${node.body.bs}
    end while`
  },
  ForInStatement: node => {
    return `for each ${node.left.bs.split('=')[0].trim()} in ${node.right.bs}
   ${node.body.bs}
    end for`
  },
  ForOfStatement: this.ForInStatement,
  UnaryExpression: node => {
    if (node.operator === 'typeof') {
      return `type(${node.argument.bs})`
    } else {
      return `${formatOperator(node.operator)},${node.argument.bs}`
    }
  },
  LogicalExpression: node => {
    return `${node.left.bs},${formatOperator(node.operator)},${node.right.bs}`
  },
  NewExpression: node => {
    params = node.arguments.length === 0 ? '' : `, ${node.arguments.map(v => v.bs).join(', ')}`
    return `createObject("${node.callee.bs}"${params})`
  },
  ConditionalExpression: node => {
    throw 'cannot use conditional expressions'
  },
}
