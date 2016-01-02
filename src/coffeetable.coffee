Baobab = require "baobab"
d3 = require "d3"
Environment =  require './environment'
Catalog =  require './catalog'


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
  constructor: (catalog={}, environment={}, edges={})->
    @catalog = new Catalog catalog
    @environment = new Environment environment
    #@flow = new @DataFlow edges

  version: '0.1.0'


module.exports = {
  CoffeeTable
  d3
  Baobab
}
