export type LoginRequest = {
  user: string
  password: string
  role?: string
}

export type LoginResponse = {
  result: {
    access_token: string
    refresh_token: string
    sub: string
    iat: number
    exp: number
  }
}

export type ServerInfo = {
  apiVersion: number
  username: string
  serverVersion: string
  systemMode: string
  product: 'iris' | 'irisforhealth' | 'healthconnect' | 'hs'
  namespaces: Array<{ name: string }>
  privileges: Record<string, Record<string, boolean>>
}

export type Session = {
  username: string
  serverVersion: string
  systemMode: string
  product: string
  privileges: ServerInfo['privileges']
}
