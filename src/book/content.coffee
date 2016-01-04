d3 = require 'd3'
Book = require './index'
Editor = require './editor'
Interactive = require '../interactive/index'

###
Content is a collection of Interactive Tabular data sources.  Content
can be consumed by a publisher.
###
class Book.Content extends Interactive
  _base_class: Interactive
  _columns: ['name']
  _metadata:
    alias: "The name of Tabular data in the SPA"
  _readme: ""

  constructor: (entries)->
    super
      name: 'content'
      values: d3.keys(entries).map((v)->[v])
      columns: @_columns
      metadata: @_metadata
      readme: @_readme

    d3.entries(entries).forEach ({key,value})=>
      value['name'] = key
      @[key] = new Interactive value

module.exports = Book.Content
