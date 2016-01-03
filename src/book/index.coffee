Editor = require './editor'
Interactive = require '../interactive/index'
###
A Book uses Publishers to create Templates that join to subsets of Content.  The
Book manager is responsible for nearly all of the content.

```
table = new CoffeeTable {}
table.books.register '#table',
  columns: [
    ['content','publisher']
  ]
  values: [
    ['#table','#table']
  ]
table.book['#table'].tree
table.book['#table'].cursor
table.book['#table'].column_data_source
table.book['#table'].selection.__data__ # is some data appended to the selection from the tree
```
###
class Book extends Editor
  _base_class: Interactive
  constructor: (data,to_register=[])->
    data ?= {}
    super
      values: data.values ? [[]]
      columns: data.columns ? ['content','publisher']
      metadata: data.metadata ? id:
        description: "The name of a template in an environment."
      readme: "How can I import a readme file"
    to_register.forEach (value)=>
      @register value.name, value.args

module.exports = Book
