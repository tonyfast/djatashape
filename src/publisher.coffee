Manager = require './manager'
Template = require './template'
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

class Publisher extends Manager
  _base_class: Template
  
  constructor: (data,to_register=[])->
    data ?= {}
    @
    super
      values: data.values ? [[]]
      columns: data.columns ? ['selector']
      metadata: data.metadata ? id:
        description: "The name of a template in an environment."
      readme: "How can I import a readme file"
    to_register.forEach (value)=>
      @register value.name, value.args

module.exports = Publisher
