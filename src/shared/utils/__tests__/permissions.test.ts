import { describe, expect, it } from 'vitest'
import type { Role } from '@/features/permissions/roles/types'
import { permissionsToLabels, traverseRoleHierarchy } from '../permissions'

describe('permissionsToLabels', () => {
  it('maps R to Read', () => expect(permissionsToLabels('R')).toEqual(['Read']))
  it('maps W to Write', () => expect(permissionsToLabels('W')).toEqual(['Write']))
  it('maps U to Use', () => expect(permissionsToLabels('U')).toEqual(['Use']))
  it('maps RWU to all three labels', () =>
    expect(permissionsToLabels('RWU')).toEqual(['Read', 'Write', 'Use']))
  it('is case-insensitive', () => expect(permissionsToLabels('rw')).toEqual(['Read', 'Write']))
  it('ignores unknown chars', () => expect(permissionsToLabels('RXU')).toEqual(['Read', 'Use']))
  it('returns empty array for empty string', () => expect(permissionsToLabels('')).toEqual([]))
})

describe('traverseRoleHierarchy', () => {
  function makeRole(resources: Array<{ Name: string; Permissions: string }>, grantedRoles: string[] = []): Role {
    return { Description: '', GrantedRoles: grantedRoles, EscalationOnly: false, Resources: resources }
  }

  it('returns empty for no roles', () => {
    expect(traverseRoleHierarchy([], new Map())).toEqual([])
  })

  it('collects resources from a single role', () => {
    const roleMap = new Map<string, Role>([
      ['Admin', makeRole([{ Name: '%DB_USER', Permissions: 'RW' }])],
    ])
    const result = traverseRoleHierarchy(['Admin'], roleMap)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      resourceName: '%DB_USER',
      permissions: expect.arrayContaining(['Read', 'Write']),
      grantedBy: ['Admin'],
    })
  })

  it('traverses nested roles', () => {
    const roleMap = new Map<string, Role>([
      ['Parent', makeRole([], ['Child'])],
      ['Child', makeRole([{ Name: 'Res', Permissions: 'R' }])],
    ])
    const result = traverseRoleHierarchy(['Parent'], roleMap)
    expect(result).toHaveLength(1)
    expect(result[0]?.resourceName).toBe('Res')
    expect(result[0]?.grantedBy).toContain('Child')
  })

  it('handles cyclic role references without infinite loop', () => {
    const roleMap = new Map<string, Role>([
      ['A', makeRole([{ Name: 'Res', Permissions: 'R' }], ['B'])],
      ['B', makeRole([], ['A'])],
    ])
    expect(() => traverseRoleHierarchy(['A'], roleMap)).not.toThrow()
  })

  it('unions permissions across multiple roles granting the same resource', () => {
    const roleMap = new Map<string, Role>([
      ['R1', makeRole([{ Name: 'Res', Permissions: 'R' }])],
      ['R2', makeRole([{ Name: 'Res', Permissions: 'W' }])],
    ])
    const result = traverseRoleHierarchy(['R1', 'R2'], roleMap)
    expect(result).toHaveLength(1)
    expect(result[0]?.permissions).toEqual(expect.arrayContaining(['Read', 'Write']))
    expect(result[0]?.grantedBy).toEqual(expect.arrayContaining(['R1', 'R2']))
  })
})
