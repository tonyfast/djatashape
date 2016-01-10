### Sorta Real Test

    module.exports = (CoffeeTable, assert, d3) ->
      describe "transform, the Expression", ->
        table = null
        init = {}
        beforeEach ->
          init =
            name: "Polygon"
            readme: "A rectangle"
            metadata: {x:'horizontal direction',y:'vertical direction'}
            columns: ['x', 'y']
            values: [[1, 3],[2, 8],[3,13]]
          table = new CoffeeTable init

        it "can be append one derived column", ->
          columns = ['x','y']
          fn = (x,y)->
            d3.zip(x,y).map (v)-> Math.tan v[1]/v[0]
          table.transform
            t: [columns...,fn]
          assert.notInclude table.raw.get(), 't', "The derived data is not immediately placed encoded in the data."
          assert.include table.columns.get(), 't', "New dynamic columns can be added."
          assert.deepEqual table.col('t').map((v)->v[0]), table.col('x','y').map((v)-> Math.tan v[1]/v[0]), "The values of the new column is consistent"

        it "can be append two derived columns", ->
          columns = ['x','y']
          fn = (x,y)->
            d3.zip(x,y).map (v)-> Math.tan v[1]/v[0]
          table.transform
            t: [columns...,fn]
            l: [columns...,(x,y)-> d3.zip(x,y).map (v)-> Math.sqrt v.reduce(((p,n)->p+Math.pow(n,2)),0)]
          assert.notInclude table.raw.get(), 't', "The derived data is not immediately placed encoded in the data."
          assert.notInclude table.raw.get(), 'l', "The derived data is not immediately placed encoded in the data."
          assert.include table.columns.get(), 't', "New dynamic columns can be added."
          assert.include table.columns.get(), 'l', "New dynamic columns can be added."
          assert.deepEqual table.col('l').map((v)->v[0]), table.col('x','y').map((v)-> Math.sqrt v.reduce(((p,n)->p+Math.pow(n,2)),0)), "The values of the new column is consistent"
          assert.deepEqual table.col('t').map((v)->v[0]), table.col('x','y').map((v)-> Math.tan v[1]/v[0]), "The values of the new column is consistent"
