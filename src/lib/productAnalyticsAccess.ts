// Who may read Admin -> Product. This is the DEVELOPER'S view of which
// screens get opened, not the academy's admin_role holders' view. The SQL
// functions carry the same uid in product_analytics_admin(); change both.
export const DEVELOPER_USER_IDS = [
  '40f07a18-b087-4c95-ba1f-d5444222968a', // tanjunsing@gmail.com
]

export function isProductAnalyticsAdmin(userId: string | null | undefined): boolean {
  return !!userId && DEVELOPER_USER_IDS.includes(userId)
}
