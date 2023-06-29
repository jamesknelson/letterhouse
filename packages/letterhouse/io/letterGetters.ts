import mem from 'mem'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

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
    createDatedOrder(new Date()),
  )
}

export async function getDrafts(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection !== 'inbox' && letter.status === 'draft',
    modifiedOrder,
  )
}

export async function getPreviews(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection !== 'inbox' && letter.status === 'preview',
    modifiedOrder,
  )
}

export async function getWIP(): Promise<Letter[]> {
  const draftsPromise = getDrafts()
  const previewsPromise = getPreviews()
  return [await previewsPromise, await draftsPromise].flat()
}

export async function getPublished(): Promise<Letter[]> {
  return collate(
    [...getLetterLoaderMap().values()],
    (letter) => letter.collection !== 'inbox' && letter.status === 'published',
    createDatedOrder(new Date()),
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
  predicate: (letter: Letter) => boolean,
  order: (x: Letter, y: Letter) => number,
): Promise<Letter[]> {
  const letters = await Promise.all(letterPromises.map((loader) => loader()))
  return (!predicate ? letters : letters.filter(predicate)).sort(order)
}

const createDatedOrder = (now: Date) => (x: Letter, y: Letter) =>
  new Date(y.dated || now).getTime() - new Date(x.dated || now).getTime()

const modifiedOrder = (x: Letter, y: Letter) =>
  new Date(y.modifiedTime).getTime() - new Date(x.modifiedTime).getTime()

function getLetterLoaderEntry([path, module]: readonly [string, any]) {
  const letterPath = parseLetterPath(path)
  const loader = async (): Promise<Letter> => {
    const letterContent = await module()
    if (!isLetterContent(letterContent)) {
      throw validateLetterModule(letterContent).join('\n')
    }
    const cwd = process.cwd()
    const fullPath = resolve(path, cwd)
    const { mtime } = await stat(fullPath)
    return getLetterFromModuleAndPath(letterContent, letterPath, mtime)
  }

  return [letterPath.id, mem(loader)] as const
}
