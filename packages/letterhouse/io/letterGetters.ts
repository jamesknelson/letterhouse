import mem from 'mem'

import { type Letter } from '../model/letter'
import { NotFoundError } from '../utils/notFoundError'

import { getReceivedLetterModules, getSentLetterModules } from './moduleGetters'
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
    (letter) => letter.category === 'received',
  )
}

export async function getDrafts(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.category === 'draft',
  )
}

export async function getSent(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.category === 'sent',
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
        ...Object.entries(getReceivedLetterModules()),
        ...Object.entries(getSentLetterModules()),
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
