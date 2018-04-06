const dist = 'dist'
const src = 'src'
const npm = 'npm'
const path = require('path')

module.exports = {
  src,
  dist,
  npm,
  helper: {
    replaceNpm(match, lib) {
      if (lib && lib[0] !== '/' && lib[0] !== '.') {
        const { file } = this
        const { cwd } = file
        const slashIndex = file.relative.lastIndexOf(path.sep)
        const relative = slashIndex > -1 ? file.relative.slice(0, slashIndex) : path.sep
        const npmPath = path.join(cwd, dist, npm)
        const filePath = path.join(cwd, dist, relative)
        let relativePath = path.relative(filePath, npmPath)
        if (relativePath[0] !== '.' || relativePath[0] !== path.sep) relativePath = `.${path.sep}${relativePath}`
        return `require('${relativePath}/${lib}')`
      }
      return `require('${lib}')`
    },
    requireNpmRegex: /require\(['"]([\w\d_\-\.\/@]+)['"]\)/ig
  }
}