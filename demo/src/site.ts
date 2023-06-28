import { getAddress } from 'letterhouse'

export { default as intro } from './widgets/intro.mdx'

export const author = await getAddress('myself')
export const title = 'James K Nelson'
export const blurb =
  'I want to be able to share thoughts and conversations without forcing you to use some distracting social media platform. So I created this website.'
export const language = 'en'

export const menu = [
  {
    label: 'Notes & Essays',
    href: '/',
  },
  // {
  //   label: 'Inbox',
  //   href: '/inbox/',
  // },
  // {
  //   label: 'Address Book',
  //   href: '/address-book/',
  // },
  {
    label: 'About Me',
    href: '/about/',
  },
]
