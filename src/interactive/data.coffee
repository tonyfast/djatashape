Row = require './rows'

class DataSourceBase extends Row

class DataSource extends DataSourceBase
  values: (args)-> @_values.get args...
  constructor: ->
    @_values = @cursor.select 'values'
    super()

module.exports = DataSource
