d3 = require 'd3'

class Template 
  constructor: (@selector)->
    @selection = d3.selectAll @selector

module.exports = Template
