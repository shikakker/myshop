import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

import commerce from '@lib/api/commerce'

export type SearchBrandNode = {
  entityId: string | number
  name: string
  path: string
}

export type SearchBrandEdge = {
  node: SearchBrandNode
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeBrands = (brands: unknown): SearchBrandEdge[] => {
  if (!Array.isArray(brands)) return []

  return brands.flatMap((brand) => {
    if (!isRecord(brand) || !isRecord(brand.node)) return []

    const { entityId, name, path } = brand.node
    const validEntityId =
      typeof entityId === 'string' || typeof entityId === 'number'

    if (!validEntityId || typeof name !== 'string' || typeof path !== 'string') {
      return []
    }

    return [{ node: { entityId, name, path } }]
  })
}

export async function getSearchStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories, brands } = await siteInfoPromise

  return {
    props: {
      pages,
      categories,
      brands: normalizeBrands(brands),
    },
    revalidate: 200,
  }
}

export type SearchPropsType = InferGetStaticPropsType<
  typeof getSearchStaticProps
>
