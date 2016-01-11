d3 = require 'd3'
Table = require('./index')

class Table.ColumnDataSource extends require './data'
  constructor: (values, columns)->
    @new_major_cursor 'column_source',  {}, 'field'
    super values, columns
    tmp = {};
    @raw.get().forEach (c)=> @_add_derived_column  c

  ### Append columns or rows without monkeys ###
  concat: ({columns,values})->
    if columns?
      #alert JSON.stringify columns
      d3.entries(columns).forEach ({key, value})=>
        ### Append the value to the raw columns ###
        @raw.push key
        @values.set @values.get().map (row,i)=> [row...,value[i]]
        @_add_derived_column key
    super values, columns

  col: (columns...)->
    if columns.length == 0 then columns = @columns.get()
    d3.zip columns.map( (c) => @field.get(c,'values'))...

module.exports = Table.ColumnDataSource
