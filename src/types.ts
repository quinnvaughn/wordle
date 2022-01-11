export type Response = {
  guess: string
  usedWrong: string
  usedRight: string
}

export type Word = {
  word: string
  weight: number
}

export type Index = {
  index: number
  letter: string
}

export type FormattedRight = "none" | "all" | Index[]

export type FormattedWrong = "none" | Index[]
