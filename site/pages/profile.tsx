import type { GetStaticPropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Container, Text } from '@components/ui'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  if (!process.env.COMMERCE_CUSTOMERAUTH_ENABLED) {
    return { notFound: true }
  }

  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise

  return {
    props: { pages, categories },
  }
}

export default function Profile() {
  const { data } = useCustomer()

  return (
    <Container className="pt-4">
      <Text variant="pageHeading">My Profile</Text>
      {data ? (
        <div className="max-w-xl flex flex-col divide-accent-2 divide-y">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4">
            <span className="text-lg font-medium text-accent-6 flex-1">Full Name</span>
            <span>
              {data.firstName} {data.lastName}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4">
            <span className="text-lg font-medium text-accent-6 flex-1">Email</span>
            <span className="break-all">{data.email}</span>
          </div>
        </div>
      ) : (
        <p className="text-accent-6 py-6">Sign in with the configured commerce provider to view your profile.</p>
      )}
    </Container>
  )
}

Profile.Layout = Layout
