const common = require('./common')
const { dist, npm, helper: { requireNpmRegex, replaceNpm } } = common
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const webpackStream = require('webpack-stream')
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const getEntries = () => {
  let pkg = null
  try {
    pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  } catch (e) {
    console.error('package.json dependencies parse error.')
    pkg = {}
  }
  pkg.dependencies = pkg.dependencies || {}
  const depNames = Object.keys(pkg.dependencies)
  getEntries.deps = depNames.length > 0
  return depNames
    .reduce((entry, dep) => {
      entry[dep] = dep
      return entry
    }, {})
}

let deps = Object.assign({}, getEntries())

console.log(deps, getEntries.deps)

const onDel = (vinyl) => {
  if (vinyl.event === 'unlink') {
    const distFilePath = path.resolve(dist, vinyl.relative)
    del.sync(distFilePath)
  }
}

const isProd = process.env.NODE_ENV === 'production'

gulp.task('watch:script', _ =>
  gulp.src('src/**/*.js')
    .pipe($.watch('src/**/*.js', onDel))
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['env', 'stage-2']
    }))
    .pipe($.sourcemaps.write())
    .pipe($.replace(requireNpmRegex, replaceNpm))
    .pipe(gulp.dest(dist))
)

gulp.task('watch:less', _ =>
  gulp.src('src/**/*.less')
    .pipe($.watch('src/**/*.less', onDel))
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.sourcemaps.write())
    .pipe($.if(isProd, $.cssnano()))
    .pipe($.rename({ extname: '.wxss' }))
    .pipe(gulp.dest(dist))
)

gulp.task('watch:wxss', _ =>
  gulp.src('src/**/*.wxss')
    .pipe($.watch('src/**/*.wxss', onDel))
    .pipe(gulp.dest(dist))
)

gulp.task('watch:wxml', _ =>
  gulp.src('src/**/*.wxml')
    .pipe($.watch('src/**/*.wxml', onDel))
    .pipe(gulp.dest(dist))
)


gulp.task('watch:json', _ =>
  gulp.src('src/**/*.json')
    .pipe($.watch('src/**/*.json', onDel))
    .pipe(gulp.dest(dist))
)

gulp.task('watch:image', _ =>
  gulp.src(['src/**/*.{jpg,jpeg,png,gif,svg}'])
    .pipe($.watch(['src/**/*.{jpg,jpeg,png,gif,svg}'], onDel))
    .pipe(gulp.dest(dist))
)

gulp.task('webpack', _ =>
  getEntries.deps ? gulp.src([])
    .pipe(webpackStream({
      entry: getEntries(),
      output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
      },
      mode: 'production'
    }, webpack))
    .pipe(gulp.dest(`${dist}/${npm}`))
    : gulp.src([])
)

gulp.task('watch:webpack', ['webpack'], _ => {
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