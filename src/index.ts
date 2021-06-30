import { sign } from 'noble-ed25519'
import { v4 as uuidv4 } from 'uuid'

function strToB64Url(str: string): string {
  function escape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  if (window && window.btoa)
    return escape(btoa(str))
  else
    return escape(Buffer.from(str || 'utf8').toString('base64'))
}

function arrToB64Url(arr: Uint8Array): string {
  return strToB64Url(Array.from(arr).map(val => String.fromCharCode(val)).join(''))
}

function b64ToArr(b64str: string): Uint8Array {
  if (window && window.atob)
    return Uint8Array.from(atob(b64str), c => c.charCodeAt(0))
  else
    return Uint8Array.from(Buffer.from(b64str, 'base64').toString('binary'), c => c.charCodeAt(0))
}

async function createAndSign(type: 'jwt' | 'tjwt' | 'cjwt', body: any, key: Uint8Array) {
  const textEncoder = new TextEncoder()

  const header = { 'alg': 'EdDSA', 'typ': type }
  const hb = `${strToB64Url(JSON.stringify(header))}.${strToB64Url(JSON.stringify(body))}`
  const hb_bytes = textEncoder.encode(hb)
  const signature = await sign(hb_bytes, key)
  const b64signature = arrToB64Url(signature)

  return `${hb}.${b64signature}`
}

function createTempUserToken(
  param: string | string[],
  appId: string,
  key: string | Uint8Array,
  duration: number = 3600,
  uuidGen: () => string = () => uuidv4()
): Promise<string> {

  const keyBytes = typeof key === 'string' ? b64ToArr(key).slice(0, 32) : key

  let to = undefined
  if (typeof param === 'string')
    to = { gid: param }
  else
    to = { uids: param }

  const body = {
    ...to,
    app: appId,
    tid: uuidGen(),
    exp: Math.floor(Date.now() / 1000) + duration
  }

  return createAndSign('tjwt', body, keyBytes)
}

function createUserToken(userId: string, groupId: string, appId: string, key: string | Uint8Array, duration = 86400) {

  const keyBytes = typeof key === 'string' ? b64ToArr(key).slice(0, 32) : key

  const body = {
    app: appId,
    uid: userId,
    gid: groupId,
    exp: Math.floor(Date.now() / 1000) + duration
  }

  return createAndSign('jwt', body, keyBytes)
}

export {
  createAndSign,
  createTempUserToken,
  createUserToken
}
