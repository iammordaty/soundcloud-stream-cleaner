/* eslint-env node */

const babel = require('gulp-babel');
const cleanCss = new (require('clean-css'));
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gutil = require('gulp-util');
const inject = require('gulp-inject');
const plumber = require('gulp-plumber');
const replace = require('gulp-replace');
const stripComments = require('gulp-strip-comments');

/**
 * @param {String} error
 * @returns {undefined}
 */
const errorHandler = (error) => gutil.log(error.message);

/**
 * @param {String} filePath
 * @returns {undefined}
 */
const injectStyles = (filePath) => {
    return inject(gulp.src(filePath), {
        starttag: '<!-- css:inject:start -->',
        endtag: '<!-- css:inject:end -->',
        removeTags: true,
        quiet: true,
        transform: (_, file) => cleanCss.minify(file.contents.toString('utf8')).styles
    })
};

gulp.task('build', [ 'lint' ], () => {
    const sources = [
        'userscript/meta.js',
        'src/utils.js',
        'src/resource.js',
        'src/storage.js',
        'src/storage.*.js',
        'src/hero.js',
        'src/stream.js',
        'src/player.js',
        'src/streamcleaner.js',
        'src/streamcleaner.*.js',
        'src/init.js',
    ];

    return gulp.src(sources)
        .pipe(plumber({ errorHandler }))
        .pipe(babel({ presets: [ 'es2015' ], plugins: [ 'array-includes', 'transform-remove-strict-mode', 'transform-merge-sibling-variables' ] }))
        .pipe(concat('soundcloud-stream-cleaner.user.js', { newLine: '\n\n' }))
        .pipe(replace('\n\n\n', '\n\n'))
        .pipe(injectStyles('src/streamcleaner.ui.css'))
        .pipe(stripComments({
            safe: true,
            ignore: /(\/\*\*\s*\n([^*]*(\*[^/])?)*\*\/|\/\/\s==UserScript==(.|\n)*?\/\/\s==\/UserScript==)/g,
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
