Baobab = require 'baobab'
d3 = require 'd3'
Interactive = require './index'
Column = require './columns'

class Interactive.Row extends Column
  length: ()-> @cursor.get 'length'
  index: (args...)-> @_index.get args...
  constructor: (values, columns)->
    @_index = @cursor.select 'index'
    @_index.set d3.range values.length
    @_length = @cursor.select 'length'
    @_length.set 'length', Baobab.monkey ['values'], (values)-> values.length
    @_index.on 'update', (event)=>
      new_index = event.data.currentData
      if event.data.previousData?
        old_index = event.data.previousData
        new_index = new_index.map (i)=> old_index.indexOf i
        values = @values()
        @_values.set new_index.map (i)=> values[i]
    super columns
    @_add_derived_column 'index', [['index']], (index)-> index

  ###
  table.iloc [2,3]
  table._index.set [2,3,0,1]
  table.iloc [2,3]
  ###
  iloc:  (selection)->
    index = @index()
    values = @values()
    if selection?
      values = selection.map (i)=> values[i]
  ###
  table.loc [2,3]
  table._index.set [2,3,0,1]
  table.loc [2,3]
  ###
  loc: (selection)->
    index = @index()
    values = @values()
    if selection?
      values = selection.map (i)=> values[index.indexOf i]
    values
  update: ->

module.exports = Interactive.Row
