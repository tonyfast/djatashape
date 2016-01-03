Manager = require './manager'
Interactive = require './interactive'

# Content is a collection of Interactive Tabular data sources.  Content
# can be consumed by a publisher.  Both data and metadata of the table can
# be injected into the dom
###
```
table = new CoffeeTable {}
table.content.register '#table',
  columns: [
    ['x','y']
  ]
  values: [
    [1,2]
    [8,9]
  ]
  metadata:
    x:
      units: 'inch'
      alt: 'width'
    y:
      units: 'inch'
      alt: 'height'

table.content['#table'].tree
table.content['#table'].cursor
table.content['#table'].column_data_source
table.content['#table'].sort().unique().filter().map()
```
###

class Content extends Manager
  _base_class: Interactive
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
