import { Jost, Livvic } from 'next/font/google'

export const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
})

export const livvic = Livvic({
  weight: ['100', '200', '300', '400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-livvic',
}) 