Baobab = require "baobab"
d3 = require "d3"
Publisher =  require './book/publisher'
Content =  require './book/content'
Book =  require './book'

# interactive tabular data, optimized for the browser
#
# @example Let's get started
#   table = new CoffeeTable
#     columns: [
#       'x'
#       'y'
#     ]
#     values: [
#       [1, 2]
#       [3, 8]
#     ]
class CoffeeTable
  # Construct a new animal.
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
