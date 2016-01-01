```
tables._catalog
tables._catalog.dir
tables._catalog.register
tables._flow
tables._flow.dir
tables._flow.register
tables._catalog.query
tables._templates.dir #list template
tables._templates.register #register new template

tables.table['foo'].values
tables.table['foo'].columns
tables.table['foo'].column_source
tables.table['foo'].register # register a new column
tables.table['foo'].metadata
tables.table['baz'].tree
```
```
Table.to_string()
Table.sort('x').sort('y').unique('z')
Table.to_string()
Table.reset().to_string()
Table.sort('x').sort('y').unique('z').compute().to_string()
Table.reset().to_string()
Table.reset_hard().to_string()
Table.selection ['x','y'], (x,y)-> x < 2
  .to_string()
Table.reset_hard().iloc([0,2]).sort('y').iloc([0,2])
```

mVOZQg
------


Forked from [Captain Anonymous](http://codepen.io/anon/)'s Pen [PZbOVo](http://codepen.io/anon/pen/PZbOVo/).

A [Pen](http://codepen.io/tonyfast/pen/mVOZQg) by [Tony Fast](http://codepen.io/tonyfast) on [CodePen](http://codepen.io/).

[License](http://codepen.io/tonyfast/pen/mVOZQg/license).