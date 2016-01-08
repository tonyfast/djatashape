### Sorta Real Test

    module.exports = (CoffeeTable) ->
      describe "CoffeeTable, the Class", ->
        table = null

        beforeEach ->
          table = new CoffeeTable.Interactive
            name: 'rectangle'
            columns: ['x', 'y']
            values: [[1, 2],[3, 8]]


        it "can be instantiated", ->
          table.should.be.an.instanceOf CoffeeTable
