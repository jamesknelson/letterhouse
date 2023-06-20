import mem from 'mem'

import { type Letter } from '../model/letter'
import { NotFoundError } from '../utils/notFoundError'

import { getInboxModules, getPostModules } from './moduleGetters'
import {
  getLetterFromModuleAndPath,
  isLetterContent,
  validateLetterModule,
} from './letterModule'
import { parseLetterPath } from './letterPath'

export type ReceivedLetters = Map<string, Letter>
export type SentLetters = Map<string, Letter>

export function getLetter(id: string): Promise<Letter> {
  const letter = getLetterLoaderMap().get(id)
  if (!letter) {
    throw new NotFoundError(id, 'letter')
  }
  return letter()
}

export function getReceived(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection === 'inbox',
  )
}

export async function getDrafts(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection !== 'inbox' && letter.status === 'draft',
  )
}

export async function getPreviews(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection !== 'inbox' && letter.status === 'preview',
  )
}

export async function getPublished(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection !== 'inbox' && letter.status === 'published',
  )
}

///

const getLetterLoaderMap: {
  (): Map<string, () => Promise<Letter>>
  cache?: Map<string, () => Promise<Letter>>
} = () => {
  if (!getLetterLoaderMap.cache) {
    getLetterLoaderMap.cache = new Map(
      [
        ...Object.entries(getInboxModules()),
        ...Object.entries(getPostModules()),
      ].map(getLetterLoaderEntry),
    )
  }
  return getLetterLoaderMap.cache
}

async function collate(
  letterPromises: (() => Promise<Letter>)[],
  predicate?: (letter: Letter) => boolean,
): Promise<Letter[]> {
  const letters = await Promise.all(letterPromises.map((loader) => loader()))
  const now = new Date()
  return (!predicate ? letters : letters.filter(predicate)).sort(
    (x, y) =>
      new Date(y.dated || now).getTime() - new Date(x.dated || now).getTime(),
  )
}

function getLetterLoaderEntry([path, module]: readonly [string, any]) {
  const letterPath = parseLetterPath(path)
  const loader = async (): Promise<Letter> => {
    const letterContent = await module()
    if (!isLetterContent(letterContent)) {
      throw validateLetterModule(letterContent).join('\n')
    }
    return getLetterFromModuleAndPath(letterContent, letterPath)
  }

  return [letterPath.id, mem(loader)] as const
}
