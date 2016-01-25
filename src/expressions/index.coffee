{d3} = require '../deps'
DerivedDataSource = require '../tree/derived_data_source'

class Expression extends DerivedDataSource
  transform: (transformers)->
    d3.entries transformers
      .forEach ({key,value})=>
        [cursors...,fn] = value ? []
        if cursors.length == 0  then cursors = null
        smart_cursor = cursors?.map((col)=> if typeof col in ['string'] then ['column_source',col,'values'] else col) ? []
        @_add_derived_column key, smart_cursor, fn
    @expression.push ['transform', transformers]
    this

  concat: (args...)->
    super args...
    @expression.push ['concat', args...]

  ###
  Project selects a subset of columns
  @example Selection the index, x, and y
    table.projection 'index','x','y'
  ###
  projection: (columns...)->
    @values.set @col columns...
    @columns.set columns...
    @expression.push ['projection', columns...]
    this

  ###
  Filter elements columns based on a predicate function.
  @param [String] columns a list of columns to include in the predicate function
  @param [Function] fn a predicate function with access to each of the columns.

  @example Filter columns ``x`` and ``y``
    table.filter 'x','y', (x,y)-> x > 0 and y < 5
  ###
  filter: (columns..., fn)->
    values = @col columns...
    new_values = values.filter fn
    @index.set new_values.map (v)=> values.indexOf v
    @values.set values
    @expression.push ['filter', columns..., fn.toString()]
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
  concat: (value_object)->
    super value_object
    @expression.push ['concat',value_object]
    this

  ###
  Apply a function to a column
  @example Apply a function to x depending on y
    table.apply 'x', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
  ###
  apply: (args...)->
    super args ...
    @expression.push ['apply',args.map (arg)-> JSON.parse JSON.stringify arg]


module.exports = Expression
