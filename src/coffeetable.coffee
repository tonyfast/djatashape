Baobab = require "baobab"
d3 = require "d3"
Publisher =  require './book/publisher'
Content =  require './book/content'
Book =  require './book/index'

###
interactive tabular data, optimized for the browser

@example Create some CoffeeTable books.
      books = new CoffeeTable [
        name: 'rectangle'
        args:
          columns: ['x', 'y']
          values: [[1, 2],[3, 8]]
        ], [
          name: 'table'
          args: d3.select '#table'
        ,
          name: 'text'
          args: d3.select '#text'
        ], [
          name: 'table'
          args:
            columns: ['title','content','publisher']
            values: [['table','rectangle','table'],['text','rectangle','text']]
        ]]
      console.log books.book['title']
      console.log books.book['table']
###
class CoffeeTable
  # Construct a collection of CoffeeTable books.
  #
  # @param [Object] content contains many Tabular datasets
  # @param [Object] publishers contains many DOM selections
  # @param [Object] books use publishers to present and update conteent
  #
  constructor: (content={}, publisher={}, book={})->
    @content = new Content content
    @publisher = new Publisher publisher
    @book = new Book book

  version: '0.1.0'


module.exports = {
  CoffeeTable
  d3
  Baobab
}
