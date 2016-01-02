Expression = require './expression'

class ColumnBase extends Expression

class Column extends ColumnBase
  columns: (args)-> @_columns.get args...
  constructor: ->
    @_columns = @cursor.select 'columns'
  update: ->

module.exports = { Column }
