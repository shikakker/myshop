import cn from 'clsx'
import type { SearchPropsType } from '@lib/search-props'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import { Layout } from '@components/common'
import { ProductCard } from '@components/product'
import type { Product } from '@commerce/types/product'
import { Container, Skeleton } from '@components/ui'

import useSearch from '@framework/product/use-search'

import getSlug from '@lib/get-slug'
import rangeMap from '@lib/range-map'

import {
  filterQuery,
  getCategoryPath,
  getDesignerPath,
  useSearchMeta,
} from '@lib/search'

const SORT = {
  'trending-desc': 'Trending',
  'latest-desc': 'Latest arrivals',
  'price-asc': 'Price: Low to high',
  'price-desc': 'Price: High to low',
} as const

const PRICE_FILTERS = {
  all: 'Any price',
  'under-50': 'Under $50',
  '50-200': '$50–$200',
  '200-plus': '$200+',
} as const

type PriceFilter = keyof typeof PRICE_FILTERS
type GridDensity = 'comfortable' | 'compact'

const RECENT_SEARCHES_KEY = 'myshop:recent-searches'
const GRID_DENSITY_KEY = 'myshop:grid-density'

const matchesPrice = (product: Product, filter: PriceFilter) => {
  const value = product.price.value
  if (filter === 'under-50') return value < 50
  if (filter === '50-200') return value >= 50 && value < 200
  if (filter === '200-plus') return value >= 200
  return true
}

export default function Search({ categories, brands }: SearchPropsType) {
  const router = useRouter()
  const { asPath, locale } = router
  const { q, sort } = router.query
  const searchQuery = typeof q === 'string' ? q.trim() : ''
  const sortKey = typeof sort === 'string' ? sort : ''

  const { pathname, category, brand } = useSearchMeta(asPath)
  const activeCategory = categories.find((cat) => cat.slug === category)
  const activeBrand = brands.find(
    ({ node }) => getSlug(node.path) === `brands/${brand}`
  )?.node

  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [gridDensity, setGridDensity] = useState<GridDensity>('comfortable')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [shareStatus, setShareStatus] = useState('')

  const { data } = useSearch({
    search: searchQuery,
    categoryId: activeCategory?.id,
    brandId: activeBrand?.entityId,
    sort: sortKey,
    locale,
  })

  useEffect(() => {
    try {
      const storedDensity = window.localStorage.getItem(GRID_DENSITY_KEY)
      if (storedDensity === 'compact' || storedDensity === 'comfortable') {
        setGridDensity(storedDensity)
      }

      const storedSearches = JSON.parse(
        window.localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'
      )
      if (Array.isArray(storedSearches)) {
        setRecentSearches(
          storedSearches.filter((value) => typeof value === 'string').slice(0, 5)
        )
      }
    } catch {
      // Storage is an enhancement; search remains functional when it is blocked.
    }
  }, [])

  useEffect(() => {
    if (!searchQuery) return

    setRecentSearches((current) => {
      const next = [
        searchQuery,
        ...current.filter(
          (value) => value.toLocaleLowerCase() !== searchQuery.toLocaleLowerCase()
        ),
      ].slice(0, 5)

      try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {
        // Keep the in-memory experience when storage is unavailable.
      }

      return next
    })
  }, [searchQuery])

  const visibleProducts = useMemo(
    () => (data?.products || []).filter((product) => matchesPrice(product, priceFilter)),
    [data?.products, priceFilter]
  )

  const activeRefinements = useMemo(() => {
    const refinements: string[] = []
    if (activeCategory?.name) refinements.push(`Category: ${activeCategory.name}`)
    if (activeBrand?.name) refinements.push(`Designer: ${activeBrand.name}`)
    if (sortKey && SORT[sortKey as keyof typeof SORT]) {
      refinements.push(`Sort: ${SORT[sortKey as keyof typeof SORT]}`)
    }
    if (priceFilter !== 'all') refinements.push(`Price: ${PRICE_FILTERS[priceFilter]}`)
    return refinements
  }, [activeBrand?.name, activeCategory?.name, priceFilter, sortKey])

  const setDensity = (density: GridDensity) => {
    setGridDensity(density)
    try {
      window.localStorage.setItem(GRID_DENSITY_KEY, density)
    } catch {
      // Preference persistence is optional.
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch {
      // In-memory state is already cleared.
    }
  }

  const clearRefinements = () => {
    setPriceFilter('all')
    router.push(
      {
        pathname: '/search',
        query: filterQuery({ q: searchQuery || undefined }),
      },
      undefined,
      { shallow: true }
    )
  }

  const copySearchLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus('Search link copied')
    } catch {
      setShareStatus('Copy is unavailable in this browser')
    }
  }

  const resultLabel = data
    ? `${visibleProducts.length} ${visibleProducts.length === 1 ? 'product' : 'products'}`
    : 'Loading products'

  return (
    <Container>
      <section className="mt-6 mb-20" aria-busy={!data}>
        <header className="mb-6 border-b border-accent-2 pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-5">
                Catalog
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-accent-9 md:text-3xl">
                {searchQuery ? `Results for “${searchQuery}”` : 'Browse products'}
              </h1>
              <p className="mt-2 text-sm text-accent-5" aria-live="polite">
                {resultLabel}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copySearchLink}
                className="min-h-11 rounded-md border border-accent-3 px-4 py-2 text-sm font-medium text-accent-8 hover:border-accent-5 focus:outline-none focus:ring-2 focus:ring-accent-7"
              >
                Share search
              </button>
              <div className="inline-flex rounded-md border border-accent-3 p-1" aria-label="Product grid density">
                <button
                  type="button"
                  aria-pressed={gridDensity === 'comfortable'}
                  onClick={() => setDensity('comfortable')}
                  className={cn('min-h-9 rounded px-3 text-sm', {
                    'bg-accent-9 text-accent-0': gridDensity === 'comfortable',
                  })}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  aria-pressed={gridDensity === 'compact'}
                  onClick={() => setDensity('compact')}
                  className={cn('min-h-9 rounded px-3 text-sm', {
                    'bg-accent-9 text-accent-0': gridDensity === 'compact',
                  })}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 min-h-5 text-sm text-accent-5" aria-live="polite">
            {shareStatus}
          </p>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium text-accent-8">
            Category
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-accent-3 bg-accent-0 px-3"
              value={activeCategory?.path || ''}
              onChange={(event) =>
                router.push({
                  pathname: getCategoryPath(event.target.value, brand),
                  query: filterQuery({ q: searchQuery, sort: sortKey }),
                })
              }
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.path} value={cat.path}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-accent-8">
            Designer
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-accent-3 bg-accent-0 px-3"
              value={activeBrand?.path || ''}
              onChange={(event) =>
                router.push({
                  pathname: getDesignerPath(event.target.value, category),
                  query: filterQuery({ q: searchQuery, sort: sortKey }),
                })
              }
            >
              <option value="">All designers</option>
              {brands.map(({ node }) => (
                <option key={node.path} value={node.path}>
                  {node.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-accent-8">
            Sort
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-accent-3 bg-accent-0 px-3"
              value={sortKey}
              onChange={(event) =>
                router.push({
                  pathname,
                  query: filterQuery({ q: searchQuery, sort: event.target.value }),
                })
              }
            >
              <option value="">Relevance</option>
              {Object.entries(SORT).map(([key, text]) => (
                <option key={key} value={key}>
                  {text}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-accent-8">
            Price
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-accent-3 bg-accent-0 px-3"
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
            >
              {Object.entries(PRICE_FILTERS).map(([key, text]) => (
                <option key={key} value={key}>
                  {text}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeRefinements.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="Active refinements">
            {activeRefinements.map((refinement) => (
              <span
                key={refinement}
                className="rounded-full bg-accent-1 px-3 py-1.5 text-sm text-accent-8"
              >
                {refinement}
              </span>
            ))}
            <button
              type="button"
              onClick={clearRefinements}
              className="min-h-9 rounded-full border border-accent-3 px-3 text-sm font-medium hover:border-accent-5 focus:outline-none focus:ring-2 focus:ring-accent-7"
            >
              Clear refinements
            </button>
          </div>
        )}

        {recentSearches.length > 0 && (
          <aside className="mb-8 rounded-lg border border-accent-2 bg-accent-0 p-4" aria-label="Recent searches">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-accent-8">Recent searches</p>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="min-h-9 text-sm text-accent-5 underline hover:text-accent-8"
              >
                Clear history
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <Link
                  key={term}
                  href={{ pathname: '/search', query: { q: term } }}
                  className="min-h-9 rounded-full border border-accent-3 px-3 py-1.5 text-sm hover:border-accent-5"
                >
                  {term}
                </Link>
              ))}
            </div>
          </aside>
        )}

        {!data ? (
          <div
            className={cn('grid gap-6', {
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': gridDensity === 'comfortable',
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4': gridDensity === 'compact',
            })}
          >
            {rangeMap(12, (i) => (
              <Skeleton key={i}>
                <div className="aspect-square w-full" />
              </Skeleton>
            ))}
          </div>
        ) : visibleProducts.length > 0 ? (
          <div
            className={cn('grid gap-6', {
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': gridDensity === 'comfortable',
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4': gridDensity === 'compact',
            })}
          >
            {visibleProducts.map((product: Product) => (
              <ProductCard
                variant="simple"
                key={product.path || product.id}
                className="animated fadeIn"
                product={product}
                imgProps={{ width: 480, height: 480 }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-accent-3 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-accent-9">No matching products</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-accent-5">
              Try a broader search or remove one or more refinements.
            </p>
            {activeRefinements.length > 0 && (
              <button
                type="button"
                onClick={clearRefinements}
                className="mt-5 min-h-11 rounded-md bg-accent-9 px-5 py-2 text-sm font-semibold text-accent-0 focus:outline-none focus:ring-2 focus:ring-accent-7"
              >
                Clear refinements
              </button>
            )}
          </div>
        )}
      </section>
    </Container>
  )
}

Search.Layout = Layout
