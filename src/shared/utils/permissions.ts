import type { EffectivePrivilege } from '@/features/permissions/users/types'
import type { Role } from '@/features/permissions/roles/types'

const PERMISSION_LABELS: Record<string, string> = {
  R: 'Read',
  W: 'Write',
  U: 'Use',
}

export function permissionsToLabels(permissions: string): string[] {
  return permissions
    .toUpperCase()
    .split('')
    .filter((c) => c in PERMISSION_LABELS)
    .map((c) => PERMISSION_LABELS[c]!)
}

export function traverseRoleHierarchy(
  rootRoles: string[],
  roleMap: Map<string, Role>,
): EffectivePrivilege[] {
  const visited = new Set<string>()
  // resourceName → { permissions union, grantedBy set }
  const accum = new Map<string, { permSet: Set<string>; grantedBy: Set<string> }>()

  function visit(roleName: string): void {
    if (visited.has(roleName)) return
    visited.add(roleName)

    const role = roleMap.get(roleName)
    if (!role) return

    for (const res of role.Resources) {
      const labels = permissionsToLabels(res.Permissions)
      if (labels.length === 0) continue

      if (!accum.has(res.Name)) {
        accum.set(res.Name, { permSet: new Set(), grantedBy: new Set() })
      }
      const entry = accum.get(res.Name)!
      for (const l of labels) entry.permSet.add(l)
      entry.grantedBy.add(roleName)
    }

    for (const sub of role.GrantedRoles) {
      visit(sub)
    }
  }

  for (const r of rootRoles) {
    visit(r)
  }

  return Array.from(accum.entries()).map(([resourceName, { permSet, grantedBy }]) => ({
    resourceName,
    permissions: Array.from(permSet),
    grantedBy: Array.from(grantedBy),
  }))
}
