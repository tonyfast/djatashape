### A Fake Test
> This is just an example.

    module.exports = (CoffeeTable) ->
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
