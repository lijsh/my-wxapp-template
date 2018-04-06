const gulp = require('gulp')
const runSequence = require('run-sequence');
const del = require('del')
const requireDir = require('require-dir')
requireDir('./gulp')

const tasks = ['script', 'less', 'wxss', 'wxml', 'json', 'webpack']
const makeTasks = (tasks, prefix) => tasks.map(task => `${prefix}:${task}`)

gulp.task('clean', () => del(['dist/*']))

gulp.task('watch', _ => runSequence('clean', makeTasks(tasks, 'watch')))

gulp.task('build', _ => runSequence('clean', makeTasks(tasks, 'build')))
