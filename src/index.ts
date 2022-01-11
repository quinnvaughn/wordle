import inquirer from "inquirer"
import words from "./words_with_weights.json"

type Answer = {
  guess: string
  usedWrong: string
  usedRight: string
}

type Index = {
  index: number
  letter: string
}

type State = {
  wordsLeft: Word[]
  suggestion?: Word
  notUsedLetters: string[]
  usedLettersWrongPosition: Index[]
  correct: boolean
  numGuesses: number
  lettersInPosition: [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null
  ]
}

type Word = {
  word: string
  weight: number
}

type Actions =
  | { type: "addNotUsedLetter"; payload: string }
  | {
      type: "setPositionLetter"
      payload: { index: number; letter: string }
    }
  | { type: "incGuesses" }
  | { type: "wordleCorrect" }
  | { type: "addUsedLetterWrongPosition"; payload: Index }
  | { type: "getTopSuggestion" }

function wordIncluesLetterAndIsInDifferentLocation(
  word: string,
  position: Index
): boolean {
  // checks if a word first includes a letter
  // then if the letter is not at that position
  return (
    word.includes(position.letter) && word[position.index] !== position.letter
  )
}

function getWeights(words: Word[]) {
  let letterWeights: { [key: string]: number } = {}
  let wordWeightArray: { word: string; weight: number }[] = []
  const totalLetters = words.length * 5

  // get the total occurences of each letter.
  words.forEach((word) =>
    word.word
      .split("")
      .forEach(
        (letter) => (letterWeights[letter] = (letterWeights[letter] ?? 0) + 1)
      )
  )

  words.forEach((word) => {
    let uniqueLetters = new Set(word.word).size
    const weight = word.word.split("").reduce((prev, curr) => {
      return (
        prev + (letterWeights[curr] / totalLetters) * Math.exp(uniqueLetters)
      )
    }, 0)
    wordWeightArray.push({ word: word.word, weight })
  })

  return wordWeightArray.sort((a, b) => b.weight - a.weight)
}

function letterInCorrectSpot(
  word: string,
  letter: string | null,
  index: number
) {
  if (letter === null) return true
  return word[index] === letter
}

function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case "incGuesses": {
      return { ...state, numGuesses: state.numGuesses + 1 }
    }
    case "wordleCorrect": {
      return { ...state, correct: true }
    }
    case "addNotUsedLetter": {
      return {
        ...state,
        notUsedLetters: [...state.notUsedLetters, ...action.payload],
      }
    }
    case "setPositionLetter": {
      const { letter, index } = action.payload
      const indexToLocation = index > 5 || index < 0 ? "undefined" : index

      if (typeof indexToLocation === "undefined") return state
      const copyofLettersInPosition = [...state.lettersInPosition] as [
        string | null,
        string | null,
        string | null,
        string | null,
        string | null
      ]
      copyofLettersInPosition[indexToLocation as number] = letter
      return { ...state, lettersInPosition: copyofLettersInPosition }
    }
    case "addUsedLetterWrongPosition": {
      return {
        ...state,
        usedLettersWrongPosition: [
          ...state.usedLettersWrongPosition,
          action.payload,
        ],
      }
    }
    case "getTopSuggestion": {
      const regex = new RegExp(state.notUsedLetters.join("|"), "i")
      const filteredWords = state.wordsLeft.filter((word) => {
        return (
          !regex.test(word.word) &&
          state.usedLettersWrongPosition.every((value) =>
            wordIncluesLetterAndIsInDifferentLocation(word.word, value)
          ) &&
          state.lettersInPosition.every((letter, index) =>
            letterInCorrectSpot(word.word, letter, index)
          )
        )
      })
      const weightedFilteredWords = getWeights(filteredWords)
      return {
        ...state,
        wordsLeft: weightedFilteredWords,
        suggestion: weightedFilteredWords[0],
        correct: filteredWords.length === 1,
      }
    }
    default:
      return state
  }
}

function dispatch(action: Actions) {
  state = reducer(state, action)
}

let state: State = {
  wordsLeft: words,
  suggestion: words[0] ?? undefined,
  correct: false,
  notUsedLetters: [],
  numGuesses: 0,
  usedLettersWrongPosition: [],
  lettersInPosition: [null, null, null, null, null],
}

function getPos(word: string, letter: string, occurence: number) {
  return word.split(letter, occurence).join(letter).length
}

function formatUsed(word: string, guess: string) {
  return word === "none"
    ? "none"
    : word === "all"
    ? "all"
    : word
        .split(" ")
        .filter(Boolean)
        .map((val) =>
          val.length === 2
            ? { letter: val[0], index: getPos(guess, val[0], Number(val[1])) }
            : { letter: val, index: getPos(guess, val, 1) }
        )
}

function suggestWord(state: State) {
  console.log("Suggested word: ", state.suggestion?.word)
}

// TODO: Add check for bad input.
// Don't add another guess if they input poorly,
// just make them redo it.

// TODO: Add "same" command if either used wrong or used right
// has not changed since last attempt.

// TODO: Add a "redo" command that lets me redo a turn if I inputted
// incorrect data - ie did green on the yellow prompt.

async function main() {
  suggestWord(state)
  while (!state.correct && state.numGuesses < 6) {
    const answers = (await inquirer.prompt([
      { type: "input", name: "guess", message: "What is your guess?" },
      {
        type: "input",
        name: "usedWrong",
        message: "Which letters are used but not in the right spot?",
      },
      {
        type: "input",
        name: "usedRight",
        message: "Which letters are used and in the right spot?",
      },
    ])) as Answer

    const { guess, usedWrong, usedRight } = answers

    // get correct format for usedWrong and usedRight
    const formattedWrong = formatUsed(usedWrong, guess)
    const formattedRight = formatUsed(usedRight, guess)

    if (formattedRight === "all") {
      dispatch({ type: "wordleCorrect" })
      return
    }

    guess.split("").forEach((letter, index) => {
      let inArray = false
      let wrongPosition = false
      let letterNotAlreadyCorrect =
        state.lettersInPosition.filter(
          (lip, lipIndex) => lip === letter && lipIndex === index
        ).length === 0
      if (
        formattedWrong !== "none" &&
        formattedWrong !== "all" &&
        formattedWrong.some(
          (val) => val.letter === letter && val.index === index
        ) &&
        letterNotAlreadyCorrect
      ) {
        dispatch({
          type: "addUsedLetterWrongPosition",
          payload: { letter, index },
        })
        inArray = true
        wrongPosition = true
      }
      if (
        formattedRight !== "none" &&
        formattedRight.some(
          (val) => val.letter === letter && val.index === index
        ) &&
        !wrongPosition
      ) {
        dispatch({ type: "setPositionLetter", payload: { letter, index } })
        inArray = true
      }
      if (!inArray) dispatch({ type: "addNotUsedLetter", payload: letter })
    })
    dispatch({ type: "incGuesses" })
    dispatch({ type: "getTopSuggestion" })
    suggestWord(state)
  }
  if (state.correct) {
    console.log("Yay! You won!")
  } else {
    console.log("Better luck next time.")
  }
}

main()
