const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const fs = require('fs')
const BrightScriptFormatter = require('brightscript-formatter').BrightScriptFormatter
const bsFormatter = new BrightScriptFormatter()
const pollyfills = require('./pollyfills')
const converters = require('./converters')

const formatOperator = op => {
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
  return op
}

const writeBrs = (node, name) => {
  const data = bsFormatter.format(node.body.map(node => node.bs).join('\n'))
  fs.writeFileSync(name, data)
}

exports.toBRS = (code, name = 'out.brs') => {
  const ast = parser.parse(code)
  fills = []
  traverse(ast, {
    exit(path) {
      const { node } = path
      if (path.type === 'Program') {
        if (fills && fills.length) {
          fills.forEach(f => {
            node.body.push(pollyfills[f])
          })
        }
        writeBrs(node, name)
      } else {
        const polly = pollyfills.has(node)
        if (polly) {
          node.bs = pollyfills[polly].convert(node)
          fills.push(polly)
        } else {
          node.bs = converters[path.type](node)
        }
      }
    },
  })
}

// exports.toBRS(fs.readFileSync(process.argv[2], 'utf-8'))
