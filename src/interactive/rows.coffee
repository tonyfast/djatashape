Baobab = require 'baobab'
d3 = require 'd3'
Interactive = require './index'
Column = require './columns'

class Interactive.Row extends Column
  length: ()-> @cursor.get('length') - 1
  index: (args...)-> @_index.get args...
  constructor: (values, columns)->
    @_index = @cursor.select 'index'
    @_index.startRecording 1
    ###@_index.on 'update', (event)=>
      new_index = event.data.currentData
      if event.data.previousData?
        alert 1
        old_index = event.data.previousData
        new_index = new_index.map (i)=> old_index.indexOf i
        values = @values()
        @_values.set new_index.map (i)=> values[i]
        @tree.commit()
    ###
    @_length = @cursor.select 'length'
    @_length.set Baobab.monkey ['values'], (values)-> values.length
    @_index.set d3.range values.length

    super columns
    @_add_derived_column 'index', [['index']], (index)-> index


  ### Function to reorder the table elements when the index is updated ###
  update_index_and_values: (new_index)->
    new_index = new_index.map (i)=> old_index.indexOf i

  ###
  Update the index when a row is concatenated.
  ###
  concat: (length)->
    i = @index()
    max = Math.max(i...) + 1
    [0..length-1].map (j)=> @_index.push max + j


  ###
  table.iloc [2,3]
  table._index.set [2,3,0,1]
  table.iloc [2,3]
  @param [Array] selection selection of the indices of the rows.
  ###
  iloc:  (selection)->
    index = @index()
    values = @values()
    if selection?
      values = selection.map (i)=> values[i]
    values
  ###
  table.loc [2,3]
  table._index.set [2,3,0,1]
  table.loc [2,3]
  @param [Array] selection selection of the ids of the rows.
  ###
  loc: (selection)->
    index = @index()
    values = @values()
    if selection?
      values = selection.map (i)=> values[index.indexOf i]
    values
  update: ->

module.exports = Interactive.Row
