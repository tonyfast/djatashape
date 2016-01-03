### Sorta Real Test

    module.exports = (CoffeeTable) ->
      describe "CoffeeTable, the Class", ->
        table = null

        beforeEach ->
          table = new CoffeeTable {}

        it "can be instantiated", ->
          table.should.be.an.instanceOf CoffeeTable
