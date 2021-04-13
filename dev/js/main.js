


// Inicialize PATHNAME & Platform
const PATHNAME = document.location.pathname.replace('/', '').split('/')
const PLATFORM = navigator.platform


window.onload = () => {

    SW.init()
    const Page = new ClassPage(Config)
    const Menu = new ClassMenu()

    Page.Show('Home')

}