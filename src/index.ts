import { sign } from 'noble-ed25519'
import { b64str2bin, bin2B64Url, str2B64Url } from './util'

async function signToken(type: string, body: any, key: Uint8Array) {

  const header = { 'alg': 'EdDSA', 'typ': type }
  const hb = `${str2B64Url(JSON.stringify(header))}.${str2B64Url(JSON.stringify(body))}`
  const hb_bytes = new TextEncoder().encode(hb)
  const signature = await sign(hb_bytes, key)
  const b64signature = bin2B64Url(signature)

  return `${hb}.${b64signature}`
}

type App = {
  id: string
}
type User = {
  id?: string,
  groupId?: string
}
type Capture = {
  groupId?: string,
  userIds?: string[]
}
type Access = {
  dataId?: string,
  groupId?: string
}

class Token {
  private key: Uint8Array
  app: App
  user: User
  capture: Capture
  access: Access
  lifetime: number

  constructor(key: Uint8Array) {
    this.key = key
  }

  build(): Promise<string> {
    const app = this.app ? { app: this.app.id } : {}
    const user = this.user ? { uid: this.user.id, gid: this.user.groupId } : {}
    const capture = this.capture ? { gid: this.capture.groupId, uids: this.capture.userIds } : {}
    const access = this.access ? { did: this.access.dataId, gid: this.access.groupId } : {}

    const body = {
      ...app,
      ...user,
      ...capture,
      ...access,
      tid: 'test',
      exp: Math.floor(Date.now() / 1000) + (this.lifetime || 3600)
    }
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key])

    const type = this.capture ? 'tjwt' : (this.access ? 'nejwt' : 'jwt')

    return signToken(type, body, this.key)
  }
}

export class TokenBuilder {
  private token: Token

  constructor(token: Token) {
    this.token = token
  }

  static init(key: string) {
    const keyBytes = typeof key === 'string' ? b64str2bin(key).slice(0, 32) : key
    return new TokenBuilder(new Token(keyBytes))
  }

  build() {
    return this.token.build()
  }

  lifetime(time: number) {
    this.token.lifetime = time
    return this
  }

  forApp(appId: string) {
    const me: TokenBuilder = this

    me.token.app = { id: appId }

    return {
      forUser: {
        withId: (userId: string) => {
          me.token.user = { id: userId }

          return {
            inGroup: (groupId: string) => {
              me.token.user.groupId = groupId
              return me
            }
          }
        }
      },
      toCaptureData: {
        forGroup: (groupId: string) => {
          me.token.capture = { groupId }
          return me
        },
        forUsers: (userIds: string[]) => {
          me.token.capture = { userIds }
          return me
        }
      },
      toAccessData: {
        withId: (dataId: string) => {
          me.token.access = { dataId }
        },
        inGroup: (groupId: string) => {
          me.token.access = { groupId }
        }
      }
    }
  }
}
