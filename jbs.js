const fs = require('fs-extra')
const converter = require('./index')
const klawSync = require('klaw-sync')
const path = require('path')

const brsInput = process.argv[2]

const isDir = fs.lstatSync(brsInput).isDirectory()

if (isDir) {
  const walkOptions = {
    traverseAll: true,
    filter: (item) => {
      return item.stats.isFile()
    }
  }
  const files = klawSync(brsInput, walkOptions)
  console.log(files.map(i => {
    return i.path.split('/').pop()
  }))
  fs.ensureDirSync('./out')
  files.forEach(f => {
    const subPath = path.join(process.cwd(), 'out', path.relative(brsInput, f.path))
    fs.ensureDirSync(path.dirname(subPath))
    if (f.path.endsWith('.js')) {
      converter.toBRS(fs.readFileSync(f.path, 'utf-8'), subPath.replace('.js', '.brs'))
    } else {
      fs.copyFileSync(f.path, subPath)
    }
  })


} else {
  converter.toBRS(brsInput)
}