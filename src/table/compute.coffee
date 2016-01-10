d3 = require "d3"
Interactive = require './index'

class Interactive.Compute
  compute: ()->
    ### Compute changes the state of the data tree ###
    @checkpoint.deepMerge
      name: @name.get()
      index: @col 'index'
      readme: @readme.get()
      values: @col()
      metadata: @metadata.get()
      columns: [@columns.get(), @columns.get()]

    ### TODO Remove old columns ###
    this

  rewind: ()->
    @cursor.deepMerge
      index: @checkpoint.get 'index'
      columns: @checkpoint.get 'columns'
      values: @checkpoint.get 'values'
      metadata: @checkpoint.get 'metadata'
    @raw.set @checkpoint.get 'columns'
    this


module.exports = Interactive.Compute
