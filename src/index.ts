import { sign } from 'noble-ed25519'
import { b64str2bin, bin2B64Url, str2B64Url } from './util'

type Type = 'app' | 'user' | 'anon'
type Body = {
  app: string,
  uid?: string,
  exp: number
}

async function signToken(type: Type, body: Body, key: Uint8Array) {

  const header = { 'alg': 'EdDSA', 'typ': type }
  const hb = `${str2B64Url(JSON.stringify(header))}.${str2B64Url(JSON.stringify(body))}`
  const hb_bytes = new TextEncoder().encode(hb)
  const signature = await sign(hb_bytes, key)
  const b64signature = bin2B64Url(signature)

  return `${hb}.${b64signature}`
}

class Token {
  appId?: string
  key: Uint8Array
  userId?: string
  expiration?: number

  constructor(appId: string, key: Uint8Array) {
    this.appId = appId
    this.key = key
  }

  create(type: Type): Promise<string> {

    const body = {
      app: this.appId,
      uid: this.userId,
      exp: this.expiration || 1999999999,
    }
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key])

    return signToken(type, body, this.key)
  }
}

export class TokenBuilder {
  private token: Token

  constructor(appId: string, key: string) {
    const keyBytes = b64str2bin(key)
    this.token = new Token(appId, keyBytes)
    return this
  }

  static init(appId: string, key: string) {
    return new TokenBuilder(appId, key)
  }

  expiration(exp: number) {
    this.token.expiration = exp
    return this
  }

  user(usr: string) {
    this.token.userId = usr
    return this.token.create('user')
  }

  app() {
    return this.token.create('app')
  }

  anon() {
    return this.token.create('anon')
  }
}
