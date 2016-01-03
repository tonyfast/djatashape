Manager = require './manager'
Template = require './template'

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
