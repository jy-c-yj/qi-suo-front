import { logout } from '@/api/user'
import { clearSession, loginPathOf } from '@/utils/auth'
import type { AuthApp } from '@/utils/auth'

/**
 * 统一退出登录：
 * 1) 调后端 /auth/logout 删除该端对应的 Redis 刷新令牌；
 * 2) 无论后端成功与否，都清掉本端 localStorage 凭证；
 * 3) 跳回本端登录页。
 *
 * 访问令牌本身按设计自然过期（24h），不做网关黑名单。
 */
export async function logoutAndClear(app: AuthApp): Promise<void> {
  try {
    await logout()
  } catch (error) {
    // 网络失败 / 令牌已过期都不影响本地退出
    console.warn('退出登录接口调用失败，继续清理本地会话:', error)
  } finally {
    clearSession(app)
    window.location.href = loginPathOf(app)
  }
}
