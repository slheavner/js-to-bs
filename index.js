const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const fs = require('fs')
const BrightScriptFormatter = require('brightscript-formatter').BrightScriptFormatter
const bsFormatter = new BrightScriptFormatter()
const formatOperator = (op) => {
  if (op === '!') {
    op = 'not'
  } else if (op.startsWith('!=')) {
    op = '<>'
  } else if (op.startsWith('==')) {
    op = '='
  } else if (op === '&&') {
    op = 'and'
  } else if (op === '||') {
    op = 'or'
  } else if (['&', '|', '<<', '>>', '+', '-', '/', '*', '<', '>'].includes(op)) {

  } else {
    console.error('unable to recognize operator ' + op)
  }
  return op;
}

const formatParams = params => {
  return params.map(node => node.bs).join(', ')
}

exports.toBRS = (code) => {
  const ast = parser.parse(code);

  traverse(ast, {
    exit(path) {
      const {
        node
      } = path
      switch (path.type) {
        case 'StringLiteral':
          node.bs = `"${node.value.replace(/"/g, '""')}"`
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
        case 'FunctionExpression':
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
          if (node.computed) {
            node.bs = `${node.object.bs}[${node.property.bs}]`
          } else {
            node.bs = `${node.object.bs}.${node.property.bs}`
          }
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
          const data = bsFormatter.format(
            node.body.map(node => node.bs).join('\n')
          )
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
          let op = formatOperator(node.operator)
          node.bs = `${node.left.bs} ${op} ${node.right.bs}`
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
        case 'ThisExpression':
          node.bs = 'm'
          return
        case 'BooleanLiteral':
          node.bs = `${node.value}`
          return
        case 'ForStatement':
          node.bs = `for ${node.init.bs} to ${node.test.bs} step ${node.update.bs}
            ${node.body.bs}
          end for`
          return
        case 'UpdateExpression':
          node.bs = `${node.argument.bs}${node.operator}`
          return
        case 'WhileStatement':
          node.bs = `while ${node.test.bs}
            ${node.body.bs}
          end while`
          return
        case 'ForOfStatement':
        case 'ForInStatement':
          node.bs = `for each ${node.left.bs.split('=')[0].trim()} in ${node.right.bs}
          ${node.body.bs}
          end for`
          return
        case 'UnaryExpression':
          if (node.operator === 'typeof') {
            node.bs = `type(${node.argument.bs})`
          } else {
            node.bs = `${formatOperator(node.operator)} ${node.argument.bs}`
          }
          return
        case 'LogicalExpression':
          node.bs = `${node.left.bs} ${formatOperator(node.operator)} ${node.right.bs}`
          return
        case 'NewExpression':
          params = node.arguments.length === 0 ? '' :
            `, ${node.arguments.map(v => v.bs).join(', ')}`
          node.bs = `createObject("${node.callee.bs}"${params})`
          return
        case 'ConditionalExpression':
          throw 'cannot use conditional expressions'
        default:
          console.log(`Bad Node Type: ${path.type}`)
      }
    }
  });

}

exports.toBRS(fs.readFileSync(process.argv[2], 'utf-8'))