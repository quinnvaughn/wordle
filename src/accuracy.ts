// Check to see how accurate the solver is.
// import words from "./five_letter_words.json"
import { WordleSolver } from "./wordleSolver"

const words = ["agara"]

function getIndicesOf(answer: string, letter: string) {
  const regex = new RegExp(letter, "gi")
  let result: RegExpExecArray | null = null
  const indices: number[] = []
  while ((result = regex.exec(answer))) {
    indices.push(result.index)
  }
  return indices
}
// loop through each letter in guess
// see if the letter is present in the answer
// AND that it's not in that specific index.
function getIncorrectPositions(
  answer: string,
  guess: string,
  correct: string
) {}

function getCorrect(answer: string, guess: string) {
  let correct = ""

  const letterOccurence: { [letter: string]: number } = {}

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]
    const numOccurences =
      answer.match(new RegExp(letter, "g") || [])?.length || 1
    if (answer[i] === letter) {
      if (numOccurences > 1) {
        letterOccurence[letter] = letterOccurence[letter] + 1 || 1
        correct += `${letter}${letterOccurence[letter]} `
      } else {
        correct += `${letter} `
      }
    }
  }
  return correct
}

function accuracy() {
  // words the solver gets right.
  const correctWords: string[] = []
  // words the solver gets wrong.
  // Helps to see what it trips up on
  // to improve logic.
  const incorrectWords: string[] = []
  let numGuessesMap: { [key: string]: number } = {}

  const guess = "agash"

  const answer = "aralb"

  let correct = getCorrect(answer, guess)

  console.log(correct)
}

accuracy()
