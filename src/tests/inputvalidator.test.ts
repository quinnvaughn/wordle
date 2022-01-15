import { InputValidator } from "../inputvalidator"

describe("Input Formatter", () => {
  test("returns error object on too short of guess", () => {
    const validator = new InputValidator({
      guess: "asdf",
      correct: "",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess must be 5 letters."
    )
  })

  test("returns error object on too long of guess", () => {
    const validator = new InputValidator({
      guess: "asdfgh",
      correct: "",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess must be 5 letters."
    )
  })

  test("returns error object on letter not in used wrong", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "",
      incorrectPosition: "l",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letter l in used but incorrect spot."
    )
  })

  test("returns error object on letters (plural) not in used wrong", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "",
      incorrectPosition: "l o",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letters l,o in used but incorrect spot."
    )
  })

  test("returns error object on letter not in used right", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "l",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letter l in used and correct spot."
    )
  })

  test("returns error object on letters (plural) not in used right", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "l o",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letters l,o in used and correct spot."
    )
  })

  test("validator returns error object on too long of letter in used wrong (ie as instead of a)", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "",
      incorrectPosition: "as",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "as is not a letter. Make sure to put spaces between letters."
    )
  })

  test("validator returns error object on too long of letter in used right (ie as instead of a)", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "as",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "as is not a letter. Make sure to put spaces between letters."
    )
  })

  test("validator does not allow spaces in guess", () => {
    const validator = new InputValidator({
      guess: "gue s",
      correct: "as",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess cannot contain any kind of space."
    )
  })

  test("validator does not allow letters in correct", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "11b",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Correct cannot contain numbers unless to specify which of a same letter."
    )
  })

  test("validator does not allow letters in incorrect", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "",
      incorrectPosition: "20",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Incorrect position cannot contain numbers unless to specify which of a same letter."
    )
  })

  test("validator does not allow letter not in guess in incorrect position", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "",
      incorrectPosition: "h",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letter h in used but incorrect spot."
    )
  })
  test("validator does not allow letter not in guess in correct position", () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "h",
      incorrectPosition: "",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letter h in used and correct spot."
    )
  })

  test('validator correct displays multiple incorrectly used letters (ie h,o in "guess")', () => {
    const validator = new InputValidator({
      guess: "guess",
      correct: "",
      incorrectPosition: "h o",
    })
    const feedback = validator.checkInputErrors()

    expect(feedback.type).toBe("error")
    expect((feedback as { type: "error"; message: string }).message).toBe(
      "Guess does not contain letters h,o in used but incorrect spot."
    )
  })
})
