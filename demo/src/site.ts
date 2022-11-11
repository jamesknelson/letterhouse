import { createGithubEditURLGetter, getAddress } from 'letterhouse'

export { default as intro } from './widgets/intro.md'

export const author = await getAddress('myself')
export const title = 'James K Nelson'
export const blurb =
  'I want to be able to share thoughts and conversations without forcing you to use some distracting social media platform. So I created this website.'
export const language = 'en'

export const menu = [
  {
    label: 'Letters',
    href: '/',
  },
  {
    label: 'Inbox',
    href: '/received',
  },
  {
    label: 'Address Book',
    href: '/address-book',
  },
  // {
  //   label: 'Offers',
  //   href: '/offers',
  // },
  {
    label: 'About',
    href: '/about',
  },
]

export const editURLGetter = createGithubEditURLGetter(
  (branch) => `jamesknelson/jkn${branch === 'main' ? '' : '-draft'}`,
)
