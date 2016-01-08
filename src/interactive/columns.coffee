d3 = require 'd3'
Interactive = require './index'
Expression = require './expression'

class Interactive.Column extends Expression
  columns: ()-> d3.merge @_columns.get()

  raw: ()-> @_columns.get 0
  derived: ()-> @_columns.get 1

  constructor: (columns)->
    @_columns = @cursor.select 'columns'
    # [raw_columns, derived_columns]
    @_columns.set [columns,[]] ? [[],[]]
    # update the values when the raw_columns change
    @_columns.select(1).on 'update', (event)=>
      console.log event
      [event.data.previousData...].filter (d)=> not d in event.data.currentData
        .forEach (column_name)-> @_cds[column_name].release()
    super()

module.exports = Interactive.Column
