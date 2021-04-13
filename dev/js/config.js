

// Pages
const Config = {
    App: {
        Id: 'billrocha',
        Version: '1.0.1',
        Name: 'BillRocha',
        Domain: 'https://billrocha.netlify.com',
        Assets: 'https://billrocha.netlify.com',
        Server: 'https://billrocha.netlify.com'
    },

    Pages: [
        {
            id: 'home',
            page: 'home',
            title: '',
            menu: false,
            topbar: false,
            efect: 'down',
            trail: false,
            bottombar: false,
            action: () => Ctrt_Home.show()
        }, {
            id: 'contact',
            page: 'contact',
            title: 'Contatos',
            menu: false,
            topbar: false,
            efect: 'backward',
            trail: false,
            bottombar: false,
            action: () => false
        }, {
            id: 'project',
            page: 'project',
            title: 'Projetos',
            menu: false,
            topbar: false,
            efect: 'back',
            trail: 'home',
            bottombar: false,
            action: () => false
        }, {
            id: 'blog',
            page: 'blog',
            title: 'Artigo',
            menu: false,
            topbar: false,
            efect: 'back',
            trail: 'home',
            bottombar: false,
            action: () => false
        }
    ]
}