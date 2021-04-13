/*  
	By Bill Rocha <prbr@ymail.com>

	*** Este script requer o Babel & Gulp 4 ou posterior *** 
	Antes de usar, instale a última versão do GULP-CLI e os plugins necessários:

	npm i --save-dev @babel/cli @babel/core @babel/polyfill @babel/preset-env @babel/register
	npm i --save-dev gulp@4 gulp-autoprefixer gulp-clean-css gulp-concat gulp-html-minifier2 gulp-if gulp-watch gulp-babel
	npm i --save-dev gulp-javascript-obfuscator gulp-sass gulp-uglify uglify-es del yargs

	adicione essas linhas no seu package.js

	"babel": {
		"presets": [ "@babel/preset-env"]
	},

 */

'use strict'

import { exec, spawn } from 'child_process'
import { gulp, series, parallel, src, dest } from 'gulp'
import babel from 'gulp-babel'
import gulpif from 'gulp-if'
import minifyCSS from 'gulp-clean-css'
import htmlmin from 'gulp-html-minifier2'
import concat from 'gulp-concat'
import header from 'gulp-header'
import yargs from 'yargs'
import javascriptObfuscator from 'gulp-javascript-obfuscator'
import uglifyes from 'uglify-es'
import composer from 'gulp-uglify/composer'
import path from 'path'
import del from 'del'
import imagemin from 'gulp-imagemin'
import sftp from 'gulp-sftp-up4'

const uglify = composer(uglifyes, console)
const argv = yargs.argv

// args
let PRO = argv.p !== undefined // gulp -p (production mode)
let OBF = (argv.o || false) && PRO // gulp -o (obfuscator)
let BABEL = argv.b !== undefined // gulp -b (to run Babel)

// show config
console.log(
	'\n---------------------------------------------------\n    ' +
	(!PRO ? "DEVELOPMENT mode ['gulp -p' to production]" : 'PRODUCTION mode') +
	'\n---------------------------------------------------\n'
)

// HTML  ------------------------------------------------------------------------------------------
const html_compress = (files, output, destination = false) =>
	src(files)
		.pipe(concat(output))
		.pipe(
			gulpif(
				PRO,
				htmlmin({
					collapseWhitespace: true,
					removeComments: true,
					removeEmptyAttributes: true
				})
			)
		)
		.pipe(dest(destination ? destination : 'public'))

// ---------------------------------------------------------------------------------- [ HTML ]
const html = () => {
	return html_compress(
		[
			'dev/html/inc/header.html',
			'dev/html/home.html',
			'dev/html/inc/footer.html'
		],
		'dev/index.html',
		'/'
	)
}

// ---------------------------------------------------------------------------------- [ STYLE ]
const style = () =>
	streamqueue(
		{ objectMode: true },
		src([
			'dev/css/part/font.css',
			'dev/css/part/reset.css',
			'dev/css/theme/default.css',

			'dev/css/part/page.css',
			'dev/css/part/menu.css'
		])
	)
		.pipe(concat('style.css'))
		.pipe(gulpif(PRO, minifyCSS({ level: { 1: { specialComments: 0 } } })))
		.pipe(dest('dev/css'))

// ---------------------------------------------------------------------------------- [ JS ]
const js = cb =>
	src([
		'dev/js/part/event.js',
		'dev/js/part/page.js',
		'dev/js/part/menu.js',
		'dev/js/part/sw.js',

		'dev/js/config.js',
		'dev/js/main.js'
	])
		.pipe(gulpif(BABEL, babel()))
		.pipe(concat('script.js'))
		.pipe(gulpif(PRO, uglify()))
		.pipe(gulpif(OBF, javascriptObfuscator({ compact: true, sourceMap: false })))
		.pipe(dest('dev/js'))


// ---------------------------------------------------------------------------------- [ SERVICE WORK ]
const sw = () => {
	let VERSION = 'const VERSION="' + new Date().getTime() + '";\r'

	return src(['dev/js/sw.js'])
		.pipe(gulpif(BABEL, babel()))
		.pipe(concat('sw.js'))
		.pipe(header(VERSION))
		.pipe(gulpif(PRO, uglify()))
		.pipe(gulpif(OBF, javascriptObfuscator({ compact: true, sourceMap: false })))
		.pipe(dest('dev'))
}



const vendor = () =>
	src(['node_modules/socket.io-client/dist/socket.io.js'])
		.pipe(dest('public/js/src/lib'))


/* TASKs ----------------------------------------------------------- [TASKs]*/
exports.default = html
exports.all = parallel(html, style, js, sw)
exports.vendor = vendor


/**
 * TODO:
 *
 * 		1 - criar minimização do CSS e JS
 * 		2 - opção de arquivo CSS/JS externo ou integrado no index.html??
 * 		3 - criar Service Worker e cache local
 * 		4 - modificar o design para acrescentar currículo e blog(?!)
 *
 */