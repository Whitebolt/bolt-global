'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require("gulp-babel");

const scripts = [
	'./src/scripts/bootstrap.js'
];

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
	gulp.src(scripts)
		.pipe(concat('admin.js'))
		.pipe(gulp.dest('./public/scripts/'))
		.on('end', () => gulp.src(scripts)
			.pipe(concat('admin.min.js'))
			.pipe(babel())
			.pipe(uglify().on('error', gutil.log))
			.pipe(gulp.dest('./public/scripts/'))
		)
});