import { Commands } from "./commands"
import { FormattedGreen, FormattedYellow, Index, UserInput } from "./types"

export class InputFormatter {
  public lowercaseInput(input: UserInput): UserInput {
    return {
      green: input.green.toLowerCase(),
      guess: input.guess.toLowerCase(),
      yellow: input.yellow.toLowerCase(),
    }
  }

  private getPos(word: string, letter: string, occurence: number) {
    return word.split(letter, occurence).join(letter).length
  }

  public formatGreen(word: string, guess: string): FormattedGreen {
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

  public formatYellow(word: string, guess: string): FormattedYellow {
    return word === Commands.none
      ? Commands.none
      : this.mapStringToIndexes(word, guess)
  }
}
