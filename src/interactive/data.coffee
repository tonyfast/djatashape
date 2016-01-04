Interactive = require './index'
Row = require './rows'

class Interactive.DataSource extends Row
  values: (args)-> @_values.get args...
  constructor: (values, columns)->
    @_values = @cursor.select 'values'
    @_values.set values ? []
    super columns

module.exports = Interactive.DataSource
