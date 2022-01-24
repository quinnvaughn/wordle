export type UserInput = {
  guess: string
  yellow: string
  green: string
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

export type FormattedGreen = "none" | "all" | Index[]

export type FormattedYellow = "none" | Index[]
