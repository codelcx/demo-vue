export enum Permission {
  EDIT = 1 << 0,
  DELETE = 1 << 1,
  READ = 1 << 2,
  CREATE = 1 << 3,
}

export type PermissionType = keyof typeof Permission

/**
 * 权限管理
 * @param permissions 权限标识
 */
export const usePermission = () => {
  // 权限标识
  let permissionFlags = 0

  // 初始化权限
  const initPermissions = (permission: PermissionType | Array<PermissionType>) => {
    const permissionArr = Array.isArray(permission) ? permission : [permission]
    permissionArr.forEach((key) => {
      permissionFlags = permissionFlags | Permission[key]
    })
  }

  // 添加权限
  const addPermission = (permission: PermissionType | Array<PermissionType>) => {
    const permissionArr = Array.isArray(permission) ? permission : [permission]
    permissionArr.forEach((key) => {
      permissionFlags = permissionFlags | Permission[key]
    })
  }

  // 移除权限
  const removePermission = (permission: PermissionType | Array<PermissionType>) => {
    const permissionArr = Array.isArray(permission) ? permission : [permission]
    permissionArr.forEach((key) => {
      permissionFlags = permissionFlags & ~Permission[key]
    })
  }

  // 判断权限
  const hasPermission = (permission: PermissionType | Array<PermissionType>) => {
    const permissionArr = Array.isArray(permission) ? permission : [permission]
    return permissionArr.every((key) => (permissionFlags & Permission[key]) === Permission[key])
  }

  return {
    hasPermission,
    initPermissions,
    addPermission,
    removePermission,
    permissionFlags,
  }
}
