# Automatarium Fork

This project is a fork of the original [Automatarium Project](https://github.com/automatarium/automatarium).

## Acknowledgements

I would like to thank the developers of the original Automatarium project for making their work publicly accessible. 

## Running the Project Locally

To run this project locally, you can use the following command:

```sh
yarn dev
```

## Enhancements

This fork extends the original project with several new features. The main focus of these enhancements is to enable the creation of assignments in a university context that can be automatically compared with a solution.

These assignments involve storing a solution as an FSA (Finite State Automaton). The student's submission (either an FSA or a RegEx) is then checked for equivalence.

### Checkout:

- Task: submission as FSA, solution as FSA (Tools - Grade Solution)
- Task: Find equivalent states (Tools - Find Equivalent States). Marks equivalent states inside a submission with a coloured stroke.
- Expression Task: submission as Regex, solution FSA (Tools - Grade Solution)
- Expression: Convert to DFA (Tools - Convert To DFA). Converts Regex to DFA.
- etc.

Both Task and Expression Task can be shared as public link (solution is not accessible) or as a private link (solution is accessible). I've reworked the comment tool to make writing assignments easier.

## Original README

For more information, you can refer to the original [README](README_old.md) of the Automatarium project.


