Interactive = require '../interactive'
Row = require './rows'

class Interactive.DataSource extends Row
  values: (args)-> @_values.get args...
  constructor: ->
    @_values = @cursor.select 'values'
    super()

module.exports = Interactive.DataSource
