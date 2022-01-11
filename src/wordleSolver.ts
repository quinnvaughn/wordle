import type {
  Index,
  Word,
  Response,
  FormattedRight,
  FormattedWrong,
} from "./types"
import weightedWords from "./words_with_weights.json"

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

  constructor(words?: Word[]) {
    this._wordsLeft =
      typeof words !== "undefined" && words.length > 0 ? words : weightedWords
    this._suggestion = this._wordsLeft[0].word
  }

  get correct() {
    return this._correct
  }

  get numGuesses() {
    return this._numGuesses
  }

  public oneWordLeft() {
    return this._wordsLeft.length === 1
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
    this._notUsedLetters.push(letter)
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

  public suggestWord() {
    console.log("Suggested word: ", this._suggestion)
  }

  public addGuess(response: Response) {
    // get correct format for usedWrong and usedRight
    const formattedWrong = this.formatWrong(response.usedWrong, response.guess)
    const formattedRight = this.formatRight(response.usedRight, response.guess)

    if (formattedRight === "all") {
      this.userWon()
      return
    }
    this.loopThroughLetters(response, formattedWrong, formattedRight)
  }

  private loopThroughLetters(
    response: Response,
    formattedWrong: FormattedWrong,
    formattedRight: FormattedRight
  ) {
    response.guess.split("").forEach((letter, index) => {
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
