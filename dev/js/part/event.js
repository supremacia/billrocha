/**
 * Event register
 * 
 */

const ClassEvent = function () {

    var events = {}
    var watch = null
    var count = 0
    var touchReg = []
    var touchRegMax = 50

    /**
     * insere uma ação para um determinado evento
     * 
     * @param {string} event  Nome do evento
     * @param {string} id Nome da ação
     * @param {function} action Ação a ser executada quando o Evento for disparado
     * 
     * @return {boolean}
     */
    const subscribe = (event, id, action) => {
        if (!events[event]) events[event] = {}
        if (!events[event][id]) {
            events[event][id] = action
            return true
        }
        return false
    }

    /**
     * Apaga um determinado evento indicado pelo seu id
     * 
     * @param {string} event 
     * @param {string} id 
     * 
     * @return {boolean}
     */
    const unsubscribe = (event, id) => {
        if (!events[event]) return false
        return delete (events[event][id])
    }

    /**
     * Executa TODAS as ações registradas para um "event" e "id" 
     * 
     * @param {string} event Nome do evento
     * @param {object|string|number|boolean} data dados passados como argumento (opcional) 
     * 
     * @return {boolean} 
     */
    const trigger = (event, data) => {
        if (!events[event]) return false
        for (var i in events[event]) {
            events[event][i](data)
        }
        return true
    }

    /**
     * Retorna os eventos registrados (debug)
     * 
     * @param {string} e 
     */
    const getEvent = e => !e ? events : events[e]

    /**
     * Apaga um evento ou limpa o registro de eventos
     * 
     * @param {string|void} e 
     */
    const clear = e => {
        e = e || false
        if (!e) return events = []
        if (undefined != typeof events[e]) events[e] = null
    }

    /**
     * Reseta o contador (não reseta o watchdog)
     * @param {number} c 
     */
    const reset = c => {
        c = parseInt(c) || 0
        count = c < 0 ? 0 : c
    }

    /**
     * Envia informações sobre o click/touch na tela pelo usuário.
     * 
     * @param {object} e 
     */
    const screenTouch = e => {
        if (GATE.id == 0) return true

        TMP2 = e

        var t = e.target
        var p = []

        if ("undefined" != typeof e['path']) {
            var y = false
            e.path.map(a => {
                if (a.localName == 'body') y = true
                if (!y) p.push({ id: a.id, class: a.className, type: a.localName })
            })
        }

        touchReg.push({
            id: t.id,
            cl: t.className,
            cx: e.clientX,
            cy: e.clientY,
            ox: e.offsetX,
            oy: e.offsetY,
            pt: p,
            pf: navigator.platform,
            us: 0//GATE.id
        })
    }

    /**
     * Iniciador do objeto
     */
    const init = () => {
        clear()
        watch = setInterval(() => trigger('watchdog', count++), 100)

        // User Data Tracer - UDT
        window.onclick = screenTouch

        // Registrando um evento para descarregar o TouchScreen
        subscribe('watchdog', 'touchSender', () => {
            if (touchReg.length < touchRegMax) return

            console.log('WatchDog trigged')

            touchReg = []
        })
    }

    init()
    return {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        trigger: trigger,
        reset: reset,
        clear: clear,
        getEvent: getEvent
    }
}

const Event = new ClassEvent()