Manager = require './manager'
Interactive = require './interactive'

# Content is a collection of Interactive Tabular data sources.  Content
# can be consumed by a publisher.  Both data and metadata of the table can
# be injected into the dom
class Content extends Manager
  _base_class: Interactive
  _column_index = 'selector'
  constructor: (data,to_register=[])->
    super
      values: data.values ? [[]]
      columns: data.columns ? ['selector']
      metadata: data.metadata ? id:
        description: ""
      readme: "How can I import a readme file"
    to_register.forEach (value)=>
      @register value.name, value.args

module.exports = Content
