Baobab = require 'baobab'
Table = require './interactive/table'

# Interactive data sources manipulate table eg. ``sort``,``unique``,``filter``,``map``, ``groupby``, ``join`` .
# ``Baobab`` trees are interactive and immutable.  They manage the state of the
# tabular data.
# Interactive maintains:
# * Table metadata
# * ColumnDataSources ``column_data_source`` and Row DataSource ``values``
# * ``History`` of the compute applied to the table.
# @example create a new Interactive Data Source
#   table = new Interactive
#     columns: [
#       'x'
#       'y'
#     ]
#     values: [
#       [1, 2]
#       [3, 8]
#     ]
#     metadata:
#       x: {units:'inch',alias:'length of rectangle'}
#       y: {units:'inch',alias:'width of rectangle'}
class Interactive extends Table
  readme: -> @_readme.get()
  constructor: (data_or_url, table_name)->
    @tree = new Baobab {}
    @cursor = @tree.select 0
    @_readme = @cursor.select 'readme'
    super data_or_url, table_name

module.exports = Interactive
