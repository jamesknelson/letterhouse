export default function roundWordCount(wordCount: number): number {
  if (wordCount < 101) {
    return Math.round((wordCount + 10) / 10) * 10
  } else if (wordCount < 350) {
    return Math.round((wordCount + 25) / 50) * 50
  } else {
    return Math.round((wordCount + 50) / 100) * 100
  }
}