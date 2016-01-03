# CoffeeTable [![Build Status](https://travis-ci.org/tonyfast/coffeetable.svg?branch=master)](https://travis-ci.org/tonyfast/coffeetable)

CoffeeTable manages many tabular data sources in single page web applications.  

## Getting Started

```coffee
books = new CoffeeTable()

# What content is being published?
books.content.register '#table',
  columns: ['x','y']
  values: [[1,2],[8,9]]
# How is it being published?
books.publisher.register '#table', d3.select '#table'
books.publisher.register 'text', 'p.text'

# What content belongs to what publisher?
books.book.register '#table',
  values: [['#table', '#table', '#table'],['text','#table','text']]
  columns: ['name', 'content', 'publisher']

books.book['text'].selection.text """
The average of x is #{d3.mean books.book['text'].column_data_source 'x'}
andy is #{d3.mean books.book['text'].column_data_source 'y'}.
"""

books.book['']
```

## Books

```coffee
new Book.book.register '#table', '#table',  data
```

### Publishers

```coffee
new Book.Publisher 'a-name', '#table'
new Book.Publisher 'a-name', d3.select '#table'
```

### Contents

```coffee
new Book.Content 'some-name'
  values: [[1,2],[8,9]]
  columns: ['x','y']
  metadata:
    x: {}
    y: {}
  readme: """
  Describes the underlying dataset with 2 rows and 2 columns ``x`` and ``y``.
  """
```

## Developing
Get npm.

```bash
npm install
npm run testem
```
to start the test server.


### `npm run` _`x`_

|     _x_       | does                                                        | testem? |
|---------------|-------------------------------------------------------------|---------|
| `build`       | generate UMD'd JS from CoffeeScript in `src/`               | x       |
| `build-deps`  | generate JS dependencies for tests                          | x       |
| `build-test`  | generate JS tests from Literate CoffeeScript in `src/test/` | x       |
| `coverage`    | report coverage from previous `test`                        | x       |
| `docs`        | generate API docs                                           | x       |
| `lint`        | check for well-formedness of CoffeeScript                   |         |
| `test-js`     | run JS tests in node                                        |         |
| `test`        | runs the tests in node directly against CoffeeScript        | x       |
| `testem`      | continuously build and run tests, serving to browsers       |         |

`lint` is not currently run, but might be added at some time, once a code
style standard is adopted.


### `testem` Test Server
The [testem](https://github.com/testem/testem) test server runs basically all
of the code tasks (short of releasing!) on every file change. Here are some
routes with interesting stuff:
- [/](http://localhost:7357) the test results
- [/doc/index.html](http://localhost:7357/doc/index.html) the API doc
- [/coverage/lcov-report/index.html](http://localhost:7357/coverage/lcov-report/index.html) test coverage

It is configured with `./testem.yml`!

## Resources
