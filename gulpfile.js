'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const gutil = require('gulp-util');

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