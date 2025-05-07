export const DB_NAME = "Mindmesh"
export const port = process.env.Port || 3030
export const corsOrigin = "*";


export const cookieName1 = 'Mind'
export const cookieName2 = 'Mesh'

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