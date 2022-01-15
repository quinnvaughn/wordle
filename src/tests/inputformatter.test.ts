import { InputFormatter } from "../inputformatter"
import {
  FormattedCorrect,
  FormattedIncorrectPosition,
  UserInput,
} from "../types"

describe("Input Formatter", () => {
  test("correctly lowercases input", () => {
    const formatter = new InputFormatter()
    const lowercase = formatter.lowercaseInput({
      guess: "ASDFS",
      correct: "A B",
      incorrectPosition: "F S",
    })
    expect(lowercase).toEqual<UserInput>({
      guess: "asdfs",
      correct: "a b",
      incorrectPosition: "f s",
    })
  })
  test("correctly lowercases input with letter", () => {
    const formatter = new InputFormatter()
    const lowercase = formatter.lowercaseInput({
      guess: "ASDFS",
      correct: "A B",
      incorrectPosition: "F S2",
    })
    expect(lowercase).toEqual<UserInput>({
      guess: "asdfs",
      correct: "a b",
      incorrectPosition: "f s2",
    })
  })
  test("formats correct string with normal letters", () => {
    const formatter = new InputFormatter()
    const input: UserInput = {
      guess: "asdfs",
      correct: "a f",
      incorrectPosition: "F S2",
    }

    const newCorrect = formatter.formatCorrect(input.correct, input.guess)

    expect(newCorrect).toEqual<FormattedCorrect>([
      { index: 0, letter: "a" },
      { letter: "f", index: 3 },
    ])
  })

  test("formats correct string with number letters", () => {
    const formatter = new InputFormatter()
    const input: UserInput = {
      guess: "asdfs",
      correct: "s1 s2",
      incorrectPosition: "F S2",
    }

    const newCorrect = formatter.formatCorrect(input.correct, input.guess)

    expect(newCorrect).toEqual<FormattedCorrect>([
      { index: 1, letter: "s" },
      { letter: "s", index: 4 },
    ])
  })

  test("formats correct string with number letters", () => {
    const formatter = new InputFormatter()
    const input: UserInput = {
      guess: "asdfs",
      correct: "s1 s2",
      incorrectPosition: "F S2",
    }

    const newCorrect = formatter.formatCorrect(input.correct, input.guess)

    expect(newCorrect).toEqual<FormattedCorrect>([
      { index: 1, letter: "s" },
      { letter: "s", index: 4 },
    ])
  })

  test("formats incorrect string with normal letters", () => {
    const formatter = new InputFormatter()
    const input: UserInput = {
      guess: "asdfs",
      correct: "s1 s2",
      incorrectPosition: "d f",
    }

    const newFormatted = formatter.formatIncorrectPosition(
      input.incorrectPosition,
      input.guess
    )

    expect(newFormatted).toEqual<FormattedIncorrectPosition>([
      { index: 2, letter: "d" },
      { index: 3, letter: "f" },
    ])
  })

  test("formats incorrect string with number letters", () => {
    const formatter = new InputFormatter()
    const input: UserInput = {
      guess: "asdfs",
      correct: "s1 s2",
      incorrectPosition: "s1 f",
    }

    const newFormatted = formatter.formatIncorrectPosition(
      input.incorrectPosition,
      input.guess
    )

    expect(newFormatted).toEqual<FormattedIncorrectPosition>([
      { index: 1, letter: "s" },
      { index: 3, letter: "f" },
    ])
  })
})
