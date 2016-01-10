Interactive = require './index'
DerivedDataSource = require '../tree/derived_data_source'
ColumnDataSource = require './column_data_source'

# Table assigns metadata to the Interactive data source
# A table is describe by:
# * _values_ - A list of lists containing the row entries in the table.
# * _columns_ - The column names in the table, the column names map the entries in each row
# * _metadata_ -
# The table keys  naming is inspired by ``pandas.DataFrame.to_dict(orient='records').

class Interactive.Table extends DerivedDataSource
  # @param [Array] columns The name of the table columns
  # @param [Array] values The values of the table.
  # @param [Object] metadata An object describing the columns
  constructor: ({values, columns})->
    ## The table can be renamed ###
    @new_major_cursor 'name', name ? "Some name"
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
Interactive.Table::to_json = ()->
  JSON.stringify
    columns: @derived()
    values: @column_data_source(@derived()...)

module.exports = Interactive.Table
