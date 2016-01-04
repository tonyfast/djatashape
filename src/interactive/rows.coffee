Baobab = require 'baobab'
Interactive = require './index'
Column = require './columns'

class Interactive.Row extends Column
  length: ()-> @cursor.get 'length'
  index: (args...)-> @_index.get args...
  constructor: (columns)->
    @_index = @cursor.select 'index'
    @_length = @cursor.select 'length'
    @_length.set 'length', Baobab.monkey ['values'], (values)-> values.length
    @stage @_column_data_source_monkey 'index', Baobab.monkey ['index'], (index)-> index

    super columns
  iloc:  ->
  loc: ->
  update: ->

module.exports = Interactive.Row
