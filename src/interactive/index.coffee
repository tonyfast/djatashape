Baobab = require 'baobab'
d3 = require 'd3'
Table = require './table'

###
An Interactive Table uses immutable cursor trees to track the evolution of
tabular data.
###
class Interactive extends Table
  ### Table name Baobab cursor ###
  name: ()-> @cursor.get 'name'
  ### Table information in readme Baobab cursor ###
  readme: ()-> @cursor.get 'readme'
  ### Reset the Table back to its initial state  ###
  reset: ()->
    @cursor.deepMerge @cursor.get 'init'
    this
  ###
  Create a new interactive table.  An Interactive Table is similar to a DataFrame
  in that it is both a list and column data source.  Rows and columns can be
  accessed independently.  Operations can be applied to both rows and columns.

  @param [Object] record_orient_data Record orient data contains the columns and
  values.

  @example Create a new interactive table
    table = new CoffeeTable
      columns: ['x', 'y']
      values: [
        [1, 2]
        [3, 8]
        [-1,4]
        [5,7]
      ]
  ###
  constructor: (record_orient_data)->
    @tree = new Baobab record_orient_data
    @cursor = @tree.select 0
    @cursor.set 'init', record_orient_data
    @_readme = @cursor.select 'readme'
    @_readme.set @_readme.get() ? ""
    super @cursor.project
      values: ['values']
      columns: ['columns']
      metadata: ['metadata']
    @compute()

  ###
  Project selects a subset of columns
  @example Selection the index, x, and y
    table.projection 'index','x','y'
  ###
  projection: (columns...)->
    @_values.set @column_data_source columns...
    @_columns.select(0).set @derived()
    @_expression.push ['projection', columns...]
    this

  ###
  Transform adds named columns to the table
  @param [Object] transformers is an object of named columns.  The new columns
  are defined by ``cursors`` and a function ``fn``.
  @example Create two new columns mean and std.
    table.transform
      mean: { cursors: ['x','y'], fn: (x,y)-> (x+y)/2 }
      std: { cursors: ['x','y'], fn: require('d3').deviation }
  ###
  transform: (transformers)->
    d3.entries transformers
      .forEach ({key,value})=>
        {cursors, fn} = value
        @_add_derived_column key, cursors.map((col)->['column_data_source',col,'values']), fn
    @_expression.push ['transform', transformers]
    this

  ###
  Filter elements columns based on a predicate function.
  @param [String] columns a list of columns to include in the predicate function
  @param [Function] fn a predicate function with access to each of the columns.

  @example Filter columns ``x`` and ``y``
    table.filter 'x','y', (x,y)-> x > 0 and y < 5
  ###
  filter: (columns..., fn)->
    values = @column_data_source columns...
    new_values = values.filter fn
    @index.set new_values.map (v)=> values.indexOf v
    @values.set values
    @_expression.push ['filter', columns..., fn.toString()]
    this
  ###
  Concatenate new values to the table.
  @param [Object] new_values responds to the keys ``columns`` and ``values`` to
  append in the column direction or row direction, respectively.
  @example Add a Two Rows
    table.concat
      values: [
        [-3,4]
        [1,9]
      ]
  @example Add One Column.  The Array has a length of six because two rows were just added.
    table.concat
      columns:
        z: [-3,4,1,9,6,-4]
  ###
  concat: (new_values)->
    super new_values
    @_expression.push ['concat',new_values]
  ###
  Apply a function to a column
  @example Apply a function to x depending on y
    table.apply 'x', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
  ###
  apply: (args...)->
    super args ...
    @_expression.push ['apply',args.map (arg)-> JSON.parse JSON.stringify arg]

module.exports = Interactive
