d3 = require 'd3'
Interactive = require './index'
ColumnDataSource = require './column_data_source'

# Table assigns metadata to the Interactive data source
# A table is describe by:
# * _values_ - A list of lists containing the row entries in the table.
# * _columns_ - The column names in the table, the column names map the entries in each row
# * _metadata_ -
# The table keys  naming is inspired by ``pandas.DataFrame.to_dict(orient='records').

class Interactive.Table extends ColumnDataSource
  metadata: (args)-> @_metadata.get args...

  # @param [String] data_or_url url to a json endpoint containing the keys ``values``, ``
  # @param [Object] data_or_url
  constructor: (values, columns, metadata)->
    ## The table can be renamed ###
    @_metadata = @cursor.select 'metadata'
    @_metadata.set metadata
    super values, columns

Interactive.Table::expr =
  concat: ->
  head: ->
  tail: ->
  sort: ->
  filter: ->
  map: ->

Interactive.Table::to_string = ->
Interactive.Table::to_json =  ->

module.exports = Interactive.Table
