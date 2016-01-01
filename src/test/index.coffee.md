# Tests
> This is a literate CoffeeScript description and implementation of a test
> this text is markdown

## Test Dependencies
[chai](http://chaijs.com/) is a nice library for natural language assertions.

    # this is a comment
    chai = require "chai"
    chai.should()

## Before the Test

    {CoffeeTable} = try
      require "coffeetable"
    catch error
      window.coffeetable

## Things We Test
> This is just an example. You'd want to write a real test, and describe it!


### A String

    # every `describe`d thing will be reported
    describe "a string is a string", ->
      aString = "aString"
      # as will the assertions
      it "should be a string", ->
        # you could have more assertions...
        aString.should.be.a "string"

      it "should be not be an array", ->
        # you could have more assertions...
        aString.should.not.be.an "array"
