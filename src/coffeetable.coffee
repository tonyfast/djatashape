{Baobab, d3} = require "./deps"
Interactive = require './interactive'
###
interactive tabular data, optimized for the browser

@example Create a new interactive CoffeeTable
  table = new CoffeeTable
    name: "Polygon"
    readme: "A rectangle"
    metadata: {x:'horizontal direction',y:'vertical direction'}
    columns: ['x', 'y']
    values: [[1, 3],[2, 8],[3,13]]

@example Add a column of data with Concat
  table.concat
    columns:
      z: [5, 4, 3]

@example Add two rows of data with Concat
  table.concat
    values: [
      [4, 18, 2]
      [5, 23, 1]
    ]

@example Add a new column that is a function of existing columns x and y
  table.transform
    t: 'x', 'y', (x, y)->
      d3.zip(x, y).map (v)-> Math.tan v[1]/ v[0]

@example Make a checkpoint or store the current state of the columns and values to reuse later.
  table.compute()

@example Create a new copy with the x and angle columns
  vectors = table.projection 'x','t'
    .copy()

The state of the table  is still the project of x and t.

@example Revert the table back to the last checkpoint.
  table.rewind()

Now the table has for columns

  alert table.name() + ' has ' + table.index().length + ' row  and the fields: ' + table.columns().join(', ')[..-2]

@example Add a categorical columns
  table.transform
      'color': 'y', (y)-> y.map (v)-> ['red','green','blue'][v %% 10]
    .compute()


@example Separate the red and the greens.
  green = table.filter 'color', (color)-> color in ['green']
    .copy()
  red = table.rewind().filter 'color', (color)-> color in ['red']
    .copy()

Separating compute from the values.

CoffeeTable stores a history of the transformations

@example Show Table Expression history
  table.history()
  table.expression()

in the next example an expression is created on the green the table and its
expressions are applied to the red table.  Methods are chainable.

@example Apply expressions to green then use the expressions on red
  green.sort 'x'
    .unique()
    .transform
      prod: 'x', 'y', (x,y)-> d3.zip(x,y).map (v)-> v[1]*v[0]

  red.evaluate green.history()


> Non-column/other cursor content is an array.

###
class CoffeeTable extends Interactive
  version: '0.1.0'
  # Construct a collection of CoffeeTable books.
  # @param [String] url_or_record_array A url to a remote resource
  # @param [{name,metadata,readme,columns,values}] url_or_record_array a structured object to create a new table
  constructor: (url_or_record_array, done)->
    if typeof(url_or_record_array) in ['string']
      d3.json url_or_record_array, (d)=>
        super d
        @cursor.set 'url', url_or_record_array
    else
      super url_or_record_array

try
  window.CoffeeTable = CoffeeTable
catch
  console.log "whatever"

module.exports = {
  CoffeeTable
  d3
  Baobab
}
