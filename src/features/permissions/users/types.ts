export type UserListItem = {
  Name: string
  FullName: string
  Enabled: boolean
  Type: string
  Namespace: string
  Routine: string
}

export type User = {
  AccountNeverExpires: boolean
  AutheEnabled: number
  ChangePassword: boolean
  Comment: string
  EmailAddress: string
  Enabled: boolean
  ExpirationDate: string
  FullName: string
  HOTPKeyDisplay: boolean
  NameSpace: string
  PasswordNeverExpires: boolean
  PhoneNumber: string
  PhoneProvider: string
  Roles: string[]
  EscalationRoles: string[]
  Routine: string
}

export type EffectivePrivilege = {
  resourceName: string
  permissions: string[]
  grantedBy: string[]
}
