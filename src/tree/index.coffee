###
The Tree is the interactive data source for the table.  It is responsible for
* Storing the static state of the table values.
* Creating Column Data sources
* Creating Derived Data sources
* Storying the history of expressions.

> All content on the leaves of the tree should be JSONifiable.  No Javascript objects.
Baobab monkeys must return jsonifiable values.
###
d3 = require 'd3'
Baobab = require 'baobab'

module.exports = class Tree extends require '../table'
  constructor: (structured_data)->
    @tree = new Baobab structured_data
    @cursor = @tree.select 0
    @events = {}
    @new_major_cursor 'init', structured_data
    @new_major_cursor 'readme', structured_data.readme ? ""
    @cursor.set 'columns', [(structured_data.columns ? []),[]]
    @new_major_cursor ['columns', 0], null, 'raw'
    @new_major_cursor ['columns', 1], null, 'columns'
    @new_major_cursor 'values', structured_data.values ? []
    @new_major_cursor 'metadata', structured_data.metadata ? {}
    @new_major_cursor 'name', structured_data.name ? ''

    super @cursor.project
      values: ['values']
      columns: ['columns', 0]

    @tree.on 'write', (event)->
      switch
        when 'index' in event.data.path and event.data.path.length == 1
          values = @get 'values'
          new_index = @get 'index'
          old_index = @select('index').getHistory(1)[0] ? d3.range new_index.length
          @set 'values', new_index.map (i)=> values[old_index.indexOf i]

  ### A major cursor is reflected in the table API ###
  new_major_cursor: (name, set_value, alias)->
    @[alias ? name] = @cursor.select name
    if set_value? then @[alias ? name].set set_value
