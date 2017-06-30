/* eslint-env node */

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const strip = require('gulp-strip-comments');

/**
 * @param {String} error
 * @returns {undefined}
 */
const errorHandler = (error) => gutil.log(error.message);

gulp.task('build', [ 'lint' ], () => {
    const sources = [
        'userscript/meta.js',
        'src/utils.js',
        'src/resource.js',
        'src/resource.*.js',
        'src/ui.js',
        'src/storage.js',
        'src/storage.*.js',
        'src/hero.js',
        'src/stream.js',
        'src/player.js',
        'src/streamcleaner.js',
        'src/init.js',
    ];

    return gulp.src(sources)
        .pipe(plumber({ errorHandler }))
        .pipe(concat('soundcloud-stream-cleaner.user.js'))
        .pipe(babel({ presets: [ 'es2015' ], plugins: [ 'array-includes', 'transform-remove-strict-mode' ] }))
        .pipe(strip({
            safe: true,
            ignore: /(\/\*\*\s*\n([^\*]*(\*[^\/])?)*\*\/|\/\/\s==UserScript==(.|\n)*?\/\/\s==\/UserScript==)/g,
            trim: true
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('serve', () => {
    connect.server({
        root: 'dist',
        livereload: false,
        host: '127.0.0.1',
        port: 9090,
    });
});

gulp.task('lint', () => {
    return gulp.src('src/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('clean', () => {
    return del([ 'dist/*' ]);
});

gulp.task('watch', [ 'build' ], () => {
    gulp.watch('src/*.js', [ 'build' ]);
});

gulp.task('default', [ 'build' ]);
