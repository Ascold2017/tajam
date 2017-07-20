
var     gulp           = require('gulp');
var		gutil          = require('gulp-util' );
var		scss           = require('gulp-sass');
var     notify         = require('gulp-notify');
var     plumber        = require('gulp-plumber');
var     sourcemaps     = require('gulp-sourcemaps');
var		browserSync    = require('browser-sync');
var		concat         = require('gulp-concat');
var		uglify         = require('gulp-uglify');
var		cleanCSS       = require('gulp-clean-css');
var		rename         = require('gulp-rename');
var		del            = require('del');
var		imagemin       = require('gulp-imagemin');
var		cache          = require('gulp-cache');
var		autoprefixer   = require('gulp-autoprefixer');
var		ftp            = require('vinyl-ftp');
var		rsync          = require('gulp-rsync');


// Скрипты проекта

gulp.task('common-js', function() {
	 gulp.src([
		'app/js/_main.js',
		])
    .pipe(plumber())
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/js/jquery-3.2.1.min.js',
        'app/js/slick.min.js',
        'app/js/jquery.slicknav.min.js',
        'app/js/jquery.fancybox.pack.js',
        'app/js/jquery.fancybox-buttons.js',
        'app/js/jquery.fancybox-media.js',
        'app/js/jquery.fancybox-thumbs.js',
        'app/js/wow.min.js',
        
		])
	.pipe(concat('scripts.min.js'))
	//.pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app/'
		},
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	}); 
});

gulp.task('sass', function() {
	 gulp.src('app/style.scss')
    .pipe(plumber())
	.pipe(scss())
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCSS().on("error", notify.onError())) // Опционально, закомментировать при отладке
	.pipe(gulp.dest('app/'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/**/*.scss', ['sass']);
	gulp.watch(['app/js/**/*.js', 'app/js/_main.js'], ['js']);
	gulp.watch('app/*.html').on('change', browserSync.reload); //Перезапуск browserSynс
});


gulp.task('build', ['removedist', 'sass', 'js'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/style.min.css',
		]).pipe(gulp.dest('dist/'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));
    
    var buildСommJs = gulp.src([
		'app/js/common.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));
    var buildImages = gulp.src([
        'app/images/**/*'
    ]).pipe(gulp.dest('dist/images'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});


gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
