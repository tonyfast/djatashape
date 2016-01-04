Interactive = require './index'
Expression = require './expression'

class Interactive.Column extends Expression
  columns: (args)-> @_columns.get args...
  constructor: (columns)->
    @_columns = @cursor.select 'columns'
    @_columns.set columns ? []
    super()

module.exports = Interactive.Column
