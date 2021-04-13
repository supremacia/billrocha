/* GATEWAY
   ----------------------------------------------------------------------------
 * Gate static object
 * 
 * Usage:
 * 
 * First, start the GATE static object
 * 		GATE.init(Page.Home, Page.Login, null, null, null, null, report, glass)
 * 
 * If successful, call the home page (external function "homePage"). 
 * Otherwise, it calls the LOGIN page.
 * 
 * 		GATE.login('your login', 'your password') -> 
 * 		GATE.logout() -> to clear access data (logout)
 * 
 * Simple GET/POST method using fetch.
 * "Callback" receives the error and the resulting data [callback (error, data)].
 * 
 * 		GATE.get(url, callback)
 * 		GATE.post(url, data, callback)
 * 
 */
const GATE = {
	// Application
	app_id: APP_ID,
	app_version: APP_VERSION,

	// Server api url
	keyUrl: API + '/key',
	authUrl: API + '/auth',
	gateUrl: API + '/gate',
	serviceUrl: API + '/service',

	// Check token settings
	controller: 'Gate',
	logoutAction: 'Logout',

	// Persistence settings
	configUrl: Config.app.domain + '/config',
	id: 0,
	name: '',
	rsa: '',
	token: '',
	ukey: '',
	geo: '',

	// Subscribe array data
	subData: {
		initError: [],
		initTokenError: [],
		initTokenValid: [],

		// Login
		loginKeyError: [],
		loginPublicError: [],
		loginError: [],
		loginSuccess: [],
		logout: [],
		reset: [],

		// Gate
		gateBeforeSend: [],
		gateAfterSend: [],
		gateError: [],
		gateSuccess: []
	},

	init: (configUrl, keyUrl, authUrl, gateUrl) => {
		if (configUrl) GATE.configUrl = configUrl
		if (keyUrl) GATE.keyUrl = keyUrl
		if (authUrl) GATE.authUrl = authUrl
		if (gateUrl) GATE.gateUrl = gateUrl

		// Carregando configuração do Cache Storage
		GATE.load((e, data) => {

			GATE.id = data.id || 0
			GATE.token = data.token || UTIL.rpass(14)
			GATE.ukey = data.ukey || UTIL.rpass()

			if (PATHNAME[0]) {
				if (PATHNAME[0] == 'v') return AUTH.verification(PATHNAME[1])
				if (PATHNAME[0] == 's') return AUTH.password(PATHNAME[1])
				if (PATHNAME[0] == 'u') {
					GATE.token = PATHNAME[1].slice(0, 14)
					GATE.ukey = PATHNAME[1].slice(14)
				}
			}
			GATE.bootCheck()
		})
	},

	// Check if logged 
	//			BY token/ukey 
	// 		 	OR a session (social network login)
	bootCheck: () => {
		GATE.service({ type: 'CheckLogin' }, (e, res) => {
			if (e) return Event.trigger('initTokenError')
			return Event.trigger('initTokenValid')
		})
	},

	login: (login, passw) => GATE.service({
		login: login,
		passw: passw,
		type: 'Login'
	}, (e, res) => {
		if (e) return Event.trigger('loginError')
		return Event.trigger('loginSuccess', { id: GATE.id, name: GATE.name })
	}),

	logout: () =>
		GATE.gate(GATE.controller, GATE.logoutAction, { id: GATE.id }, () =>
			GATE.reset()),

	// Clear local data (logout)
	reset: () => {
		GATE.rsa = ''
		GATE.id = 0
		GATE.name = ''
		GATE.ukey = UTIL.rpass()
		GATE.token = false

		// Save (clear config file)
		GATE.save(() => {
			Event.trigger('reset')
		})
	},

	// Obtém a chave pública do servidor
	getPublicKey: cb =>
		GATE.get(GATE.keyUrl, (e, key) => {
			var error = () => {
				GATE.rsa = ''
				return cb ? cb(true) : null
			}
			if (e) return error()

			var pk = key.replace(/\s|\n|\r|\n\r/g)
			if (pk.length < 50) return error()

			GATE.rsa = pk
			return cb ? cb(GATE.rsa) : null
		}),

	// External Services
	service: (data, cb) => {
		data['ukey'] = GATE.ukey
		data['geo'] = GATE.geo
		data['token'] = GATE.token
		data['api_id'] = GATE.app_id
		data['api_version'] = GATE.app_version

		GATE.getPublicKey(rsa => {
			SHOW.glass(true) // bloqueia a tela
			data = RSA.encrypt(JSON.stringify(data), RSA.getPublicKey(GATE.rsa))

			GATE.post(GATE.serviceUrl, data, (e, res) => {
				SHOW.glass(false)// libera a tela
				if (e) return cb(e, res)
				GATE.sync(res, cb)
			})
		})
	},

	// Gateway to server api
	gate: (controller, action, param, cb) => {
		// Formatting ...
		var dt = {
			error: false,
			app: GATE.app_id,
			version: GATE.app_version,

			id: GATE.id,
			ukey: GATE.ukey,
			token: GATE.token,

			controller: controller,
			action: action,
			param: param
		}

		// Encrypting with AES ...
		var encData = AES.encrypt(JSON.stringify(dt), GATE.ukey)
		encData = GATE.token + encData

		// close the glass
		Event.trigger('gateBeforeSend')

		GATE.post(GATE.gateUrl, encData, (e, res) => {
			// Se action for Logout, sai sem rodar Sync
			if (action == GATE.logoutAction) {
				GATE.reset()
				return Event.trigger('logout', { e, res })
			}
			Event.trigger('gateAfterSend') // open the glass

			if (e) {
				Event.trigger('gateError')
				return cb(true, res)
			}

			// Checking the synchronization with the server (encryption = ok)
			GATE.sync(res, cb)
		})
	},

	// Checking the synchronization ...
	sync: (res, cb) => {
		try {
			var res = JSON.parse(res)
		} catch (e) { }
		// OLD: .replace(/\\u002B/g, '+')
		// OBS: para o netcore que manda aspas indesejadas e codificação em UTF-8 :P
		//res = res.replace(/"/g, '').replace(/\\u([\d\w]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))

		if ('undefined' != typeof res['error']) {
			GATE.reset()
			return cb(true, res.data)
		}

		var data = false

		// Decrypting ...
		try {
			var dec = AES.decrypt(res, GATE.ukey)
			data = JSON.parse(dec)

			if (data.user.id) GATE.id = data.user.id
			if (data.user.name) GATE.name = data.user.name
			if (data.user.ukey) GATE.ukey = data.user.ukey
			if (data.user.token) GATE.token = data.user.token

			//console.log('Sync', data)

			// Save in Cache Storage
			return GATE.save(e => cb(e, data.data))
		} catch (e) {
			GATE.reset()
			return cb(true, e)
		}
	},

	// Save configurations in fakefile
	save: cb => GATE.post(GATE.configUrl,
		JSON.stringify({
			id: GATE.id,
			name: GATE.name,
			token: GATE.token,
			ukey: GATE.ukey
		}), cb),

	// Load configurations from fakefile
	load: cb =>
		GATE.get(GATE.configUrl, (e, d) => {
			if (e !== false) cb(true, {})
			var data = {}
			try {
				data = JSON.parse(d)
			} catch (x) { }
			return cb(e, data)
		}),

	// Send a HTTP GET
	get: (url, cb) => {
		fetch(url, {
			method: 'GET',
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		})
			.then(response => response.text())
			.then(res => cb(false, res))
			.catch(error => cb(true, error))
	},

	// Send a HTTP POST
	post: (url, data, cb) => {
		fetch(url, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				Pragma: 'no-cache',
				'Cache-Control': 'no-cache'
			},
			body: data
		})
			.then(response => response.text())
			.then(res => cb(false, res))
			.catch(error => cb(true, error))
	},


	xpost: (url, data, cb) => {
		fetch(url, {
			method: 'POST',
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body: data
		})
			.then(response => response.text())
			.then(res => cb(false, res))
			.catch(error => cb(true, error))
	},
}
