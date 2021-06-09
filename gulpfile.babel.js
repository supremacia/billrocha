/*  
	By Bill Rocha <prbr@ymail.com>

	*** Este script requer o Babel & Gulp 4 ou posterior *** 
	Antes de usar, instale a última versão do GULP-CLI e os plugins necessários:

	npm i --save-dev @babel/cli @babel/core @babel/polyfill @babel/preset-env @babel/register
	npm i --save-dev gulp@4 gulp-autoprefixer gulp-clean-css gulp-concat gulp-html-minifier2 gulp-if gulp-babel
	npm i --save-dev gulp-javascript-obfuscator gulp-uglify uglify-es del yargs image-to-base64 gulp-header gulp-imagemin streamqueue gulp-replace gulp-img2b64

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
import streamqueue from 'streamqueue'
import b64 from 'gulp-img2b64'

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
			'dev/index.html'
		],
		'index.min.html',
		'dev/html'
	)
}

// ---------------------------------------------------------------------------------- [ STYLE ]
const style = () =>
	streamqueue(
		{ objectMode: true },
		src([
			'dev/css/style.css'
		])
	)
		.pipe(concat('style.min.css'))
		.pipe(gulpif(PRO, minifyCSS({ level: { 1: { specialComments: 0 } } })))
		.pipe(dest('dev/css'))

// ---------------------------------------------------------------------------------- [ JS ]
const js = () =>
	src([
		'dev/js/main.js'
	])
		.pipe(gulpif(BABEL, babel()))
		.pipe(concat('script.min.js'))
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

// ---------------------------------------------------------------------------------- [ STYLE ]
const image = cb =>
	src('dev/img/*')
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(b64())
		.pipe(dest('dev/img/b64'))


/* TASKs ----------------------------------------------------------- [TASKs]*/
exports.default = html
exports.all = parallel(html, style, js, sw)

exports.style = style
exports.html = html
exports.js = js
exports.image = image

/**
 * PROCESSO:
 *
 * 		1 - Minimiza JS		--> ./_tmp/main.js
 * 			Minimiza CSS	--> ./_tmp/style.css
 * 			Minimiza HTML	--> ./_tmp/index.html
 *
 * 		2 - Minimiza imagens		--> ./_tmp/img/*.(jpg|png)
 * 			Converte para base64	--> ./_tmp/img/*.b64
 *
 * 		3 - Carrega ./_tmp/index.html como uma string e faz replaces:
 * 			Add IMGs (*.b64) no ./_tmp/style.css
 * 			Add  ./_tmp/style.css (<style>)
 * 			Add  ./_tmp/main.js (<script>)
 *
 * 		4 - Salva ./public/index.html
 * 			Limpa a pasta de trabalho (del ./_temp)
 */

/**
 * TODO:
 *
 * 		gulp-replace -> https://www.npmjs.com/package/gulp-replace
 *
 * 		1 - criar minimização do CSS e JS
 * 		2 - opção de arquivo CSS/JS externo ou integrado no index.html??
 * 		3 - criar Service Worker e cache local
 * 		4 - modificar o design para acrescentar currículo e blog(?!)
 *
 */