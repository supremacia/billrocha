/**
 * SWORKER ----------------------------------------------------------- BEGIN
 */

const SWORKER = {
	key_url: '/msg/push',
	geo_url: '/profile/geo',
	SW: null,
	serverPushKey: false,
	geoLocationId: false,
	latitude: 0,
	longitude: 0,
	pushdata: [],

	init: () => {
		console.log('SWORKER INIT')
		//Instalando o Service Worker
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', function (event) {
				console.log('SWMessage:', event.data)
				SWORKER.pushdata.push(event.data)
			})

			navigator.serviceWorker.register(location.origin + '/sw.js', {scope: '/'}).then(sw => (SWORKER.SW = sw))

			return true
		} else {
			report(
				'Seu navegador não suporta essa aplicação.<b>Atualize seu navegador ou procure um mais moderno como o Chrome ou Firefox.'
			)
			return false
		}
	},

	pushEnabled: () => Notification.permission == 'granted' && SWORKER.serverPushKey,

	enablePush: cb => {
		if ('function' != typeof cb) cb = () => null

		SERVER.get(SWORKER.key_url, {}, function (d) {
			SWORKER.SW.pushManager
				.subscribe({
					userVisibleOnly: true,
					applicationServerKey: SWORKER.urlB64ToUint8Array(d.key)
				})
				.then(function (subscription) {
					fetch(SWORKER.key_url, {
						method: 'post',
						headers: {'Content-type': 'application/json'},
						body: JSON.stringify({reg: subscription})
					})
						.then(function (r) {
							return r.json()
						})
						.then(function (d) {
							SWORKER.serverPushKey = !d.error
							cb(d)
						})
				})
				.catch(function (e) {
					SWORKER.serverPushKey = false
					return cb(e)
				})
		})
	},

	disablePush: function (cb) {
		if ('function' != typeof cb) cb = function () {}

		SWORKER.SW.pushManager
			.getSubscription()
			.then(function (subscription) {
				if (subscription) {
					return subscription.unsubscribe()
				}
			})
			.catch(function (e) {
				return cb(e)
			})
			.then(function () {
				SERVER.delete(SWORKER.key_url, {}, function (d) {
					SWORKER.serverPushKey = d.error
					return cb(d.error)
				})
			})
	},

	// ------------------- GEOLOCATION ------------------------------------------------------------

	// Get GeoLocation
	getGeoLocation: () => ({lat: SWORKER.latitude, lon: SWORKER.longitude}),

	// teste: Google MAps link
	googleMap: () => {
		window.location = 'https://www.google.com/maps/@' + SWORKER.latitude + ',' + SWORKER.longitude + ',15z'
	},
	getAddress: () => {
		$.get(
			'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
				SWORKER.latitude +
				'&lon=' +
				SWORKER.longitude,
			d => console.log(d)
		)
	},

	// Inicia a captura de GeoLocalização
	startGeoLocation: () => {
		if ('geolocation' in navigator) {
			SWORKER.geoLocationId = navigator.geolocation.watchPosition(
				position => {
					SWORKER.latitude = position.coords.latitude
					SWORKER.longitude = position.coords.longitude
					SWORKER.sendGeoLocation()
				},
				error => {
					SWORKER.latitude = 0
					SWORKER.longitude = 0
					SWORKER.sendGeoLocation()
				},
				{
					enableHighAccuracy: true,
					maximumAge: 30000,
					timeout: 27000
				}
			)
		} else {
			SWORKER.geoLocationId = false
			SWORKER.latitude = 0
			SWORKER.longitude = 0
		}
	},

	// Stop GeoLocation
	stopGeoLocation: () => {
		navigator.geolocation.clearWatch(SWORKER.geoLocationId)
		SWORKER.latitude = 0
		SWORKER.longitude = 0
		SWORKER.sendGeoLocation()
	},

	// Send GeoLocation data
	sendGeoLocation: () =>
		SERVER.post(
			SWORKER.geo_url,
			{
				lat: SWORKER.latitude,
				lon: SWORKER.longitude
			},
			() => null,
			() => null
		),

	// UTILS -----------------------------------------------------------------¬
	urlB64ToUint8Array: function (base64String) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
		const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

		const rawData = window.atob(base64)
		const outputArray = new Uint8Array(rawData.length)

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i)
		}
		return outputArray
	}
}
