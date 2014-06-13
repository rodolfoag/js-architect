var gulp = require('gulp'),
    notify = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    size = require('gulp-size'),
    imagemin = require('gulp-imagemin'),
    streamify = require('gulp-streamify');

// Task functions

function scripts (watch) {
    var bundler,
        file = './clientapp/scripts/app.js';

    if (watch) {
        bundler = watchify(file);
    } else {
        bundler = browserify(file);
    }

    function rebundle () {
        var stream = bundler.bundle()
            .pipe(source('bundle.js'))
            .pipe(streamify(size()))
            .pipe(gulp.dest('public'));

        if (watch) {
            return stream;
        } else {
            return stream.pipe(notify({ message: 'Scripts task complete' }));
        }
    }

    bundler.on('update', rebundle);

    return rebundle();
}

/**
 * TODO: the vendor scripts task should be incorporated into the scripts
 *       task, and be concatenated into the bundle script, generating only
 *       one script tag, avoiding http roundtrips.
 *       One way to do this is to add a task to look for changes on the bundle.js
 *       and vendor.js inside the public dir, and then create the final file
 *       from there.
 */
function vendorScripts () {
    return gulp.src('clientapp/scripts/lib/*.js')
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest('public'));
}

function watchVendorScripts () {
    gulp.watch('clientapp/scripts/lib/*.js', ['vendorScripts']);
}

function lintScripts () {
    return gulp.src(['clientapp/scripts/models/*.js',
                     'clientapp/scripts/pages/*.js',
                     'clientapp/scripts/views/*.js',
                     'clientapp/scripts/app.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
}

function watchLintScripts () {
    gulp.watch(['clientapp/scripts/models/*.js',
                'clientapp/scripts/pages/*.js',
                'clientapp/scripts/views/*.js',
                'clientapp/scripts/app.js'],
                ['lintScripts']);
}

function styles () {
    return gulp.src('clientapp/assets/styles/**/*.scss')
        .pipe(concat('styles.css'))
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1',
                           'ios 6', 'android 4' ))
        .pipe(minifycss())
        .pipe(size())
        .pipe(gulp.dest('public'))
        .pipe(notify({ message: 'Styles task complete' }));
}

function watchStyles () {
    gulp.watch('clientapp/assets/styles/**/*.scss', ['styles']);
}

function images () {
    return gulp.src('clientapp/assets/images/**/*')
        .pipe(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true }))
        .pipe(gulp.dest('public/images'))
        .pipe(notify({ message: 'Images task complete' }));
}

function watchImages () {
    gulp.watch('clientapp/assets/images/**/*', ['images']);
}


// Gulp tasks

gulp.task('clean', function () {
    return gulp.src(['public/**',], { read: false })
        .pipe(clean());
});

gulp.task('scripts', function () {
    return scripts(false);
});

gulp.task('watchScripts', function () {
    return scripts(true);
});

gulp.task('vendorScripts', function () {
    return vendorScripts();
});

gulp.task('watchVendorScripts', function () {
    return watchVendorScripts();
});

gulp.task('lintScripts', function () {
    return lintScripts();
});

gulp.task('watchLintScripts', function () {
    return watchLintScripts();
});

gulp.task('styles', function () {
    return styles();
});

gulp.task('watchStyles', function () {
    return watchStyles();
});

gulp.task('images', function () {
    return images();
});

gulp.task('watchImages', function () {
    return watchImages();
});

/**
 * Default task
 * Execute by using $ gulp.
 * The additional array with the clean task tells gulp to run clean as a
 * dependency, meaning, before the gulp.start gets execute. Taks in Gulp run
 * concurrently and have no order in which the'll finish. Gulp doesn't
 * recomend running tasks in the dependency array, but in this scenario to
 * ensure 'clean' fully completes, it seems the best option.
 */
gulp.task('default', ['clean'], function () {
    gulp.start('watchLintScripts', 'watchScripts', 'watchVendorScripts',
        'watchStyles', 'watchImages');
});
