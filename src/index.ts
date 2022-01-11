import inquirer from "inquirer"
import type { Response } from "./types"
import { WordleSolver } from "./wordleSolver"

// TODO: Add check for bad input.
// Don't add another guess if they input poorly,
// just make them redo it.

// TODO: Add "same" command if either used wrong or used right
// has not changed since last attempt.

// TODO: Add a "redo" command that lets me redo a turn if I inputted
// incorrect data - ie did green on the yellow prompt.

async function main() {
  // you can add your own weighted words to the class in the constructor.
  // of format
  // {
  // weight: number
  // word: string
  // }[]
  const solver = new WordleSolver()
  solver.suggestWord()
  while (!solver.correct && solver.numGuesses < 6) {
    const response = (await inquirer.prompt([
      { type: "input", name: "guess", message: "What is your guess?" },
      {
        type: "input",
        name: "usedWrong",
        message: "Which letters are used but not in the right spot?",
      },
      {
        type: "input",
        name: "usedRight",
        message: "Which letters are used and in the right spot?",
      },
    ])) as Response

    solver.addGuess(response)
    if (response.usedRight !== "all" || solver.oneWordLeft()) {
      solver.suggestWord()
    }
  }

  if (solver.correct) {
    console.log("Yay! You won!")
  } else {
    console.log("Better luck next time.")
  }
}

main()
