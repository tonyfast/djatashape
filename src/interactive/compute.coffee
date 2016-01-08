d3 = require "d3"
Interactive = require './index'

class Interactive.Compute
  compute: ()->
    ### Compute changes the state of the data tree ###
    @_checkpoint.deepMerge
      name: @name()
      readme: @readme()
      values: @column_data_source()
      metadata: @metadata()
      columns: [@derived(), @derived()]
    this

  rewind: ()->
    @cursor.deepMerge
      columns: @_checkpoint.get 'columns'
      values: @_checkpoint.get 'values'
      metadata: @_checkpoint.get 'metadata'
    @columns.select(0).set @_checkpoint.get 'columns'
    this


module.exports = Interactive.Compute
