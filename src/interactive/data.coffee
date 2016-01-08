Interactive = require './index'
Row = require './rows'

class Interactive.DataSource extends Row
  values: ()-> @_values.get()
  constructor: (values, columns)->
    @_values = @cursor.select 'values'
    @_values.set values ? []
    super values, columns

  concat: (append_rows)->
    append_rows.values?.forEach (row)=> @_values.push row
    this

module.exports = Interactive.DataSource
