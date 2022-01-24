import { Commands } from "./commands"
import { InputFormatter } from "./inputformatter"
import { InputValidator } from "./inputvalidator"
import type {
  Index,
  Word,
  UserInput,
  UserInputValidation,
  FormattedYellow,
  FormattedGreen,
} from "./types"
import weightedWords from "./words_with_weights.json"

export class WordleSolver {
  private _wordsLeft: Word[]
  private _notUsedLetters: string[] = []
  private _yellow: Index[] = []
  private _numGuesses: number = 1
  private _green: [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null
  ] = [null, null, null, null, null]
  private _correct: boolean = false
  private _suggestion: string
  private _formatter: InputFormatter
  private _validator: InputValidator

  constructor(
    words: Word[] = weightedWords,
    formatter = new InputFormatter(),
    validator = new InputValidator()
  ) {
    this._wordsLeft = words
    this._suggestion = this._wordsLeft[0].word
    this._formatter = formatter
    this._validator = validator
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
    return this._yellow
  }

  get lettersInPosition() {
    return this._green
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
      this._yellow.some((wp) => wp.letter === letter) ||
      this._green.includes(letter)
    ) {
      return
    } else {
      this._notUsedLetters.push(letter)
    }
  }

  private setPositionLetter(letter: string, index: number) {
    const indexToLocation = index > 5 || index < 0 ? "undefined" : index

    if (typeof indexToLocation === "undefined") return
    this._green[indexToLocation as number] = letter
  }

  private addUsedLetterWrongPosition(letter: string, index: number) {
    if (this._yellow.some((wp) => wp.index === index && wp.letter === letter)) {
      return
    } else {
      this._yellow.push({ letter, index })
    }
  }

  private updateSuggestion() {
    const regex = new RegExp(this._notUsedLetters.join("|"), "i")
    const filteredWords = this._wordsLeft.filter((word) => {
      // this prevents screwing up the situation where
      // you pick a word that has the same letters as your
      // first suggestion.
      // ie suggestion = arose answer = aeros
      const shouldTest = this._notUsedLetters.length > 0
      let doesNotUseNotUsedLetters: boolean = true
      if (shouldTest) {
        doesNotUseNotUsedLetters = !regex.test(word.word)
      }
      return (
        doesNotUseNotUsedLetters &&
        this._yellow.every((value) =>
          this.wordIncluesLetterAndIsInDifferentLocation(word.word, value)
        ) &&
        this._green.every((letter, index) =>
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
    const formattedInput = this._formatter.lowercaseInput(input)
    const { guess, yellow, green } = formattedInput
    // redoing input validation so holding off on this.
    // const inputValidator = new InputValidator(formattedInput)
    // // error checking
    // const errorCheck = inputValidator.checkInputErrors()
    // if (errorCheck.type === "error") {
    //   return errorCheck
    // }
    // get correct format for incorrectPosition and correct
    const formattedYellow = this._formatter.formatYellow(yellow, guess)
    const formattedGreen = this._formatter.formatGreen(green, guess)

    if (formattedGreen === Commands.all || formattedGreen.length === 5) {
      this.userWon()
      return { type: "ok" }
    }
    this.loopThroughLetters(guess, formattedYellow, formattedGreen)
    return { type: "ok" }
  }

  private loopThroughLetters(
    guess: string,
    formattedYellow: FormattedYellow,
    formattedGreen: FormattedGreen
  ) {
    guess.split("").forEach((letter, index) => {
      let inArray = false
      let wrongPosition = false
      if (
        formattedYellow !== Commands.none &&
        formattedYellow.some(
          (val) => val.letter === letter && val.index === index
        ) &&
        this._green.filter(
          (lip, lipIndex) => lip === letter && lipIndex === index
        ).length === 0
      ) {
        this.addUsedLetterWrongPosition(letter, index)
        inArray = true
        wrongPosition = true
      }
      if (
        formattedGreen !== Commands.none &&
        formattedGreen !== Commands.all &&
        formattedGreen.some(
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
