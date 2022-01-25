# Wordle Solver

I created a little CLI to help you solve wordles.

As of the moment it is 87% accurate in 6 turns if you follow its suggestions exactly. You can see the data for that in the data folder.

I'm hoping to get it to at least the mid 90s with some optimizations. If you have any suggestions on that feel free to open a PR.

## Running it

To run the CLI, first install all necessary packages with `npm/yarn install` and then start it with `npm/yarn start`

## Using the CLI

I'm currently redoing the input validation, so don't input anything incorrectly, or you will break it and have to start over.

It will suggest a word to you each round, ask you what word you selected, and then ask you what letters were yellow and what letters were green. Put a space between letters to indicate multiple.

**Example:**

What is your guess? *arose*\
Which letters are yellow? *o s*\
Which letters are green? *a*

There are two special words: `none` and `all`. **None** is if there were either no green or yellow letters in the word and that's a quick way to let the CLI know. **All** is if all the letters were yellow, or you solved the puzzle in the case of green.

**Example:**

What is your guess? *fizzy*\
Which letters are yellow? *none*\
Which letters are green? *all*\
Yay! You won!

If there are multiple instances of a letter in a word, specify which instance of the letter you are referring to at the end of the letter, starting with 1

**Example:**

What is your guess? *fuzzy*\
Which letters are yellow? *z1 y*\
Which letters are green? *f z2*


I'm currently working on adding some additional keywords for user experience, such as `same` for when yellow or green does not change from one turn to another.


You can see how I developed the weights for the words in weights.ts. I calculated the occurence of each letter in all five letter english words and divided them by the total number of letters to get the % a letter occurs. For each word, I then calculate how many unique letters there are in the word. To get the weight of a word, I multiply the % of each letter by e<sup>unique letters</sup> to really weight words with more unique letters, as that gives us more information per turn.


