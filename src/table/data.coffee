Table = require('./index')

class Table.DataSource extends require './rows'
  concat: (values, columns)->
    values?.forEach (row)=> @values.push row
    super values?.length ? 0
    this

module.exports =  Table.DataSource
