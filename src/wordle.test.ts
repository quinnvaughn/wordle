import type { Word } from "./types"
import { WordleSolver } from "./wordleSolver"

let fakeWeights: Word[] = []

beforeAll(() => {
  fakeWeights.push({ weight: 3, word: "hello" })
  fakeWeights.push({ weight: 1.5, word: "gross" })
  fakeWeights.push({ weight: 1.12, word: "nobby" })
})

describe("Wordle Solver", () => {
  describe("Constructor", () => {
    test("Works without input", () => {
      const solver = new WordleSolver()

      expect(solver.suggestion).toBe("arose")
      expect(solver.correct).toBe(false)
      expect(solver.lettersInPosition).toEqual([null, null, null, null, null])
      expect(solver.numGuesses).toBe(0)
      expect(solver.notUsedLetters).toEqual([])
      expect(solver.usedLettersWrongPosition).toEqual([])
    })
    test("Works with input", () => {
      const solver = new WordleSolver(fakeWeights)

      expect(solver.suggestion).toBe("hello")
      expect(solver.correct).toBe(false)
      expect(solver.lettersInPosition).toEqual([null, null, null, null, null])
      expect(solver.numGuesses).toBe(0)
      expect(solver.notUsedLetters).toEqual([])
      expect(solver.usedLettersWrongPosition).toEqual([])
    })
  })
  describe("Add a guess", () => {
    test("adds one guess correctly", () => {
      const solver = new WordleSolver(fakeWeights)

      solver.addGuess({ guess: "aeiou", usedRight: "", usedWrong: "o" })

      expect(solver.suggestion).toBe("gross")
      expect(solver.correct).toBe(false)
      expect(solver.lettersInPosition).toEqual([null, null, null, null, null])
      expect(solver.notUsedLetters).toEqual(["a", "e", "i", "u"])
      expect(solver.numGuesses).toBe(1)
      expect(solver.oneWordLeft()).toBe(false)
      expect(solver.usedLettersWrongPosition).toEqual([
        { index: 3, letter: "o" },
      ])
    })
    test("Adds multiple guesses correctly", () => {
      // actual word = nobby
      const solver = new WordleSolver(fakeWeights)

      solver.addGuess({ guess: "aeiou", usedRight: "", usedWrong: "o" })

      expect(solver.suggestion).toBe("gross")
      expect(solver.correct).toBe(false)
      expect(solver.lettersInPosition).toEqual([null, null, null, null, null])
      expect(solver.notUsedLetters).toEqual(["a", "e", "i", "u"])
      expect(solver.numGuesses).toBe(1)
      expect(solver.oneWordLeft()).toBe(false)
      expect(solver.usedLettersWrongPosition).toEqual([
        { index: 3, letter: "o" },
      ])

      solver.addGuess({ guess: "gross", usedRight: "", usedWrong: "o" })
      expect(solver.suggestion).toBe("nobby")
      expect(solver.correct).toBe(true)
      expect(solver.lettersInPosition).toEqual([null, null, null, null, null])
      expect(solver.notUsedLetters).toEqual(["a", "e", "i", "u", "g", "r", "s"])
      expect(solver.numGuesses).toBe(2)
      expect(solver.oneWordLeft()).toBe(true)
      expect(solver.usedLettersWrongPosition).toEqual([
        { index: 3, letter: "o" },
        { index: 2, letter: "o" },
      ])
    })
  })
  describe("Input errors", () => {
    test("returns error object on incorrect length guess", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "bingbong",
        usedRight: "",
        usedWrong: "",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "Guess must be 5 letters."
      )
    })

    test("returns error object on letter not in used wrong", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "",
        usedWrong: "l",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "Guess does not contain letter l in used but incorrect spot."
      )
    })

    test("returns error object on letters (plural) not in used wrong", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "",
        usedWrong: "l o",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "Guess does not contain letters l,o in used but incorrect spot."
      )
    })

    test("returns error object on letter not in used right", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "l",
        usedWrong: "",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "Guess does not contain letter l in used and correct spot."
      )
    })

    test("returns error object on letters (plural) not in used right", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "l o",
        usedWrong: "",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "Guess does not contain letters l,o in used and correct spot."
      )
    })

    test("solver returns error object on too long of letter in used wrong (ie as instead of a)", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "",
        usedWrong: "as",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "as is not a letter. Make sure to put spaces between letters."
      )
    })

    test("solver returns error object on too long of letter in used right (ie as instead of a)", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "as",
        usedWrong: "",
      })

      expect(feedback.type).toBe("error")
      expect((feedback as { type: "error"; message: string }).message).toBe(
        "as is not a letter. Make sure to put spaces between letters."
      )
    })
  })

  describe("Keywords", () => {
    test("solver does not break on response 'none'", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "",
        usedWrong: "none",
      })

      expect(feedback.type).toBe("ok")
    })

    test("solver does not break on response 'all'", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        usedRight: "all",
        usedWrong: "",
      })

      expect(feedback.type).toBe("ok")
    })
  })
})
