import type { Word } from "../types"
import { WordleSolver } from "../wordleSolver"

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

      solver.addGuess({ guess: "aeiou", correct: "", incorrectPosition: "o" })

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

      solver.addGuess({ guess: "aeiou", correct: "", incorrectPosition: "o" })

      expect(solver.suggestion).toBe("gross")
      expect(solver.correct).toBe(false)
      expect(solver.lettersInPosition).toEqual([null, null, null, null, null])
      expect(solver.notUsedLetters).toEqual(["a", "e", "i", "u"])
      expect(solver.numGuesses).toBe(1)
      expect(solver.oneWordLeft()).toBe(false)
      expect(solver.usedLettersWrongPosition).toEqual([
        { index: 3, letter: "o" },
      ])

      solver.addGuess({ guess: "gross", correct: "", incorrectPosition: "o" })
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

  describe("Keywords", () => {
    test("solver does not break on response 'none'", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        correct: "",
        incorrectPosition: "none",
      })

      expect(feedback.type).toBe("ok")
    })

    test("solver does not break on response 'all'", () => {
      const solver = new WordleSolver(fakeWeights)
      const feedback = solver.addGuess({
        guess: "guess",
        correct: "all",
        incorrectPosition: "",
      })

      expect(feedback.type).toBe("ok")
    })
  })
})
