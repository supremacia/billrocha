/*
 *  Global functions
 */

const _ = e => document.querySelector(e) || false
const _a = e => document.querySelectorAll(e) || false
const _f = f => ('function' == typeof f ? f : () => null)
const _dez = v => (v < 10 ? '0' + v : v)
var _cut = (t, w, h) => t.substr(0, w).length < t.length ? t.substr(0, w - (h ? 1 : 3)) + (h ? '&#133;' : '...') : t.substr(0, w)
