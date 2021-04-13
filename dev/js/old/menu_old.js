const MENU = {
    current: '',
    html: {
        backIcon: '#hdr-back',
        title: '#hdr-title',
        menuIcon: '#hdr-menu',
        header: '#header',
        menu: '.menu',
        prefix: '#mnu-'
    },

    init: () => {
        return null
        //_a(MENU.html.menu).forEach(a => a.onclick = e => e.target.classList.remove('on'))
    },


    show: (page) => {
        return null
        // var page = page || SHOW.currentPage

        // _a(MENU.html.menu + ':not(' + MENU.html.prefix + page + ')').forEach(a => a.classList.remove('on'))
        // _(MENU.html.prefix + page).classList[MENU.current == page ? 'remove' : 'add']('on')
        // MENU.current = MENU.current == page ? '' : page
        // return false
    },

    hide: () => {
        return null
        // _a(MENU.html.menu).forEach(a => a.classList.remove('on'))
        // MENU.current = ''
    },

    header: (title, back, menu) => {
        return null
        // if ("undefined" != typeof title) MENU.title(title)
        // if ("undefined" != typeof menu) MENU.menu(menu)
        // if ("undefined" != typeof back) MENU.back(back)

        // _(MENU.html.header).classList.add('on')
    },
    showHeader: () => null, //_(MENU.html.header).classList.add('on'),
    hideHeader: () => null, //_(MENU.html.header).classList.remove('on'),

    title: t => null, //(_(MENU.html.title).innerHTML = t),
    back: b => null, //(_(MENU.html.backIcon).classList[b ? 'add' : 'remove']('on')),
    menu: m => null, //(_(MENU.html.menuIcon).classList[m ? 'add' : 'remove']('on')),
}