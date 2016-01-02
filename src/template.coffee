d3 = require 'd3'

class TemplateBase

class Template extends TemplateBase
  constructor: (@selector)->
    @selection = d3.selectAll @selector

module.exports = Template
