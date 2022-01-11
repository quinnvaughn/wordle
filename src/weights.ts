import words from "./five_letter_words.json"
import fs from "fs"

function getWeights(words: string[]) {
  let letterWeights: { [key: string]: number } = {}
  let wordWeightArray: { word: string; weight: number }[] = []
  const totalLetters = words.length * 5

  // get the total occurences of each letter.
  words.forEach((word) =>
    word
      .split("")
      .forEach(
        (letter) => (letterWeights[letter] = (letterWeights[letter] ?? 0) + 1)
      )
  )

  words.forEach((word) => {
    let uniqueLetters = new Set(word).size
    const weight = word.split("").reduce((prev, curr) => {
      return (
        prev + (letterWeights[curr] / totalLetters) * Math.exp(uniqueLetters)
      )
    }, 0)
    wordWeightArray.push({ word, weight })
  })

  wordWeightArray.sort((a, b) => b.weight - a.weight)

  fs.writeFile(
    "src/words_with_weights.json",
    JSON.stringify(wordWeightArray),
    {},
    () => {}
  )
}

getWeights(words)
