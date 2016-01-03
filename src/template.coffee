d3 = require 'd3'

class Template
  ###
  @params [string] selector css selector a DOM node
  ###
  constructor: (@selector)->
    @selection = d3.selectAll @selector
    @update()

  render:-> (selectors, data, enter_transition, exit_transition)->
    _selection = @selection
    selectors.split('>').forEach (selector)=>
      _selection = @selection.selectAll selector
        .data data

      enter = _selection.enter().enter_transition?()
      enter.append selector
      exit = _selection.exit().exit_transition?()
      exit.remove()
    new _selection

module.exports = Template
