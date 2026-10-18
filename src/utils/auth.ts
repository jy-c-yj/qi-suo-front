/**
 * 三端（用户 / 商家 / 管理员）登录态的唯一事实来源。
 *
 * 同一个浏览器可以同时登录三端，三端各存一份凭证，互不影响：
 *   user     -> userToken     / userRefreshTokenKey     / username
 *   merchant -> merchantToken / merchantRefreshTokenKey / merchantName
 *   admin    -> adminToken    / adminRefreshTokenKey    / adminUsername
 *
 * 【为什么"带哪份 token"要看页面路径，而不是请求 URL】
 * 商家端的商品页会合法地调用 /admin/CategoryAndAttribute/**，用户端的搜索页会调
 * /admin/category/getCategory —— 请求 URL 分不出"我在哪个端"，只有页面路径能。
 * 以前是用一个全局的 loginType 来选的，而它是"谁最后登录谁说了算"，所以在同一浏览器
 * 先登用户端、再登商家端之后，回到用户端就会把商家的 token 发出去，接口全部鉴权失败。
 *
 * 本模块刻意【不】import @/router：router/index.ts 与 api/user.ts 都要 import 本模块，
 * 反向依赖会形成循环。用 window.location.pathname 就够——createWebHistory 下两者同步。
 */

export type AuthApp = 'user' | 'merchant' | 'admin'

interface AppAuthConfig {
  /** 访问令牌的存储键 */
  tokenKey: string
  /** 刷新令牌的存储键 */
  refreshKeyKey: string
  /** 展示用名字的存储键 */
  nameKey: string
  /** 登录账号 id 的存储键 */
  idKey: string
  /** 角色列表的存储键（JSON 字符串） */
  rolesKey: string
  /** 该端的登录页 */
  loginPath: string
  /** 该端登录后的默认落地页 */
  homePath: string
}

const APP_AUTH: Record<AuthApp, AppAuthConfig> = {
  user: {
    tokenKey: 'userToken',
    refreshKeyKey: 'userRefreshTokenKey',
    nameKey: 'username',
    idKey: 'userId',
    rolesKey: 'userRoles',
    loginPath: '/login/user',
    homePath: '/home'
  },
  merchant: {
    tokenKey: 'merchantToken',
    refreshKeyKey: 'merchantRefreshTokenKey',
    nameKey: 'merchantName',
    idKey: 'merchantId',
    rolesKey: 'merchantRoles',
    loginPath: '/login/merchant',
    homePath: '/merchant/dashboard'
  },
  admin: {
    tokenKey: 'adminToken',
    refreshKeyKey: 'adminRefreshTokenKey',
    nameKey: 'adminUsername',
    idKey: 'adminId',
    rolesKey: 'adminRoles',
    loginPath: '/login/admin',
    homePath: '/admin/image/background'
  }
}

/**
 * 去掉部署前缀（BASE_URL）与查询串，只留路由路径。
 * 现在 base 是 '/'，这层归一化是为了将来部署到子路径时不会静默失效。
 */
function normalizePath(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  let normalized = path || '/'
  if (base !== '/' && normalized.startsWith(base)) {
    normalized = '/' + normalized.slice(base.length)
  }
  return normalized.replace(/[?#].*$/, '')
}

/**
 * 页面路径 -> 属于哪一端。
 * 按路径段判断，所以 /administrator 不会误判成管理端；
 * /merchant-register 也不会误判成商家端（它少了那个斜杠）。
 */
export function appFromPath(path: string): AuthApp {
  const p = normalizePath(path)

  // 登录页的归属由后缀决定，不受 /login 前缀影响
  if (p === '/login/admin') return 'admin'
  if (p === '/login/merchant') return 'merchant'

  if (p === '/admin' || p.startsWith('/admin/')) return 'admin'
  if (p === '/merchant' || p.startsWith('/merchant/')) return 'merchant'

  // /login、/login/user、/register、/home、/user/**、/product/** 等都归用户端
  return 'user'
}

/** 当前页面属于哪一端 */
export function currentApp(pathname: string = window.location.pathname): AuthApp {
  return appFromPath(pathname)
}

/** 取某端的访问令牌，没有则返回空串 */
export function getToken(app: AuthApp = currentApp()): string {
  return localStorage.getItem(APP_AUTH[app].tokenKey) || ''
}

/** 取某端的刷新令牌键，没有则返回空串 */
export function getRefreshKey(app: AuthApp = currentApp()): string {
  return localStorage.getItem(APP_AUTH[app].refreshKeyKey) || ''
}

/** 取某端的展示用名字，没有则返回空串 */
export function getName(app: AuthApp = currentApp()): string {
  return localStorage.getItem(APP_AUTH[app].nameKey) || ''
}

/** 某端是否已登录 */
export function hasSession(app: AuthApp = currentApp()): boolean {
  return !!getToken(app)
}

/**
 * 登录成功后写入某端的凭证。
 * 只写非空值：后端返回体异常时不要把 "undefined" 存进去，
 * 宁可缺 key（守卫会拦下）也不要存一个假 token。
 */
export function saveSession(
  app: AuthApp,
  token: string,
  refreshKey: string,
  name?: string,
  id?: number | null,
  roles?: string[]
): void {
  const config = APP_AUTH[app]
  if (token) localStorage.setItem(config.tokenKey, token)
  if (refreshKey) localStorage.setItem(config.refreshKeyKey, refreshKey)
  if (name) localStorage.setItem(config.nameKey, name)
  if (id !== undefined && id !== null) localStorage.setItem(config.idKey, String(id))
  if (roles && roles.length > 0) localStorage.setItem(config.rolesKey, JSON.stringify(roles))
}

/** 取某端的登录账号 id，没有则返回 null */
export function getUserId(app: AuthApp = currentApp()): number | null {
  const raw = localStorage.getItem(APP_AUTH[app].idKey)
  if (!raw) return null
  const id = Number(raw)
  return Number.isFinite(id) ? id : null
}

/** 取某端的角色列表，没有则返回空数组 */
export function getRoles(app: AuthApp = currentApp()): string[] {
  const raw = localStorage.getItem(APP_AUTH[app].rolesKey)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((role): role is string => typeof role === 'string') : []
  } catch {
    return []
  }
}

/** 当前端是否拥有任一角色 */
export function hasAnyRole(roles: string[], app: AuthApp = currentApp()): boolean {
  const owned = getRoles(app)
  return roles.some(role => owned.includes(role))
}

/**
 * 管理员级别：3=系统管理员、2=超级管理员、1=普通管理员。
 * 旧会话没有 roles 时按普通管理员降级，建议重新登录。
 */
export function getAdminType(app: AuthApp = 'admin'): number {
  const roles = getRoles(app)
  if (roles.includes('SystemADMIN') || roles.includes('system')) return 3
  if (roles.includes('SuperAdmin')) return 2
  return 1
}

/**
 * 只更新访问令牌（刷新令牌续期后调用）。
 * 后端刷新接口不轮换 refresh_token_key，所以刷新键与名字保持原样。
 */
export function saveAccessToken(app: AuthApp, token: string): void {
  if (token) localStorage.setItem(APP_AUTH[app].tokenKey, token)
}

/**
 * 只清掉这一端的登录态，另外两端的凭证不动。
 * 这是三端隔离的关键：某端登录过期不该把其他端踢下线。
 */
export function clearSession(app: AuthApp): void {
  const config = APP_AUTH[app]
  localStorage.removeItem(config.tokenKey)
  localStorage.removeItem(config.refreshKeyKey)
  localStorage.removeItem(config.nameKey)
  localStorage.removeItem(config.idKey)
  localStorage.removeItem(config.rolesKey)
}

/** 某端的登录页路径 */
export function loginPathOf(app: AuthApp): string {
  return APP_AUTH[app].loginPath
}

/** 某端登录后的默认落地页 */
export function homePathOf(app: AuthApp): string {
  return APP_AUTH[app].homePath
}
