Interactive = require './index'
Expression = require './expression'

class Interactive.Column extends Expression
  columns: (args)-> @_columns.get args...
  constructor: ->
    @_columns = @cursor.select 'columns'
    super()

module.exports = Interactive.Column
