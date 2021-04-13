/**
 * Page Class
 */

const ClassPage = function (config) {

    var currentPage = 'home'
    var currentIn = 'up'
    var currentOut = 'down'

    var trail = []

    var efects = {
        next: { in: () => 'right', out: () => 'left' },
        back: { in: () => 'left', out: () => 'right' },
        up: { in: () => 'up', out: () => 'down' },
        down: { in: () => 'down', out: () => 'up' },
        forward: { in: () => currentIn, out: () => currentOut },
        backward: { in: () => currentOut, out: () => currentIn }
    }

    var pages = {}

    const show = (page, efect) => {
        if (!pages[page] || page == currentPage) return false
        eft = efects[efect] || efects[pages[page].efect]

        Event.trigger('PageBefore', page) // Dispara evento

        // Colocando a devida class na página anterior e na nova...
        _a('.page').forEach(a => {
            a.classList.remove('on', 'iup', 'idown', 'ileft', 'iright', 'oup', 'odown', 'oleft', 'oright')

            if (a.id == 'pg-' + pages[currentPage].page) a.classList.add('o' + eft.out())
            if (a.id == 'pg-' + pages[page].page) {
                a.classList.add('on', 'i' + eft.in())
                a.scrollTop = 0
            }
        })

        Event.trigger('PageBeforeAction', pages[currentPage])

        // Running action
        pages[page].action()

        // Se o ROOT estiver na última posição de trail, simplifica a rota...
        var last = trail[trail.length - 1]
        if (last == 'auth' || last == 'dashboard') trail = [last]

        // Se a página for um ROOT ou não aceitar trail...
        if (pages[page].trail === false || page == 'auth' || page == 'dashboard') trail = [page]

        // Se a página tiver um trail fixo...
        if ("string" == typeof pages[page].trail) trail = [pages[page].trail]

        // Se a página aceitar trail livremente...
        if (pages[page].trail === true) trail.push(currentPage)

        // Atualizando a página selecionada, efeitos & disparando o evento final
        currentIn = eft.in()
        currentOut = eft.out()
        currentPage = page

        Event.trigger('PageAfter', pages[currentPage])

        /* Retorna false para ser usado em retorno 
           de link <a onclick="return Page('home')" ...
        */
        return false
    }

    // Retorna a página corrente 
    const current = () => currentPage
    const getPages = (p) => (p ? pages[p] : pages)
    const back = () => {
        history.back()
        return false
    }

    // Construindo ...
    const construct = (config) => {
        if (!config) return false
        config.map(a => pages[a.id] = a)

        history.pushState(null, null, '/')
        history.pushState(null, null, '/')

        window.onpopstate = e => {
            e.preventDefault()
            history.pushState(null, null, '/')

            // Se tiver trilha...
            var prev = trail.pop()

            if (prev) show(prev)
            return false
        }
    }
    construct(config)

    // Returns ...
    return {
        show: show,
        current: current,
        pages: getPages,
        back: back,
    }
}