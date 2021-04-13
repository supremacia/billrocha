/**
 * Class MENUs
 */

const MenuClass = function () {

    // Defaults
    const node = {
        bottomBar: '#bottombar',
        btb: '#btb-',
        topBar: '#topbar',
        tpbAvatar: '#tpb-avatar',
        tpbAvatarImg: '#tpb-avatar img',
        tpbTitle: '#tpb-title',
        tpbInfo: '#topbar-info',
        tpbStar: '#tpb-star',
        tpbChat: '#tpb-chat',
        tpbOs: '#tpb-os',
        tpbNot: '#tpb-not',
        menuBox: '#menu',
        current: 'home'
    }

    // Carrega a configuração da página atual
    var currentPage = []

    var actions = {
        a1: () => Page.show('dashboard'),
        a2: () => Page.show('service'),
        a3: () => false,
        a4: () => false,
        a5: () => Page.show('formulario'),
        a6: () => false,
        b1: () => Page.show('passwordIn'),
        b2: () => Page.show('terms'),
        b3: () => AUTH.logout()
    }

    var oldBottomBar = []
    var activeBottomBar = []
    var bottomBarActions = {
        b1: () => history.back(),
        b2: () => Page.show('dashboard'),
        b3: () => Page.show('service'),
        b4: () => menu(true)
    }

    /**
     * Page call this function after set a new page
     * @param {string} b New Page id 
     */
    const set = p => {
        currentPage = p
        menu(false)
        setMenuItemActive(currentPage.menu)
        topbar(currentPage.topbar !== false, currentPage.topbar[0], currentPage.topbar[1])
        bottombar(currentPage.bottombar !== false, currentPage.bottombar)
    }

    // Returns current selected
    const getCurrent = () => node.current

    // Set topbar
    const topbar = (show, avatar, title) => {
        hideInfo()
        _(node.topBar).classList[!show ? 'remove' : 'add']('on')
        if (avatar) {
            _(node.tpbAvatar).classList.add('on')
            _(node.tpbAvatarImg).src = avatar === true ? '/img/logo.png' : avatar
            _(node.tpbTitle).classList.add('left')
        } else {
            _(node.tpbAvatar).classList.remove('on')
            _(node.tpbTitle).classList.remove('left')
        }

        if (title)
            _(node.tpbTitle).innerHTML =
                _cut(title, parseInt(parseInt(_(node.tpbTitle).offsetWidth) / 10), true)
    }


    // Show & hide Info (to dashboard)
    const showInfo = (s, c, o, n) => {
        _(node.tpbStar).innerHTML = UTIL.toStar(s || 0)
        _(node.tpbChat).innerHTML = c || 0
        _(node.tpbOs).innerHTML = o || 0
        _(node.tpbNot).innerHTML = n || 0
        _(node.tpbInfo).classList.add('on')
    }
    const hideInfo = () => _(node.tpbInfo).classList.remove('on')

    // MENU --------------------------------------------------------

    // Show/hide menu
    const menu = (m) => {
        _(node.menuBox).classList[m === false ? 'remove' : 'add']('on')
        mountBottomBar(m === false ? null : [false, false, false, true])
    }

    // Executa a ação registrada para o menu selecionando
    const menuAction = a => {
        if (a.classList.contains('active')) return false
        var id = a.getAttribute('data-id')

        menu(false)

        if ("function" == typeof actions[id]) {
            actions[id]()
            setMenuItemActive(id)
        }
        node.current = id
    }

    const setMenuItemActive = a =>
        _(node.menuBox).querySelectorAll('li').forEach(i =>
            i.classList[i.getAttribute('data-id') == a ? 'add' : 'remove']('active'))

    // ------------------------------ BOTTOMBAR

    // Set bootom bar
    const bottombar = (show, btb) => {
        _(node.bottomBar).classList[!show ? 'remove' : 'add']('on')
        if (Array.isArray(btb)) btb.map((a, b) => setBtb(b + 1, a))
    }

    // Configura dos dados para fazer a montagem do BottomBar
    const mountBottomBar = a => {
        //if (!Page.getPages(Page.current())) return false
        var c = Array.isArray(a) ? a : currentPage.bottombar
        if (c == false) c = [false, null, null, null]
        c.map((a, b) => setBtb(b + 1, a))
    }

    // Monta/configura 1 bottomBar
    const setBtb = (a, b) => {
        _(node.btb + a).classList = b === false ? 'off' : b === true ? 'on' : ''
        if (a == 1) bottomBarActions.b1 = b === null ? () => history.back() : () => false
        activeBottomBar[a - 1] = b
    }
    const getBtb = a => a
        ? currentPage.bottombar[a]
        : currentPage.bottombar

    // Ao clicar em um botão do BottomBar
    const bottomBarAction = a => {
        a = a.getAttribute('data-id') || a.parentElement.getAttribute('data-id')
        if (a == "b2" || a == "b3") node.current = "a" + (parseInt(a.substr(1)) - 1)
        bottomBarActions[a] ? bottomBarActions[a]() : false
    }


    /**
     * Build object
     */
    const construct = () => {
        _(node.bottomBar).onclick = e => bottomBarAction(e.target)
        _(node.menuBox).onclick = e => menuAction(e.target)

        // Escutando evento de troca de página
        Event.subscribe('PageAfter', 'menu', set)
    }
    construct()

    return {
        set: set,
        current: getCurrent,
        topbar: topbar,
        bottombar: bottombar,
        showInfo: showInfo,
        hideInfo: hideInfo,
        bottomBarAction: bottomBarAction,
        menuAction: menuAction,
        currentPage: currentPage
    }
}