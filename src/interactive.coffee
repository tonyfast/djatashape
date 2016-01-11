d3 = require 'd3'
Tree = require './tree'

###
An Interactive Table uses immutable cursor trees to track the evolution history at a table state.
  It is similar to a DataFrame because it's rows and columns can be accessed independently.  The
state of the table can be used to publish data-driven content to a webpage.  Most
data that is generated from an API endpoint can be represented as a table; more
complex scenarios can be decoupled to independent tables.  Decoupled tables can manipulated
independently and joined with other tables.

###
class Interactive extends Tree
  reset: ()->
    @cursor.deepMerge @_init.get()
    this
  ###
  Create a new interactive table.
  @param [{columns, values, readme, metadata}] record_orient_data Record orient data contains the columns and
  values.

  @example Create a new interactive table
    table = new CoffeeTable
      columns: ['x', 'y']
      values: [
        [1, 2]
        [3, 8]
        [-1,4]
        [5,7]
      ]
  ###
  constructor: (record_orient_data)->
    super record_orient_data
    @compute()

module.exports = Interactive
