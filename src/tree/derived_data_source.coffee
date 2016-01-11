Baobab = require 'baobab'

class DerivedDataSource extends require '../table/column_data_source'
  constructor: (values, columns)->
    ###
    Transform adds named columns to the table
    @param [Object] transformers is an object of named columns.  The new columns
    are defined by ``cursors`` and a function ``fn``.
    @example Create two new columns mean and std.
      table.transform
        mean: ['x','y', (x,y)-> (x+y)/2 ]
        std: ['x','y', (x,y)-> (x+y)/2 ]

    dont states are weird
    ###
    super values, columns
  ###
  Create a new interactive cursor that defines a new Column Data Source
  ###
  _add_derived_column: (name, cursors=[], fn=null )->
    if cursors.length == 0 then cursors = [['columns',0],['values'],['.','name']]
    fn ?= (columns,values,column_name)->
      column_index = columns.indexOf column_name
      values.map (row_values)-> row_values[column_index]
    @field.set name,
        name: name
        values: Baobab.monkey cursors..., fn
    ### Always push derived columns to second part of columns ###
    unless name in ['index', @columns.get()...]
      @columns.push name

module.exports = DerivedDataSource
