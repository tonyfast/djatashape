(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Book, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./book/manager');


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

  Book.prototype._base_class = require('./interactive');

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

})(Manager);

module.exports = Book;


},{"./book/manager":3,"./interactive":7}],2:[function(require,module,exports){
var Book, Interactive, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('../book');

Manager = require('./manager');

Interactive = require('../interactive');


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

})(Manager);

module.exports = Book.Content;


},{"../book":1,"../interactive":7,"./manager":3}],3:[function(require,module,exports){
var Book, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('../book');

Interactive = require('../interactive');


/*
Manager attaches keyed tables and selections to the Publisher, Content, and Book
 */

Book.Manager = (function(superClass) {
  extend(Manager, superClass);

  function Manager() {
    return Manager.__super__.constructor.apply(this, arguments);
  }

  Manager.prototype.dir = function() {
    return this.column_data_source(this.index_column);
  };

  Manager.prototype.register = function(name, data_or_url) {
    if (data_or_url == null) {
      data_or_url = null;
    }
    this[name] = new this._base_class(data_or_url);
    return this[name];
  };

  Manager.prototype.unregister = function(name) {};

  Manager.prototype.commit = function() {};

  return Manager;

})(Interactive);

module.exports = Book.Manager;


},{"../book":1,"../interactive":7}],4:[function(require,module,exports){
var Book, Manager, Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('../book');

Manager = require('./manager');

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

})(Manager);

module.exports = Book.Publisher;


},{"../book":1,"./manager":3,"./template":5}],5:[function(require,module,exports){
var Book, d3,
  slice = [].slice;

d3 = require('d3');

Book = require('../book');


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


},{"../book":1,"d3":"d3"}],6:[function(require,module,exports){
var Baobab, Book, CoffeeTable, Content, Publisher, d3;

Baobab = require("baobab");

d3 = require("d3");

Publisher = require('./book/publisher');

Content = require('./book/content');

Book = require('./book');


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


},{"./book":1,"./book/content":2,"./book/publisher":4,"baobab":"baobab","d3":"d3"}],7:[function(require,module,exports){
var Baobab, Interactive, Table,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Baobab = require('baobab');

Table = require('./interactive/table');

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


},{"./interactive/table":15,"baobab":"baobab"}],8:[function(require,module,exports){
var Baobab, DataSource, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Baobab = require("baobab");

Interactive = require('../interactive');

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
        return values.map((function(_this) {
          return function(row_values) {
            return row_values[column_index];
          };
        })(this));
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


},{"../interactive":7,"./data":11,"baobab":"baobab"}],9:[function(require,module,exports){
var Expression, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('../interactive');

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


},{"../interactive":7,"./expression":12}],10:[function(require,module,exports){
var Interactive, d3,
  slice = [].slice;

d3 = require("d3");

Interactive = require('../interactive');

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


},{"../interactive":7,"d3":"d3"}],11:[function(require,module,exports){
var Interactive, Row,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('../interactive');

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


},{"../interactive":7,"./rows":14}],12:[function(require,module,exports){
var History, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Interactive = require('../interactive');

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


},{"../interactive":7,"./history":13}],13:[function(require,module,exports){
var Compute, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('../interactive');

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


},{"../interactive":7,"./compute":10}],14:[function(require,module,exports){
var Column, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('../interactive');

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


},{"../interactive":7,"./columns":9}],15:[function(require,module,exports){
var ColumnDataSource, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Interactive = require('../interactive');

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


},{"../interactive":7,"./column_data_source":8,"d3":"d3"}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9vay5jb2ZmZWUiLCJzcmMvYm9vay9jb250ZW50LmNvZmZlZSIsInNyYy9ib29rL21hbmFnZXIuY29mZmVlIiwic3JjL2Jvb2svcHVibGlzaGVyLmNvZmZlZSIsInNyYy9ib29rL3RlbXBsYXRlLmNvZmZlZSIsInNyYy9jb2ZmZWV0YWJsZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvcm93cy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvdGFibGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVI7OztBQUVWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CTTs7O2lCQUNKLFdBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDQSxjQUFDLElBQUQsRUFBTSxXQUFOO0FBQ1gsUUFBQTs7TUFEaUIsY0FBWTs7O01BQzdCLE9BQVE7O0lBQ1Isc0NBQ0U7TUFBQSxNQUFBLHNDQUFzQixDQUFDLEVBQUQsQ0FBdEI7TUFDQSxPQUFBLHlDQUF3QixDQUFDLFNBQUQsRUFBVyxXQUFYLENBRHhCO01BRUEsUUFBQSwwQ0FBMEI7UUFBQSxFQUFBLEVBQ3hCO1VBQUEsV0FBQSxFQUFhLDJDQUFiO1NBRHdCO09BRjFCO01BSUEs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QSx5Q0FBd0IsRUFEeEI7UUFFQSxRQUFBLDBDQUEwQixFQUYxQjtRQUdBLE1BQUEsd0NBQXNCLElBSHRCO1FBSUEsS0FBQSxFQUFPLEVBQUUsQ0FBQyxLQUFILCtFQUErQixDQUEvQixDQUpQO09BREosRUFPSTtRQUFBLE1BQUEsRUFBUSxNQUFSO1FBQ0EsSUFBQSxFQUFNLENBQUMsSUFBRCxDQUROO09BUEo7YUFTQSw4QkFBQSxFQXJCRjs7RUFESTs7OztHQWJ3Qjs7QUFxQ2hDLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLElBQW5CLEdBQ0U7RUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBLENBQVI7RUFDQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBRE47RUFFQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBRk47RUFHQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBSE47RUFJQSxNQUFBLEVBQVEsU0FBQSxHQUFBLENBSlI7RUFLQSxHQUFBLEVBQUssU0FBQSxHQUFBLENBTEw7OztBQU9GLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLFNBQW5CLEdBQStCLFNBQUEsR0FBQTs7QUFDL0IsV0FBVyxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsT0FBbkIsR0FBOEIsU0FBQSxHQUFBOztBQUU5QixNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTWFuYWdlciA9IHJlcXVpcmUgJy4vYm9vay9tYW5hZ2VyJ1xuXG4jIyNcbkEgQm9vayB1c2VzIFB1Ymxpc2hlcnMgdG8gY3JlYXRlIFRlbXBsYXRlcyB0aGF0IGpvaW4gdG8gc3Vic2V0cyBvZiBDb250ZW50LiAgVGhlXG5Cb29rIG1hbmFnZXIgaXMgcmVzcG9uc2libGUgZm9yIG5lYXJseSBhbGwgb2YgdGhlIGNvbnRlbnQuXG5cbmBgYFxudGFibGUgPSBuZXcgQ29mZmVlVGFibGUge31cbnRhYmxlLmJvb2tzLnJlZ2lzdGVyICcjdGFibGUnLFxuICBjb2x1bW5zOiBbXG4gICAgWydjb250ZW50JywncHVibGlzaGVyJ11cbiAgXVxuICB2YWx1ZXM6IFtcbiAgICBbJyN0YWJsZScsJyN0YWJsZSddXG4gIF1cbnRhYmxlLmJvb2tbJyN0YWJsZSddLnRyZWVcbnRhYmxlLmJvb2tbJyN0YWJsZSddLmN1cnNvclxudGFibGUuYm9va1snI3RhYmxlJ10uY29sdW1uX2RhdGFfc291cmNlXG50YWJsZS5ib29rWycjdGFibGUnXS5zZWxlY3Rpb24uX19kYXRhX18gIyBpcyBzb21lIGRhdGEgYXBwZW5kZWQgdG8gdGhlIHNlbGVjdGlvbiBmcm9tIHRoZSB0cmVlXG5gYGBcbiMjI1xuY2xhc3MgQm9vayBleHRlbmRzIE1hbmFnZXJcbiAgX2Jhc2VfY2xhc3M6IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSx0b19yZWdpc3Rlcj1bXSktPlxuICAgIGRhdGEgPz0ge31cbiAgICBzdXBlclxuICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyA/IFsnY29udGVudCcsJ3B1Ymxpc2hlciddXG4gICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IGlkOlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgbmFtZSBvZiBhIHRlbXBsYXRlIGluIGFuIGVudmlyb25tZW50LlwiXG4gICAgICByZWFkbWU6IFwiSG93IGNhbiBJIGltcG9ydCBhIHJlYWRtZSBmaWxlXCJcbiAgICB0b19yZWdpc3Rlci5mb3JFYWNoICh2YWx1ZSk9PlxuICAgICAgQHJlZ2lzdGVyIHZhbHVlLm5hbWUsIHZhbHVlLmFyZ3NcblxubW9kdWxlLmV4cG9ydHMgPSBCb29rXG4iLCJCb29rID0gcmVxdWlyZSAnLi4vYm9vaydcbk1hbmFnZXIgPSByZXF1aXJlICcuL21hbmFnZXInXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuXG4jIENvbnRlbnQgaXMgYSBjb2xsZWN0aW9uIG9mIEludGVyYWN0aXZlIFRhYnVsYXIgZGF0YSBzb3VyY2VzLiAgQ29udGVudFxuIyBjYW4gYmUgY29uc3VtZWQgYnkgYSBwdWJsaXNoZXIuICBCb3RoIGRhdGEgYW5kIG1ldGFkYXRhIG9mIHRoZSB0YWJsZSBjYW5cbiMgYmUgaW5qZWN0ZWQgaW50byB0aGUgZG9tXG4jIyNcbmBgYFxudGFibGUgPSBuZXcgQ29mZmVlVGFibGUge31cbnRhYmxlLmNvbnRlbnQucmVnaXN0ZXIgJyN0YWJsZScsXG4gIGNvbHVtbnM6IFtcbiAgICBbJ3gnLCd5J11cbiAgXVxuICB2YWx1ZXM6IFtcbiAgICBbMSwyXVxuICAgIFs4LDldXG4gIF1cbiAgbWV0YWRhdGE6XG4gICAgeDpcbiAgICAgIHVuaXRzOiAnaW5jaCdcbiAgICAgIGFsdDogJ3dpZHRoJ1xuICAgIHk6XG4gICAgICB1bml0czogJ2luY2gnXG4gICAgICBhbHQ6ICdoZWlnaHQnXG5cbnRhYmxlLmNvbnRlbnRbJyN0YWJsZSddLnRyZWVcbnRhYmxlLmNvbnRlbnRbJyN0YWJsZSddLmN1cnNvclxudGFibGUuY29udGVudFsnI3RhYmxlJ10uY29sdW1uX2RhdGFfc291cmNlXG50YWJsZS5jb250ZW50WycjdGFibGUnXS5zb3J0KCkudW5pcXVlKCkuZmlsdGVyKCkubWFwKClcbmBgYFxuIyMjXG5jbGFzcyBCb29rLkNvbnRlbnQgZXh0ZW5kcyBNYW5hZ2VyXG4gIF9iYXNlX2NsYXNzOiBJbnRlcmFjdGl2ZVxuICBjb25zdHJ1Y3RvcjogKGRhdGEsdG9fcmVnaXN0ZXI9W10pLT5cbiAgICBzdXBlclxuICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyA/IFsnc2VsZWN0b3InXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suQ29udGVudFxuIiwiQm9vayA9IHJlcXVpcmUgJy4uL2Jvb2snXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuXG4jIyNcbk1hbmFnZXIgYXR0YWNoZXMga2V5ZWQgdGFibGVzIGFuZCBzZWxlY3Rpb25zIHRvIHRoZSBQdWJsaXNoZXIsIENvbnRlbnQsIGFuZCBCb29rXG4jIyNcbmNsYXNzIEJvb2suTWFuYWdlciBleHRlbmRzIEludGVyYWN0aXZlXG4gIGRpcjogKCktPiBAY29sdW1uX2RhdGFfc291cmNlIEBpbmRleF9jb2x1bW5cbiAgcmVnaXN0ZXI6ICggbmFtZSwgZGF0YV9vcl91cmw9bnVsbCApLT5cbiAgICBAW25hbWVdID0gbmV3IEBfYmFzZV9jbGFzcyBkYXRhX29yX3VybFxuICAgIEBbbmFtZV1cbiAgdW5yZWdpc3RlcjogKCBuYW1lICktPlxuICBjb21taXQ6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5NYW5hZ2VyXG4iLCJCb29rID0gcmVxdWlyZSAnLi4vYm9vaydcbk1hbmFnZXIgPSByZXF1aXJlICcuL21hbmFnZXInXG5UZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGUnXG5cbiMjI1xuUHVibGlzaGVyIGlzIGEgc3VwZXJjaGFyZ2VkIGQzIHNlbGVjdGlvbi4gIEl0IGFkZHMgc29tZSBjb252aWVuY2UgZnVuY3Rpb25zIHRvXG5lbnRlciwgZXhpdCwgYW5kIHVwZGF0ZSBkYXRhLiAgQWxsIG9mIGQzIHRoZSBzZWxlY3Rpb24gbWV0aG9kcyBhcmUgZXhwb3NlZFxudG8gdGhlIHB1Ymxpc2hlclxuXG5gYGBcbnRhYmxlID0gbmV3IENvZmZlZVRhYmxlIHt9XG50ZW1wbGF0ZSA9IHRhYmxlLnB1Ymxpc2hlci5yZWdpc3RlciAnLmZvbyN0YWJsZSdcbnRlbXBsYXRlLnNlbGVjdGlvbi5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG50ZW1wbGF0ZS5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG5cbnRlbXBsYXRlLnJlbmRlciAndGFibGUnLCBbMV1cbnRlbXBsYXRlLnJlbmRlciAnZGl2LnRyLnZhbHVlcyA+IHRkJywgW1xuICBbMSwyXVxuICBbOCw3XVxuXVxuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLnZhbHVlcyA+IHRkJywgdGFibGUuY29udGVudFsnI3RhYmxlJ10udmFsdWVzKClcblxudGVtcGxhdGUucmVuZGVyICd0ci5jb2x1bW5zID4gdGgnLCBbXG4gIFswXVxuXSwgJ3VwJ1xuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmluZGV4ID4gdGgnLCBbXG4gIFtudWxsXVxuICBbMF1cbl0sICdsZWZ0J1xuYGBgXG4jIyNcblxuY2xhc3MgQm9vay5QdWJsaXNoZXIgZXh0ZW5kcyBNYW5hZ2VyXG4gIF9iYXNlX2NsYXNzOiBUZW1wbGF0ZVxuXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSx0b19yZWdpc3Rlcj1bXSktPlxuICAgIGRhdGEgPz0ge31cbiAgICBAXG4gICAgc3VwZXJcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBuYW1lIG9mIGEgdGVtcGxhdGUgaW4gYW4gZW52aXJvbm1lbnQuXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suUHVibGlzaGVyXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuQm9vayA9IHJlcXVpcmUgJy4uL2Jvb2snXG5cbiMjI1xuYGBgXG50ZW1wbGF0ZS5zZWxlY3Rpb24uaHRtbCgpID09IFwiXCI8ZGl2IGNsYXNzPVwiZm9vXCIgaWQ9XCJ0YWJsZVwiPjwvZGl2PlwiXCJcIlxudGVtcGxhdGUuaHRtbCgpID09IFwiXCI8ZGl2IGNsYXNzPVwiZm9vXCIgaWQ9XCJ0YWJsZVwiPjwvZGl2PlwiXCJcIlxuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RhYmxlJywgWzFdXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLnZhbHVlcyA+IHRkJywgW1sxLDJdLFs4LDddXVxudGVtcGxhdGUucmVuZGVyICd0ci52YWx1ZXMgPiB0ZCcsIHRhYmxlLmNvbnRlbnRbJyN0YWJsZSddLnZhbHVlcygpXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmNvbHVtbnMgPiB0aCcsIFtbMF1dLCAndXAnXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmluZGV4ID4gdGgnLCBbW251bGxdLFswXV0sICdsZWZ0J1xuYGBgXG4jIyNcblxuY2xhc3MgQm9vay5UZW1wbGF0ZVxuICAjIyNcbiAgQHBhcmFtIFtzdHJpbmddIHNlbGVjdG9yIGNzcyBzZWxlY3RvciBhIERPTSBub2RlXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKEBzZWxlY3RvciwgZGF0YT1bW11dKS0+XG4gICAgQHNlbGVjdGlvbiA9IGQzLnNlbGVjdEFsbCBAc2VsZWN0b3JcbiAgICBAX2ludG9fc2VsZWN0aW9uIEBzZWxlY3Rpb24sIEBzZWxlY3RvciwgZGF0YVxuXG4gICMjI1xuICBAcGFyYW0gW3N0cmluZ10gc2VsZWN0b3JzIHRhZ05hbWUuY2xhc3NOYW1lMS5jbGFzc05hbWUyI2lkXG4gIEBwYXJhbSBbb2JqZWN0XSBkYXRhIG5lc3RlZCBhcnJheXNcbiAgQHBhcmFtIFtzdHJpbmddIGRpcmVjdGlvbiBhcHBlbmQgYWZ0ZXIgdGhlIGxhc3QgY2hpbGRcbiAgIyMjXG4gIHJlbmRlcjogKHNlbGVjdG9ycywgZGF0YSwgZGlyZWN0aW9uKS0+XG4gICAgZmlyc3Rfc2VsZWN0aW9uID0gQF9pbnRvX3NlbGVjdGlvbiBAc2VsZWN0aW9uLCBzZWxlY3RvcnMsIGRhdGEsIGRpcmVjdGlvblxuICAgIG5ldyBmaXJzdF9zZWxlY3Rpb25cblxuICBfaW50b19zZWxlY3Rpb246IChzZWxlY3Rpb24sIHNlbGVjdG9ycywgZGF0YSwgZGlyZWN0aW9uPSdkb3duJywgZmlyc3Rfc2VsZWN0aW9uPW51bGwpLT5cbiAgICBbc2VsZWN0b3IsIHNlbGVjdG9ycy4uLl0gPSBzZWxlY3RvcnMuc3BsaXQgJz4nXG4gICAgW3RhZyxjbGFzc2VzLi4uXSA9IHNlbGVjdG9yLnNwbGl0KCcuJylcbiAgICBbbGFzdF9jbGFzcyxpZF0gPSBsYXN0X2NsYXNzLnNwbGl0ICcjJ1xuICAgIHNlbGVjdG9yID89ICdkaXYnXG4gICAgY2xhc3NlcyA/PSBbXVxuICAgIGlkID89IG51bGxcbiAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24uc2VsZWN0QWxsIHNlbGVjdG9yXG4gICAgICAuZGF0YSBkYXRhXG4gICAgZmlyc3Rfc2VsZWN0aW9uID89IHNlbGVjdGlvblxuICAgIGlmIGRpcmVjdGlvbiBpbiBbJ2Rvd24nLCdyaWdodCddXG4gICAgICBzZWxlY3Rlci5lbnRlcigpLmFwcGVuZCB0YWdcbiAgICBlbHNlIGlmIGRpcmVjdGlvbiBpbiBbJ3VwJywnbGVmdCddXG4gICAgICBzZWxlY3Rlci5lbnRlcigpLmluc2VydCB0YWcsICc6Zmlyc3QtY2hpbGQnXG4gICAgZm9yIGNsYXNzX25hbWUgaW4gY2xhc3Nlc1xuICAgICAgc2VsZWN0aW9uLmNsYXNzZWQgY2xhc3NfbmFtZSwgdHJ1ZVxuICAgIGlmIGlkPyB0aGVuIHNlbGVjdGlvbi4gYXR0ciAnaWQnLCBpZFxuICAgICMjIyBJIGFtIHVuc3VyZSB3aGVyZSB0aGlzIHNob3VsZCBiZSBwbGFjZWQgIyMjXG4gICAgc2VsZWN0aW9uLmV4aXQoKS5yZW1vdmUoKVxuXG4gICAgaWYgc2VsZWN0b3JzLmxlbmd0aCA+IDFcbiAgICAgIHNlbGVjdGlvbi5mb3JFYWNoIChfZGF0YSk9PlxuICAgICAgICBAX2ludG9fc2VsZWN0aW9uIGQzLnNlbGVjdChAKSwgc2VsZWN0b3JzLmpvaW4oJz4nKSwgX2RhdGEsIGZpcnN0X3NlbGVjdGlvblxuXG4gICAgZmlyc3Rfc2VsZWN0aW9uXG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5UZW1wbGF0ZVxuIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5kMyA9IHJlcXVpcmUgXCJkM1wiXG5QdWJsaXNoZXIgPSAgcmVxdWlyZSAnLi9ib29rL3B1Ymxpc2hlcidcbkNvbnRlbnQgPSAgcmVxdWlyZSAnLi9ib29rL2NvbnRlbnQnXG5Cb29rID0gIHJlcXVpcmUgJy4vYm9vaydcblxuIyMjXG5pbnRlcmFjdGl2ZSB0YWJ1bGFyIGRhdGEsIG9wdGltaXplZCBmb3IgdGhlIGJyb3dzZXJcblxuQGV4YW1wbGUgQ3JlYXRlIHNvbWUgQ29mZmVlVGFibGUgYm9va3MuXG4gICAgICBib29rcyA9IG5ldyBDb2ZmZWVUYWJsZSBbXG4gICAgICAgIG5hbWU6ICdyZWN0YW5nbGUnXG4gICAgICAgIGFyZ3M6XG4gICAgICAgICAgY29sdW1uczogWyd4JywgJ3knXVxuICAgICAgICAgIHZhbHVlczogW1sxLCAyXSxbMywgOF1dXG4gICAgICAgIF0sIFtcbiAgICAgICAgICBuYW1lOiAndGFibGUnXG4gICAgICAgICAgYXJnczogZDMuc2VsZWN0ICcjdGFibGUnXG4gICAgICAgICxcbiAgICAgICAgICBuYW1lOiAndGV4dCdcbiAgICAgICAgICBhcmdzOiBkMy5zZWxlY3QgJyN0ZXh0J1xuICAgICAgICBdLCBbXG4gICAgICAgICAgbmFtZTogJ3RhYmxlJ1xuICAgICAgICAgIGFyZ3M6XG4gICAgICAgICAgICBjb2x1bW5zOiBbJ3RpdGxlJywnY29udGVudCcsJ3B1Ymxpc2hlciddXG4gICAgICAgICAgICB2YWx1ZXM6IFtbJ3RhYmxlJywncmVjdGFuZ2xlJywndGFibGUnXSxbJ3RleHQnLCdyZWN0YW5nbGUnLCd0ZXh0J11dXG4gICAgICAgIF1dXG4gICAgICBjb25zb2xlLmxvZyBib29rcy5ib29rWyd0aXRsZSddXG4gICAgICBjb25zb2xlLmxvZyBib29rcy5ib29rWyd0YWJsZSddXG4jIyNcbmNsYXNzIENvZmZlZVRhYmxlXG4gICMgQ29uc3RydWN0IGEgY29sbGVjdGlvbiBvZiBDb2ZmZWVUYWJsZSBib29rcy5cbiAgI1xuICAjIEBwYXJhbSBbT2JqZWN0XSBjb250ZW50IGNvbnRhaW5zIG1hbnkgVGFidWxhciBkYXRhc2V0c1xuICAjIEBwYXJhbSBbT2JqZWN0XSBwdWJsaXNoZXJzIGNvbnRhaW5zIG1hbnkgRE9NIHNlbGVjdGlvbnNcbiAgIyBAcGFyYW0gW09iamVjdF0gYm9va3MgdXNlIHB1Ymxpc2hlcnMgdG8gcHJlc2VudCBhbmQgdXBkYXRlIGNvbnRlZW50XG4gICNcbiAgY29uc3RydWN0b3I6IChjb250ZW50PXt9LCBwdWJsaXNoZXI9e30sIGJvb2s9e30pLT5cbiAgICBAY29udGVudCA9IG5ldyBDb250ZW50IGNvbnRlbnRcbiAgICBAcHVibGlzaGVyID0gbmV3IFB1Ymxpc2hlciBwdWJsaXNoZXJcbiAgICBAYm9vayA9IG5ldyBCb29rIGJvb2tcblxuICB2ZXJzaW9uOiAnMC4xLjAnXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvZmZlZVRhYmxlXG4gIGQzXG4gIEJhb2JhYlxufVxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuVGFibGUgPSByZXF1aXJlICcuL2ludGVyYWN0aXZlL3RhYmxlJ1xuXG4jIEludGVyYWN0aXZlIGRhdGEgc291cmNlcyBtYW5pcHVsYXRlIHRhYmxlIGVnLiBgYHNvcnRgYCxgYHVuaXF1ZWBgLGBgZmlsdGVyYGAsYGBtYXBgYCwgYGBncm91cGJ5YGAsIGBgam9pbmBgIC5cbiMgYGBCYW9iYWJgYCB0cmVlcyBhcmUgaW50ZXJhY3RpdmUgYW5kIGltbXV0YWJsZS4gIFRoZXkgbWFuYWdlIHRoZSBzdGF0ZSBvZiB0aGVcbiMgdGFidWxhciBkYXRhLlxuIyBJbnRlcmFjdGl2ZSBtYWludGFpbnM6XG4jICogVGFibGUgbWV0YWRhdGFcbiMgKiBDb2x1bW5EYXRhU291cmNlcyBgYGNvbHVtbl9kYXRhX3NvdXJjZWBgIGFuZCBSb3cgRGF0YVNvdXJjZSBgYHZhbHVlc2BgXG4jICogYGBIaXN0b3J5YGAgb2YgdGhlIGNvbXB1dGUgYXBwbGllZCB0byB0aGUgdGFibGUuXG4jIEBleGFtcGxlIGNyZWF0ZSBhIG5ldyBJbnRlcmFjdGl2ZSBEYXRhIFNvdXJjZVxuIyAgIHRhYmxlID0gbmV3IEludGVyYWN0aXZlXG4jICAgICBjb2x1bW5zOiBbXG4jICAgICAgICd4J1xuIyAgICAgICAneSdcbiMgICAgIF1cbiMgICAgIHZhbHVlczogW1xuIyAgICAgICBbMSwgMl1cbiMgICAgICAgWzMsIDhdXG4jICAgICBdXG4jICAgICBtZXRhZGF0YTpcbiMgICAgICAgeDoge3VuaXRzOidpbmNoJyxhbGlhczonbGVuZ3RoIG9mIHJlY3RhbmdsZSd9XG4jICAgICAgIHk6IHt1bml0czonaW5jaCcsYWxpYXM6J3dpZHRoIG9mIHJlY3RhbmdsZSd9XG5jbGFzcyBJbnRlcmFjdGl2ZSBleHRlbmRzIFRhYmxlXG4gIHJlYWRtZTogLT4gQF9yZWFkbWUuZ2V0KClcbiAgY29uc3RydWN0b3I6IChkYXRhX29yX3VybCwgdGFibGVfbmFtZSktPlxuICAgIEB0cmVlID0gbmV3IEJhb2JhYiB7fVxuICAgIEBjdXJzb3IgPSBAdHJlZS5zZWxlY3QgMFxuICAgIEBfcmVhZG1lID0gQGN1cnNvci5zZWxlY3QgJ3JlYWRtZSdcbiAgICBzdXBlciBkYXRhX29yX3VybCwgdGFibGVfbmFtZVxuICAgIEBjb21wdXRlKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vZGF0YSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZSBleHRlbmRzIERhdGFTb3VyY2VcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jZHMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1uX2RhdGFfc291cmNlJ1xuICAgIHN1cGVyKClcblxuICBsb2FkOiAoY29sdW1ucykgLT5cbiAgICAgIGNvbHVtbnMgPz0gQGNvbHVtbnMoKVxuICAgICAgIyMjIEluZGV4IG1vbmtleSBpcyBkZXN0cm95ZWQgb24gdGhlIGZpcnN0IG9wZXJhdGlvbiAjIyNcbiAgICAgIGNkcyA9IHt9XG4gICAgICBjb2x1bW5zID0gQXJyYXkgY29sdW1ucy4uLlxuICAgICAgY29sdW1ucy5mb3JFYWNoIChjb2x1bW4sY29sdW1uX2luZGV4KT0+XG4gICAgICAgICMjIyBDcmVhdGUgRHluYW1pYyBOb2RlcyBmb3IgRWFjaCBDb2x1bW4gRGF0YSBTb3VyY2UgIyMjXG4gICAgICAgIGNkcyA9IEBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleSBjb2x1bW4sIG51bGwsIGNkc1xuICAgICAgQHN0YWdlIGNkc1xuXG4gIF9jb2x1bW5fbmFtZV9hcnJheTogKGNvbHVtbnMpLT4gaWYgbm90IEFycmF5LmlzQXJyYXkgY29sdW1ucyB0aGVuIFtjb2x1bW5zXSBlbHNlIGNvbHVtbnNcblxuICBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleTogKGNvbHVtbixtb25rZXksdG1wPXt9KS0+XG4gICAgICB0bXBbJ2NvbHVtbl9kYXRhX3NvdXJjZSddID89IHt9XG4gICAgICBtb25rZXkgPz0gQmFvYmFiLm1vbmtleSBbJ2NvbHVtbnMnXSxbJ3ZhbHVlcyddLFsnLicsJ25hbWUnXSwgKGNvbHVtbnMsdmFsdWVzLGNvbHVtbl9uYW1lKS0+XG4gICAgICAgICAgICAgIGNvbHVtbl9pbmRleCA9IGNvbHVtbnMuaW5kZXhPZiBjb2x1bW5fbmFtZVxuICAgICAgICAgICAgICB2YWx1ZXMubWFwIChyb3dfdmFsdWVzKT0+IHJvd192YWx1ZXNbY29sdW1uX2luZGV4XVxuICAgICAgdG1wWydjb2x1bW5fZGF0YV9zb3VyY2UnXVtjb2x1bW5dID1cbiAgICAgICAgICBuYW1lOiBjb2x1bW5cbiAgICAgICAgICB2YWx1ZXM6IG1vbmtleVxuICAgICAgdG1wXG5cbiAgY29sdW1uX2RhdGFfc291cmNlOiAoY29sdW1ucyxmb3JjZV9hcnJheT1mYWxzZSktPlxuICAgIGNvbHVtbnMgPSBAX2NvbHVtbl9uYW1lX2FycmF5IGNvbHVtbnNcbiAgICBpZiBjb2x1bW5zLmxlbmd0aCA+IDEgb3IgZm9yY2VfYXJyYXlcbiAgICAgIGQzLnppcCBjb2x1bW5zLm1hcCggKGMpID0+IEBfY2RzLmdldChjLCd2YWx1ZXMnKSApLi4uXG4gICAgZWxzZVxuICAgICAgQF9jZHMuZ2V0KGNvbHVtbnNbMF0sJ3ZhbHVlcycpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5cbiIsImQzID0gcmVxdWlyZSBcImQzXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbXB1dGVcbiAgY29tcHV0ZTogKCktPlxuICAgICMjIyBDb21wdXRlIGNoYW5nZXMgdGhlIHN0YXRlIG9mIHRoZSBkYXRhIHRyZWUgIyMjXG4gICAgY29uc29sZS5sb2cgMSxcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcblxuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICB0aGlzXG5cbiAgc3RhZ2U6IChuZXdfc3RhdGUsZXhwcmVzc2lvbj1udWxsKS0+XG4gICAgW3VwZGF0ZV9zdGF0ZSwgbW9ua2V5c10gPSBAX3NwbGl0X3VwZGF0ZV9vYmplY3QgbmV3X3N0YXRlXG4gICAgQGN1cnNvci5kZWVwTWVyZ2UgdXBkYXRlX3N0YXRlXG4gICAgaWYgbW9ua2V5cy5sZW5ndGggPiAwXG4gICAgICBmb3IgbW9ua2V5IGluIG1vbmtleXNcbiAgICAgICAgQGN1cnNvci5zZXQgbW9ua2V5LnBhdGgsIG1vbmtleS52YWx1ZVxuICAgIHRoaXNcblxuICBfc3BsaXRfdXBkYXRlX29iamVjdDogKCB1cGRhdGVkX3N0YXRlLCBwYXRoPVtdLCBtb25rZXlzPVtdICktPlxuICAgICMjIyBQcnVuZSBhbmQgc2V0IHRoZSBCYW9iYWIgbW9ua2V5cyBhbmQgcmV0dXJuIG9ubHkgdGhlIHZhbHVlcyBjb21wbGlhbnQgd2l0aCBkZWVwTWVyZ2UgIyMjXG4gICAgZDMuZW50cmllcyB1cGRhdGVkX3N0YXRlXG4gICAgICAgIC5mb3JFYWNoIChlbnRyeSk9PlxuICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkoZW50cnkudmFsdWUpXG4gICAgICAgICAgICAjIyMgZG8gbm90aGluZyAjIyNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZihlbnRyeS52YWx1ZSkgaW4gWydvYmplY3QnXVxuICAgICAgICAgICAgaWYgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldWydoYXNEeW5hbWljUGF0aHMnXT9cbiAgICAgICAgICAgICAgbW9ua2V5cy5wdXNoXG4gICAgICAgICAgICAgICAgcGF0aDogW3BhdGguLi4sZW50cnkua2V5XVxuICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZVxuICAgICAgICAgICAgICBkZWxldGUgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBfc3BsaXRfdXBkYXRlX29iamVjdCB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV0sIFtwYXRoLi4uLGVudHJ5LmtleV0sIG1vbmtleXNcbiAgICBbdXBkYXRlZF9zdGF0ZSxtb25rZXlzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbXB1dGVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Sb3cgPSByZXF1aXJlICcuL3Jvd3MnXG5cbmNsYXNzIEludGVyYWN0aXZlLkRhdGFTb3VyY2UgZXh0ZW5kcyBSb3dcbiAgdmFsdWVzOiAoYXJncyktPiBAX3ZhbHVlcy5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX3ZhbHVlcyA9IEBjdXJzb3Iuc2VsZWN0ICd2YWx1ZXMnXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkRhdGFTb3VyY2VcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoYXJncyktPiBAX2V4cHJlc3Npb24uZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zLi4uKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCktPlxuICAgICAgaWYgZXhwcmVzc2lvbi5tZXRob2QgaW4gZDMua2V5cyBARXhwcmVzc2lvbi5wcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzLkV4cHJlc3Npb25bZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZSBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBwcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzW2V4cHJlc3Npb24ubWV0aG9kXSBleHByZXNzaW9uLmFyZ3MuLi5cbiAgICAgIGVsc2VcbiAgICAgICAgYXNzZXJ0IFwiI3tKU09OLnN0cmluZ2lmeSBleHByZXNzaW9uc30gaXMgbm90IHVuZGVyc3Rvb2QuXCJcbiAgICAgIEBzdGFnZSBjb21wdXRlZF9zdGF0ZVxuICAgICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MpLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuQ29tcHV0ZSA9IHJlcXVpcmUgJy4vY29tcHV0ZSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuSGlzdG9yeSBleHRlbmRzIENvbXB1dGVcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jaGVja3BvaW50ID0gQGN1cnNvci5zZWxlY3QgJ2NoZWNrcG9pbnQnXG4gICAgQF9jaGVja3BvaW50LnNldCB7fVxuICAgIEBfZXhwcmVzc2lvbi5zdGFydFJlY29yZGluZyAyMFxuICAgIHN1cGVyKClcbiAgaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmdldEhpc3RvcnkoKVxuICBjbGVhcl9oaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uY2xlYXJIaXN0b3J5KClcbiAgcmVjb3JkOiAoZXhwcmVzc2lvbiktPlxuICAgICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkhpc3RvcnlcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db2x1bW4gPSByZXF1aXJlICcuL2NvbHVtbnMnXG5cbmNsYXNzIEludGVyYWN0aXZlLlJvdyBleHRlbmRzIENvbHVtblxuICBpbmRleDogKGFyZ3MpLT4gQF9pbmRleC5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2luZGV4ID0gQGN1cnNvci5zZWxlY3QgJ2luZGV4J1xuICAgIEBzdGFnZSBAX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXkgJ2luZGV4JywgW1snaW5kZXgnXSwgKGluZGV4KS0+IGluZGV4XVxuICAgIHN1cGVyKClcbiAgaWxvYzogIC0+XG4gIGxvYzogLT5cbiAgdXBkYXRlOiAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlJvd1xuIiwiZDMgPSByZXF1aXJlICdkMydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db2x1bW5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9jb2x1bW5fZGF0YV9zb3VyY2UnXG5cbiMgVGFibGUgYXNzaWducyBtZXRhZGF0YSB0byB0aGUgSW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VcbiMgQSB0YWJsZSBpcyBkZXNjcmliZSBieTpcbiMgKiBfdmFsdWVzXyAtIEEgbGlzdCBvZiBsaXN0cyBjb250YWluaW5nIHRoZSByb3cgZW50cmllcyBpbiB0aGUgdGFibGUuXG4jICogX2NvbHVtbnNfIC0gVGhlIGNvbHVtbiBuYW1lcyBpbiB0aGUgdGFibGUsIHRoZSBjb2x1bW4gbmFtZXMgbWFwIHRoZSBlbnRyaWVzIGluIGVhY2ggcm93XG4jICogX21ldGFkYXRhXyAtXG4jIFRoZSB0YWJsZSBrZXlzICBuYW1pbmcgaXMgaW5zcGlyZWQgYnkgYGBwYW5kYXMuRGF0YUZyYW1lLnRvX2RpY3Qob3JpZW50PSdyZWNvcmRzJykuXG5cbmNsYXNzIEludGVyYWN0aXZlLlRhYmxlIGV4dGVuZHMgQ29sdW1uRGF0YVNvdXJjZVxuICBtZXRhZGF0YTogKGFyZ3MpLT4gQF9tZXRhZGF0YS5nZXQgYXJncy4uLlxuXG4gICMgQHBhcmFtIFtTdHJpbmddIGRhdGFfb3JfdXJsIHVybCB0byBhIGpzb24gZW5kcG9pbnQgY29udGFpbmluZyB0aGUga2V5cyBgYHZhbHVlc2BgLCBgYFxuICAjIEBwYXJhbSBbT2JqZWN0XSBkYXRhX29yX3VybFxuICBjb25zdHJ1Y3RvcjogKGRhdGFfb3JfdXJsLCBAbmFtZT1udWxsKS0+XG4gICAgIyMgVGhlIHRhYmxlIGNhbiBiZSByZW5hbWVkICMjI1xuICAgIEBfbmFtZSA9IEBjdXJzb3Iuc2VsZWN0ICduYW1lJ1xuICAgIEBfbmFtZS5zZXQgQG5hbWVcbiAgICBAX21ldGFkYXRhID0gQGN1cnNvci5zZWxlY3QgJ21ldGFkYXRhJ1xuICAgIHN1cGVyKClcbiAgICBAbG9hZCBkYXRhX29yX3VybFxuXG4gIGxvYWQ6IChkYXRhX29yX3VybCktPlxuICAgIGlmICdzdHJpbmcnIGluIFt0eXBlb2YgZGF0YV9vcl91cmxdXG4gICAgICBkMy5qc29uIGRhdGEsICh0YWJsZV9kYXRhKT0+XG4gICAgICAgIHRhYmxlX2RhdGFbJ3VybCddID0gQF9yYXdcbiAgICAgICAgQHN0YWdlXG4gICAgICAgICAgICByYXc6IHRhYmxlX2RhdGFcbiAgICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSB0YWJsZV9kYXRhLmxlbmd0aFxuICAgICAgICAgICxcbiAgICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgICBhcmdzOiBbZGF0YV9vcl91cmxdXG4gICAgICAgIHN1cGVyKClcbiAgICBlbHNlXG4gICAgICBkYXRhID0gZGF0YV9vcl91cmxcbiAgICAgIEBzdGFnZVxuICAgICAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gW11cbiAgICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IHt9XG4gICAgICAgICAgcmVhZG1lOiBkYXRhLnJlYWRtZSA/IG51bGxcbiAgICAgICAgICBpbmRleDogZDMucmFuZ2UgZGF0YS52YWx1ZXM/Lmxlbmd0aCA/IDBcbiAgICAgICAgLFxuICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgYXJnczogW2RhdGFdXG4gICAgICBzdXBlcigpXG5cbkludGVyYWN0aXZlLlRhYmxlOjpleHByID1cbiAgY29uY2F0OiAtPlxuICBoZWFkOiAtPlxuICB0YWlsOiAtPlxuICBzb3J0OiAtPlxuICBmaWx0ZXI6IC0+XG4gIG1hcDogLT5cblxuSW50ZXJhY3RpdmUuVGFibGU6OnRvX3N0cmluZyA9IC0+XG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fanNvbiA9ICAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iXX0=
