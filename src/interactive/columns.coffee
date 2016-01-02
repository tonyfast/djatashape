Interactive = require '../interactive'
Expression = require './expression'

class Interactive.Column extends Expression
  columns: (args)-> @_columns.get args...
  constructor: ->
    @_columns = @cursor.select 'columns'
  update: ->

module.exports = Interactive.Column
