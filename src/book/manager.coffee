Book = require '../book'
Interactive = require '../interactive'

###
Manager attaches keyed tables and selections to the Publisher, Content, and Book
###
class Book.Manager extends Interactive
  dir: ()-> @column_data_source @index_column
  register: ( name, data_or_url=null )->
    @[name] = new @_base_class data_or_url
    @[name]
  unregister: ( name )->
  commit: ->

module.exports = Book.Manager
