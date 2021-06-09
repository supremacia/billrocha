'use strict';

var version = '1.0.1'
var _0x555a = ['classList', 'onload', 'getElementById', 'card', 'add', 'remove', 'title'];
(function (_0x5ac580, _0x3e1817) {
    var _0x546a53 = function (_0x3f720e) {
        while (--_0x3f720e) {
            _0x5ac580['push'](_0x5ac580['shift']());
        }
    };
    _0x546a53(++_0x3e1817);
}(_0x555a, 0x80));
var _0x24b9 = function (_0x3b372d, _0x211016) {
    _0x3b372d = _0x3b372d - 0x0;
    var _0x27bb32 = _0x555a[_0x3b372d];
    return _0x27bb32;
};

var page = function (_0x32773d) {
    document[_0x24b9('0x0')](_0x24b9('0x1'))['classList'][0x0 == _0x32773d ? _0x24b9('0x2') : _0x24b9(
        '0x3')]('on'), setTimeout(function () {
            document['getElementById'](_0x24b9('0x4'))[_0x24b9('0x5')][0x0 == _0x32773d ? 'remove' :
                _0x24b9('0x2')
            ]('on');
        }, 0x1f4);
};
var _ = e => document.querySelector(e) || false;
var tg = e => {
    var t = e.currentTarget.id

    if (t == 'qrcodeCopy') {
        _('#qrcodeId').select()
        _('#qrcodeId').setSelectionRange(0, 99999)
        document.execCommand("copy");
        alert('Código copiado!\nAbra seu aplicativo bancário e cole o PIX.')
    }
    return _('#qrcode').classList[t == 'pix' ? 'add' : 'remove']('on')
}
window[_0x24b9('0x6')] = function () {
    _('#pix').onclick = tg;
    _('#qrcodeCopy').onclick = tg;
    _('#qrcode').onclick = tg;
    return page(0x1);
};