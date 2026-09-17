/**
 * Local storefront configuration used by next.config.js.
 * The deployable app compiles the in-repo commerce sources directly so the
 * historical provider build toolchain is not part of the production install.
 */

const path = require('path')
const providerNextConfig = require('../packages/local/src/next.config.cjs')

const PROVIDERS = ['@vercel/commerce-local']

function getProviderName() {
  return process.env.COMMERCE_PROVIDER || '@vercel/commerce-local'
}

function withCommerceConfig(nextConfig = {}) {
  const provider = nextConfig.commerce?.provider || getProviderName()

  if (!PROVIDERS.includes(provider)) {
    throw new Error(
      `The commerce provider "${provider}" is not installed in this production storefront. Supported provider: "${PROVIDERS.join(
        ', '
      )}"`
    )
  }

  const providerCommerce = providerNextConfig.commerce || {}
  const appCommerce = nextConfig.commerce || {}
  const features = {
    ...(providerCommerce.features || {}),
    ...(appCommerce.features || {}),
  }

  const config = {
    ...providerNextConfig,
    ...nextConfig,
    commerce: {
      ...providerCommerce,
      ...appCommerce,
      provider,
      features,
    },
    images: {
      ...(providerNextConfig.images || {}),
      ...(nextConfig.images || {}),
    },
    env: {
      ...(providerNextConfig.env || {}),
      ...(nextConfig.env || {}),
    },
    experimental: {
      ...(providerNextConfig.experimental || {}),
      ...(nextConfig.experimental || {}),
      externalDir: true,
    },
  }

  Object.entries(features).forEach(([key, value]) => {
    if (value) {
      config.env[`COMMERCE_${key.toUpperCase()}_ENABLED`] = String(Boolean(value))
    }
  })

  // `commerce` is an internal composition key, not a supported Next.js config key.
  // Strip it after feature/env derivation so Next can validate the final config cleanly.
  delete config.commerce

  const webpack = nextConfig.webpack
  config.webpack = (webpackConfig, options) => {
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias || {}),
      '@commerce': path.resolve(__dirname, '../packages/commerce/src'),
      '@vercel/commerce': path.resolve(__dirname, '../packages/commerce/src'),
      '@framework': path.resolve(__dirname, '../packages/local/src'),
    }

    return webpack ? webpack(webpackConfig, options) : webpackConfig
  }

  return config
}

module.exports = { withCommerceConfig, getProviderName }
