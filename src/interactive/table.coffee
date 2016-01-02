d3 = require 'd3'
Interactive = require '../interactive'
Column = require './columns'

# Table assigns metadata to the Interactive data source
# A table is describe by:
# * _values_ - A list of lists containing the row entries in the table.
# * _columns_ - The column names in the table, the column names map the entries in each row
# * _metadata_ -
# The table keys  naming is inspired by ``pandas.DataFrame.to_dict(orient='records').

class Interactive.Table extends Columns
  metadata: (args)-> @_metadata.get args...

  # @param [String] data_or_url url to a json endpoint containing the keys ``values``, ``
  # @param [Object] data_or_url
  constructor: (data_or_url, @name=null)->
    ## The table can be renamed ###
    @_name = @cursor.select 'name'
    @_name.set @name
    @_metadata = @cursor.select 'metadata'
    @load data_or_url
    super()
  load: (data_or_url)->
    if 'string' in [typeof data_or_url]
      d3.json data, (table_data)=>
        table_data['url'] = @_raw
        @stage
            raw: table_data
            index: d3.range table_data.length
          ,
            method: 'load'
            args: [data_or_url]
        super()
    else
      data = data_or_url
      @stage
          values: data.values ? [[]]
          columns: data.columns ? []
          metadata: data.metadata ? {}
          readme: data.readme ? null
          index: d3.range data.values?.length ? 0
        ,
          method: 'load'
          args: [data]
      super()

Table::expr =
  concat: ->
  head: ->
  tail: ->
  sort: ->
  filter: ->
  map: ->

Table::to_string = ->
Table::to_json =  ->

module.exports = Interactive.Table
