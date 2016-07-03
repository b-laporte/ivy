// originally from https://gist.github.com/Fishrock123/8ea81dad3197c2f84366

var PATH = {
    test: "./test/app.js",
    html: './test/**/*.html',
    jasmine: [
        'node_modules/jasmine-core/lib/jasmine-core/boot.js',
        'node_modules/jasmine-core/lib/jasmine-core/jasmine.css',
        'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
        'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
        'node_modules/jasmine-core/lib/jasmine-core/json2js.js'
    ]
};
var BABEL_OPTIONS = {
    extensions: [".js"],
    presets: ["es2015", "stage-1"],
    "plugins": [
        ["transform-decorators-legacy"]
    ]
};
var gulp = require('gulp');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var merge = require('utils-merge');

var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');


/* nicer browserify errors */
var gutil = require('gulp-util');
var chalk = require('chalk');

function map_error(err) {
    if (err.fileName) {
        // regular error
        gutil.log(chalk.red(err.name)
            + ': '
            + chalk.yellow(err.fileName.replace(__dirname + '/src/', ''))
            + ': '
            + 'Line '
            + chalk.magenta(err.lineNumber)
            + ' & '
            + 'Column '
            + chalk.magenta(err.columnNumber || err.column)
            + ': '
            + chalk.blue(err.description));
    } else {
        // browserify error..
        gutil.log(chalk.red(err.name)
            + ': '
            + chalk.yellow(err.message));
    }

    this.emit('end');
}
/* */

gulp.task('watchify', ['html'], function () {
    var args = merge(watchify.args, { debug: true });
    var bundler = watchify(browserify(PATH.test, args)).transform(babelify, BABEL_OPTIONS);
    bundle_js(bundler);

    bundler.on('update', function () {
        bundle_js(bundler);
    })
})

function bundle_js(bundler) {
    return bundler.bundle()
        .on('error', map_error)
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'))
        .pipe(rename('app.min.js'))
        .pipe(sourcemaps.init({ loadMaps: true }))
        // capture sourcemaps from transforms
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
}

// Without watchify
gulp.task('browserify', function () {
    var bundler = browserify(PATH.test, { debug: true }).transform(babelify, BABEL_OPTIONS);

    return bundle_js(bundler)
});

// Without sourcemaps
gulp.task('browserify-production', function () {
    var bundler = browserify(PATH.test).transform(babelify, BABEL_OPTIONS)

    return bundler.bundle()
        .on('error', map_error)
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
});

gulp.task('clean', function (done) {
    var del = require('del');
    return del(['dist'], done);
});

gulp.task('jasmine', ['clean'] , function () {
    return gulp.src(PATH.jasmine).pipe(gulp.dest('dist/jasmine'));
});

gulp.task('html', ['jasmine'], function () {
    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');

    var port = 9000, app;
    app = connect().use(serveStatic(__dirname + '/dist'));  // serve everything that is static
    http.createServer(app).listen(port, function () {
        open('http://localhost:' + port + '/');
    });

    return gulp.src(PATH.html).pipe(gulp.dest('dist'));
});

gulp.task('play', ['watchify'], function () {});

// dbmon build

gulp.task('dbmon', function () {
    var bundler = browserify("./samples/dbmon/app.js").transform(babelify, BABEL_OPTIONS)

    return bundler.bundle()
        .on('error', map_error)
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(rename('dbmon.min.js')) //.pipe(uglify())
        .pipe(gulp.dest('dist'))
});