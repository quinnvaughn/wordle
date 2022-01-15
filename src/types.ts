export type UserInput = {
  guess: string
  incorrectPosition: string
  correct: string
}

export type Word = {
  word: string
  weight: number
}

export type UserInputValidation =
  | { type: "ok" }
  | { type: "error"; message: string }

export type Index = {
  index: number
  letter: string
}

export type FormattedCorrect = "none" | "all" | Index[]

export type FormattedIncorrectPosition = "none" | Index[]
