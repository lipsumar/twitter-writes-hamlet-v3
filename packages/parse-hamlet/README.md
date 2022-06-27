# parse-hamlet

This package can download and parse the full text of Hamlet.

### Usage

`pnpm run parse` will produce `entries.json`

### corrections to scenes HTML pages

Some manual corrections were needed to parse:

- A4S2: `(<I>Within.</I>)` => `<I>(Within.)</I>`
- A4S4: remove duplicate and unclosed `<a name=sd1>`
- A5S1: convey- ances => conveyances
- A2S2: remove \n after "speak to him"
