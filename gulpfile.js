const src = 'src'
const dist = 'dist'

const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const replaceExt = require('replace-ext')
const requireNpm = require('./gulp/plugins/require-npm')
const webpack = require('webpack-stream')
const npmModules = {}
const getEntries = () => {
  let pkg = null
  try {
    pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  } catch(e) {
    console.error('package.json dependencies parse error.')
    pkg = { dependencies: deps}
  }
  return Object.keys(pkg.dependencies)
    .reduce((entry, dep) => {
      entry[dep] = dep
      return entry
    }, {})
}

let deps = Object.assign({}, getEntries())

const onDel = (vinyl) => {
  if (vinyl.event === 'unlink') {
    const distFilePath = path.resolve(dist, vinyl.relative)
    del.sync(distFilePath)
  }
}

gulp.task('watch:script', () => 
  gulp.src('src/**/*.js')
    .pipe($.watch('src/**/*.js', onDel))
    .pipe($.plumber())
    .pipe($.babel({
      presets: ['env', 'stage-2']
    }))
    .pipe(requireNpm())
    .pipe(gulp.dest('dist'))
)

gulp.task('watch:less', _ => 
  gulp.src('src/**/*.less')
    .pipe($.watch('src/**/*.less', onDel))
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.rename({ extname: '.wxss' }))
    .pipe(gulp.dest('dist'))
)

gulp.task('watch:others', () =>
  gulp.src(['src/**/*.json', 'src/**/*.wxml', 'src/**/*.wxss'])
    .pipe($.watch(['src/**/*.json', 'src/**/*.wxml', 'src/**/*.wxss'], onDel))
    .pipe(gulp.dest('dist'))
)

gulp.task('webpack', () => 
  gulp.src([])
    .pipe(webpack({
      entry: getEntries(),
      output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
      }
    }))
    .pipe(gulp.dest('dist/npm'))
)

gulp.task('watch:webpack', ['webpack'], () => {
  return $.watch('package.json', () => {
    const entries = getEntries()
    let shouldReRun = false
    Object.keys(entries).forEach(key => {
      if (!(key in deps)) {
        shouldReRun = true
        deps[key] = key
      }
    })
    if (shouldReRun) {
      gulp.run('webpack')
    }
  })
})

gulp.task('watch', ['watch:script', 'watch:less', 'watch:others', 'watch:webpack'])

gulp.task('default', ['watch'])