Interactive = require './interactive'

class Manager extends Interactive
  dir: ()-> @column_data_source @index_column
  register: ( name, data_or_url=null )->
    @[name] = new @_base_class data_or_url
    super()
  unregister: ( name )->
  commit: ->

module.exports = { Manager }
