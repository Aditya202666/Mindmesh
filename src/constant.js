export const DB_NAME = "Mindmesh"
export const port = process.env.Port || 3030
export const corsOrigin = "*";

export const OWNER = 0
export const ADMIN = 1
export const MANAGER = 2
export const CONTRIBUTOR = 3
export const UNAUTHORIZED = 4

export const cookieName1 = 'Mind'
export const cookieName2 = 'Mesh'
export const cookieName3 = 'RefreshToken'

export const secureCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 // one day
  }
export const unsecureCookieOptions = {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 // one day
  }