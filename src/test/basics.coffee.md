### Sorta Real Test

    module.exports = (CoffeeTable) ->
      describe "CoffeeTable, the Class", ->
        table = null

        beforeEach ->
          table = new CoffeeTable
                rectangle:
                  columns: ['x', 'y']
                  values: [[1, 2],[3, 8]]
              , [['table','#table'],['text','#text']]
              , [['table','rectangle','table'],['text','rectangle','text']]
            

        it "can be instantiated", ->
          table.should.be.an.instanceOf CoffeeTable
