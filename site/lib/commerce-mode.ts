export const commerceProvider =
  process.env.NEXT_PUBLIC_COMMERCE_PROVIDER || '@vercel/commerce-local'

export const isCommerceDemo = commerceProvider === '@vercel/commerce-local'
