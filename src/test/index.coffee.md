# Tests
> This is a literate CoffeeScript description and implementation of a test
> this text is markdown. Note that the newline between Markdown and CoffeeScript
> must be present.

## Test Dependencies
[chai](http://chaijs.com/) is a nice library for natural language assertions.
It only need to be required here, and will be picked up in the tests.

    # this is a comment
    chai = require "chai"
    chai.should()
    assert = require('chai').assert

## Before the Test
Because of browser vs node weirdness, we do a little jiggering to ensure we have
the right handle for coffeetable.

    CoffeeTable = null

    describe "CoffeeTable, the module", ->
      it "imports", ->
        {CoffeeTable} = try
          require "coffeetable"
        catch error
          try
            require "../coffeetable"
          catch error
            window?.coffeetable
        assert.typeOf CoffeeTable, "function"

## The Actual Tests
Each of these is a module that exposes one function which accepts CoffeeTable

        (require "./basics") CoffeeTable, assert, require('d3')
        (require "./expressions") CoffeeTable, assert, require('d3')
