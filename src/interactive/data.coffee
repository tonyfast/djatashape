Interactive = require './index'
Row = require './rows'

class Interactive.DataSource extends Row
  values: ()-> @_values.get()
  constructor: (values, columns)->
    @_values = @cursor.select 'values'
    @_values.set values ? []
    super values, columns

  concat: (values)->
    values?.forEach (row)=> @_values.push row
    super values?.length ? 0
    this

module.exports = Interactive.DataSource
