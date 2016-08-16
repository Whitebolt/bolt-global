'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require("gulp-babel");
const embedTemplates = require('gulp-angular-embed-templates');

const jsBuildSources = (require('./package.json').jsBuildRoots || []).concat(['.']);

function flatten(arr) {
	return arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
}

function getJsBuildSources(sources) {
	return flatten(sources.map(
		source => require(source + '/package.json').srcRoots.map(
			buidItem => (source + '/' + buidItem)
		)
	));
}

gulp.task('sass', () => {
	gulp.src(['./src/scss/*.scss'])
		.pipe(sass({
			outputStyle: 'compressed',
			includePaths: ['./node_modules/foundation-sites/scss']
		}).on('error', gutil.log))
		.pipe(cleanCSS({
			advanced: true,
			keppSpecialComments: 0,
			restructuring: true
		}))
		.pipe(gulp.dest('./public/css'))
});

gulp.task('minify', () => {
	gulp.src(getJsBuildSources(jsBuildSources))
		.pipe(concat('admin.js'))
		.pipe(embedTemplates({basePath: __dirname + '/src/scripts/admin/'}))
		.pipe(gulp.dest('./public/scripts/'))
		.on('end', () => gulp.src(getJsBuildSources(jsBuildSources))
			.pipe(concat('admin.min.js'))
			.pipe(embedTemplates({basePath: __dirname + '/src/scripts/admin/'}))
			.pipe(babel())
			.pipe(uglify().on('error', gutil.log))
			.pipe(gulp.dest('./public/scripts/'))
		)
});