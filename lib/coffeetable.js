(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Book, Editor, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('./index');

Editor = require('./editor');

Interactive = require('../interactive/index');


/*
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
 */

Book.Content = (function(superClass) {
  extend(Content, superClass);

  Content.prototype._base_class = Interactive;

  function Content(data, to_register) {
    var ref, ref1, ref2;
    if (to_register == null) {
      to_register = [];
    }
    Content.__super__.constructor.call(this, {
      values: (ref = data.values) != null ? ref : [[]],
      columns: (ref1 = data.columns) != null ? ref1 : ['selector'],
      metadata: (ref2 = data.metadata) != null ? ref2 : {
        id: {
          description: ""
        }
      },
      readme: "How can I import a readme file"
    });
    to_register.forEach((function(_this) {
      return function(value) {
        return _this.register(value.name, value.args);
      };
    })(this));
  }

  return Content;

})(Editor);

module.exports = Book.Content;


},{"../interactive/index":13,"./editor":2,"./index":3}],2:[function(require,module,exports){
var Book, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('./index');

Interactive = require('../interactive/index');


/*
Manager attaches keyed tables and selections to the Publisher, Content, and Book
 */

Book.Editor = (function(superClass) {
  extend(Editor, superClass);

  function Editor() {
    return Editor.__super__.constructor.apply(this, arguments);
  }

  Editor.prototype.dir = function() {
    return this.column_data_source(this.index_column);
  };

  Editor.prototype.register = function(name, data_or_url) {
    if (data_or_url == null) {
      data_or_url = null;
    }
    this[name] = new this._base_class(data_or_url);
    return this[name];
  };

  Editor.prototype.unregister = function(name) {};

  Editor.prototype.commit = function() {};

  return Editor;

})(Interactive);

module.exports = Book.Editor;


},{"../interactive/index":13,"./index":3}],3:[function(require,module,exports){
var Book, Editor, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Editor = require('./editor');

Interactive = require('../interactive/index');


/*
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
 */

Book = (function(superClass) {
  extend(Book, superClass);

  Book.prototype._base_class = Interactive;

  function Book(data, to_register) {
    var ref, ref1, ref2;
    if (to_register == null) {
      to_register = [];
    }
    if (data == null) {
      data = {};
    }
    Book.__super__.constructor.call(this, {
      values: (ref = data.values) != null ? ref : [[]],
      columns: (ref1 = data.columns) != null ? ref1 : ['content', 'publisher'],
      metadata: (ref2 = data.metadata) != null ? ref2 : {
        id: {
          description: "The name of a template in an environment."
        }
      },
      readme: "How can I import a readme file"
    });
    to_register.forEach((function(_this) {
      return function(value) {
        return _this.register(value.name, value.args);
      };
    })(this));
  }

  return Book;

})(Editor);

module.exports = Book;


},{"../interactive/index":13,"./editor":2}],4:[function(require,module,exports){
var Book, Editor, Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('./index');

Editor = require('./editor');

Template = require('./template');


/*
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
 */

Book.Publisher = (function(superClass) {
  extend(Publisher, superClass);

  Publisher.prototype._base_class = Template;

  function Publisher(data, to_register) {
    var ref, ref1, ref2;
    if (to_register == null) {
      to_register = [];
    }
    if (data == null) {
      data = {};
    }
    this;
    Publisher.__super__.constructor.call(this, {
      values: (ref = data.values) != null ? ref : [[]],
      columns: (ref1 = data.columns) != null ? ref1 : ['selector'],
      metadata: (ref2 = data.metadata) != null ? ref2 : {
        id: {
          description: "The name of a template in an environment."
        }
      },
      readme: "How can I import a readme file"
    });
    to_register.forEach((function(_this) {
      return function(value) {
        return _this.register(value.name, value.args);
      };
    })(this));
  }

  return Publisher;

})(Editor);

module.exports = Book.Publisher;


},{"./editor":2,"./index":3,"./template":5}],5:[function(require,module,exports){
var Book, d3,
  slice = [].slice;

d3 = require('d3');

Book = require('./index');


/*
```
template.selection.html() == ""<div class="foo" id="table"></div>"""
template.html() == ""<div class="foo" id="table"></div>"""

template.render 'table', [1]
template.render 'tr.values > td', [[1,2],[8,7]]
template.render 'tr.values > td', table.content['#table'].values()
template.render 'tr.columns > th', [[0]], 'up'
template.render 'tr.index > th', [[null],[0]], 'left'
```
 */

Book.Template = (function() {

  /*
  @param [string] selector css selector a DOM node
   */
  function Template(selector1, data) {
    this.selector = selector1;
    if (data == null) {
      data = [[]];
    }
    this.selection = d3.selectAll(this.selector);
    this._into_selection(this.selection, this.selector, data);
  }


  /*
  @param [string] selectors tagName.className1.className2#id
  @param [object] data nested arrays
  @param [string] direction append after the last child
   */

  Template.prototype.render = function(selectors, data, direction) {
    var first_selection;
    first_selection = this._into_selection(this.selection, selectors, data, direction);
    return new first_selection;
  };

  Template.prototype._into_selection = function(selection, selectors, data, direction, first_selection) {
    var class_name, classes, i, id, last_class, len, ref, ref1, ref2, selector, tag;
    if (direction == null) {
      direction = 'down';
    }
    if (first_selection == null) {
      first_selection = null;
    }
    ref = selectors.split('>'), selector = ref[0], selectors = 2 <= ref.length ? slice.call(ref, 1) : [];
    ref1 = selector.split('.'), tag = ref1[0], classes = 2 <= ref1.length ? slice.call(ref1, 1) : [];
    ref2 = last_class.split('#'), last_class = ref2[0], id = ref2[1];
    if (selector == null) {
      selector = 'div';
    }
    if (classes == null) {
      classes = [];
    }
    if (id == null) {
      id = null;
    }
    selection = selection.selectAll(selector).data(data);
    if (first_selection == null) {
      first_selection = selection;
    }
    if (direction === 'down' || direction === 'right') {
      selecter.enter().append(tag);
    } else if (direction === 'up' || direction === 'left') {
      selecter.enter().insert(tag, ':first-child');
    }
    for (i = 0, len = classes.length; i < len; i++) {
      class_name = classes[i];
      selection.classed(class_name, true);
    }
    if (id != null) {
      selection.attr('id', id);
    }

    /* I am unsure where this should be placed */
    selection.exit().remove();
    if (selectors.length > 1) {
      selection.forEach((function(_this) {
        return function(_data) {
          return _this._into_selection(d3.select(_this), selectors.join('>'), _data, first_selection);
        };
      })(this));
    }
    return first_selection;
  };

  return Template;

})();

module.exports = Book.Template;


},{"./index":3,"d3":"d3"}],6:[function(require,module,exports){
var Baobab, Book, CoffeeTable, Content, Publisher, d3;

Baobab = require("baobab");

d3 = require("d3");

Publisher = require('./book/publisher');

Content = require('./book/content');

Book = require('./book/index');


/*
interactive tabular data, optimized for the browser

@example Create some CoffeeTable books.
      books = new CoffeeTable [
        name: 'rectangle'
        args:
          columns: ['x', 'y']
          values: [[1, 2],[3, 8]]
        ], [
          name: 'table'
          args: d3.select '#table'
        ,
          name: 'text'
          args: d3.select '#text'
        ], [
          name: 'table'
          args:
            columns: ['title','content','publisher']
            values: [['table','rectangle','table'],['text','rectangle','text']]
        ]]
      console.log books.book['title']
      console.log books.book['table']
 */

CoffeeTable = (function() {
  function CoffeeTable(content, publisher, book) {
    if (content == null) {
      content = {};
    }
    if (publisher == null) {
      publisher = {};
    }
    if (book == null) {
      book = {};
    }
    this.content = new Content(content);
    this.publisher = new Publisher(publisher);
    this.book = new Book(book);
  }

  CoffeeTable.prototype.version = '0.1.0';

  return CoffeeTable;

})();

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./book/content":1,"./book/index":3,"./book/publisher":4,"baobab":"baobab","d3":"d3"}],7:[function(require,module,exports){
var Baobab, DataSource, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Baobab = require("baobab");

Interactive = require('./index');

DataSource = require('./data');

Interactive.ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource() {
    this._cds = this.cursor.select('column_data_source');
    ColumnDataSource.__super__.constructor.call(this);
  }

  ColumnDataSource.prototype.load = function(columns) {
    var cds;
    if (columns == null) {
      columns = this.columns();
    }

    /* Index monkey is destroyed on the first operation */
    cds = {};
    columns = Array.apply(null, columns);
    columns.forEach((function(_this) {
      return function(column, column_index) {

        /* Create Dynamic Nodes for Each Column Data Source */
        return cds = _this._column_data_source_monkey(column, null, cds);
      };
    })(this));
    return this.stage(cds);
  };

  ColumnDataSource.prototype._column_name_array = function(columns) {
    if (!Array.isArray(columns)) {
      return [columns];
    } else {
      return columns;
    }
  };

  ColumnDataSource.prototype._column_data_source_monkey = function(column, monkey, tmp) {
    if (tmp == null) {
      tmp = {};
    }
    if (tmp['column_data_source'] == null) {
      tmp['column_data_source'] = {};
    }
    if (monkey == null) {
      monkey = Baobab.monkey(['columns'], ['values'], ['.', 'name'], function(columns, values, column_name) {
        var column_index;
        column_index = columns.indexOf(column_name);
        return values.map(function(row_values) {
          return row_values[column_index];
        });
      });
    }
    tmp['column_data_source'][column] = {
      name: column,
      values: monkey
    };
    return tmp;
  };

  ColumnDataSource.prototype.column_data_source = function(columns, force_array) {
    if (force_array == null) {
      force_array = false;
    }
    columns = this._column_name_array(columns);
    if (columns.length > 1 || force_array) {
      return d3.zip.apply(d3, columns.map((function(_this) {
        return function(c) {
          return _this._cds.get(c, 'values');
        };
      })(this)));
    } else {
      return this._cds.get(columns[0], 'values');
    }
  };

  return ColumnDataSource;

})(DataSource);

module.exports = Interactive.ColumnDataSource;


},{"./data":10,"./index":13,"baobab":"baobab"}],8:[function(require,module,exports){
var Expression, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Expression = require('./expression');

Interactive.Column = (function(superClass) {
  extend(Column, superClass);

  Column.prototype.columns = function(args) {
    var ref;
    return (ref = this._columns).get.apply(ref, args);
  };

  function Column() {
    this._columns = this.cursor.select('columns');
    Column.__super__.constructor.call(this);
  }

  return Column;

})(Expression);

module.exports = Interactive.Column;


},{"./expression":11,"./index":13}],9:[function(require,module,exports){
var Interactive, d3,
  slice = [].slice;

d3 = require("d3");

Interactive = require('./index');

Interactive.Compute = (function() {
  function Compute() {}

  Compute.prototype.compute = function() {

    /* Compute changes the state of the data tree */
    console.log(1, {
      values: this.values(),
      index: this.index(),
      metadata: this.metadata(),
      columns: this.columns(),
      readme: this.readme()
    });
    this._checkpoint.deepMerge({
      values: this.values(),
      index: this.index(),
      metadata: this.metadata(),
      columns: this.columns(),
      readme: this.readme()
    });
    return this;
  };

  Compute.prototype.stage = function(new_state, expression) {
    var i, len, monkey, monkeys, ref, update_state;
    if (expression == null) {
      expression = null;
    }
    ref = this._split_update_object(new_state), update_state = ref[0], monkeys = ref[1];
    this.cursor.deepMerge(update_state);
    if (monkeys.length > 0) {
      for (i = 0, len = monkeys.length; i < len; i++) {
        monkey = monkeys[i];
        this.cursor.set(monkey.path, monkey.value);
      }
    }
    return this;
  };

  Compute.prototype._split_update_object = function(updated_state, path, monkeys) {
    if (path == null) {
      path = [];
    }
    if (monkeys == null) {
      monkeys = [];
    }

    /* Prune and set the Baobab monkeys and return only the values compliant with deepMerge */
    d3.entries(updated_state).forEach((function(_this) {
      return function(entry) {
        var ref;
        if (Array.isArray(entry.value)) {

          /* do nothing */
        } else if ((ref = typeof entry.value) === 'object') {
          if (updated_state[entry.key]['hasDynamicPaths'] != null) {
            monkeys.push({
              path: slice.call(path).concat([entry.key]),
              value: entry.value
            });
            return delete updated_state[entry.key];
          } else {
            return _this._split_update_object(updated_state[entry.key], slice.call(path).concat([entry.key]), monkeys);
          }
        }
      };
    })(this));
    return [updated_state, monkeys];
  };

  return Compute;

})();

module.exports = Interactive.Compute;


},{"./index":13,"d3":"d3"}],10:[function(require,module,exports){
var Interactive, Row,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Row = require('./rows');

Interactive.DataSource = (function(superClass) {
  extend(DataSource, superClass);

  DataSource.prototype.values = function(args) {
    var ref;
    return (ref = this._values).get.apply(ref, args);
  };

  function DataSource() {
    this._values = this.cursor.select('values');
    DataSource.__super__.constructor.call(this);
  }

  return DataSource;

})(Row);

module.exports = Interactive.DataSource;


},{"./index":13,"./rows":14}],11:[function(require,module,exports){
var History, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Interactive = require('./index');

History = require('./history');

Interactive.Expression = (function(superClass) {
  extend(Expression, superClass);

  Expression.prototype.expression = function(args) {
    var ref;
    return (ref = this._expression).get.apply(ref, args);
  };

  function Expression() {
    this.expressions = [];
    this._expression = this.cursor.select('expression');
    Expression.__super__.constructor.call(this);
  }

  Expression.prototype.execute = function() {
    var expressions;
    expressions = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return expressions.forEach(function(expression, expression_count) {
      var computed_state, ref, ref1, ref2;
      if (ref = expression.method, indexOf.call(d3.keys(this.Expression.prototype), ref) >= 0) {
        computed_state = (ref1 = this.Expression)[expression.method].apply(ref1, expression.args);
      } else if (ref2 = expression.method, indexOf.call(d3.keys(this.prototype), ref2) >= 0) {
        computed_state = this[expression.method].apply(this, expression.args);
      } else {
        assert((JSON.stringify(expressions)) + " is not understood.");
      }
      this.stage(computed_state);
      return this.compute();
    });
  };

  Expression.prototype.get = function(args) {
    var ref;
    return (ref = this.cursor).get.apply(ref, args);
  };

  Expression.prototype.set = function(args) {
    var ref;
    return (ref = this.cursor).set.apply(ref, args);
  };

  return Expression;

})(History);

module.exports = Interactive.Expression;


},{"./history":12,"./index":13}],12:[function(require,module,exports){
var Compute, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Compute = require('./compute');

Interactive.History = (function(superClass) {
  extend(History, superClass);

  function History() {
    this._checkpoint = this.cursor.select('checkpoint');
    this._checkpoint.set({});
    this._expression.startRecording(20);
    History.__super__.constructor.call(this);
  }

  History.prototype.history = function() {
    return this._expression.getHistory();
  };

  History.prototype.clear_history = function() {
    return this._expression.clearHistory();
  };

  History.prototype.record = function(expression) {
    return this.expressions.push(expression);
  };

  return History;

})(Compute);

module.exports = Interactive.History;


},{"./compute":9,"./index":13}],13:[function(require,module,exports){
var Baobab, Interactive, Table,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Baobab = require('baobab');

Table = require('./table');

Interactive = (function(superClass) {
  extend(Interactive, superClass);

  Interactive.prototype.readme = function() {
    return this._readme.get();
  };

  function Interactive(data_or_url, table_name) {
    this.tree = new Baobab({});
    this.cursor = this.tree.select(0);
    this._readme = this.cursor.select('readme');
    Interactive.__super__.constructor.call(this, data_or_url, table_name);
    this.compute();
  }

  return Interactive;

})(Table);

module.exports = Interactive;


},{"./table":15,"baobab":"baobab"}],14:[function(require,module,exports){
var Column, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Column = require('./columns');

Interactive.Row = (function(superClass) {
  extend(Row, superClass);

  Row.prototype.index = function(args) {
    var ref;
    return (ref = this._index).get.apply(ref, args);
  };

  function Row() {
    this._index = this.cursor.select('index');
    this.stage(this._column_data_source_monkey('index', [
      ['index'], function(index) {
        return index;
      }
    ]));
    Row.__super__.constructor.call(this);
  }

  Row.prototype.iloc = function() {};

  Row.prototype.loc = function() {};

  Row.prototype.update = function() {};

  return Row;

})(Column);

module.exports = Interactive.Row;


},{"./columns":8,"./index":13}],15:[function(require,module,exports){
var ColumnDataSource, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Interactive = require('./index');

ColumnDataSource = require('./column_data_source');

Interactive.Table = (function(superClass) {
  extend(Table, superClass);

  Table.prototype.metadata = function(args) {
    var ref;
    return (ref = this._metadata).get.apply(ref, args);
  };

  function Table(data_or_url, name) {
    this.name = name != null ? name : null;
    this._name = this.cursor.select('name');
    this._name.set(this.name);
    this._metadata = this.cursor.select('metadata');
    Table.__super__.constructor.call(this);
    this.load(data_or_url);
  }

  Table.prototype.load = function(data_or_url) {
    var data, ref, ref1, ref2, ref3, ref4, ref5;
    if ('string' === (typeof data_or_url)) {
      return d3.json(data, (function(_this) {
        return function(table_data) {
          table_data['url'] = _this._raw;
          _this.stage({
            raw: table_data,
            index: d3.range(table_data.length)
          }, {
            method: 'load',
            args: [data_or_url]
          });
          return Table.__super__.load.call(_this);
        };
      })(this));
    } else {
      data = data_or_url;
      this.stage({
        values: (ref = data.values) != null ? ref : [[]],
        columns: (ref1 = data.columns) != null ? ref1 : [],
        metadata: (ref2 = data.metadata) != null ? ref2 : {},
        readme: (ref3 = data.readme) != null ? ref3 : null,
        index: d3.range((ref4 = (ref5 = data.values) != null ? ref5.length : void 0) != null ? ref4 : 0)
      }, {
        method: 'load',
        args: [data]
      });
      return Table.__super__.load.call(this);
    }
  };

  return Table;

})(ColumnDataSource);

Interactive.Table.prototype.expr = {
  concat: function() {},
  head: function() {},
  tail: function() {},
  sort: function() {},
  filter: function() {},
  map: function() {}
};

Interactive.Table.prototype.to_string = function() {};

Interactive.Table.prototype.to_json = function() {};

module.exports = Interactive.Table;


},{"./column_data_source":7,"./index":13,"d3":"d3"}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9vay9jb250ZW50LmNvZmZlZSIsInNyYy9ib29rL2VkaXRvci5jb2ZmZWUiLCJzcmMvYm9vay9pbmRleC5jb2ZmZWUiLCJzcmMvYm9vay9wdWJsaXNoZXIuY29mZmVlIiwic3JjL2Jvb2svdGVtcGxhdGUuY29mZmVlIiwic3JjL2NvZmZlZXRhYmxlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb2x1bW5fZGF0YV9zb3VyY2UuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbnMuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbXB1dGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2RhdGEuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2V4cHJlc3Npb24uY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2hpc3RvcnkuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2luZGV4LmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9yb3dzLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS90YWJsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLHlCQUFBO0VBQUE7OztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFDUCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsV0FBQSxHQUFjLE9BQUEsQ0FBUSxzQkFBUjs7O0FBS2Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJNLElBQUksQ0FBQzs7O29CQUNULFdBQUEsR0FBYTs7RUFDQSxpQkFBQyxJQUFELEVBQU0sV0FBTjtBQUNYLFFBQUE7O01BRGlCLGNBQVk7O0lBQzdCLHlDQUNFO01BQUEsTUFBQSxzQ0FBc0IsQ0FBQyxFQUFELENBQXRCO01BQ0EsT0FBQSx5Q0FBd0IsQ0FBQyxVQUFELENBRHhCO01BRUEsUUFBQSwwQ0FBMEI7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QUEwQixFQUYxQjtRQUdBLE1BQUEsd0NBQXNCLElBSHRCO1FBSUEsS0FBQSxFQUFPLEVBQUUsQ0FBQyxLQUFILCtFQUErQixDQUEvQixDQUpQO09BREYsRUFPRTtRQUFBLE1BQUEsRUFBUSxNQUFSO1FBQ0EsSUFBQSxFQUFNLENBQUMsSUFBRCxDQUROO09BUEY7YUFTQSw4QkFBQSxFQXJCRjs7RUFESTs7OztHQWJ3Qjs7QUFxQ2hDLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLElBQW5CLEdBQ0U7RUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBLENBQVI7RUFDQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBRE47RUFFQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBRk47RUFHQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBSE47RUFJQSxNQUFBLEVBQVEsU0FBQSxHQUFBLENBSlI7RUFLQSxHQUFBLEVBQUssU0FBQSxHQUFBLENBTEw7OztBQU9GLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLFNBQW5CLEdBQStCLFNBQUEsR0FBQTs7QUFDL0IsV0FBVyxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsT0FBbkIsR0FBOEIsU0FBQSxHQUFBOztBQUU5QixNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiQm9vayA9IHJlcXVpcmUgJy4vaW5kZXgnXG5FZGl0b3IgPSByZXF1aXJlICcuL2VkaXRvcidcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUvaW5kZXgnXG5cbiMgQ29udGVudCBpcyBhIGNvbGxlY3Rpb24gb2YgSW50ZXJhY3RpdmUgVGFidWxhciBkYXRhIHNvdXJjZXMuICBDb250ZW50XG4jIGNhbiBiZSBjb25zdW1lZCBieSBhIHB1Ymxpc2hlci4gIEJvdGggZGF0YSBhbmQgbWV0YWRhdGEgb2YgdGhlIHRhYmxlIGNhblxuIyBiZSBpbmplY3RlZCBpbnRvIHRoZSBkb21cbiMjI1xuYGBgXG50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZSB7fVxudGFibGUuY29udGVudC5yZWdpc3RlciAnI3RhYmxlJyxcbiAgY29sdW1uczogW1xuICAgIFsneCcsJ3knXVxuICBdXG4gIHZhbHVlczogW1xuICAgIFsxLDJdXG4gICAgWzgsOV1cbiAgXVxuICBtZXRhZGF0YTpcbiAgICB4OlxuICAgICAgdW5pdHM6ICdpbmNoJ1xuICAgICAgYWx0OiAnd2lkdGgnXG4gICAgeTpcbiAgICAgIHVuaXRzOiAnaW5jaCdcbiAgICAgIGFsdDogJ2hlaWdodCdcblxudGFibGUuY29udGVudFsnI3RhYmxlJ10udHJlZVxudGFibGUuY29udGVudFsnI3RhYmxlJ10uY3Vyc29yXG50YWJsZS5jb250ZW50WycjdGFibGUnXS5jb2x1bW5fZGF0YV9zb3VyY2VcbnRhYmxlLmNvbnRlbnRbJyN0YWJsZSddLnNvcnQoKS51bmlxdWUoKS5maWx0ZXIoKS5tYXAoKVxuYGBgXG4jIyNcbmNsYXNzIEJvb2suQ29udGVudCBleHRlbmRzIEVkaXRvclxuICBfYmFzZV9jbGFzczogSW50ZXJhY3RpdmVcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgc3VwZXJcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiXG4gICAgICByZWFkbWU6IFwiSG93IGNhbiBJIGltcG9ydCBhIHJlYWRtZSBmaWxlXCJcbiAgICB0b19yZWdpc3Rlci5mb3JFYWNoICh2YWx1ZSk9PlxuICAgICAgQHJlZ2lzdGVyIHZhbHVlLm5hbWUsIHZhbHVlLmFyZ3NcblxubW9kdWxlLmV4cG9ydHMgPSBCb29rLkNvbnRlbnRcbiIsIkJvb2sgPSByZXF1aXJlICcuL2luZGV4J1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZS9pbmRleCdcblxuIyMjXG5NYW5hZ2VyIGF0dGFjaGVzIGtleWVkIHRhYmxlcyBhbmQgc2VsZWN0aW9ucyB0byB0aGUgUHVibGlzaGVyLCBDb250ZW50LCBhbmQgQm9va1xuIyMjXG5jbGFzcyBCb29rLkVkaXRvciBleHRlbmRzIEludGVyYWN0aXZlXG4gIGRpcjogKCktPiBAY29sdW1uX2RhdGFfc291cmNlIEBpbmRleF9jb2x1bW5cbiAgcmVnaXN0ZXI6ICggbmFtZSwgZGF0YV9vcl91cmw9bnVsbCApLT5cbiAgICBAW25hbWVdID0gbmV3IEBfYmFzZV9jbGFzcyBkYXRhX29yX3VybFxuICAgIEBbbmFtZV1cbiAgdW5yZWdpc3RlcjogKCBuYW1lICktPlxuICBjb21taXQ6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5FZGl0b3JcbiIsIkVkaXRvciA9IHJlcXVpcmUgJy4vZWRpdG9yJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZS9pbmRleCdcbiMjI1xuQSBCb29rIHVzZXMgUHVibGlzaGVycyB0byBjcmVhdGUgVGVtcGxhdGVzIHRoYXQgam9pbiB0byBzdWJzZXRzIG9mIENvbnRlbnQuICBUaGVcbkJvb2sgbWFuYWdlciBpcyByZXNwb25zaWJsZSBmb3IgbmVhcmx5IGFsbCBvZiB0aGUgY29udGVudC5cblxuYGBgXG50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZSB7fVxudGFibGUuYm9va3MucmVnaXN0ZXIgJyN0YWJsZScsXG4gIGNvbHVtbnM6IFtcbiAgICBbJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICBdXG4gIHZhbHVlczogW1xuICAgIFsnI3RhYmxlJywnI3RhYmxlJ11cbiAgXVxudGFibGUuYm9va1snI3RhYmxlJ10udHJlZVxudGFibGUuYm9va1snI3RhYmxlJ10uY3Vyc29yXG50YWJsZS5ib29rWycjdGFibGUnXS5jb2x1bW5fZGF0YV9zb3VyY2VcbnRhYmxlLmJvb2tbJyN0YWJsZSddLnNlbGVjdGlvbi5fX2RhdGFfXyAjIGlzIHNvbWUgZGF0YSBhcHBlbmRlZCB0byB0aGUgc2VsZWN0aW9uIGZyb20gdGhlIHRyZWVcbmBgYFxuIyMjXG5jbGFzcyBCb29rIGV4dGVuZHMgRWRpdG9yXG4gIF9iYXNlX2NsYXNzOiBJbnRlcmFjdGl2ZVxuICBjb25zdHJ1Y3RvcjogKGRhdGEsdG9fcmVnaXN0ZXI9W10pLT5cbiAgICBkYXRhID89IHt9XG4gICAgc3VwZXJcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gQm9va1xuIiwiQm9vayA9IHJlcXVpcmUgJy4vaW5kZXgnXG5FZGl0b3IgPSByZXF1aXJlICcuL2VkaXRvcidcblRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZSdcblxuIyMjXG5QdWJsaXNoZXIgaXMgYSBzdXBlcmNoYXJnZWQgZDMgc2VsZWN0aW9uLiAgSXQgYWRkcyBzb21lIGNvbnZpZW5jZSBmdW5jdGlvbnMgdG9cbmVudGVyLCBleGl0LCBhbmQgdXBkYXRlIGRhdGEuICBBbGwgb2YgZDMgdGhlIHNlbGVjdGlvbiBtZXRob2RzIGFyZSBleHBvc2VkXG50byB0aGUgcHVibGlzaGVyXG5cbmBgYFxudGFibGUgPSBuZXcgQ29mZmVlVGFibGUge31cbnRlbXBsYXRlID0gdGFibGUucHVibGlzaGVyLnJlZ2lzdGVyICcuZm9vI3RhYmxlJ1xudGVtcGxhdGUuc2VsZWN0aW9uLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcbnRlbXBsYXRlLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcblxudGVtcGxhdGUucmVuZGVyICd0YWJsZScsIFsxXVxudGVtcGxhdGUucmVuZGVyICdkaXYudHIudmFsdWVzID4gdGQnLCBbXG4gIFsxLDJdXG4gIFs4LDddXG5dXG5cbnRlbXBsYXRlLnJlbmRlciAndHIudmFsdWVzID4gdGQnLCB0YWJsZS5jb250ZW50WycjdGFibGUnXS52YWx1ZXMoKVxuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmNvbHVtbnMgPiB0aCcsIFtcbiAgWzBdXG5dLCAndXAnXG5cbnRlbXBsYXRlLnJlbmRlciAndHIuaW5kZXggPiB0aCcsIFtcbiAgW251bGxdXG4gIFswXVxuXSwgJ2xlZnQnXG5gYGBcbiMjI1xuXG5jbGFzcyBCb29rLlB1Ymxpc2hlciBleHRlbmRzIEVkaXRvclxuICBfYmFzZV9jbGFzczogVGVtcGxhdGVcblxuICBjb25zdHJ1Y3RvcjogKGRhdGEsdG9fcmVnaXN0ZXI9W10pLT5cbiAgICBkYXRhID89IHt9XG4gICAgQFxuICAgIHN1cGVyXG4gICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gWydzZWxlY3RvciddXG4gICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IGlkOlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgbmFtZSBvZiBhIHRlbXBsYXRlIGluIGFuIGVudmlyb25tZW50LlwiXG4gICAgICByZWFkbWU6IFwiSG93IGNhbiBJIGltcG9ydCBhIHJlYWRtZSBmaWxlXCJcbiAgICB0b19yZWdpc3Rlci5mb3JFYWNoICh2YWx1ZSk9PlxuICAgICAgQHJlZ2lzdGVyIHZhbHVlLm5hbWUsIHZhbHVlLmFyZ3NcblxubW9kdWxlLmV4cG9ydHMgPSBCb29rLlB1Ymxpc2hlclxuIiwiZDMgPSByZXF1aXJlICdkMydcbkJvb2sgPSByZXF1aXJlICcuL2luZGV4J1xuXG4jIyNcbmBgYFxudGVtcGxhdGUuc2VsZWN0aW9uLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcbnRlbXBsYXRlLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcblxudGVtcGxhdGUucmVuZGVyICd0YWJsZScsIFsxXVxudGVtcGxhdGUucmVuZGVyICd0ci52YWx1ZXMgPiB0ZCcsIFtbMSwyXSxbOCw3XV1cbnRlbXBsYXRlLnJlbmRlciAndHIudmFsdWVzID4gdGQnLCB0YWJsZS5jb250ZW50WycjdGFibGUnXS52YWx1ZXMoKVxudGVtcGxhdGUucmVuZGVyICd0ci5jb2x1bW5zID4gdGgnLCBbWzBdXSwgJ3VwJ1xudGVtcGxhdGUucmVuZGVyICd0ci5pbmRleCA+IHRoJywgW1tudWxsXSxbMF1dLCAnbGVmdCdcbmBgYFxuIyMjXG5cbmNsYXNzIEJvb2suVGVtcGxhdGVcbiAgIyMjXG4gIEBwYXJhbSBbc3RyaW5nXSBzZWxlY3RvciBjc3Mgc2VsZWN0b3IgYSBET00gbm9kZVxuICAjIyNcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IsIGRhdGE9W1tdXSktPlxuICAgIEBzZWxlY3Rpb24gPSBkMy5zZWxlY3RBbGwgQHNlbGVjdG9yXG4gICAgQF9pbnRvX3NlbGVjdGlvbiBAc2VsZWN0aW9uLCBAc2VsZWN0b3IsIGRhdGFcblxuICAjIyNcbiAgQHBhcmFtIFtzdHJpbmddIHNlbGVjdG9ycyB0YWdOYW1lLmNsYXNzTmFtZTEuY2xhc3NOYW1lMiNpZFxuICBAcGFyYW0gW29iamVjdF0gZGF0YSBuZXN0ZWQgYXJyYXlzXG4gIEBwYXJhbSBbc3RyaW5nXSBkaXJlY3Rpb24gYXBwZW5kIGFmdGVyIHRoZSBsYXN0IGNoaWxkXG4gICMjI1xuICByZW5kZXI6IChzZWxlY3RvcnMsIGRhdGEsIGRpcmVjdGlvbiktPlxuICAgIGZpcnN0X3NlbGVjdGlvbiA9IEBfaW50b19zZWxlY3Rpb24gQHNlbGVjdGlvbiwgc2VsZWN0b3JzLCBkYXRhLCBkaXJlY3Rpb25cbiAgICBuZXcgZmlyc3Rfc2VsZWN0aW9uXG5cbiAgX2ludG9fc2VsZWN0aW9uOiAoc2VsZWN0aW9uLCBzZWxlY3RvcnMsIGRhdGEsIGRpcmVjdGlvbj0nZG93bicsIGZpcnN0X3NlbGVjdGlvbj1udWxsKS0+XG4gICAgW3NlbGVjdG9yLCBzZWxlY3RvcnMuLi5dID0gc2VsZWN0b3JzLnNwbGl0ICc+J1xuICAgIFt0YWcsY2xhc3Nlcy4uLl0gPSBzZWxlY3Rvci5zcGxpdCgnLicpXG4gICAgW2xhc3RfY2xhc3MsaWRdID0gbGFzdF9jbGFzcy5zcGxpdCAnIydcbiAgICBzZWxlY3RvciA/PSAnZGl2J1xuICAgIGNsYXNzZXMgPz0gW11cbiAgICBpZCA/PSBudWxsXG4gICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLnNlbGVjdEFsbCBzZWxlY3RvclxuICAgICAgLmRhdGEgZGF0YVxuICAgIGZpcnN0X3NlbGVjdGlvbiA/PSBzZWxlY3Rpb25cbiAgICBpZiBkaXJlY3Rpb24gaW4gWydkb3duJywncmlnaHQnXVxuICAgICAgc2VsZWN0ZXIuZW50ZXIoKS5hcHBlbmQgdGFnXG4gICAgZWxzZSBpZiBkaXJlY3Rpb24gaW4gWyd1cCcsJ2xlZnQnXVxuICAgICAgc2VsZWN0ZXIuZW50ZXIoKS5pbnNlcnQgdGFnLCAnOmZpcnN0LWNoaWxkJ1xuICAgIGZvciBjbGFzc19uYW1lIGluIGNsYXNzZXNcbiAgICAgIHNlbGVjdGlvbi5jbGFzc2VkIGNsYXNzX25hbWUsIHRydWVcbiAgICBpZiBpZD8gdGhlbiBzZWxlY3Rpb24uIGF0dHIgJ2lkJywgaWRcbiAgICAjIyMgSSBhbSB1bnN1cmUgd2hlcmUgdGhpcyBzaG91bGQgYmUgcGxhY2VkICMjI1xuICAgIHNlbGVjdGlvbi5leGl0KCkucmVtb3ZlKClcblxuICAgIGlmIHNlbGVjdG9ycy5sZW5ndGggPiAxXG4gICAgICBzZWxlY3Rpb24uZm9yRWFjaCAoX2RhdGEpPT5cbiAgICAgICAgQF9pbnRvX3NlbGVjdGlvbiBkMy5zZWxlY3QoQCksIHNlbGVjdG9ycy5qb2luKCc+JyksIF9kYXRhLCBmaXJzdF9zZWxlY3Rpb25cblxuICAgIGZpcnN0X3NlbGVjdGlvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suVGVtcGxhdGVcbiIsIkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuZDMgPSByZXF1aXJlIFwiZDNcIlxuUHVibGlzaGVyID0gIHJlcXVpcmUgJy4vYm9vay9wdWJsaXNoZXInXG5Db250ZW50ID0gIHJlcXVpcmUgJy4vYm9vay9jb250ZW50J1xuQm9vayA9ICByZXF1aXJlICcuL2Jvb2svaW5kZXgnXG5cbiMjI1xuaW50ZXJhY3RpdmUgdGFidWxhciBkYXRhLCBvcHRpbWl6ZWQgZm9yIHRoZSBicm93c2VyXG5cbkBleGFtcGxlIENyZWF0ZSBzb21lIENvZmZlZVRhYmxlIGJvb2tzLlxuICAgICAgYm9va3MgPSBuZXcgQ29mZmVlVGFibGUgW1xuICAgICAgICBuYW1lOiAncmVjdGFuZ2xlJ1xuICAgICAgICBhcmdzOlxuICAgICAgICAgIGNvbHVtbnM6IFsneCcsICd5J11cbiAgICAgICAgICB2YWx1ZXM6IFtbMSwgMl0sWzMsIDhdXVxuICAgICAgICBdLCBbXG4gICAgICAgICAgbmFtZTogJ3RhYmxlJ1xuICAgICAgICAgIGFyZ3M6IGQzLnNlbGVjdCAnI3RhYmxlJ1xuICAgICAgICAsXG4gICAgICAgICAgbmFtZTogJ3RleHQnXG4gICAgICAgICAgYXJnczogZDMuc2VsZWN0ICcjdGV4dCdcbiAgICAgICAgXSwgW1xuICAgICAgICAgIG5hbWU6ICd0YWJsZSdcbiAgICAgICAgICBhcmdzOlxuICAgICAgICAgICAgY29sdW1uczogWyd0aXRsZScsJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICAgICAgICAgICAgdmFsdWVzOiBbWyd0YWJsZScsJ3JlY3RhbmdsZScsJ3RhYmxlJ10sWyd0ZXh0JywncmVjdGFuZ2xlJywndGV4dCddXVxuICAgICAgICBdXVxuICAgICAgY29uc29sZS5sb2cgYm9va3MuYm9va1sndGl0bGUnXVxuICAgICAgY29uc29sZS5sb2cgYm9va3MuYm9va1sndGFibGUnXVxuIyMjXG5jbGFzcyBDb2ZmZWVUYWJsZVxuICAjIENvbnN0cnVjdCBhIGNvbGxlY3Rpb24gb2YgQ29mZmVlVGFibGUgYm9va3MuXG4gICNcbiAgIyBAcGFyYW0gW09iamVjdF0gY29udGVudCBjb250YWlucyBtYW55IFRhYnVsYXIgZGF0YXNldHNcbiAgIyBAcGFyYW0gW09iamVjdF0gcHVibGlzaGVycyBjb250YWlucyBtYW55IERPTSBzZWxlY3Rpb25zXG4gICMgQHBhcmFtIFtPYmplY3RdIGJvb2tzIHVzZSBwdWJsaXNoZXJzIHRvIHByZXNlbnQgYW5kIHVwZGF0ZSBjb250ZWVudFxuICAjXG4gIGNvbnN0cnVjdG9yOiAoY29udGVudD17fSwgcHVibGlzaGVyPXt9LCBib29rPXt9KS0+XG4gICAgQGNvbnRlbnQgPSBuZXcgQ29udGVudCBjb250ZW50XG4gICAgQHB1Ymxpc2hlciA9IG5ldyBQdWJsaXNoZXIgcHVibGlzaGVyXG4gICAgQGJvb2sgPSBuZXcgQm9vayBib29rXG5cbiAgdmVyc2lvbjogJzAuMS4wJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb2ZmZWVUYWJsZVxuICBkM1xuICBCYW9iYWJcbn1cbiIsIkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vZGF0YSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZSBleHRlbmRzIERhdGFTb3VyY2VcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jZHMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1uX2RhdGFfc291cmNlJ1xuICAgIHN1cGVyKClcblxuICBsb2FkOiAoY29sdW1ucykgLT5cbiAgICBjb2x1bW5zID89IEBjb2x1bW5zKClcbiAgICAjIyMgSW5kZXggbW9ua2V5IGlzIGRlc3Ryb3llZCBvbiB0aGUgZmlyc3Qgb3BlcmF0aW9uICMjI1xuICAgIGNkcyA9IHt9XG4gICAgY29sdW1ucyA9IEFycmF5IGNvbHVtbnMuLi5cbiAgICBjb2x1bW5zLmZvckVhY2ggKGNvbHVtbixjb2x1bW5faW5kZXgpPT5cbiAgICAgICMjIyBDcmVhdGUgRHluYW1pYyBOb2RlcyBmb3IgRWFjaCBDb2x1bW4gRGF0YSBTb3VyY2UgIyMjXG4gICAgICBjZHMgPSBAX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXkgY29sdW1uLCBudWxsLCBjZHNcbiAgICBAc3RhZ2UgY2RzXG5cbiAgX2NvbHVtbl9uYW1lX2FycmF5OiAoY29sdW1ucyktPiBpZiBub3QgQXJyYXkuaXNBcnJheSBjb2x1bW5zIHRoZW4gW2NvbHVtbnNdIGVsc2UgY29sdW1uc1xuXG4gIF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5OiAoY29sdW1uLG1vbmtleSx0bXA9e30pLT5cbiAgICB0bXBbJ2NvbHVtbl9kYXRhX3NvdXJjZSddID89IHt9XG4gICAgbW9ua2V5ID89IEJhb2JhYi5tb25rZXkgWydjb2x1bW5zJ10sWyd2YWx1ZXMnXSxbJy4nLCduYW1lJ10sIChjb2x1bW5zLHZhbHVlcyxjb2x1bW5fbmFtZSktPlxuICAgICAgY29sdW1uX2luZGV4ID0gY29sdW1ucy5pbmRleE9mIGNvbHVtbl9uYW1lXG4gICAgICB2YWx1ZXMubWFwIChyb3dfdmFsdWVzKS0+IHJvd192YWx1ZXNbY29sdW1uX2luZGV4XVxuICAgIHRtcFsnY29sdW1uX2RhdGFfc291cmNlJ11bY29sdW1uXSA9XG4gICAgICAgIG5hbWU6IGNvbHVtblxuICAgICAgICB2YWx1ZXM6IG1vbmtleVxuICAgIHRtcFxuXG4gIGNvbHVtbl9kYXRhX3NvdXJjZTogKGNvbHVtbnMsZm9yY2VfYXJyYXk9ZmFsc2UpLT5cbiAgICBjb2x1bW5zID0gQF9jb2x1bW5fbmFtZV9hcnJheSBjb2x1bW5zXG4gICAgaWYgY29sdW1ucy5sZW5ndGggPiAxIG9yIGZvcmNlX2FycmF5XG4gICAgICBkMy56aXAgY29sdW1ucy5tYXAoIChjKSA9PiBAX2Nkcy5nZXQoYywndmFsdWVzJykgKS4uLlxuICAgIGVsc2VcbiAgICAgIEBfY2RzLmdldChjb2x1bW5zWzBdLCd2YWx1ZXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtbkRhdGFTb3VyY2VcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5cbiIsImQzID0gcmVxdWlyZSBcImQzXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29tcHV0ZVxuICBjb21wdXRlOiAoKS0+XG4gICAgIyMjIENvbXB1dGUgY2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhlIGRhdGEgdHJlZSAjIyNcbiAgICBjb25zb2xlLmxvZyAxLFxuICAgICAgdmFsdWVzOiBAdmFsdWVzKClcbiAgICAgIGluZGV4OiBAaW5kZXgoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBAY29sdW1ucygpXG4gICAgICByZWFkbWU6IEByZWFkbWUoKVxuXG4gICAgQF9jaGVja3BvaW50LmRlZXBNZXJnZVxuICAgICAgdmFsdWVzOiBAdmFsdWVzKClcbiAgICAgIGluZGV4OiBAaW5kZXgoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBAY29sdW1ucygpXG4gICAgICByZWFkbWU6IEByZWFkbWUoKVxuICAgIHRoaXNcblxuICBzdGFnZTogKG5ld19zdGF0ZSxleHByZXNzaW9uPW51bGwpLT5cbiAgICBbdXBkYXRlX3N0YXRlLCBtb25rZXlzXSA9IEBfc3BsaXRfdXBkYXRlX29iamVjdCBuZXdfc3RhdGVcbiAgICBAY3Vyc29yLmRlZXBNZXJnZSB1cGRhdGVfc3RhdGVcbiAgICBpZiBtb25rZXlzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtb25rZXkgaW4gbW9ua2V5c1xuICAgICAgICBAY3Vyc29yLnNldCBtb25rZXkucGF0aCwgbW9ua2V5LnZhbHVlXG4gICAgdGhpc1xuXG4gIF9zcGxpdF91cGRhdGVfb2JqZWN0OiAoIHVwZGF0ZWRfc3RhdGUsIHBhdGg9W10sIG1vbmtleXM9W10gKS0+XG4gICAgIyMjIFBydW5lIGFuZCBzZXQgdGhlIEJhb2JhYiBtb25rZXlzIGFuZCByZXR1cm4gb25seSB0aGUgdmFsdWVzIGNvbXBsaWFudCB3aXRoIGRlZXBNZXJnZSAjIyNcbiAgICBkMy5lbnRyaWVzIHVwZGF0ZWRfc3RhdGVcbiAgICAgICAgLmZvckVhY2ggKGVudHJ5KT0+XG4gICAgICAgICAgaWYgQXJyYXkuaXNBcnJheShlbnRyeS52YWx1ZSlcbiAgICAgICAgICAgICMjIyBkbyBub3RoaW5nICMjI1xuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mKGVudHJ5LnZhbHVlKSBpbiBbJ29iamVjdCddXG4gICAgICAgICAgICBpZiB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV1bJ2hhc0R5bmFtaWNQYXRocyddP1xuICAgICAgICAgICAgICBtb25rZXlzLnB1c2hcbiAgICAgICAgICAgICAgICBwYXRoOiBbcGF0aC4uLixlbnRyeS5rZXldXG4gICAgICAgICAgICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlXG4gICAgICAgICAgICAgIGRlbGV0ZSB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQF9zcGxpdF91cGRhdGVfb2JqZWN0IHVwZGF0ZWRfc3RhdGVbZW50cnkua2V5XSwgW3BhdGguLi4sZW50cnkua2V5XSwgbW9ua2V5c1xuICAgIFt1cGRhdGVkX3N0YXRlLG1vbmtleXNdXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29tcHV0ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuUm93ID0gcmVxdWlyZSAnLi9yb3dzJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5EYXRhU291cmNlIGV4dGVuZHMgUm93XG4gIHZhbHVlczogKGFyZ3MpLT4gQF92YWx1ZXMuZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF92YWx1ZXMgPSBAY3Vyc29yLnNlbGVjdCAndmFsdWVzJ1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5EYXRhU291cmNlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoYXJncyktPiBAX2V4cHJlc3Npb24uZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zLi4uKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCktPlxuICAgICAgaWYgZXhwcmVzc2lvbi5tZXRob2QgaW4gZDMua2V5cyBARXhwcmVzc2lvbi5wcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzLkV4cHJlc3Npb25bZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZSBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBwcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzW2V4cHJlc3Npb24ubWV0aG9kXSBleHByZXNzaW9uLmFyZ3MuLi5cbiAgICAgIGVsc2VcbiAgICAgICAgYXNzZXJ0IFwiI3tKU09OLnN0cmluZ2lmeSBleHByZXNzaW9uc30gaXMgbm90IHVuZGVyc3Rvb2QuXCJcbiAgICAgIEBzdGFnZSBjb21wdXRlZF9zdGF0ZVxuICAgICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MpLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2NoZWNrcG9pbnQuc2V0IHt9XG4gICAgQF9leHByZXNzaW9uLnN0YXJ0UmVjb3JkaW5nIDIwXG4gICAgc3VwZXIoKVxuICBoaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uZ2V0SGlzdG9yeSgpXG4gIGNsZWFyX2hpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5jbGVhckhpc3RvcnkoKVxuICByZWNvcmQ6IChleHByZXNzaW9uKS0+XG4gICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkhpc3RvcnlcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcblRhYmxlID0gcmVxdWlyZSAnLi90YWJsZSdcblxuIyBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZXMgbWFuaXB1bGF0ZSB0YWJsZSBlZy4gYGBzb3J0YGAsYGB1bmlxdWVgYCxgYGZpbHRlcmBgLGBgbWFwYGAsIGBgZ3JvdXBieWBgLCBgYGpvaW5gYCAuXG4jIGBgQmFvYmFiYGAgdHJlZXMgYXJlIGludGVyYWN0aXZlIGFuZCBpbW11dGFibGUuICBUaGV5IG1hbmFnZSB0aGUgc3RhdGUgb2YgdGhlXG4jIHRhYnVsYXIgZGF0YS5cbiMgSW50ZXJhY3RpdmUgbWFpbnRhaW5zOlxuIyAqIFRhYmxlIG1ldGFkYXRhXG4jICogQ29sdW1uRGF0YVNvdXJjZXMgYGBjb2x1bW5fZGF0YV9zb3VyY2VgYCBhbmQgUm93IERhdGFTb3VyY2UgYGB2YWx1ZXNgYFxuIyAqIGBgSGlzdG9yeWBgIG9mIHRoZSBjb21wdXRlIGFwcGxpZWQgdG8gdGhlIHRhYmxlLlxuIyBAZXhhbXBsZSBjcmVhdGUgYSBuZXcgSW50ZXJhY3RpdmUgRGF0YSBTb3VyY2VcbiMgICB0YWJsZSA9IG5ldyBJbnRlcmFjdGl2ZVxuIyAgICAgY29sdW1uczogW1xuIyAgICAgICAneCdcbiMgICAgICAgJ3knXG4jICAgICBdXG4jICAgICB2YWx1ZXM6IFtcbiMgICAgICAgWzEsIDJdXG4jICAgICAgIFszLCA4XVxuIyAgICAgXVxuIyAgICAgbWV0YWRhdGE6XG4jICAgICAgIHg6IHt1bml0czonaW5jaCcsYWxpYXM6J2xlbmd0aCBvZiByZWN0YW5nbGUnfVxuIyAgICAgICB5OiB7dW5pdHM6J2luY2gnLGFsaWFzOid3aWR0aCBvZiByZWN0YW5nbGUnfVxuY2xhc3MgSW50ZXJhY3RpdmUgZXh0ZW5kcyBUYWJsZVxuICByZWFkbWU6IC0+IEBfcmVhZG1lLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIHRhYmxlX25hbWUpLT5cbiAgICBAdHJlZSA9IG5ldyBCYW9iYWIge31cbiAgICBAY3Vyc29yID0gQHRyZWUuc2VsZWN0IDBcbiAgICBAX3JlYWRtZSA9IEBjdXJzb3Iuc2VsZWN0ICdyZWFkbWUnXG4gICAgc3VwZXIgZGF0YV9vcl91cmwsIHRhYmxlX25hbWVcbiAgICBAY29tcHV0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbHVtbiA9IHJlcXVpcmUgJy4vY29sdW1ucydcblxuY2xhc3MgSW50ZXJhY3RpdmUuUm93IGV4dGVuZHMgQ29sdW1uXG4gIGluZGV4OiAoYXJncyktPiBAX2luZGV4LmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfaW5kZXggPSBAY3Vyc29yLnNlbGVjdCAnaW5kZXgnXG4gICAgQHN0YWdlIEBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleSAnaW5kZXgnLCBbWydpbmRleCddLCAoaW5kZXgpLT4gaW5kZXhdXG4gICAgc3VwZXIoKVxuICBpbG9jOiAgLT5cbiAgbG9jOiAtPlxuICB1cGRhdGU6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuUm93XG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuQ29sdW1uRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vY29sdW1uX2RhdGFfc291cmNlJ1xuXG4jIFRhYmxlIGFzc2lnbnMgbWV0YWRhdGEgdG8gdGhlIEludGVyYWN0aXZlIGRhdGEgc291cmNlXG4jIEEgdGFibGUgaXMgZGVzY3JpYmUgYnk6XG4jICogX3ZhbHVlc18gLSBBIGxpc3Qgb2YgbGlzdHMgY29udGFpbmluZyB0aGUgcm93IGVudHJpZXMgaW4gdGhlIHRhYmxlLlxuIyAqIF9jb2x1bW5zXyAtIFRoZSBjb2x1bW4gbmFtZXMgaW4gdGhlIHRhYmxlLCB0aGUgY29sdW1uIG5hbWVzIG1hcCB0aGUgZW50cmllcyBpbiBlYWNoIHJvd1xuIyAqIF9tZXRhZGF0YV8gLVxuIyBUaGUgdGFibGUga2V5cyAgbmFtaW5nIGlzIGluc3BpcmVkIGJ5IGBgcGFuZGFzLkRhdGFGcmFtZS50b19kaWN0KG9yaWVudD0ncmVjb3JkcycpLlxuXG5jbGFzcyBJbnRlcmFjdGl2ZS5UYWJsZSBleHRlbmRzIENvbHVtbkRhdGFTb3VyY2VcbiAgbWV0YWRhdGE6IChhcmdzKS0+IEBfbWV0YWRhdGEuZ2V0IGFyZ3MuLi5cblxuICAjIEBwYXJhbSBbU3RyaW5nXSBkYXRhX29yX3VybCB1cmwgdG8gYSBqc29uIGVuZHBvaW50IGNvbnRhaW5pbmcgdGhlIGtleXMgYGB2YWx1ZXNgYCwgYGBcbiAgIyBAcGFyYW0gW09iamVjdF0gZGF0YV9vcl91cmxcbiAgY29uc3RydWN0b3I6IChkYXRhX29yX3VybCwgQG5hbWU9bnVsbCktPlxuICAgICMjIFRoZSB0YWJsZSBjYW4gYmUgcmVuYW1lZCAjIyNcbiAgICBAX25hbWUgPSBAY3Vyc29yLnNlbGVjdCAnbmFtZSdcbiAgICBAX25hbWUuc2V0IEBuYW1lXG4gICAgQF9tZXRhZGF0YSA9IEBjdXJzb3Iuc2VsZWN0ICdtZXRhZGF0YSdcbiAgICBzdXBlcigpXG4gICAgQGxvYWQgZGF0YV9vcl91cmxcblxuICBsb2FkOiAoZGF0YV9vcl91cmwpLT5cbiAgICBpZiAnc3RyaW5nJyBpbiBbdHlwZW9mIGRhdGFfb3JfdXJsXVxuICAgICAgZDMuanNvbiBkYXRhLCAodGFibGVfZGF0YSk9PlxuICAgICAgICB0YWJsZV9kYXRhWyd1cmwnXSA9IEBfcmF3XG4gICAgICAgIEBzdGFnZVxuICAgICAgICAgIHJhdzogdGFibGVfZGF0YVxuICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSB0YWJsZV9kYXRhLmxlbmd0aFxuICAgICAgICAsXG4gICAgICAgICAgbWV0aG9kOiAnbG9hZCdcbiAgICAgICAgICBhcmdzOiBbZGF0YV9vcl91cmxdXG4gICAgICAgIHN1cGVyKClcbiAgICBlbHNlXG4gICAgICBkYXRhID0gZGF0YV9vcl91cmxcbiAgICAgIEBzdGFnZVxuICAgICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbXVxuICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IHt9XG4gICAgICAgIHJlYWRtZTogZGF0YS5yZWFkbWUgPyBudWxsXG4gICAgICAgIGluZGV4OiBkMy5yYW5nZSBkYXRhLnZhbHVlcz8ubGVuZ3RoID8gMFxuICAgICAgLFxuICAgICAgICBtZXRob2Q6ICdsb2FkJ1xuICAgICAgICBhcmdzOiBbZGF0YV1cbiAgICAgIHN1cGVyKClcblxuSW50ZXJhY3RpdmUuVGFibGU6OmV4cHIgPVxuICBjb25jYXQ6IC0+XG4gIGhlYWQ6IC0+XG4gIHRhaWw6IC0+XG4gIHNvcnQ6IC0+XG4gIGZpbHRlcjogLT5cbiAgbWFwOiAtPlxuXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fc3RyaW5nID0gLT5cbkludGVyYWN0aXZlLlRhYmxlOjp0b19qc29uID0gIC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuVGFibGVcbiJdfQ==
