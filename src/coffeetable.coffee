Baobab = require "baobab"
d3 = require "d3"

class CoffeeTable
  constructor: ->
    @tree = new Baobab({})

  add: (them...) -> them.reduce (a, b) -> a + b


module.exports = {
  CoffeeTable
  d3
  Baobab
}
