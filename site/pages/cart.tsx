import type { GetStaticPropsContext } from 'next'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import commerce from '@lib/api/commerce'
import { isCommerceDemo } from '@lib/commerce-mode'
import { Layout } from '@components/common'
import { Button, Text, Container } from '@components/ui'
import { Bag, MapPin, CreditCard } from '@components/icons'
import { CartItem } from '@components/cart'
import { useUI } from '@components/ui/context'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise
  return {
    props: { pages, categories },
  }
}

export default function Cart() {
  const { data, isLoading, isEmpty } = useCart()
  const { openSidebar, setSidebarView } = useUI()

  const { price: subTotal } = usePrice(
    data && {
      amount: Number(data.subtotalPrice),
      currencyCode: data.currency.code,
    }
  )
  const { price: total } = usePrice(
    data && {
      amount: Number(data.totalPrice),
      currencyCode: data.currency.code,
    }
  )

  const goToCheckout = () => {
    openSidebar()
    setSidebarView('CHECKOUT_VIEW')
  }

  return (
    <Container className="grid lg:grid-cols-12 pt-4 gap-8 lg:gap-20">
      <div className="lg:col-span-7">
        {isLoading || isEmpty ? (
          <div className="flex-1 px-6 sm:px-12 py-20 flex flex-col justify-center items-center">
            <span className="border border-dashed border-secondary flex items-center justify-center w-16 h-16 bg-primary p-12 rounded-lg text-primary">
              <Bag className="absolute" />
            </span>
            <h1 className="pt-6 text-2xl font-bold tracking-wide text-center">
              Your cart is empty
            </h1>
            <p className="text-accent-6 px-4 sm:px-10 text-center pt-2">
              Add a product to review quantities and pricing here.
            </p>
          </div>
        ) : (
          <div className="lg:px-0 sm:px-6 flex-1">
            <Text variant="pageHeading">My Cart</Text>
            <Text variant="sectionHeading">Review your order</Text>
            <ul className="py-6 space-y-6 sm:py-0 sm:space-y-0 sm:divide-y sm:divide-accent-2 border-b border-accent-2">
              {data!.lineItems.map((item: any) => (
                <CartItem
                  key={item.id}
                  item={item}
                  currencyCode={data!.currency.code}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <div className="flex-shrink-0 px-4 py-10 lg:py-24 sm:px-6">
          {!isCommerceDemo && process.env.COMMERCE_CUSTOMCHECKOUT_ENABLED && (
            <>
              <div className="rounded-md border border-accent-2 px-6 py-6 mb-4 text-center flex items-center justify-center hover:border-accent-4">
                <div className="mr-5">
                  <MapPin />
                </div>
                <div className="text-sm text-center font-medium">
                  <span className="uppercase">+ Add Shipping Address</span>
                </div>
              </div>
              <div className="rounded-md border border-accent-2 px-6 py-6 mb-4 text-center flex items-center justify-center hover:border-accent-4">
                <div className="mr-5">
                  <CreditCard />
                </div>
                <div className="text-sm text-center font-medium">
                  <span className="uppercase">+ Add Payment Method</span>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-accent-2">
            <ul className="py-3">
              <li className="flex justify-between py-1 gap-4">
                <span>Subtotal</span>
                <span>{subTotal}</span>
              </li>
              <li className="flex justify-between py-1 gap-4">
                <span>Taxes</span>
                <span>{isCommerceDemo ? 'Not charged in demo' : 'Calculated at checkout'}</span>
              </li>
              <li className="flex justify-between py-1 gap-4">
                <span>Shipping</span>
                <span>{isCommerceDemo ? 'Not charged in demo' : 'Calculated at checkout'}</span>
              </li>
            </ul>
            <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-6">
              <span>Total</span>
              <span>{total}</span>
            </div>
          </div>

          <div className="w-full lg:w-80 ml-auto space-y-3">
            {isEmpty ? (
              <Button href="/" Component="a" width="100%">
                Continue Shopping
              </Button>
            ) : isCommerceDemo ? (
              <>
                <div className="rounded-md border border-accent-2 bg-accent-1 px-4 py-3 text-sm text-accent-6" role="status">
                  Checkout is unavailable in local demo mode. Connect a supported commerce provider before accepting orders.
                </div>
                <Button href="/search" Component="a" width="100%">
                  Continue Shopping
                </Button>
              </>
            ) : process.env.COMMERCE_CUSTOMCHECKOUT_ENABLED ? (
              <Button Component="a" width="100%" onClick={goToCheckout}>
                Proceed to Checkout ({total})
              </Button>
            ) : (
              <Button href="/checkout" Component="a" width="100%">
                Proceed to Checkout
              </Button>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

Cart.Layout = Layout
