import { isBrowser } from "./globals"

export function str2B64Url(str: string): string {
  function escape(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  if (isBrowser)
    return escape(window.btoa(str))
  else
    return escape(Buffer.from(str || 'utf8').toString('base64'))
}

export function bin2B64Url(arr: Uint8Array): string {
  return str2B64Url(Array.from(arr).map(val => String.fromCharCode(val)).join(''))
}

export function b64str2bin(b64str: string): Uint8Array {
  if (isBrowser)
    return Uint8Array.from(window.atob(b64str), c => c.charCodeAt(0))
  else
    return Buffer.from(b64str, 'base64')
}