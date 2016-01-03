Interactive = require './index'
Column = require './columns'

class Interactive.Row extends Column
  index: (args)-> @_index.get args...
  constructor: ->
    @_index = @cursor.select 'index'
    @stage @_column_data_source_monkey 'index', [['index'], (index)-> index]
    super()
  iloc:  ->
  loc: ->
  update: ->

module.exports = Interactive.Row
