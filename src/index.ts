import inquirer from "inquirer"
import { Commands } from "./commands"
import type { UserInput } from "./types"
import { WordleSolver } from "./wordleSolver"

// TODO: Add "same" command if either used wrong or used right
// has not changed since last attempt.

// TODO: Add a "redo" command that lets me redo a turn if I inputted
// incorrect data - ie did green on the yellow prompt.

const prompts = [
  { type: "input", name: "guess", message: "What is your guess?" },
  {
    type: "input",
    name: "yellow",
    message: "Which letters are yellow?",
  },
  {
    type: "input",
    name: "green",
    message: "Which letters are green?",
  },
]

async function main() {
  // you can add your own weighted words to the class in the constructor.
  // of format
  // {
  // weight: number
  // word: string
  // }[]
  const solver = new WordleSolver()
  solver.outputSuggestionToConsole()
  while (!solver.correct && solver.numGuesses < 7) {
    let input = (await inquirer.prompt(prompts)) as UserInput

    let feedback = solver.addGuess(input)
    // keep looping through until they give correct input.
    while (feedback.type === "error") {
      console.error(feedback.message)
      input = (await inquirer.prompt(prompts)) as UserInput
      feedback = solver.addGuess(input)
    }
    if (input.green !== Commands.all || solver.oneWordLeft()) {
      solver.outputSuggestionToConsole()
    }
  }

  if (solver.correct) {
    console.log("Yay! You won!")
  } else {
    console.log("Better luck next time.")
  }
}

main()
