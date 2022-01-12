import type {
  Index,
  Word,
  Response,
  FormattedRight,
  FormattedWrong,
} from "./types"
import weightedWords from "./words_with_weights.json"

type GuessResponse = { type: "ok" } | { type: "error"; message: string }

export class WordleSolver {
  private _wordsLeft: Word[]
  private _notUsedLetters: string[] = []
  private _usedLettersWrongPosition: Index[] = []
  private _numGuesses: number = 0
  private _lettersInPosition: [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null
  ] = [null, null, null, null, null]
  private _correct: boolean = false
  private _suggestion?: string

  constructor(words: Word[] = weightedWords) {
    this._wordsLeft = words
    this._suggestion = this._wordsLeft[0].word
  }

  get correct() {
    return this._correct
  }

  get numGuesses() {
    return this._numGuesses
  }

  get notUsedLetters() {
    return this._notUsedLetters
  }

  get usedLettersWrongPosition() {
    return this._usedLettersWrongPosition
  }

  get lettersInPosition() {
    return this._lettersInPosition
  }

  get suggestion() {
    return this._suggestion
  }

  public oneWordLeft() {
    return this._wordsLeft.length === 1
  }

  public outputSuggestionToConsole() {
    console.log(`Suggested word: ${this._suggestion}`)
    console.log(`Possible words left: ${this._wordsLeft.length}`)
  }

  private userWon() {
    this._correct = true
  }

  private wordIncluesLetterAndIsInDifferentLocation(
    word: string,
    position: Index
  ): boolean {
    // checks if a word first includes a letter
    // then if the letter is not at that position
    return (
      word.includes(position.letter) && word[position.index] !== position.letter
    )
  }

  private getWeights(words: Word[]) {
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

  private letterInCorrectSpot(
    word: string,
    letter: string | null,
    index: number
  ) {
    if (letter === null) return true
    return word[index] === letter
  }

  private incrementGuesses() {
    this._numGuesses += 1
  }

  private addNotUsedLetter(letter: string) {
    // array already contains letter.
    if (this._notUsedLetters.includes(letter)) {
      return
    } else {
      this._notUsedLetters.push(letter)
    }
  }

  private setPositionLetter(letter: string, index: number) {
    const indexToLocation = index > 5 || index < 0 ? "undefined" : index

    if (typeof indexToLocation === "undefined") return
    this._lettersInPosition[indexToLocation as number] = letter
  }

  private addUsedLetterWrongPosition(letter: string, index: number) {
    this._usedLettersWrongPosition.push({ letter, index })
  }

  private updateSuggestion() {
    const regex = new RegExp(this._notUsedLetters.join("|"), "i")
    const filteredWords = this._wordsLeft.filter((word) => {
      return (
        !regex.test(word.word) &&
        this._usedLettersWrongPosition.every((value) =>
          this.wordIncluesLetterAndIsInDifferentLocation(word.word, value)
        ) &&
        this._lettersInPosition.every((letter, index) =>
          this.letterInCorrectSpot(word.word, letter, index)
        )
      )
    })
    this._wordsLeft = this.getWeights(filteredWords)
    this._suggestion =
      this._wordsLeft.length === 0
        ? "No more suggestions left"
        : this._wordsLeft[0].word

    this._wordsLeft.length === 1 && this.userWon()
  }

  private getPos(word: string, letter: string, occurence: number) {
    return word.split(letter, occurence).join(letter).length
  }

  private formatRight(word: string, guess: string): FormattedRight {
    return word === "none"
      ? "none"
      : word === "all"
      ? "all"
      : word
          .split(" ")
          .filter(Boolean)
          .map((val) =>
            val.length === 2
              ? {
                  letter: val[0],
                  index: this.getPos(guess, val[0], Number(val[1])),
                }
              : { letter: val, index: this.getPos(guess, val, 1) }
          )
  }

  private formatWrong(word: string, guess: string): FormattedWrong {
    return word === "none"
      ? "none"
      : word
          .split(" ")
          .filter(Boolean)
          .map((val) =>
            val.length === 2
              ? {
                  letter: val[0],
                  index: this.getPos(guess, val[0], Number(val[1])),
                }
              : { letter: val, index: this.getPos(guess, val, 1) }
          )
  }

  private incorrectLetterChecker(
    type: "wrong" | "right",
    usedString: string,
    guess: string
  ): GuessResponse {
    if (usedString === "all" || usedString === "none") return { type: "ok" }
    const incorrectLetters: string[] = []
    usedString.split(" ").forEach((letter) => {
      if (!guess.includes(letter)) incorrectLetters.push(letter)
    })
    if (incorrectLetters.length > 0) {
      const plural = incorrectLetters.length === 1 ? "letter" : "letters"
      return {
        type: "error",
        message: `Guess does not contain ${plural} ${incorrectLetters.join(
          ","
        )} in used ${type === "wrong" ? "but incorrect" : "and correct"} spot.`,
      }
    }
    return { type: "ok" }
  }

  private letterLengthChecker(usedString: string): GuessResponse {
    let tooLongOfLetter: string = ""

    usedString.split(" ").every((letter) => {
      if (letter.length !== 1 && letter !== "all" && letter !== "none") {
        tooLongOfLetter = letter
        return false
      }
      return true
    })
    if (tooLongOfLetter.length > 0) {
      return {
        type: "error",
        message: `${tooLongOfLetter} is not a letter. Make sure to put spaces between letters.`,
      }
    } else {
      return { type: "ok" }
    }
  }

  private checkInputErrors({
    guess,
    usedRight,
    usedWrong,
  }: Response): GuessResponse {
    if (guess.length !== 5) {
      return { type: "error", message: "Guess must be 5 letters." }
    }
    const incorrectLetterWrong = this.letterLengthChecker(usedWrong)
    if (incorrectLetterWrong.type === "error") {
      return incorrectLetterWrong
    }
    const incorrectLetterRight = this.letterLengthChecker(usedRight)
    if (incorrectLetterRight.type === "error") {
      return incorrectLetterRight
    }
    const incorrectUsedWrong = this.incorrectLetterChecker(
      "wrong",
      usedWrong,
      guess
    )
    if (incorrectUsedWrong.type === "error") {
      return incorrectUsedWrong
    }
    const incorrectUsedRight = this.incorrectLetterChecker(
      "right",
      usedRight,
      guess
    )
    if (incorrectUsedRight.type === "error") {
      return incorrectUsedRight
    }
    return { type: "ok" }
  }

  public addGuess({ guess, usedRight, usedWrong }: Response): GuessResponse {
    // error checking
    const errorCheck = this.checkInputErrors({ guess, usedRight, usedWrong })
    if (errorCheck.type === "error") {
      return errorCheck
    }
    // get correct format for usedWrong and usedRight
    const formattedWrong = this.formatWrong(usedWrong, guess)
    const formattedRight = this.formatRight(usedRight, guess)

    if (formattedRight === "all") {
      this.userWon()
      return { type: "ok" }
    }
    this.loopThroughLetters(guess, formattedWrong, formattedRight)
    return { type: "ok" }
  }

  private loopThroughLetters(
    guess: string,
    formattedWrong: FormattedWrong,
    formattedRight: FormattedRight
  ) {
    guess.split("").forEach((letter, index) => {
      let inArray = false
      let wrongPosition = false
      if (
        formattedWrong !== "none" &&
        formattedWrong.some(
          (val) => val.letter === letter && val.index === index
        ) &&
        this._lettersInPosition.filter(
          (lip, lipIndex) => lip === letter && lipIndex === index
        ).length === 0
      ) {
        this.addUsedLetterWrongPosition(letter, index)
        inArray = true
        wrongPosition = true
      }
      if (
        formattedRight !== "none" &&
        formattedRight !== "all" &&
        formattedRight.some(
          (val) => val.letter === letter && val.index === index
        ) &&
        !wrongPosition
      ) {
        this.setPositionLetter(letter, index)
        inArray = true
      }
      if (!inArray) this.addNotUsedLetter(letter)
    })
    this.incrementGuesses()
    this.updateSuggestion()
  }
}
