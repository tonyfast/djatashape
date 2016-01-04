Baobab = require 'baobab'
d3 = require 'd3'
Interactive = require './index'
Table = require './table'

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
class InteractiveGraph extends Interactive
  ###
  @param [String] name The name of the Interactive Graph.
  @param [Array] values m lists of lists with n elements.  Represents a table or
  dataframe like object
  @param [Array] columns A list of column names for the corresponding values
  @param [Object] metadata An object with keys that are column names.  The keys
  can define arbitrary objects.
  @param [String] readme Some metadata about the table itself.
  ###
  constructor: (name, edges, @parent, @child, columns)->
    metadata = {}
    metadata[@parent.name()] =
      alias: "parent"
      description: "Parent Data Source to Child template"
    metadata[@child.name()] =
      alias: "child"
      description: "Parent Data Source to Child template"
    super
      name: name
      values: edges
      columns: ['name',@parent.name(),@child.name()]
      metadata: metadata
      readme: "A Connection between a Tabular Data Source and Template."
    @_extend_column_data_source metadata

  _extend_column_data_source: (metadata)->

    @_column_data_source_monkey 'parent', Baobab.monkey [@parent.name()], (value)-> value
    cds = @_column_data_source_monkey 'child', Baobab.monkey([@child.name()], (value)-> value), cds
    @stage cds

module.exports = InteractiveGraph
