Interactive = require './index'
ColumnDataSource = require './column_data_source'

# Table assigns metadata to the Interactive data source
# A table is describe by:
# * _values_ - A list of lists containing the row entries in the table.
# * _columns_ - The column names in the table, the column names map the entries in each row
# * _metadata_ -
# The table keys  naming is inspired by ``pandas.DataFrame.to_dict(orient='records').

class Interactive.Table extends ColumnDataSource
  ### Return the metadata of the columns ###
  metadata: (args)->
    if args?
      tmp = {}
      args.forEach (arg)=> tmp[arg] = arg
      @_metadata.project tmp
    else
      @_metadata.get

  # @param [Array] columns The name of the table columns
  # @param [Array] values The values of the table.
  # @param [Object] metadata An object describing the columns
  constructor: ({values, columns, metadata})->
    ## The table can be renamed ###
    @_metadata = @cursor.select 'metadata'
    @_metadata.set @_metadata.get() ? metadata
    super values, columns
    @compute()

###
A formatted string of the table.
###
Interactive.Table::to_string = ->
###
JSONify the current state of the table.

@param [Boolean] index True includes the index in the JSON string.
###
Interactive.Table::to_json = (index=on)->
  cursors =
    columns: ['columns']
    values: ['values']
  if index then cursors['index'] = ['index']
  JSON.stringify @cursor.project cursors

module.exports = Interactive.Table
