d3 = require 'd3'
Book = require './index'
Interactive = require '../interactive/index'

###
Manager attaches keyed tables and selections to the Publisher, Content, and Book
###
class Book.Editor extends Interactive
  dir: ()-> @column_data_source @index_column
  constructor: (@_values,@_name)->
    super
      columns: @_columns
      values: @_values ? []
      metadata: @_metadata
      readme: @_readme
      name: @_name

  register: ( name, value )->
    @[name] = new @_base_class value, name
    @_values.push [name]
    @[name]
  unregister: ( name )->
  commit: ->

module.exports = Book.Editor
