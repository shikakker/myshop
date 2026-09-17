import type { FC } from 'react'
import {
  getCommerceProvider,
  useCommerce as useCoreCommerce,
} from '@vercel/commerce'
import type { CommerceProviderProps } from '@vercel/commerce'
import { localProvider, LocalProvider } from './provider'

export { localProvider }
export type { LocalProvider }

export const CommerceProvider: FC<CommerceProviderProps> =
  getCommerceProvider(localProvider)

export const useCommerce = () => useCoreCommerce<LocalProvider>()
