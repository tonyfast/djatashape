Manager = require './manager'

class EnvironmentBase extends Manager
  _base_class: require './template'
  _column_index: 'selector'
class Environment extends EnvironmentBase
  constructor: (data,to_register=[])->
    data ?= {}
    @
    super
      # Values of the catalog
      values: data.values ? [[]]
      # features in the catalog
      columns: data.columns ? ['selector']
      # augmented column information
      metadata: data.metadata ? id:
        description: "The name of a template in an environment."
      readme: "How can I import a readme file"
    to_register.forEach (value)=>
      @register value.name, value.args

module.exports = Environment
