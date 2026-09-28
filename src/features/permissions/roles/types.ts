export type RoleListItem = {
  Name: string
  Description: string
  CreatedBy: string
  EscalationOnly: boolean
}

export type Role = {
  Description: string
  GrantedRoles: string[]
  EscalationOnly: boolean
  Resources: Array<{
    Name: string
    Permissions: string
  }>
}

export type RoleOwners = {
  users: string[]
}
