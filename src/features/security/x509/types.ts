export type X509CredentialListItem = {
  Name: string
  ValidTo?: string
}

export type X509Credential = {
  OwnerList?: string[]
  CAFile?: string
  PeerNames?: string[]
}

export type X509Certificate = {
  Subject: string
  Issuer: string
  ValidFrom: string
  ValidTo: string
}

export type X509CertificateStatus = 'valid' | 'expiring-soon' | 'expired'
