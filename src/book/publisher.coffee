Book = require './index'
Editor = require './editor'
Template = require './template'
Interactive = require '../interactive/index'

###
Publisher is a supercharged d3 selection.  It adds some convience functions to
enter, exit, and update data.  All of d3 the selection methods are exposed
to the publisher

```
table = new CoffeeTable {}
template = table.publisher.register '.foo#table'
template.selection.html() == ""<div class="foo" id="table"></div>"""
template.html() == ""<div class="foo" id="table"></div>"""

template.render 'table', [1]
template.render 'div.tr.values > td', [
  [1,2]
  [8,7]
]

template.render 'tr.values > td', table.content['#table'].values()

template.render 'tr.columns > th', [
  [0]
], 'up'

template.render 'tr.index > th', [
  [null]
  [0]
], 'left'
```
###

class Book.Publisher extends Interactive
  _base_class: Template
  _metadata:
    name: 'Name of the Publisher'
    selector: 'CSS selector to publisher'
  _readme: ""
  constructor: (value)->
    super
      name: 'publisher'
      values: value
      columns: ['name', 'selector']
      metadata: @_metadata
      readme: @_readme
    value.forEach (entry)=>
      @[entry[0]] = new Template entry...



module.exports = Book.Publisher
