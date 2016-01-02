Baobab = require 'baobab'
Table = require './interactive/table'

class Interactive extends Table
  readme: -> @_readme.get()
  constructor: (data_or_url, table_name)->
    @tree = new Baobab {}
    @cursor = @tree.select 0
    @_readme = @cursor.select 'readme'
    super data_or_url, table_name

module.exports = Interactive
