/**
 * 订单状态的展示归一。
 *
 * 后端 OrderStatus.UNPAID 从某个版本起写的是「未支付」，
 * 而部分老页面仍按「待支付」判断，导致未支付订单看不到支付按钮、
 * 商家端也筛不出数据。这里统一兼容两种写法，只改前端展示。
 */

/** 把历史文案「待支付」归一为后端当前使用的「未支付」 */
export function normalizeOrderStatus(status?: string | null): string {
  if (!status) return ''
  return status === '待支付' ? '未支付' : status
}

/** 是否未支付（兼容两种历史写法） */
export function isUnpaid(status?: string | null): boolean {
  return status === '未支付' || status === '待支付'
}

export type OrderStatusTagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

/** el-tag 的类型映射 */
export function getOrderStatusType(status?: string | null): OrderStatusTagType {
  switch (normalizeOrderStatus(status)) {
    case '未支付':
      return 'warning'
    case '已支付':
      return 'primary'
    case '已发货':
      return 'info'
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}
