import { Commands } from "./commands"
import {
  FormattedCorrect,
  FormattedIncorrectPosition,
  Index,
  UserInput,
} from "./types"

export class InputFormatter {
  public lowercaseInput(input: UserInput): UserInput {
    return {
      correct: input.correct.toLowerCase(),
      guess: input.guess.toLowerCase(),
      incorrectPosition: input.incorrectPosition.toLowerCase(),
    }
  }

  private getPos(word: string, letter: string, occurence: number) {
    return word.split(letter, occurence).join(letter).length
  }

  public formatCorrect(word: string, guess: string): FormattedCorrect {
    return word === Commands.none
      ? Commands.none
      : word === Commands.all
      ? Commands.all
      : this.mapStringToIndexes(word, guess)
  }

  private mapStringToIndexes(word: string, guess: string): Index[] {
    return word
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

  public formatIncorrectPosition(
    word: string,
    guess: string
  ): FormattedIncorrectPosition {
    return word === Commands.none
      ? Commands.none
      : this.mapStringToIndexes(word, guess)
  }
}
