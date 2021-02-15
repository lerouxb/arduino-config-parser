Arduino Config Parser
===

## Installation

Requires [node.js](https://nodejs.org/en/).


## Usage

```
bin/txt-to-json path/to/boards.txt > boards.json
bin/json-to-text path/to/boards.json > boards.txt
```

Alternatively use this as a library. See lib/parse.js and lib/format.js or the bin scripts or tests for examples. Might be easiest to parse to something in memory, manipulate it there and format it out again. I still have to add some examples of how you would do that.

## Notes about the JSON structure

Unfortunately the .txt format doesn't map terribly well to JSON. JSON has no comments and anything in the structure can only be an array, an object or a simple value like a string or number. The .txt format allows you to have something that is both an "object" (ie. it has properties) AND a simple value itself. Example:

```
attiny1634.menu.clock.6external=6 MHz (external)
attiny1634.menu.clock.6external.bootloader.low_fuses=0xED
```

See how 6.external is both a "leaf" and a "branch" at the same time. So to deal with those things I came up with the convention of making everything in the tree an object and then preceding comments and whitespace goes on __comments and the actual value if the path is a leaf goes in __value. Which is slightly awkward but I don't have better ideas yet.

The easiest way to see this and understand what I'm on about is to run the tests. This will parse and then format all the fixtures and then put them in a folder called output in the root. You can then use a nice GUI diff viewer that will allow you to diff two directories (I used Meld) and diff the output and text/fixtures folders. Scroll through there and look at how some lines' order jiggled around. That's probably also the easiest way to reason for yourself whether that matters or if the result is in fact better than what you started with. Or not.

## Notes about the order

The order of the lines in the .txt files can be totally random. You can reverse those two lines in the example above, you can have multiple child branches in any order following it.. I can't easily maintain the exact order which means if you diff what you get when you format the file back out with the original some lines will be moved around. I think the result is functionally equivalent and probably better at least in most cases, though. I do try and keep the order within a "folder", though, because those probably matter for menu items.

## To run the tests

All the deps are dev deps, so you only have to install if you're going to run the tests:

```
npm install
```

```
npm test
```

This currently fails for a bunch of fixtures because I haven't updated the fixtures to be valid.
