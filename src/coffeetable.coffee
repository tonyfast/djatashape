Baobab = require "baobab"
d3 = require "d3"

class CoffeeTable
  constructor: (catalog, environment,edges=)->
    @catalog = new @Catalog catalog
    @environment = new @Environment environment
    #@flow = new @DataFlow edges

  version: '0.1.0'
  Interactive: require './interactive'
  #Flow: require './dataflow'
  Environment: require './environment'
  Catalog: require './catalog'

module.exports = {
  CoffeeTable
  d3
  Baobab
}
