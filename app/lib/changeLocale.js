export function changeLocale(locale) {
    try {
        let state = JSON.parse(localStorage.state)
        state.intl.locale = locale
        localStorage.setItem('state', JSON.stringify(state))
        location.reload()
    } catch (e) {
        console.warn('Error while changing a locale', e)
    }
}
