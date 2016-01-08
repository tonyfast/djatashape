Baobab = require "baobab"
d3 = require "d3"
###
interactive tabular data, optimized for the browser

@example A complete example.
      d3.select('body').html('').append('div').attr 'id','table'
      d3.select('body').append('div').append('span').attr 'id','text'

      books = new CoffeeTable
          rectangle:
            columns: ['x', 'y']
            values: [[1, 2],[3, 8]]
        , [['table','#table'],['text','#text']]
        , [['table','rectangle','table'],['text','rectangle','text']]

      books.book['table'].render 'tr.values>th.index', (()->@index()), 'left'
      books.book['table'].render 'tr.values>td.values', (()->@columns())
      books.book['table'].render 'tr.columns>th.columns', (()->[null, @columns()...]),  'up'
      books.book['table'].glue
        content:
          index: (index)=> books.book['table'].render 'tr.values>th.index'
          values: (values)=> books.book['table'].render 'tr.values > td.values', values
        browser:
          th.columns:
            click: (data)-> @sort data
            mouseon: (data)-> console.log data


###
class window.CoffeeTable
  # Construct a collection of CoffeeTable books.
  # @param [Object] content contains many Tabular datasets
  # @param [Object] publisher contains many DOM selections
  # @param [Object] book use publishers to present and update conteent
  constructor: (@url)-> d3.json @url, (d)-> super d

  version: '0.1.0'

CoffeeTable.Interactive = require './interactive'
CoffeeTable.InteractiveGraph = require './interactive'


window.table = new CoffeeTable.Interactive
  columns: ['x', 'y']
  values: [
    [1, 2]
    [3, 8]
    [-1,4]
    [5,7]
  ]
window.square = new CoffeeTable.Interactive
  columns: ['x', 'y']
  values: [
    [1, 1]
    [7,7]
  ]
module.exports = {
  CoffeeTable
  d3
  Baobab
}
