import Cookies from 'js-cookie'

const TokenKey = 'jnpf_token'

export function getLotToken() {
  return window.localStorage.getItem('hhlottoken')
}
export function getToken() {
	 
  return window.localStorage.getItem('jnpf_token')
}

export function setToken(token) {
	 
  return window.localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
