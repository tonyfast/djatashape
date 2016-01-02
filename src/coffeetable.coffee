Baobab = require "baobab"
d3 = require "d3"
Publisher =  require './publisher'
Content =  require './content'


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
  constructor: (content={}, publishers={}, books={})->
    @content = new Content content
    @publishers = new Publisher publishers
    @books = new Book books

  version: '0.1.0'


module.exports = {
  CoffeeTable
  d3
  Baobab
}
