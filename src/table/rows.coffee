module.exports = class require('./index').Row extends require './columns'
  constructor: (values, columns)->
    @new_major_cursor 'index', [0..values.length]
    @index.startRecording 1
    @length = ()-> @values.get().length
    super columns
    @_add_derived_column 'index', ['index'], (index)-> index

  ###
  Update the index when a row is concatenated.
  ###
  concat: (length)->
    i = @field.get 'index', 'values'
    max = Math.max(i...) + 1
    [0..length-1].map (j)=> @index.push max + j


  ###
  table.iloc [2,3]
  table._index.set [2,3,0,1]
  table.iloc [2,3]
  @param [Array] selection selection of the indices of the rows.
  ###
  iloc:  (selection)->
    index = @index.get()
    values = @values.get()
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
    index = @index.get()
    values = @values.get()
    if selection?
      values = selection.map (i)=> values[index.indexOf i]
    values
