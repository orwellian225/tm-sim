# Turing Machine Designer and Simulator

## Motivation

This simulator was built as an educational tool for use in the University of the Witwatersrand COMS3003A Course, Formal Languages and Automata.
The tools helps visualize, program and test Turing Machines for decision problems, with the following definition:
$$
	TM = \left< Q, \Sigma, \Gamma, \delta, q_{initial}, q_{accept}, q_{reject} \right>
$$

* $Q$ - a set of states of the TM
* $\Sigma$ - a set of symbols that form the input language alphabet
* $\Gamma = {\textvisiblespace} \cup \Sigma \cup$ - a set of symbols that form the language alphabet the TM computes with
* $\delta: Q \times \Gamma \rightarrow Q \times \Gamma \times {Left, Right}$
* $q_{initial}$ - the initial state of the TM
* $q_{accept}$ - the accept state of the TM
* $q_{reject}$ - the reject state of the TM

> [!TIP]
> There are other formulations of Turing Machines, but this definition is from Sipser's [Introduction to the Theory of Computation](https://www.amazon.com/Introduction-Theory-Computation-Michael-Sipser/dp/113318779X)

## Using the simulator

The simulator can be broken down into 4 sections, the sidebar, state diagram, transtion table, and computations.

1. In the sidebar, a user can edit the states, tape alphabet and language alphabet.
2. The state diagram is a visualization of the machines states and transitions in the familiar format of moore diagrams.
3. The transition table is an alternate visualization of the machine, by viewing its transitions as a table of functions.
This can also be thought of as the 'program' of the Turing Machine.
4. Computations are a visualization of the TM's tape during a computation, and can be stepped through with rudimentary debugging tools

A TM is also saveble in a JSON format via `File > Save > JSON`, and then can later be uploaded with `File > Load > From File`.

## Running locally

1. `git clone`
2. `cd`
3. `npm install` / `bun install`
4. `npm run dev` / `bun run dev`
