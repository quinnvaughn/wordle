import { Commands } from "./commands"
import { UserInput, UserInputValidation } from "./types"

type InputOption = "guess" | "incorrect" | "correct"

type NumberLetter = {
  numberLetter: string
  type: InputOption
}

export class InputValidator {
  private _guess: string
  private _incorrectPosition: string
  private _correct: string
  private _numberLetters: NumberLetter[] = []

  constructor(input: UserInput) {
    this._guess = input.guess
    this._incorrectPosition = input.incorrectPosition
    this._correct = input.correct
  }

  private containsNumber(type: InputOption) {
    return /\d/.test(this.getWordFromType(type))
  }

  private letterCount(separator: string | RegExp, type: InputOption) {
    const word = this.getWordFromType(type)
    const letterCount: { [letter: string]: number } = {}

    word
      .split(separator)
      .forEach(
        (letter) => (letterCount[letter] = (letterCount[letter] ?? 0) + 1)
      )
    return letterCount
  }

  private userUsedSameLetterMultipleTimesInString(
    type: InputOption
  ): UserInputValidation {
    const letterCount = this.letterCount(" ", type)

    const letters: string[] = []

    Object.entries(letterCount).forEach(([key, value]) => {
      if (value > 1) letters.push(key)
    })

    if (letters.length > 0) {
      const plural = letters.length === 1 ? "letter" : "letters"
      return {
        type: "error",
        message: `You used ${plural} ${letters.join(
          ","
        )} multiple times in ${type} and did not specify the occurence. Please make sure to specify (ie s1 s2).`,
      }
    }
    return { type: "ok" }
  }

  private userDidNotSpecifyWhichOccurence(
    firstType: InputOption,
    secondType: InputOption
  ): UserInputValidation {
    const firstWord = this.getWordFromType(firstType)
    const secondWord = this.getWordFromType(secondType)
    if (
      firstWord === Commands.all ||
      firstWord === Commands.none ||
      secondWord === Commands.all ||
      secondWord === Commands.none
    ) {
      return { type: "ok" }
    }
    const sameLetters: string[] = []
    firstWord
      .split("")
      .forEach(
        (letter) => secondWord.includes(letter) && sameLetters.push(letter)
      )
    if (sameLetters.length > 0) {
      const plural = sameLetters.length === 1 ? "letter" : "letters"
      return {
        type: "error",
        message: `You used ${plural} ${sameLetters.join(
          ","
        )} multiple times and did not specify the occurence. Please make sure to specify (ie s1 s2).`,
      }
    }
    return { type: "ok" }
  }

  private letterLengthChecker(type: InputOption): UserInputValidation {
    const word = this.getWordFromType(type)
    let tooLongOfLetter: string = ""

    word.split(" ").every((letter) => {
      if (
        letter.length !== 1 &&
        letter !== Commands.all &&
        letter !== Commands.none &&
        !this.containsNumberLetters(type)
      ) {
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

  private getNumberLettersOfType(type: InputOption) {
    return this._numberLetters.filter((nl) => nl.type === type)
  }

  private numberLettersOutOfBounds(type: InputOption): UserInputValidation {
    const numberLetters = this.getNumberLettersOfType(type)

    // does not even have number letters
    // so this error cannot be the case.
    if (numberLetters.length === 0) {
      return { type: "ok" }
    }

    const letterCount = this.letterCount("", "guess")

    const outOfBounds: string[] = []

    for (let i = 0; i < this._numberLetters.length; i++) {
      const nl = this._numberLetters[i]

      const letter = nl.numberLetter[0]
      const number = Number(nl.numberLetter[1])

      if (letterCount[letter] < number) {
        outOfBounds.push(nl.numberLetter)
      }
    }

    if (outOfBounds.length > 0) {
      const plural =
        outOfBounds.length === 1
          ? { letter: "Letter", item: "item", position: "position" }
          : { letter: "Letters", item: "items", position: "positions" }
      return {
        type: "error",
        message: `${plural.letter} does not contain ${plural.item} at ${
          plural.position
        } ${outOfBounds.join(
          ","
        )}. Make sure you input letters inside the word.`,
      }
    }

    return { type: "ok" }
  }

  private incorrectLetterChecker(type: InputOption): UserInputValidation {
    const word = this.getWordFromType(type)
    if (word === Commands.all || word === Commands.none) return { type: "ok" }
    const incorrectLetters: string[] = []
    word.split(" ").forEach((letter) => {
      if (!this._guess.includes(letter)) {
        incorrectLetters.push(letter)
      }
    })
    if (incorrectLetters.length > 0) {
      const plural = incorrectLetters.length === 1 ? "letter" : "letters"
      return {
        type: "error",
        message: `Guess does not contain ${plural} ${incorrectLetters.join(
          ","
        )} in used ${
          type === "incorrect" ? "but incorrect" : "and correct"
        } spot.`,
      }
    }
    return { type: "ok" }
  }

  private getWordFromType(type: InputOption) {
    return type === "guess"
      ? this._guess
      : type === "incorrect"
      ? this._incorrectPosition
      : this._correct
  }

  private getNumberLetters(type: InputOption): NumberLetter[] {
    const word = this.getWordFromType(type)
    // get all the inputs by spaces.
    const allWords = word.split(" ")

    // loop through
    for (let i = 0; i < allWords.length; i++) {
      const word = allWords[i]

      // only possible true are words with length 2
      if (word.length === 2) {
        const letter = word[0]
        const number = word[1]
        // any letter. Already sanitzed to be lowercase.
        const letterRegex = /[a-z]/i
        // cannot be zero
        const numberRegex = /[1-9]/i
        // if letter is a letter.
        if (letterRegex.test(letter) && numberRegex.test(number)) {
          this._numberLetters.push({ numberLetter: letter, type })
        }
      }
    }
    return this.getNumberLettersOfType(type)
  }

  private guessCannotContainSpace() {
    return /\s/i.test(this._guess)
  }

  private containsNumberLetters(type: InputOption) {
    return this.getNumberLetters(type).length > 0
  }

  public checkInputErrors(): UserInputValidation {
    const guessHasSpace = this.guessCannotContainSpace()
    if (guessHasSpace) {
      return {
        type: "error",
        message: "Guess cannot contain any kind of space.",
      }
    }
    const guessHasNumbers = this.containsNumber("guess")
    if (guessHasNumbers) {
      return { type: "error", message: "Guess cannot contain numbers." }
    }
    const incorrectPositionHasNumbers =
      this.containsNumber("incorrect") &&
      !this.containsNumberLetters("incorrect")

    if (incorrectPositionHasNumbers) {
      return {
        type: "error",
        message:
          "Incorrect position cannot contain numbers unless to specify which of a same letter.",
      }
    }

    const correctHasNumbers =
      this.containsNumber("correct") && !this.containsNumberLetters("correct")

    if (correctHasNumbers) {
      return {
        type: "error",
        message:
          "Correct cannot contain numbers unless to specify which of a same letter.",
      }
    }

    const usedSameLetterInIncorrect =
      this.userUsedSameLetterMultipleTimesInString("incorrect")

    if (usedSameLetterInIncorrect.type === "error") {
      return usedSameLetterInIncorrect
    }

    const usedSameLetterInCorrect =
      this.userUsedSameLetterMultipleTimesInString("correct")

    if (usedSameLetterInCorrect.type === "error") {
      return usedSameLetterInCorrect
    }

    const didNotSpecifyOccurence = this.userDidNotSpecifyWhichOccurence(
      "incorrect",
      "correct"
    )

    if (didNotSpecifyOccurence.type === "error") {
      return didNotSpecifyOccurence
    }

    const incorrectOutOfBounds = this.numberLettersOutOfBounds("incorrect")

    if (incorrectOutOfBounds.type === "error") {
      return incorrectOutOfBounds
    }

    const correctOutOfBounds = this.numberLettersOutOfBounds("correct")

    if (correctOutOfBounds.type === "error") {
      return correctOutOfBounds
    }

    if (this._guess.length !== 5) {
      return { type: "error", message: "Guess must be 5 letters." }
    }
    const incorrectLetterWrong = this.letterLengthChecker("incorrect")
    if (incorrectLetterWrong.type === "error") {
      return incorrectLetterWrong
    }
    const incorrectLetterRight = this.letterLengthChecker("correct")
    if (incorrectLetterRight.type === "error") {
      return incorrectLetterRight
    }
    const incorrectUsedWrong = this.incorrectLetterChecker("incorrect")
    if (incorrectUsedWrong.type === "error") {
      return incorrectUsedWrong
    }
    const incorrectUsedRight = this.incorrectLetterChecker("correct")
    if (incorrectUsedRight.type === "error") {
      return incorrectUsedRight
    }
    return { type: "ok" }
  }
}
