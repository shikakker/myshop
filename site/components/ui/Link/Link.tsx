import NextLink from 'next/link'
import type { ComponentProps } from 'react'

type LinkProps = ComponentProps<typeof NextLink>

const Link = ({ children, ...props }: LinkProps) => {
  return <NextLink {...props}>{children}</NextLink>
}

export default Link
