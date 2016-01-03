d3 = require 'd3'
Book = require './index'

###
```
template.selection.html() == ""<div class="foo" id="table"></div>"""
template.html() == ""<div class="foo" id="table"></div>"""

template.render 'table', [1]
template.render 'tr.values > td', [[1,2],[8,7]]
template.render 'tr.values > td', table.content['#table'].values()
template.render 'tr.columns > th', [[0]], 'up'
template.render 'tr.index > th', [[null],[0]], 'left'
```
###

class Book.Template
  ###
  @param [string] selector css selector a DOM node
  ###
  constructor: (@selector, data=[[]])->
    @selection = d3.selectAll @selector
    @_into_selection @selection, @selector, data

  ###
  @param [string] selectors tagName.className1.className2#id
  @param [object] data nested arrays
  @param [string] direction append after the last child
  ###
  render: (selectors, data, direction)->
    first_selection = @_into_selection @selection, selectors, data, direction
    new first_selection

  _into_selection: (selection, selectors, data, direction='down', first_selection=null)->
    [selector, selectors...] = selectors.split '>'
    [tag,classes...] = selector.split('.')
    [last_class,id] = last_class.split '#'
    selector ?= 'div'
    classes ?= []
    id ?= null
    selection = selection.selectAll selector
      .data data
    first_selection ?= selection
    if direction in ['down','right']
      selecter.enter().append tag
    else if direction in ['up','left']
      selecter.enter().insert tag, ':first-child'
    for class_name in classes
      selection.classed class_name, true
    if id? then selection. attr 'id', id
    ### I am unsure where this should be placed ###
    selection.exit().remove()

    if selectors.length > 1
      selection.forEach (_data)=>
        @_into_selection d3.select(@), selectors.join('>'), _data, first_selection

    first_selection

module.exports = Book.Template
