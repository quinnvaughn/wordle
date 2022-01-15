import { Commands } from "./commands"
import { InputFormatter } from "./inputformatter"
import { InputValidator } from "./inputvalidator"
import type {
  Index,
  Word,
  UserInput,
  FormattedCorrect,
  FormattedIncorrectPosition,
  UserInputValidation,
} from "./types"
import weightedWords from "./words_with_weights.json"

export class WordleSolver {
  private _wordsLeft: Word[]
  private _notUsedLetters: string[] = []
  private _usedLettersWrongPosition: Index[] = []
  private _numGuesses: number = 1
  private _lettersInPosition: [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null
  ] = [null, null, null, null, null]
  private _correct: boolean = false
  private _suggestion: string

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
    if (
      this._notUsedLetters.includes(letter) ||
      this._usedLettersWrongPosition.some((wp) => wp.letter === letter) ||
      this._lettersInPosition.includes(letter)
    ) {
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
    if (
      this._usedLettersWrongPosition.some(
        (wp) => wp.index === index && wp.letter === letter
      )
    ) {
      return
    } else {
      this._usedLettersWrongPosition.push({ letter, index })
    }
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

  public addGuess(input: UserInput): UserInputValidation {
    // get everything in lowercase
    const inputFormatter = new InputFormatter()
    const formattedInput = inputFormatter.lowercaseInput(input)
    const { guess, incorrectPosition, correct } = formattedInput
    // const inputValidator = new InputValidator(formattedInput)
    // // error checking
    // const errorCheck = inputValidator.checkInputErrors()
    // if (errorCheck.type === "error") {
    //   return errorCheck
    // }
    // get correct format for incorrectPosition and correct
    const formattedIncorrectPosition = inputFormatter.formatIncorrectPosition(
      incorrectPosition,
      guess
    )
    const formattedCorrect = inputFormatter.formatCorrect(correct, guess)

    if (formattedCorrect === Commands.all || formattedCorrect.length === 5) {
      this.userWon()
      return { type: "ok" }
    }
    this.loopThroughLetters(guess, formattedIncorrectPosition, formattedCorrect)
    return { type: "ok" }
  }

  private loopThroughLetters(
    guess: string,
    FormattedIncorrectPosition: FormattedIncorrectPosition,
    FormattedCorrect: FormattedCorrect
  ) {
    guess.split("").forEach((letter, index) => {
      let inArray = false
      let wrongPosition = false
      if (
        FormattedIncorrectPosition !== Commands.none &&
        FormattedIncorrectPosition.some(
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
        FormattedCorrect !== Commands.none &&
        FormattedCorrect !== Commands.all &&
        FormattedCorrect.some(
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
