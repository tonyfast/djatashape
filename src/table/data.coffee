module.exports =  class require('./index').DataSource extends require './rows'
  concat: (values, columns)->
    values?.forEach (row)=> @values.push row
    super values, columns
    this
