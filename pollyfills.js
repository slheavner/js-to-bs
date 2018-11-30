const formatParams = params => {
  return params.map(node => node.bs).join(', ')
}
const fills = {
  charAt: {
    bs: `
  function _charAt(str, index)
    return str.left(index+1).right(len(str) - index)
  end function
  `,
    test: node => {
      return (
        node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.bs === 'charAt'
      )
    },
    convert: node => {
      return `_charAt(${node.callee.object.bs}, ${formatParams(node.arguments)})`
    },
  },
  charCodeAt: {
    bs: `
  function _charAt(str, index)
    return asc(str.left(index+1).right(len(str) - index))
  end function
  `,
    test: node => {
      return (
        node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.bs === 'charCodeAt'
      )
    },
    convert: node => {
      return `_charCodeAt(${node.callee.object.bs}, ${formatParams(node.arguments)})`
    },
  },
  concat: {
    bs: `
    function _concat(str, args)
      for each c in args
        str = str + c
      end for
      return str
    end function
  `,
    test: node => {
      return (
        node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.bs === 'concat'
      )
    },
    convert: node => {
      return `_concat(${node.callee.object.bs}, [${formatParams(node.arguments)}])`
    },
  },
  endsWith: {
    bs: `
    function _endsWith(str, e) 
      return e = str.right(len(str) - len(e))
    end function
    `,
    test: node => {
      return (
        node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.bs === 'endsWith'
      )
    },
    convert: node => {
      return `_endsWith(${node.callee.object.bs}, ${formatParams(node.arguments)})`
    },
  },
  includes: {
    bs: `
    function _includes(str, include, position = 0)
      return instr(position, str, include) > 0
    end function
    `,
    test: node => {
      return (
        node.type === 'CallExpression' &&
        node.callee.property &&
        node.callee.property.bs === 'includes'
      )
    },
    convert: node => {
      return `_includes(${node.callee.object.bs}, ${formatParams(node.arguments)})`
    },
  },
}

module.exports = {
  has: node => {
    let k = null
    Object.keys(fills).forEach(key => {
      if (fills[key].test(node)) {
        k = key
      }
    })
    return k
  },
  ...fills,
}
