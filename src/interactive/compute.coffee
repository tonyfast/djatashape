d3 = require "d3"
Interactive = require './index'

class Interactive.Compute
  compute: ()->
    ### Compute changes the state of the data tree ###
    @_checkpoint.deepMerge
      name: @name()
      index: @index()
      readme: @readme()
      values: @column_data_source()
      metadata: @metadata()
      columns: [@derived(), @derived()]

    ### TODO Remove old columns ###
    this

  rewind: ()->
    @cursor.deepMerge
      index: @_checkpoint.get 'index'
      columns: @_checkpoint.get 'columns'
      values: @_checkpoint.get 'values'
      metadata: @_checkpoint.get 'metadata'
    @_columns.select(0).set @_checkpoint.get 'columns'
    this


module.exports = Interactive.Compute
