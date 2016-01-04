d3 = require 'd3'
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
  _columns: ['alias','content','publisher']
  _metadata:
    alias: 'Alias of Book that connects Content and a Publisher'
  _readme: ''

  constructor: (values)->
    super values
    d3.range(@length()).forEach (i)=>
      @[@_cds.get('alias', 'values', i)] =
        content: @content[@get 'column_data_source', 'content', 'values', i]
        publisher: @publisher[@get 'column_data_source', 'publisher', 'values', i]


module.exports = Book
