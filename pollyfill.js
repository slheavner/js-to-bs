const formatParams = params => {
  return params.map(node => node.bs).join(', ')
}

exports.charAt = {
  bs: `
    function _charAt(str, index)
      return str.left(index).right(index)
    end function
    `,
  convert: node => {
    return `_charAt(${node.callee.object.bs}, ${formatParams(node.arguments)})`
  },
}
