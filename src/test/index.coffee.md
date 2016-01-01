# Tests
> This is a literate CoffeeScript description and implementation of a test
> this text is markdown. Note that the newline between Markdown and CoffeeScript
> must be present.

## Test Dependencies
[chai](http://chaijs.com/) is a nice library for natural language assertions.

    # this is a comment
    chai = require "chai"
    chai.should()

## Before the Test
Because of browser vs node weirdness, we do a little jiggering to ensure we have
the right handle for coffeetable.

    {CoffeeTable} = try
      require "coffeetable"
    catch error
      window.coffeetable

## Things We Test

### A Fake Test
> This is just an example.

    # every `describe`d thing will be reported
    describe "A String...", ->
      aString = "a string"
      # as will the assertions
      it "is only a string", ->
        # you could have more assertions...
        aString.should.be.a "string"
      it "is not an array", ->
        aString.should.not.be.an "array"

### Fake Test, Real Library

    describe "CoffeeTable...", ->
      table = new CoffeeTable()
      it "adds 1 number!", ->
        table.add 1
          .should.equal 1
      it "adds 2 numbers!", ->
        table.add 1, 1
          .should.equal 2
