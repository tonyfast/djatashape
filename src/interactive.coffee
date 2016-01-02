Baobab = require 'baobab'
Table = require './interactive/table'

class Interactive extends Table
  readme: -> @_readme.get()
  constructor: (table_name, data_or_url)->
    @tree = new Baobab {}
    @cursor = @tree.select 0
    @_readme = @cursor.select 'readme'
    super table_name, data_or_url

module.exports = { Interactive }
