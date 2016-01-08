d3 = require 'd3'
Baobab = require "baobab"
Interactive = require './index'
DataSource = require './data'

class Interactive.ColumnDataSource extends DataSource
  constructor: (values, columns)->
    @_cds = @cursor.select 'column_data_source'
    super values, columns
    columns.map (column_name)=> @apply column_name

  ### Create a new interactive data source
  table.apply 'mean', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
  table.projection()
  ###
  apply: (args...)-> @_add_derived_column args...
  ###
  Create a new interactive cursor that defines a new Column Data Source
  ###
  _add_derived_column: (name, cursors, fn)->
    cursors ?= [['columns',0],['values'],['.','name']]
    fn ?= (columns,values,column_name)->
      column_index = columns.indexOf column_name
      values.map (row_values)-> row_values[column_index]
    @_cds.set name,
        name: name
        values: Baobab.monkey cursors..., fn
    ### Always push derived columns to second part of columns ###
    unless name in ['index',@derived()...]
      @_columns.select(1).push name


  ### Append columns or rows without monkeys ###
  concat: ({columns,values})->
    if columns?
      #alert JSON.stringify columns
      d3.entries(columns).forEach ({key, value})=>
        ### Append the value to the raw columns ###
        @_columns.select(0).push key
        @_values.set @values().map (row,i)=> [row...,value[i]]
        @_add_derived_column key
    super values


  column_data_source: (columns...)->
    if columns.length == 0 then columns = @derived()
    d3.zip columns.map( (c) => @_cds.get(c,'values'))...

module.exports = Interactive.ColumnDataSource
