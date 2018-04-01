const path = require('path')
const through = require('through2')
const PluginError = require('plugin-error')
const config = require('../config')

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      return cb(new PluginError('gulp-require-npm', 'Streaming not supported'))
    }
    if (file.isBuffer()) {
      let contents = file.contents.toString()
      contents = contents.replace(/require\(['"]([\w\d_\-\.\/@]+)['"]\)/ig, (match, lib) => {
        if (lib && lib[0] !== '/' && lib[0] !== '.') {
          const { cwd } = file
          const slashIndex = file.relative.lastIndexOf(path.sep)
          const relative = slashIndex > -1 ? file.relative.slice(0, slashIndex) : path.sep
          const npmPath = path.join(cwd, config.dist, config.npm)
          const filePath = path.join(cwd, config.dist, relative)
          let relativePath = path.relative(filePath, npmPath)
          if (relativePath[0] !== '.' || relativePath[0] !== path.sep) relativePath = `.${path.sep}${relativePath}`
          return `require('${relativePath}/${lib}')`
        }
        return `require('${lib}')`
      })
      file.contents =  new Buffer(contents)
      cb(null, file)
    }
  })
}