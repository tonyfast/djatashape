d3 = require 'd3'

class Template
  ###
  @params [string] selector css selector a DOM node
  ###
  constructor: (@selector)->
    @selection = d3.selectAll @selector

module.exports = Template
