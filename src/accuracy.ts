// Check to see how accurate the solver is.
import words from "./five_letter_words.json"
import { WordleSolver } from "./wordleSolver"
import fs from "fs"

// loop through each letter in guess
// see if the letter is present in the answer
// AND that it's not in that specific index.
function getIncorrectPosition(answer: string, guess: string) {
  let incorrect = ""
  const letterOccurence: { [letter: string]: number } = {}

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]
    const numOccurences =
      answer.match(new RegExp(letter, "g") || [])?.length || 1
    if (answer.includes(letter)) {
      letterOccurence[letter] = (letterOccurence[letter] ?? 0) + 1
      if (answer[i] !== letter) {
        if (numOccurences > 1) {
          incorrect += `${letter}${letterOccurence[letter]} `
        } else {
          incorrect += `${letter} `
        }
      }
    }
  }
  return incorrect
}

function getCorrect(answer: string, guess: string) {
  let correct = ""

  const letterOccurence: { [letter: string]: number } = {}

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]
    const numOccurences =
      answer.match(new RegExp(letter, "g") || [])?.length || 1
    if (answer[i] === letter) {
      if (numOccurences > 1) {
        letterOccurence[letter] = (letterOccurence[letter] ?? 0) + 1
        correct += `${letter}${letterOccurence[letter]} `
      } else {
        correct += `${letter} `
      }
    }
  }
  return correct
}

function accuracy() {
  // words the solver gets wrong.
  // Helps to see what it trips up on
  // to improve logic.
  const incorrectWords: string[] = []
  // this shows all the correct words and how many guesses it took for each.
  let numGuessesMap: { [key: string]: number } = {}
  for (let i = 0; i < words.length; i++) {
    const wordle = new WordleSolver()
    const answer = words[i]
    let correct = getCorrect(answer, wordle.suggestion)
    let incorrectPosition = getIncorrectPosition(answer, wordle.suggestion)
    wordle.addGuess({ guess: wordle.suggestion, correct, incorrectPosition })

    while (!wordle.correct && wordle.numGuesses < 7) {
      correct = getCorrect(answer, wordle.suggestion)
      incorrectPosition = getIncorrectPosition(answer, wordle.suggestion)
      wordle.addGuess({ guess: wordle.suggestion, correct, incorrectPosition })
    }

    if (answer === wordle.suggestion) {
      numGuessesMap[answer] = wordle.numGuesses
    } else {
      incorrectWords.push(answer)
    }
  }

  fs.writeFileSync(
    "data/numGuesses.json",
    JSON.stringify(numGuessesMap, null, 2)
  )

  fs.writeFileSync(
    "data/incorrectWords.json",
    JSON.stringify(incorrectWords, null, 2)
  )

  const percentages = {
    correct: (Object.keys(numGuessesMap).length / words.length) * 100,
    incorrect: (incorrectWords.length / words.length) * 100,
  }

  fs.writeFileSync(
    "data/percentages.json",
    JSON.stringify(percentages, null, 2)
  )

  function getNumGuesses(amount: number) {
    return Object.values(numGuessesMap).filter((guesses) => guesses === amount)
      .length
  }

  const numGuessesDistribution = {
    one: getNumGuesses(1),
    two: getNumGuesses(2),
    three: getNumGuesses(3),
    four: getNumGuesses(4),
    five: getNumGuesses(5),
    six: getNumGuesses(6),
  }

  fs.writeFileSync(
    "data/distribution.json",
    JSON.stringify(numGuessesDistribution, null, 2)
  )
}

accuracy()
