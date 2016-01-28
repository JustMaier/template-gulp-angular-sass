// Load plugins
var 
	gulp 			= require('gulp')
,	plumber 		= require('gulp-plumber')
,	filter 			= require('gulp-filter')
,	rename 			= require('gulp-rename')
,	replace 		= require('gulp-replace')
,	concat          = require('gulp-concat')
,	uglify          = require('gulp-uglify')
,	minifyCss       = require('gulp-minify-css')
,	inject       	= require('gulp-inject')
,	copy       		= require('gulp-copy')
,	templateCache   = require('gulp-angular-templatecache')
,	sass            = require('gulp-sass')
,	autoprefixer    = require('gulp-autoprefixer')
,	sourcemaps      = require('gulp-sourcemaps')
,	notify      	= require('gulp-notify')
,	livereload      = require('gulp-livereload')
,	webserver		= require('gulp-webserver')
,	del      		= require('del')
;

// Path Config
var src = {
	js: 'js/app/',
	vendor: 'js/lib/',
	mock: 'js/mock/',
	sass: 'scss/'
},
dest = {
	js: 'js/min/',
	css: 'css/',
	maps: '../maps/',
	file: 'app'
},
dist = {
	images: 'images/',
	fonts: 'fonts/',
	css: 'css/'
}


// Task Helper
gulp.taskSet = function (name, fn, sets) {
	var setupTask = function (files, setName) {
		var taskName = name + '-' + setName;
		gulp.task(taskName, function () {
			return fn(files, setName);
		});
		return taskName
	}

	var allTasks = [];
	for (var setName in sets) {
		allTasks.push(setupTask(sets[setName], setName));
	};
	gulp.task(name, allTasks, function () { });
}

gulp.taskSet('js', function(files, setName){
	var stream = gulp.src(files)
		.pipe(plumber({errorHandler: notify.onError({
			title: 'Error compiling JS',
			message: 'Error: <%= error.message %>'
		})}))
		.pipe(sourcemaps.init())
		.pipe(concat(setName+'.js'))
		.pipe(sourcemaps.write('../'+dest.maps))
		.pipe(gulp.dest(dest.js))
		.pipe(filter(['*.js']))
		.pipe(livereload())
		.pipe(notify({ title: 'Successfully compiled JS', message: 'Created <%= file.relative %>', onLast:true }));

	return stream;
}, {
	app: [
		src.js+'app.js'
	,	src.js+'**/*.js'
	],
	vendor: [
		src.vendor+'*.js'
	],
	mock: [
		src.mock+"mock.js",
		src.mock+"**/*.js"
	]
});

gulp.taskSet('sass', function(files, setName){
	console.log(files, setName);
	var stream = gulp.src(files)
		.pipe(plumber({errorHandler: notify.onError({
			title: 'Error compiling SASS',
			message: 'Error: <%= error.message %>'
		})}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(autoprefixer('last 10 version'))
		.pipe(sourcemaps.write(dest.maps))
		.pipe(gulp.dest(dest.css))
		.pipe(filter(['*.css']))
		.pipe(livereload())
		.pipe(notify({ title: 'Successfully compiled SASS', message: 'Created <%= file.relative %>', onLast:true }));

	return stream;
}, {
	bootstrap: src.sass+'bootstrap.scss',
	site: src.sass + 'site.scss',
	email: src.sass + 'email.scss'
});

gulp.task('templates', function () {
	//templates.js
	var stream = gulp.src(src.js+'**/*.html')
		.pipe(plumber({errorHandler: notify.onError({
			title: 'Error compiling Templates',
			message: 'Error: <%= error.message %>'
		})}))
		.pipe(templateCache({
			root: '',
			standalone: true
		}))
		.pipe(gulp.dest(dest.js))
		.pipe(filter(['*.js']))
		.pipe(livereload())
		.pipe(notify({ title: 'Successfully compiled Templates', message: 'Created <%= file.relative %>', onLast:true }));

	return stream;
});

gulp.task('webserver', function() {
	gulp.src('./')
		.pipe(webserver({
			port: 1227,
			open: true
		}));
});

gulp.task('watch', ['sass', 'js', 'templates', 'webserver'], function() {
	livereload.listen();

	gulp.watch([
		src.sass+'site.scss'
	,	src.sass+'site/**/*.scss'
	], ['sass-site']);
	gulp.watch([
		src.sass+'bootstrap.scss'
	,	src.sass+'bootstrap/**/*.scss'
	], ['sass-bootstrap']);
	gulp.watch(src.js+'**/*.js', ['js-app']);
	gulp.watch(src.js+'**/*.html', ['templates']);
	gulp.watch(src.vendor + '**/*.js', ['js-vendor']);
	gulp.watch(src.mock + '**/*.js', ['js-mock']);

	gulp.watch('index.html').on('change', livereload.changed);
});

gulp.task('clean', function(cb){
	del(['dist/**/*'], cb);
})

gulp.task('build', ['sass', 'js', 'templates'], function(){
	//js files
	gulp.src([
		dest.js+'vendor.js'
	,	dest.js+'templates.js'
	,	dest.js+'app.js'
	])
	.pipe(concat(dest.file+'.js'))
	.pipe(uglify())
	.pipe(replace(/\\?'?images\/([\{\w\-\.\}]+)\\?'?/g, dist.images+'$1'))
	.pipe(replace(',"mock"', ''))
	.pipe(gulp.dest('dist/js/'));

	//css files
	gulp.src([
		dest.css+'bootstrap.css'
	,	dest.css+'site.css'
	])
	.pipe(concat(dest.file+'.css'))
	.pipe(replace(/url\('?"?img\/([\w\.\-]+)'?"?\)/g, 'url(\''+dist.images+'$1\')'))
	.pipe(replace(/url\('?"?fonts\/([\w\.\-\#\?]+)'?"?\)/g, 'url(\''+dist.fonts+'$1\')'))
	.pipe(minifyCss())
	.pipe(gulp.dest('dist/css/'));

	//copying
	gulp.src('css/img/*').pipe(copy('dist/images/', {prefix: 2}));
	gulp.src('css/fonts/*').pipe(copy('dist/css/fonts/', {prefix: 2}));
	gulp.src('images/*').pipe(copy('dist/images/', {prefix: 1}));
	
	//index
	var injectsTransform = function(filePath, file){
		return file.contents.toString('utf8');
	}
	gulp.src('index.html')
		.pipe(inject(gulp.src(['injects/head.html']), {
			starttag: '<!-- inject:head:{{ext}} -->',
			transform: injectsTransform
		}))
		.pipe(inject(gulp.src(['injects/scripts.html']), {
			starttag: '<!-- inject:scripts:{{ext}} -->',
			transform: injectsTransform
		}))
		.pipe(inject(gulp.src(['injects/header.html']), {
			starttag: '<!-- inject:header:{{ext}} -->',
			transform: injectsTransform
		}))
		.pipe(inject(gulp.src(['injects/footer.html']), {
			starttag: '<!-- inject:footer:{{ext}} -->',
			transform: injectsTransform
		}))
		.pipe(rename(dest.file+'.html'))
		.pipe(gulp.dest('dist/'));
})