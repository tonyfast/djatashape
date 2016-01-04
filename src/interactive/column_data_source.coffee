d3 = require 'd3'
Baobab = require "baobab"
Interactive = require './index'
DataSource = require './data'

class Interactive.ColumnDataSource extends DataSource
  constructor: (values, columns)->
    @_cds = @cursor.select 'column_data_source'
    super values, columns
    @load columns

  load: (columns) ->
    columns ?= @columns()
    ### Index monkey is destroyed on the first operation ###
    cds = {}
    columns = Array columns...

    columns.forEach (column)=>
      ### Create Dynamic Nodes for Each Column Data Source ###
      cds = @_column_data_source_monkey column, null, cds
    @stage cds

  _column_name_array: (columns)-> if not Array.isArray columns then [columns] else columns

  _column_data_source_monkey: (column,monkey,tmp={})->
    tmp['column_data_source'] ?= {}
    monkey ?= Baobab.monkey ['columns'],['values'],['.','name'], (columns,values,column_name)->
      column_index = columns.indexOf column_name
      values.map (row_values)-> row_values[column_index]
    tmp['column_data_source'][column] =
        name: column
        values: monkey
    tmp

  column_data_source: (columns,force_array=false)->

    columns = @_column_name_array columns
    if columns.length > 1 or force_array
      d3.zip columns.map( (c) => @_cds.get(c,'values') )...
    else
      @_cds.get(columns[0],'values')

module.exports = Interactive.ColumnDataSource
