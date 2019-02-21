const path = require('path')
const watch = require('gulp-watch')
const newer = require('gulp-newer')
const plumber = require('gulp-plumber')
const babel = require('gulp-babel')
const gulpSequence = require('gulp-sequence')
const gutil = require('gulp-util')
const through = require('through2')
const gulp = require('gulp')
const chalk = require('chalk')
const clean = require('gulp-clean')

const scripts = ['./packages/*/src/**/*.js']

const dest = 'packages'

var srcEx, libFragment

if (path.win32 === path) {
  srcEx = /(packages\\[^\\]+)\\src\\/
  libFragment = '$1\\lib\\'
} else {
  srcEx = new RegExp('(packages/[^/]+)/src/')
  libFragment = '$1/lib/'
}

const mapToDest = path => path.replace(srcEx, libFragment)

const filelog = title => {
  return through.obj((file, enc, callback) => {
    file.path = file.path.replace(srcEx, libFragment)
    gutil.log(title, "'" + chalk.cyan(path.relative(process.cwd(), file.path)))
    callback(null, file)
  })
}

gulp.task('clean', () =>
  gulp.src('packages/*/lib', { read: false }).pipe(clean())
)

gulp.task('build', ['clean'], () => {
  return gulp
    .src(scripts)
    .pipe(
      plumber({
        errorHandler (err) {
          gutil.log(err.message + '\r\n' + err.codeFrame)
        },
      })
    )
    .pipe(newer({ map: mapToDest }))
    .pipe(filelog('Compile'))
    .pipe(babel())
    .pipe(gulp.dest(dest))
})

gulp.task('build-watch', () => {
  return gulp
    .src(scripts)
    .pipe(
      plumber({
        errorHandler (err) {
          gutil.log(err.message + '\r\n' + err.codeFrame)
        },
      })
    )
    .pipe(
      through.obj(function (file, enc, callback) {
        file._path = file.path
        file.path = file.path.replace(srcEx, libFragment)
        callback(null, file)
      })
    )
    .pipe(newer(dest))
    .pipe(filelog('Compile'))
    .pipe(babel())
    .pipe(gulp.dest(dest))
})

gulp.task('default', ['build'])
gulp.task('watch', callback => {
  gulpSequence('clean', 'build-watch')(callback)
  watch(scripts, { debounceDelay: 200 }, () => gulp.start('build-watch'))
})
