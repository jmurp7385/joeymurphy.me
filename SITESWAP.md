# Siteswap Notation Explained

A guide to understanding the language of juggling patterns, as used in the Siteswap Animator.

## What is Siteswap?

Siteswap is a mathematical notation used to describe and create juggling patterns. It represents the sequence of throws in a pattern, allowing jugglers to communicate complex patterns concisely and discover new ones.

---

## The Basics: Throws as Numbers

In siteswap, each throw is represented by a positive integer.

* **The number indicates how many "beats" later the ball will be thrown again.** A beat is the time it-takes for one hand to make a throw.

* **Odd numbers are crossing throws:** The ball is thrown to the opposite hand.
  * `3`: A standard throw in a 3-ball cascade. It lands in the other hand 3 beats later.
  * `5`: A higher crossing throw.
  * `1`: A very quick, low pass directly to the other hand.

* **Even numbers are self-throws (or columns):** The ball is thrown and caught by the *same* hand.
  * `4`: A standard throw in a 4-ball fountain. It lands in the same hand 4 beats later.
  * `2`: A "hold". The hand holds the ball for one beat and throws it on the next available beat for that hand.
  * `0`: An empty hand. The hand does nothing for one beat.

### Calculating the Number of Balls

A key property of a valid siteswap is that the **average of the throw numbers equals the number of balls** in the pattern.

* `531`: (5 + 3 + 1) / 3 = 9 / 3 = **3 balls**.
* `441`: (4 + 4 + 1) / 3 = 9 / 3 = **3 balls**.
* `4`: 4 / 1 = **4 balls**.

---

## Asynchronous Patterns

This is the most common type of pattern, where hands throw one after another (alternating). The siteswap string is read from left to right, with each number representing a throw from alternating hands.

#### Example: `531` (a 3-ball pattern)

1. The first hand throws a `5`.
2. The second hand throws a `3`.
3. The first hand throws a `1`.
4. The pattern repeats.

---

## Synchronous (Sync) Patterns

In sync patterns, both hands throw at the same time on every beat. They are enclosed in parentheses, with the throws separated by a comma.

* **Notation:** `(left_throw, right_throw)`

#### Example: `(4,4)` (a 4-ball pattern)

On every beat, both hands throw a `4` to themselves.

### Crossing Sync Throws

An `x` can be added after a throw number to indicate that it is a crossing throw, even if the number is even. This is useful for creating patterns where balls cross paths.

#### Example: `(6x,4)` (a 5-ball pattern)

* On every beat, the left hand throws a high crossing `6x`.
* Simultaneously, the right hand throws a `4` to itself.

---

## Multiplex Patterns

A multiplex pattern involves throwing more than one ball from the same hand at the same time. These throws are enclosed in square brackets.

*   **Notation:** `[throw1throw2]`

#### Example: `[33]0` (a 3-ball pattern)

1. The first hand throws two balls simultaneously as `3`s (crossing throws).
2. The second hand does nothing (a `0` throw).
3. The pattern repeats.

The number of balls is calculated as before: (`3` + `3` + `0`) / 2 = 6 / 2 = **3 balls**.

---

## Try It Out

Experiment with these patterns in the animator:

* **Asynchronous:** `3`, `4`, `5`, `531`, `441`, `91`
* **Synchronous:** `(4,4)`, `(6,6)`, `(6x,4)`
*   **Multiplex:** `[34]1`
