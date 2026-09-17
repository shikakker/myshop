import { useMemo } from 'react'
import { SWRHook } from '@vercel/commerce/utils/types'
import useSearch, { UseSearch } from '@vercel/commerce/product/use-search'
import type { Product, SearchProductsBody } from '@vercel/commerce/types/product'
import catalog from '../data.json'

export default useSearch as UseSearch<typeof handler>

type LocalCatalogProduct = (typeof catalog.products)[number]

const normalizeProduct = (product: LocalCatalogProduct): Product => ({
  id: product.id,
  name: product.name,
  vendor: product.vendor,
  path: product.path,
  slug: product.slug,
  description: '',
  descriptionHtml: product.descriptionHtml,
  price: product.price,
  images: product.images.map((image) => ({
    url: image.url,
    alt: image.altText,
  })),
  variants: product.variants,
  options: product.options,
})

const products = catalog.products.map(normalizeProduct)

const applySearch = (items: Product[], input: SearchProductsBody) => {
  const normalizedSearch = (input.search || '').trim().toLocaleLowerCase()
  let result = normalizedSearch
    ? items.filter((product) =>
        [product.name, product.vendor, product.descriptionHtml]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()
          .includes(normalizedSearch)
      )
    : [...items]

  if (input.sort === 'price-asc') {
    result = result.sort((a, b) => a.price.value - b.price.value)
  } else if (input.sort === 'price-desc') {
    result = result.sort((a, b) => b.price.value - a.price.value)
  } else if (input.sort === 'latest-desc') {
    result = result.reverse()
  }

  return result
}

export const handler: SWRHook<any> = {
  fetchOptions: {
    query: '',
  },
  async fetcher() {
    return {
      products,
      found: products.length > 0,
    }
  },
  useHook:
    () =>
    (input: SearchProductsBody = {}) => {
      const search = input.search || ''
      const sort = input.sort || ''

      return useMemo(() => {
        const filteredProducts = applySearch(products, { search, sort })

        return {
          data: {
            products: filteredProducts,
            found: filteredProducts.length > 0,
          },
        }
      }, [search, sort])
    },
}
