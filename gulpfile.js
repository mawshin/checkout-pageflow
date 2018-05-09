var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var prefix = require('gulp-autoprefixer');
var cssmin = require('gulp-clean-css');
var concat = require("gulp-concat");
var uglify = require('gulp-uglify');
var postcss = require('gulp-postcss');
var reporter = require('postcss-reporter');
var syntax_scss = require('postcss-scss');
var stylelint = require('stylelint');
var newer = require('gulp-newer');
var del = require('del');
var path = require('path');
var merge = require('merge-stream');

/**
 * Launch the Server
 */
gulp.task('browser-sync', ['sync'], function () {
	browserSync.init(null, {
		// Change as required
		server: {
          baseDir: "./public/"
        }
	});
});

/**
 * Compile files from scss after lint
 */
gulp.task("scss-lint", function() {
  
  /**
   * SCSS stylelint
   * refer to article "http://www.creativenightly.com/2016/02/How-to-lint-your-css-with-stylelint/"
   * https://gist.github.com/KingScooty/fa4aab7852dd30feb573#file-gulpfile-js
   */

    // Stylelint config rules
    var stylelintConfig = {
        "rules": {
            "block-no-empty": true,
            "color-no-invalid-hex": true,
            "declaration-colon-space-after": "always",
            "declaration-colon-space-before": "never",
            "function-comma-space-after": "always",
            "function-url-quotes": "always",
            "media-feature-colon-space-after": "always",
            "media-feature-colon-space-before": "never",
            "media-feature-name-no-vendor-prefix": true,
            "max-empty-lines": 5,
            // "number-leading-zero": "never",
            "number-no-trailing-zeros": true,
            "property-no-vendor-prefix": true,
            // "declaration-block-no-duplicate-properties": true,
            "block-no-single-line": true,
            "declaration-block-trailing-semicolon": "always",
            "selector-list-comma-space-before": "never",
            // "selector-list-comma-newline-after": "always",
            // "selector-no-id": true,
            "string-quotes": "double",
            "value-no-vendor-prefix": true
        }
    }

    var processors = [
        stylelint(stylelintConfig),
        reporter({
            clearMessages: true
        })
    ];

    gulp.src(
    ['app/sass/*.scss', 'app/sass/**/*.scss',
    // Ignore linting vendor assets
    // Useful if you have bower components
    '!app/sass/_settings.scss', '!app/sass/_components.ie-specific.scss', '!app/sass/_shame.scss', '!app/sass/lib/*.scss', '!app/sass/vendor/**/*.scss']
    )
    .pipe(postcss(processors, {syntax: syntax_scss}));
});

/**
 * Compile files from scss
 */
gulp.task('css-concat', ['sass'], function () {
    gulp.src(['app/css/bootstrap.min.css', 'app/css/ie10-viewport-bug-workaround.css', 'app/css/styles.css'])
        .pipe(concat('global.css'))
        .pipe(gulp.dest('app/css/'));
});

gulp.task('sass', function () {
    var scssStream,
    cssStream;

    scssStream = gulp.src(['app/sass/styles.scss'])
    	.pipe(sourcemaps.init())
    	.pipe(sass({
    		includePaths: ['scss'],
    		onError: browserSync.notify
    	}))
    	.pipe(sourcemaps.write('./'))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
    	.pipe(gulp.dest('app/css/'));

    cssStream = gulp.src(['app/css/bootstrap.min.css', 'app/css/ie10-viewport-bug-workaround.css']);

    return merge(scssStream, cssStream)
        .pipe(concat('global.css'))
        .pipe(sourcemaps.init())
        .pipe(cssmin({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('app/css/'));
});

gulp.task('sass-prod', function () {
    return gulp.src(['app/sass/styles.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({
        	includePaths: ['scss']
        }))
        .pipe(sourcemaps.write())
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(cssmin({compatibility: 'ie8'}))
        .pipe(gulp.dest('app/css/'));
});

/**
 * Minify custom js scripts
 */
gulp.task('scripts', function () {
    return gulp.src(['app/js/lib/jquery-1.10.2.min.js', 'app/js/init.js'])
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('app/js/'));
});

gulp.task('scripts-prod', function () {
	return gulp.src('app/js/app.min.js')
		.pipe(uglify())
		//.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('public/js/'));
});

/**
 * Reload page when views change
 */
 gulp.task('views', ['sass'], function () {
   gulp.src(['app/css/styles.css'])
     .pipe(newer('public/css/'))
     .pipe(gulp.dest('public/css/'))
     .pipe(browserSync.reload({stream: true}));
 });

/**
 * Copies templates and assets from external modules and dirs
 */
// gulp.task('copy', function () {
//     return gulp.watch(['app/**', '!app/{sass,sass/**}'], function(obj){
// 	    if( obj.type === 'changed') {
// 		    gulp.src( obj.path, { "base": "app/"})
// 		    .pipe(gulp.dest('public/'));
// 		    .pipe(browserSync.reload({stream: true}));
// 	    }
//     });
// });

gulp.task('copy-files', function() {  
    gulp.src(['app/*', '!app/{sass,sass/**}'])
        .pipe(gulp.dest('public/'));
});

gulp.task('sync', function() {
	gulp.src(['app/**/*', '!app/{sass,sass/**}', '!app/js/{init.js,lib/**}'])
		.pipe(newer('public/'))
		.pipe(gulp.dest('public/'))
		.pipe(browserSync.reload({stream: true}));
		//console.log('Copy Done');
});

/**
 * Watch scss files for changes & recompile
 * Watch views folder for changes and reload BrowserSync
 */
gulp.task('watch', function () {
	gulp.watch(['app/sass/*.scss'], ['views']);
	gulp.watch(['app/js/**/*'], ['scripts']);
	//gulp.watch(['app/js/app.min.js'], ['sync']);
	gulp.watch(['app/images/*', 'app/images/**/*'], ['sync']);
	gulp.watch(['app/*.html'], ['sync']);
	//gulp.watch(['app/**/*', '!app/{sass,sass/**}'], ['sync']);

	var watcher = gulp.watch(['app/**/*', '!app/{sass,sass/**}', '!app/css/styles.css', '!app/css/global.css.map', '!app/js/init.js'], ['sync']);
	watcher.on('change', function(ev) {
         if(ev.type === 'deleted') {
         	/**
         	 * Sync up deleted files between 2 folder on harddisk
         	 * refer to article "https://fettblog.eu/gulp-recipes-part-2/#sync-directories-on-your-harddisk"
         	 */
         	
         	//console.log('file deleted');
         	//console.log(path.relative('./', ev.path).replace('app\\assets\\','public\\'));
 			del(path.relative('./', ev.path).replace('app\\assets\\','public\\'));
         }
    });
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the scripts, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('build', ['sass-prod', 'scripts-prod']);