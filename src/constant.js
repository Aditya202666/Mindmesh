export const port = process.env.Port || 3030
export const corsOrigin = "http://localhost:5173";
export const DB_NAME = "Mindmesh"


export const MindCookie = 'Mind'
export const MeshCookie = 'Mesh'
export const refreshTokenCookie = 'RefreshToken'

export const secureCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  }
export const unsecureCookieOptions = {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  }

export const workspacePrefix = 'ws_'
export const projectPrefix = 'pr_'

export const OwnerAccessLevel = 4
export const AdminAccessLevel = 3
export const ManagerAccessLevel = 2
export const MemberAccessLevel = 1
