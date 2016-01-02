ColumnDataSource = require './column_data_source'

class TableBase extends Column

class Table extends TableBase
  metadata: (args)-> @_metadata.get args...
  constructor: (@name, data_or_url)->
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
          index: d3.range data.values.length ? 0
        ,
          method: 'load'
          args: [data]
      super()
Table::expr.concat = ->
Table::expr.head = ->
Table::expr.tail = ->
Table::expr.sort = ->
Table::expr.filter = ->
Table::expr.map = ->

Table::to_string = ->
Table::to_json =  ->

module.exports =  { Table }
