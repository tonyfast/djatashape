d3 = require 'd3'

module.exports = class require('./index').ColumnDataSource extends require './data'
  constructor: (values, columns)->
    @new_major_cursor 'column_source',  {}, 'field'
    @expr.concat = @concat
    super values, columns
    tmp = {};
    @raw.get().forEach (c)=> tmp[c] = null
    @transform tmp

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
