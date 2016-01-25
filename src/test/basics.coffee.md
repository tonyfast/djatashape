### Sorta Real Test
    assert = require('chai').assert

    module.exports = (CoffeeTable, assert, d3) ->
      describe "CoffeeTable, the Class", ->
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

        it "can be instantiated", ->
          assert.instanceOf table, CoffeeTable, "table is an instance of CoffeeTable"

        it "initializes correctly with the proper history", ->
          assert.deepEqual table.init.get(), init, "The initial data is stored correctly in the tree."
          assert table.checkpoint.project
              name: ['name']
              columns: ['columns']
              values: ['values']
            , init, "The initial is the first checkpoint."

      describe "CoffeeTable, the loader", ->
        table = null
        init = {}
        beforeEach ->
          table = new CoffeeTable 'lib/test/iris.json'

        it "can import a file", ->
          setTimeout ()->

              assert table.length() == 150, "The length of the table is correct"
              assert.deepEqual table.raw.get(), ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"], "The original columns are loaded correctly."
              assert.deepEqual table.columns.get(), ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"], "The derived columns are loaded correctly."
              table.transform
                mean: ["sepal_length", "sepal_width", "petal_length", "petal_width", "species", (a,b,c,d)-> d3.zip(a,b,c,d).map (v)-> d3.mean(v)]
              assert.include table.columns.get(), 'mean', "The derived column was added."
              assert.notInclude table.raw.get(), 'mean', "The derived columns did not change the original values."
            , 1000


      describe "Rows Operators",->
        table = null
        init = {}
        beforeEach ->
          init =
            name: "Polygon"
            readme: "A rectangle"
            metadata: {x:'horizontal direction',y:'vertical direction'}
            columns: ['x', 'y']
            values: [[1, 3],[2, 8],[3,13],[4,18]]
          table = new CoffeeTable init

        it "can select Rows", ->
          assert.deepEqual table.iloc([2])[0], init.values[2], "The a row can be chosen with the index."
          assert.deepEqual table.loc([2])[0], init.values[2], "The a row can be chosen with an id."

        it "can add Rows", ->
          length = table.length()
          length = [0,1].map (v)=> v + length
          values =
            values: [[5,23],[6,28]]
          table.concat values
          assert.deepEqual table.iloc(length), values.values, "The rows have been appended to the values"
          assert.deepEqual [0..table.length()], table.index.get(), "The index has been updated."

        it "can update values when the index changes", ->
          new_index = [2,1,3,0]
          vprev = table.values.get()
          table.index.set new_index
          vnew = table.col()
          assert.notDeepEqual vprev, vnew, "The values have been updated to the new index orientation."
          assert.deepEqual new_index.map((i)=> vprev[i]), vnew, "The values are sorted automatically after the index is updated."

        it "can append rows and update index", ->
          length = table.length()
          length = [1,2].map (v)=> v + length
          values =
            values: [[5,23],[6,28]]
          extended_table = table.concat values
          vprev = table.values.get()
          new_index = [4,5,2,1,3,0]
          table.index.set new_index
          vnew = table.col()
          assert.deepEqual new_index.map((i)=> vprev[i]), vnew, "The appended rows are indexed correctly."


      describe "Working with Columns", ->
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

        it "creates new derived columns data sources", ->
          assert.sameMembers table.columns.get(), init.columns, "The original columns are preserved."
          assert.includeMembers table.columns.get(), table.raw.get(), "Derived columns data sources have been created for the raw data."

        it "has column selections that can be reordered", ->
          assert.deepEqual table.col('y','x'), init.values.map((v)=>[v[1],v[0]]), "The column data sources match."

        it "can concatenate new columns", ->
          columns =
            z: [5, 4, 3]
          table.concat
            columns: columns
          assert.include table.raw.get(), 'z', "New raw columns can be added."
          assert.include table.columns.get(), 'z', "New dynamic columns can be added."
          assert.deepEqual table.col('z').map((v)->v[0]), columns['z'], "The values of the new column is consistent"

        it "can create derived data columns", ->
          columns = ['x','y']
          fn = (x,y)->
            d3.zip(x,y).map (v)-> Math.tan v[1]/v[0]
          table.transform
            t: [columns...,fn]

          assert.notInclude table.raw.get(), 't', "The derived data is not immediately placed encoded in the data."
          assert.include table.columns.get(), 't', "New dynamic columns can be added."
          assert.deepEqual table.col('t').map((v)->v[0]), table.col('x','y').map((v)-> Math.tan v[1]/v[0]), "The values of the new column is consistent"
