const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default;
const fs = require('fs')

const formatParams = params => {
  return params.map(node => node.bs).join(', ')
}

const toBRS = (code) => {
  const ast = parser.parse(code);

  let bs = '';

  traverse(ast, {
    exit(path) {
      const {
        node
      } = path
      switch (path.type) {
        case 'StringLiteral':
          node.bs = `"${node.value}"`
          return
        case 'Identifier':
          node.bs = node.name
          return
        case 'VariableDeclarator':

          node.bs = node.init ? `${node.id.bs} = ${node.init.bs}` :
            `${node.id.bs} = invalid`
          return
        case 'VariableDeclaration':
          node.bs = node.declarations.map(node => node.bs).join('\n')
          return
        case 'TemplateElement':
          node.bs = `"${node.value.raw}"`
          return
        case 'TemplateLiteral':
          node.bs = node.expressions.concat(node.quasis)
            .sort((a, b) => {
              return a.start - b.start
            }).map(node => node.bs).join(' + ')
          return
        case 'ArrowFunctionExpression':
          node.bs = `function(${formatParams(node.params)})
    ${node.body.bs}
  end function`.trim()
          return
        case 'NumericLiteral':
          node.bs = node.value
          return
        case 'CallExpression':
          node.bs = `${node.callee.bs}(${formatParams(node.arguments)})`
          return
        case 'ExpressionStatement':
          node.bs = node.expression.bs
          return
        case 'MemberExpression':
          node.bs = `${node.object.bs}.${node.property.bs}`
          return
        case 'IfStatement':
          const alternate = node.alternate ? `else ${
            node.alternate.bs.startsWith('if') ? '' : '\n  '
          }${node.alternate.bs}${
      node.alternate.bs.endsWith('end if') ? '' : '\nend if'
    }` : '\nend if'

          node.bs = `if ${node.test.bs} then
    ${node.consequent.bs}
  ${alternate}`
          return
        case 'Program':
          const data = node.body.map(node => node.bs).join('\n')
          console.log(data)
          fs.writeFileSync('./out.brs', data)
          return
        case 'FunctionDeclaration':
          node.bs = `
  function ${node.id.bs}(${formatParams(node.params)})
    ${node.body.bs}
  end function`.trim()
          return
        case 'BlockStatement':
          node.bs = node.body.map(node => node.bs).join('\n')
          return
        case 'BinaryExpression':
          node.bs = `${node.left.bs} ${node.operator} ${node.right.bs}`
          return
        case 'ReturnStatement':
          node.bs = `return ${node.argument.bs}`
          return
        case 'ObjectProperty':
          node.bs = `${node.key.bs}: ${node.value.bs}`
          return
        case 'ObjectExpression':
          node.bs = `{
      ${node.properties.map(node => node.bs).join(',\n')}
    }`
          return
        case 'ArrayExpression':
          node.bs = `[
      ${node.elements.map(node => node.bs).join(',\n')}
    ]`
          return
        case 'AssignmentExpression':
          node.bs = `${node.left.bs} ${node.operator} ${node.right.bs}`
          return
        case 'NullLiteral':
          node.bs = 'invalid'
          return
        case 'ObjectPattern':
          return
        default:
          console.log(path.type)
      }
    }
  });

}

toBRS(fs.readFileSync(process.argv[2], 'utf-8'))