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
          table = new CoffeeTable.Interactive init

        it "can be instantiated", ->
          assert.instanceOf table, CoffeeTable.Interactive, "table is an instance of CoffeeTable"

        it "initializes correctly with the proper history", ->
          assert.deepEqual table._init.get(), init, "The initial data is stored correctly in the tree."
          assert table._checkpoint.project
              name: ['name']
              columns: ['columns']
              values: ['values']
            , init, "The initial is the first checkpoint."

      describe "Working with Rows",->
        table = null
        init = {}
        beforeEach ->
          init =
            name: "Polygon"
            readme: "A rectangle"
            metadata: {x:'horizontal direction',y:'vertical direction'}
            columns: ['x', 'y']
            values: [[1, 3],[2, 8],[3,13]]
          table = new CoffeeTable.Interactive init

        it "can select Rows"

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
          table = new CoffeeTable.Interactive init

        it "creates new derived columns data sources", ->
          assert.sameMembers table._columns.get(0), init.columns, "The original columns are preserved."
          assert.includeMembers table.derived(), table.raw(), "Derived columns data sources have been created for the raw data."

        it "has column selections that can be reordered", ->
          assert.deepEqual table.column_data_source('y','x'), init.values.map((v)=>[v[1],v[0]]), "The column data sources match."

        it "can concatenate new columns", ->
          columns =
            z: [5, 4, 3]
          extended_table = table.concat
            columns: columns
          assert.include extended_table.raw(), 'z', "New raw columns can be added."
          assert.include extended_table.derived(), 'z', "New dynamic columns can be added."
          assert.deepEqual extended_table.column_data_source('z').map((v)->v[0]), columns['z'], "The values of the new column is consistent"

        it "can create derived data columns", ->
          columns = ['x','y']
          fn = (x,y)-> d3.zip(x,y).map (v)-> Math.tan v[1]/v[0]
          extended_table = table.transform
            t: [columns...,fn]
          assert.notInclude extended_table.raw(), 't', "The derived data is not immediately placed encoded in the data."
          assert.include extended_table.derived(), 't', "New dynamic columns can be added."
          assert.deepEqual extended_table.column_data_source('t').map((v)->v[0]), extended_table.column_data_source('x','y').map((v)-> Math.tan v[1]/v[0]), "The values of the new column is consistent"
