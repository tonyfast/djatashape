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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9vay5jb2ZmZWUiLCJzcmMvYm9vay9jb250ZW50LmNvZmZlZSIsInNyYy9ib29rL21hbmFnZXIuY29mZmVlIiwic3JjL2Jvb2svcHVibGlzaGVyLmNvZmZlZSIsInNyYy9ib29rL3RlbXBsYXRlLmNvZmZlZSIsInNyYy9jb2ZmZWV0YWJsZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvcm93cy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvdGFibGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVI7OztBQUVWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CTTs7O2lCQUNKLFdBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDQSxjQUFDLElBQUQsRUFBTSxXQUFOO0FBQ1gsUUFBQTs7TUFEaUIsY0FBWTs7O01BQzdCLE9BQVE7O0lBQ1Isc0NBQ0U7TUFBQSxNQUFBLHNDQUFzQixDQUFDLEVBQUQsQ0FBdEI7TUFDQSxPQUFBLHlDQUF3QixDQUFDLFNBQUQsRUFBVyxXQUFYLENBRHhCO01BRUEsUUFBQSwwQ0FBMEI7UUFBQSxFQUFBLEVBQ3hCO1VBQUEsV0FBQSxFQUFhLDJDQUFiO1NBRHdCO09BRjFCO01BSUEs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QSx3Q0FBc0IsSUFIdEI7UUFJQSxLQUFBLEVBQU8sRUFBRSxDQUFDLEtBQUgsK0VBQStCLENBQS9CLENBSlA7T0FERixFQU9FO1FBQUEsTUFBQSxFQUFRLE1BQVI7UUFDQSxJQUFBLEVBQU0sQ0FBQyxJQUFELENBRE47T0FQRjthQVNBLDhCQUFBLEVBckJGOztFQURJOzs7O0dBYndCOztBQXFDaEMsV0FBVyxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsSUFBbkIsR0FDRTtFQUFBLE1BQUEsRUFBUSxTQUFBLEdBQUEsQ0FBUjtFQUNBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FETjtFQUVBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FGTjtFQUdBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FITjtFQUlBLE1BQUEsRUFBUSxTQUFBLEdBQUEsQ0FKUjtFQUtBLEdBQUEsRUFBSyxTQUFBLEdBQUEsQ0FMTDs7O0FBT0YsV0FBVyxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsU0FBbkIsR0FBK0IsU0FBQSxHQUFBOztBQUMvQixXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxPQUFuQixHQUE4QixTQUFBLEdBQUE7O0FBRTlCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYW5hZ2VyID0gcmVxdWlyZSAnLi9ib29rL21hbmFnZXInXG5cbiMjI1xuQSBCb29rIHVzZXMgUHVibGlzaGVycyB0byBjcmVhdGUgVGVtcGxhdGVzIHRoYXQgam9pbiB0byBzdWJzZXRzIG9mIENvbnRlbnQuICBUaGVcbkJvb2sgbWFuYWdlciBpcyByZXNwb25zaWJsZSBmb3IgbmVhcmx5IGFsbCBvZiB0aGUgY29udGVudC5cblxuYGBgXG50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZSB7fVxudGFibGUuYm9va3MucmVnaXN0ZXIgJyN0YWJsZScsXG4gIGNvbHVtbnM6IFtcbiAgICBbJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICBdXG4gIHZhbHVlczogW1xuICAgIFsnI3RhYmxlJywnI3RhYmxlJ11cbiAgXVxudGFibGUuYm9va1snI3RhYmxlJ10udHJlZVxudGFibGUuYm9va1snI3RhYmxlJ10uY3Vyc29yXG50YWJsZS5ib29rWycjdGFibGUnXS5jb2x1bW5fZGF0YV9zb3VyY2VcbnRhYmxlLmJvb2tbJyN0YWJsZSddLnNlbGVjdGlvbi5fX2RhdGFfXyAjIGlzIHNvbWUgZGF0YSBhcHBlbmRlZCB0byB0aGUgc2VsZWN0aW9uIGZyb20gdGhlIHRyZWVcbmBgYFxuIyMjXG5jbGFzcyBCb29rIGV4dGVuZHMgTWFuYWdlclxuICBfYmFzZV9jbGFzczogcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIHN1cGVyXG4gICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gWydjb250ZW50JywncHVibGlzaGVyJ11cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBuYW1lIG9mIGEgdGVtcGxhdGUgaW4gYW4gZW52aXJvbm1lbnQuXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2tcbiIsIkJvb2sgPSByZXF1aXJlICcuLi9ib29rJ1xuTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFuYWdlcidcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5cbiMgQ29udGVudCBpcyBhIGNvbGxlY3Rpb24gb2YgSW50ZXJhY3RpdmUgVGFidWxhciBkYXRhIHNvdXJjZXMuICBDb250ZW50XG4jIGNhbiBiZSBjb25zdW1lZCBieSBhIHB1Ymxpc2hlci4gIEJvdGggZGF0YSBhbmQgbWV0YWRhdGEgb2YgdGhlIHRhYmxlIGNhblxuIyBiZSBpbmplY3RlZCBpbnRvIHRoZSBkb21cbiMjI1xuYGBgXG50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZSB7fVxudGFibGUuY29udGVudC5yZWdpc3RlciAnI3RhYmxlJyxcbiAgY29sdW1uczogW1xuICAgIFsneCcsJ3knXVxuICBdXG4gIHZhbHVlczogW1xuICAgIFsxLDJdXG4gICAgWzgsOV1cbiAgXVxuICBtZXRhZGF0YTpcbiAgICB4OlxuICAgICAgdW5pdHM6ICdpbmNoJ1xuICAgICAgYWx0OiAnd2lkdGgnXG4gICAgeTpcbiAgICAgIHVuaXRzOiAnaW5jaCdcbiAgICAgIGFsdDogJ2hlaWdodCdcblxudGFibGUuY29udGVudFsnI3RhYmxlJ10udHJlZVxudGFibGUuY29udGVudFsnI3RhYmxlJ10uY3Vyc29yXG50YWJsZS5jb250ZW50WycjdGFibGUnXS5jb2x1bW5fZGF0YV9zb3VyY2VcbnRhYmxlLmNvbnRlbnRbJyN0YWJsZSddLnNvcnQoKS51bmlxdWUoKS5maWx0ZXIoKS5tYXAoKVxuYGBgXG4jIyNcbmNsYXNzIEJvb2suQ29udGVudCBleHRlbmRzIE1hbmFnZXJcbiAgX2Jhc2VfY2xhc3M6IEludGVyYWN0aXZlXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSx0b19yZWdpc3Rlcj1bXSktPlxuICAgIHN1cGVyXG4gICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gWydzZWxlY3RvciddXG4gICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IGlkOlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJcIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5Db250ZW50XG4iLCJCb29rID0gcmVxdWlyZSAnLi4vYm9vaydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5cbiMjI1xuTWFuYWdlciBhdHRhY2hlcyBrZXllZCB0YWJsZXMgYW5kIHNlbGVjdGlvbnMgdG8gdGhlIFB1Ymxpc2hlciwgQ29udGVudCwgYW5kIEJvb2tcbiMjI1xuY2xhc3MgQm9vay5NYW5hZ2VyIGV4dGVuZHMgSW50ZXJhY3RpdmVcbiAgZGlyOiAoKS0+IEBjb2x1bW5fZGF0YV9zb3VyY2UgQGluZGV4X2NvbHVtblxuICByZWdpc3RlcjogKCBuYW1lLCBkYXRhX29yX3VybD1udWxsICktPlxuICAgIEBbbmFtZV0gPSBuZXcgQF9iYXNlX2NsYXNzIGRhdGFfb3JfdXJsXG4gICAgQFtuYW1lXVxuICB1bnJlZ2lzdGVyOiAoIG5hbWUgKS0+XG4gIGNvbW1pdDogLT5cblxubW9kdWxlLmV4cG9ydHMgPSBCb29rLk1hbmFnZXJcbiIsIkJvb2sgPSByZXF1aXJlICcuLi9ib29rJ1xuTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFuYWdlcidcblRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZSdcblxuIyMjXG5QdWJsaXNoZXIgaXMgYSBzdXBlcmNoYXJnZWQgZDMgc2VsZWN0aW9uLiAgSXQgYWRkcyBzb21lIGNvbnZpZW5jZSBmdW5jdGlvbnMgdG9cbmVudGVyLCBleGl0LCBhbmQgdXBkYXRlIGRhdGEuICBBbGwgb2YgZDMgdGhlIHNlbGVjdGlvbiBtZXRob2RzIGFyZSBleHBvc2VkXG50byB0aGUgcHVibGlzaGVyXG5cbmBgYFxudGFibGUgPSBuZXcgQ29mZmVlVGFibGUge31cbnRlbXBsYXRlID0gdGFibGUucHVibGlzaGVyLnJlZ2lzdGVyICcuZm9vI3RhYmxlJ1xudGVtcGxhdGUuc2VsZWN0aW9uLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcbnRlbXBsYXRlLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcblxudGVtcGxhdGUucmVuZGVyICd0YWJsZScsIFsxXVxudGVtcGxhdGUucmVuZGVyICdkaXYudHIudmFsdWVzID4gdGQnLCBbXG4gIFsxLDJdXG4gIFs4LDddXG5dXG5cbnRlbXBsYXRlLnJlbmRlciAndHIudmFsdWVzID4gdGQnLCB0YWJsZS5jb250ZW50WycjdGFibGUnXS52YWx1ZXMoKVxuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmNvbHVtbnMgPiB0aCcsIFtcbiAgWzBdXG5dLCAndXAnXG5cbnRlbXBsYXRlLnJlbmRlciAndHIuaW5kZXggPiB0aCcsIFtcbiAgW251bGxdXG4gIFswXVxuXSwgJ2xlZnQnXG5gYGBcbiMjI1xuXG5jbGFzcyBCb29rLlB1Ymxpc2hlciBleHRlbmRzIE1hbmFnZXJcbiAgX2Jhc2VfY2xhc3M6IFRlbXBsYXRlXG5cbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIEBcbiAgICBzdXBlclxuICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyA/IFsnc2VsZWN0b3InXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5QdWJsaXNoZXJcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5Cb29rID0gcmVxdWlyZSAnLi4vYm9vaydcblxuIyMjXG5gYGBcbnRlbXBsYXRlLnNlbGVjdGlvbi5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG50ZW1wbGF0ZS5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG5cbnRlbXBsYXRlLnJlbmRlciAndGFibGUnLCBbMV1cbnRlbXBsYXRlLnJlbmRlciAndHIudmFsdWVzID4gdGQnLCBbWzEsMl0sWzgsN11dXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLnZhbHVlcyA+IHRkJywgdGFibGUuY29udGVudFsnI3RhYmxlJ10udmFsdWVzKClcbnRlbXBsYXRlLnJlbmRlciAndHIuY29sdW1ucyA+IHRoJywgW1swXV0sICd1cCdcbnRlbXBsYXRlLnJlbmRlciAndHIuaW5kZXggPiB0aCcsIFtbbnVsbF0sWzBdXSwgJ2xlZnQnXG5gYGBcbiMjI1xuXG5jbGFzcyBCb29rLlRlbXBsYXRlXG4gICMjI1xuICBAcGFyYW0gW3N0cmluZ10gc2VsZWN0b3IgY3NzIHNlbGVjdG9yIGEgRE9NIG5vZGVcbiAgIyMjXG4gIGNvbnN0cnVjdG9yOiAoQHNlbGVjdG9yLCBkYXRhPVtbXV0pLT5cbiAgICBAc2VsZWN0aW9uID0gZDMuc2VsZWN0QWxsIEBzZWxlY3RvclxuICAgIEBfaW50b19zZWxlY3Rpb24gQHNlbGVjdGlvbiwgQHNlbGVjdG9yLCBkYXRhXG5cbiAgIyMjXG4gIEBwYXJhbSBbc3RyaW5nXSBzZWxlY3RvcnMgdGFnTmFtZS5jbGFzc05hbWUxLmNsYXNzTmFtZTIjaWRcbiAgQHBhcmFtIFtvYmplY3RdIGRhdGEgbmVzdGVkIGFycmF5c1xuICBAcGFyYW0gW3N0cmluZ10gZGlyZWN0aW9uIGFwcGVuZCBhZnRlciB0aGUgbGFzdCBjaGlsZFxuICAjIyNcbiAgcmVuZGVyOiAoc2VsZWN0b3JzLCBkYXRhLCBkaXJlY3Rpb24pLT5cbiAgICBmaXJzdF9zZWxlY3Rpb24gPSBAX2ludG9fc2VsZWN0aW9uIEBzZWxlY3Rpb24sIHNlbGVjdG9ycywgZGF0YSwgZGlyZWN0aW9uXG4gICAgbmV3IGZpcnN0X3NlbGVjdGlvblxuXG4gIF9pbnRvX3NlbGVjdGlvbjogKHNlbGVjdGlvbiwgc2VsZWN0b3JzLCBkYXRhLCBkaXJlY3Rpb249J2Rvd24nLCBmaXJzdF9zZWxlY3Rpb249bnVsbCktPlxuICAgIFtzZWxlY3Rvciwgc2VsZWN0b3JzLi4uXSA9IHNlbGVjdG9ycy5zcGxpdCAnPidcbiAgICBbdGFnLGNsYXNzZXMuLi5dID0gc2VsZWN0b3Iuc3BsaXQoJy4nKVxuICAgIFtsYXN0X2NsYXNzLGlkXSA9IGxhc3RfY2xhc3Muc3BsaXQgJyMnXG4gICAgc2VsZWN0b3IgPz0gJ2RpdidcbiAgICBjbGFzc2VzID89IFtdXG4gICAgaWQgPz0gbnVsbFxuICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5zZWxlY3RBbGwgc2VsZWN0b3JcbiAgICAgIC5kYXRhIGRhdGFcbiAgICBmaXJzdF9zZWxlY3Rpb24gPz0gc2VsZWN0aW9uXG4gICAgaWYgZGlyZWN0aW9uIGluIFsnZG93bicsJ3JpZ2h0J11cbiAgICAgIHNlbGVjdGVyLmVudGVyKCkuYXBwZW5kIHRhZ1xuICAgIGVsc2UgaWYgZGlyZWN0aW9uIGluIFsndXAnLCdsZWZ0J11cbiAgICAgIHNlbGVjdGVyLmVudGVyKCkuaW5zZXJ0IHRhZywgJzpmaXJzdC1jaGlsZCdcbiAgICBmb3IgY2xhc3NfbmFtZSBpbiBjbGFzc2VzXG4gICAgICBzZWxlY3Rpb24uY2xhc3NlZCBjbGFzc19uYW1lLCB0cnVlXG4gICAgaWYgaWQ/IHRoZW4gc2VsZWN0aW9uLiBhdHRyICdpZCcsIGlkXG4gICAgIyMjIEkgYW0gdW5zdXJlIHdoZXJlIHRoaXMgc2hvdWxkIGJlIHBsYWNlZCAjIyNcbiAgICBzZWxlY3Rpb24uZXhpdCgpLnJlbW92ZSgpXG5cbiAgICBpZiBzZWxlY3RvcnMubGVuZ3RoID4gMVxuICAgICAgc2VsZWN0aW9uLmZvckVhY2ggKF9kYXRhKT0+XG4gICAgICAgIEBfaW50b19zZWxlY3Rpb24gZDMuc2VsZWN0KEApLCBzZWxlY3RvcnMuam9pbignPicpLCBfZGF0YSwgZmlyc3Rfc2VsZWN0aW9uXG5cbiAgICBmaXJzdF9zZWxlY3Rpb25cblxubW9kdWxlLmV4cG9ydHMgPSBCb29rLlRlbXBsYXRlXG4iLCJCYW9iYWIgPSByZXF1aXJlIFwiYmFvYmFiXCJcbmQzID0gcmVxdWlyZSBcImQzXCJcblB1Ymxpc2hlciA9ICByZXF1aXJlICcuL2Jvb2svcHVibGlzaGVyJ1xuQ29udGVudCA9ICByZXF1aXJlICcuL2Jvb2svY29udGVudCdcbkJvb2sgPSAgcmVxdWlyZSAnLi9ib29rJ1xuXG4jIyNcbmludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuXG5AZXhhbXBsZSBDcmVhdGUgc29tZSBDb2ZmZWVUYWJsZSBib29rcy5cbiAgICAgIGJvb2tzID0gbmV3IENvZmZlZVRhYmxlIFtcbiAgICAgICAgbmFtZTogJ3JlY3RhbmdsZSdcbiAgICAgICAgYXJnczpcbiAgICAgICAgICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gICAgICAgICAgdmFsdWVzOiBbWzEsIDJdLFszLCA4XV1cbiAgICAgICAgXSwgW1xuICAgICAgICAgIG5hbWU6ICd0YWJsZSdcbiAgICAgICAgICBhcmdzOiBkMy5zZWxlY3QgJyN0YWJsZSdcbiAgICAgICAgLFxuICAgICAgICAgIG5hbWU6ICd0ZXh0J1xuICAgICAgICAgIGFyZ3M6IGQzLnNlbGVjdCAnI3RleHQnXG4gICAgICAgIF0sIFtcbiAgICAgICAgICBuYW1lOiAndGFibGUnXG4gICAgICAgICAgYXJnczpcbiAgICAgICAgICAgIGNvbHVtbnM6IFsndGl0bGUnLCdjb250ZW50JywncHVibGlzaGVyJ11cbiAgICAgICAgICAgIHZhbHVlczogW1sndGFibGUnLCdyZWN0YW5nbGUnLCd0YWJsZSddLFsndGV4dCcsJ3JlY3RhbmdsZScsJ3RleHQnXV1cbiAgICAgICAgXV1cbiAgICAgIGNvbnNvbGUubG9nIGJvb2tzLmJvb2tbJ3RpdGxlJ11cbiAgICAgIGNvbnNvbGUubG9nIGJvb2tzLmJvb2tbJ3RhYmxlJ11cbiMjI1xuY2xhc3MgQ29mZmVlVGFibGVcbiAgIyBDb25zdHJ1Y3QgYSBjb2xsZWN0aW9uIG9mIENvZmZlZVRhYmxlIGJvb2tzLlxuICAjXG4gICMgQHBhcmFtIFtPYmplY3RdIGNvbnRlbnQgY29udGFpbnMgbWFueSBUYWJ1bGFyIGRhdGFzZXRzXG4gICMgQHBhcmFtIFtPYmplY3RdIHB1Ymxpc2hlcnMgY29udGFpbnMgbWFueSBET00gc2VsZWN0aW9uc1xuICAjIEBwYXJhbSBbT2JqZWN0XSBib29rcyB1c2UgcHVibGlzaGVycyB0byBwcmVzZW50IGFuZCB1cGRhdGUgY29udGVlbnRcbiAgI1xuICBjb25zdHJ1Y3RvcjogKGNvbnRlbnQ9e30sIHB1Ymxpc2hlcj17fSwgYm9vaz17fSktPlxuICAgIEBjb250ZW50ID0gbmV3IENvbnRlbnQgY29udGVudFxuICAgIEBwdWJsaXNoZXIgPSBuZXcgUHVibGlzaGVyIHB1Ymxpc2hlclxuICAgIEBib29rID0gbmV3IEJvb2sgYm9va1xuXG4gIHZlcnNpb246ICcwLjEuMCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29mZmVlVGFibGVcbiAgZDNcbiAgQmFvYmFiXG59XG4iLCJCYW9iYWIgPSByZXF1aXJlICdiYW9iYWInXG5UYWJsZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUvdGFibGUnXG5cbiMgSW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VzIG1hbmlwdWxhdGUgdGFibGUgZWcuIGBgc29ydGBgLGBgdW5pcXVlYGAsYGBmaWx0ZXJgYCxgYG1hcGBgLCBgYGdyb3VwYnlgYCwgYGBqb2luYGAgLlxuIyBgYEJhb2JhYmBgIHRyZWVzIGFyZSBpbnRlcmFjdGl2ZSBhbmQgaW1tdXRhYmxlLiAgVGhleSBtYW5hZ2UgdGhlIHN0YXRlIG9mIHRoZVxuIyB0YWJ1bGFyIGRhdGEuXG4jIEludGVyYWN0aXZlIG1haW50YWluczpcbiMgKiBUYWJsZSBtZXRhZGF0YVxuIyAqIENvbHVtbkRhdGFTb3VyY2VzIGBgY29sdW1uX2RhdGFfc291cmNlYGAgYW5kIFJvdyBEYXRhU291cmNlIGBgdmFsdWVzYGBcbiMgKiBgYEhpc3RvcnlgYCBvZiB0aGUgY29tcHV0ZSBhcHBsaWVkIHRvIHRoZSB0YWJsZS5cbiMgQGV4YW1wbGUgY3JlYXRlIGEgbmV3IEludGVyYWN0aXZlIERhdGEgU291cmNlXG4jICAgdGFibGUgPSBuZXcgSW50ZXJhY3RpdmVcbiMgICAgIGNvbHVtbnM6IFtcbiMgICAgICAgJ3gnXG4jICAgICAgICd5J1xuIyAgICAgXVxuIyAgICAgdmFsdWVzOiBbXG4jICAgICAgIFsxLCAyXVxuIyAgICAgICBbMywgOF1cbiMgICAgIF1cbiMgICAgIG1ldGFkYXRhOlxuIyAgICAgICB4OiB7dW5pdHM6J2luY2gnLGFsaWFzOidsZW5ndGggb2YgcmVjdGFuZ2xlJ31cbiMgICAgICAgeToge3VuaXRzOidpbmNoJyxhbGlhczond2lkdGggb2YgcmVjdGFuZ2xlJ31cbmNsYXNzIEludGVyYWN0aXZlIGV4dGVuZHMgVGFibGVcbiAgcmVhZG1lOiAtPiBAX3JlYWRtZS5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKGRhdGFfb3JfdXJsLCB0YWJsZV9uYW1lKS0+XG4gICAgQHRyZWUgPSBuZXcgQmFvYmFiIHt9XG4gICAgQGN1cnNvciA9IEB0cmVlLnNlbGVjdCAwXG4gICAgQF9yZWFkbWUgPSBAY3Vyc29yLnNlbGVjdCAncmVhZG1lJ1xuICAgIHN1cGVyIGRhdGFfb3JfdXJsLCB0YWJsZV9uYW1lXG4gICAgQGNvbXB1dGUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlXG4iLCJCYW9iYWIgPSByZXF1aXJlIFwiYmFvYmFiXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9kYXRhJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db2x1bW5EYXRhU291cmNlIGV4dGVuZHMgRGF0YVNvdXJjZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NkcyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5fZGF0YV9zb3VyY2UnXG4gICAgc3VwZXIoKVxuXG4gIGxvYWQ6IChjb2x1bW5zKSAtPlxuICAgIGNvbHVtbnMgPz0gQGNvbHVtbnMoKVxuICAgICMjIyBJbmRleCBtb25rZXkgaXMgZGVzdHJveWVkIG9uIHRoZSBmaXJzdCBvcGVyYXRpb24gIyMjXG4gICAgY2RzID0ge31cbiAgICBjb2x1bW5zID0gQXJyYXkgY29sdW1ucy4uLlxuICAgIGNvbHVtbnMuZm9yRWFjaCAoY29sdW1uLGNvbHVtbl9pbmRleCk9PlxuICAgICAgIyMjIENyZWF0ZSBEeW5hbWljIE5vZGVzIGZvciBFYWNoIENvbHVtbiBEYXRhIFNvdXJjZSAjIyNcbiAgICAgIGNkcyA9IEBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleSBjb2x1bW4sIG51bGwsIGNkc1xuICAgIEBzdGFnZSBjZHNcblxuICBfY29sdW1uX25hbWVfYXJyYXk6IChjb2x1bW5zKS0+IGlmIG5vdCBBcnJheS5pc0FycmF5IGNvbHVtbnMgdGhlbiBbY29sdW1uc10gZWxzZSBjb2x1bW5zXG5cbiAgX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXk6IChjb2x1bW4sbW9ua2V5LHRtcD17fSktPlxuICAgIHRtcFsnY29sdW1uX2RhdGFfc291cmNlJ10gPz0ge31cbiAgICBtb25rZXkgPz0gQmFvYmFiLm1vbmtleSBbJ2NvbHVtbnMnXSxbJ3ZhbHVlcyddLFsnLicsJ25hbWUnXSwgKGNvbHVtbnMsdmFsdWVzLGNvbHVtbl9uYW1lKS0+XG4gICAgICBjb2x1bW5faW5kZXggPSBjb2x1bW5zLmluZGV4T2YgY29sdW1uX25hbWVcbiAgICAgIHZhbHVlcy5tYXAgKHJvd192YWx1ZXMpLT4gcm93X3ZhbHVlc1tjb2x1bW5faW5kZXhdXG4gICAgdG1wWydjb2x1bW5fZGF0YV9zb3VyY2UnXVtjb2x1bW5dID1cbiAgICAgICAgbmFtZTogY29sdW1uXG4gICAgICAgIHZhbHVlczogbW9ua2V5XG4gICAgdG1wXG5cbiAgY29sdW1uX2RhdGFfc291cmNlOiAoY29sdW1ucyxmb3JjZV9hcnJheT1mYWxzZSktPlxuICAgIGNvbHVtbnMgPSBAX2NvbHVtbl9uYW1lX2FycmF5IGNvbHVtbnNcbiAgICBpZiBjb2x1bW5zLmxlbmd0aCA+IDEgb3IgZm9yY2VfYXJyYXlcbiAgICAgIGQzLnppcCBjb2x1bW5zLm1hcCggKGMpID0+IEBfY2RzLmdldChjLCd2YWx1ZXMnKSApLi4uXG4gICAgZWxzZVxuICAgICAgQF9jZHMuZ2V0KGNvbHVtbnNbMF0sJ3ZhbHVlcycpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5cbiIsImQzID0gcmVxdWlyZSBcImQzXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbXB1dGVcbiAgY29tcHV0ZTogKCktPlxuICAgICMjIyBDb21wdXRlIGNoYW5nZXMgdGhlIHN0YXRlIG9mIHRoZSBkYXRhIHRyZWUgIyMjXG4gICAgY29uc29sZS5sb2cgMSxcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcblxuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICB0aGlzXG5cbiAgc3RhZ2U6IChuZXdfc3RhdGUsZXhwcmVzc2lvbj1udWxsKS0+XG4gICAgW3VwZGF0ZV9zdGF0ZSwgbW9ua2V5c10gPSBAX3NwbGl0X3VwZGF0ZV9vYmplY3QgbmV3X3N0YXRlXG4gICAgQGN1cnNvci5kZWVwTWVyZ2UgdXBkYXRlX3N0YXRlXG4gICAgaWYgbW9ua2V5cy5sZW5ndGggPiAwXG4gICAgICBmb3IgbW9ua2V5IGluIG1vbmtleXNcbiAgICAgICAgQGN1cnNvci5zZXQgbW9ua2V5LnBhdGgsIG1vbmtleS52YWx1ZVxuICAgIHRoaXNcblxuICBfc3BsaXRfdXBkYXRlX29iamVjdDogKCB1cGRhdGVkX3N0YXRlLCBwYXRoPVtdLCBtb25rZXlzPVtdICktPlxuICAgICMjIyBQcnVuZSBhbmQgc2V0IHRoZSBCYW9iYWIgbW9ua2V5cyBhbmQgcmV0dXJuIG9ubHkgdGhlIHZhbHVlcyBjb21wbGlhbnQgd2l0aCBkZWVwTWVyZ2UgIyMjXG4gICAgZDMuZW50cmllcyB1cGRhdGVkX3N0YXRlXG4gICAgICAgIC5mb3JFYWNoIChlbnRyeSk9PlxuICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkoZW50cnkudmFsdWUpXG4gICAgICAgICAgICAjIyMgZG8gbm90aGluZyAjIyNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZihlbnRyeS52YWx1ZSkgaW4gWydvYmplY3QnXVxuICAgICAgICAgICAgaWYgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldWydoYXNEeW5hbWljUGF0aHMnXT9cbiAgICAgICAgICAgICAgbW9ua2V5cy5wdXNoXG4gICAgICAgICAgICAgICAgcGF0aDogW3BhdGguLi4sZW50cnkua2V5XVxuICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZVxuICAgICAgICAgICAgICBkZWxldGUgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBfc3BsaXRfdXBkYXRlX29iamVjdCB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV0sIFtwYXRoLi4uLGVudHJ5LmtleV0sIG1vbmtleXNcbiAgICBbdXBkYXRlZF9zdGF0ZSxtb25rZXlzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbXB1dGVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Sb3cgPSByZXF1aXJlICcuL3Jvd3MnXG5cbmNsYXNzIEludGVyYWN0aXZlLkRhdGFTb3VyY2UgZXh0ZW5kcyBSb3dcbiAgdmFsdWVzOiAoYXJncyktPiBAX3ZhbHVlcy5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX3ZhbHVlcyA9IEBjdXJzb3Iuc2VsZWN0ICd2YWx1ZXMnXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkRhdGFTb3VyY2VcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoYXJncyktPiBAX2V4cHJlc3Npb24uZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zLi4uKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCktPlxuICAgICAgaWYgZXhwcmVzc2lvbi5tZXRob2QgaW4gZDMua2V5cyBARXhwcmVzc2lvbi5wcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzLkV4cHJlc3Npb25bZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZSBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBwcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzW2V4cHJlc3Npb24ubWV0aG9kXSBleHByZXNzaW9uLmFyZ3MuLi5cbiAgICAgIGVsc2VcbiAgICAgICAgYXNzZXJ0IFwiI3tKU09OLnN0cmluZ2lmeSBleHByZXNzaW9uc30gaXMgbm90IHVuZGVyc3Rvb2QuXCJcbiAgICAgIEBzdGFnZSBjb21wdXRlZF9zdGF0ZVxuICAgICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MpLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuQ29tcHV0ZSA9IHJlcXVpcmUgJy4vY29tcHV0ZSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuSGlzdG9yeSBleHRlbmRzIENvbXB1dGVcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jaGVja3BvaW50ID0gQGN1cnNvci5zZWxlY3QgJ2NoZWNrcG9pbnQnXG4gICAgQF9jaGVja3BvaW50LnNldCB7fVxuICAgIEBfZXhwcmVzc2lvbi5zdGFydFJlY29yZGluZyAyMFxuICAgIHN1cGVyKClcbiAgaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmdldEhpc3RvcnkoKVxuICBjbGVhcl9oaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uY2xlYXJIaXN0b3J5KClcbiAgcmVjb3JkOiAoZXhwcmVzc2lvbiktPlxuICAgIEBleHByZXNzaW9ucy5wdXNoIGV4cHJlc3Npb25cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5IaXN0b3J5XG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuQ29sdW1uID0gcmVxdWlyZSAnLi9jb2x1bW5zJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Sb3cgZXh0ZW5kcyBDb2x1bW5cbiAgaW5kZXg6IChhcmdzKS0+IEBfaW5kZXguZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9pbmRleCA9IEBjdXJzb3Iuc2VsZWN0ICdpbmRleCdcbiAgICBAc3RhZ2UgQF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5ICdpbmRleCcsIFtbJ2luZGV4J10sIChpbmRleCktPiBpbmRleF1cbiAgICBzdXBlcigpXG4gIGlsb2M6ICAtPlxuICBsb2M6IC0+XG4gIHVwZGF0ZTogLT5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Sb3dcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuQ29sdW1uRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vY29sdW1uX2RhdGFfc291cmNlJ1xuXG4jIFRhYmxlIGFzc2lnbnMgbWV0YWRhdGEgdG8gdGhlIEludGVyYWN0aXZlIGRhdGEgc291cmNlXG4jIEEgdGFibGUgaXMgZGVzY3JpYmUgYnk6XG4jICogX3ZhbHVlc18gLSBBIGxpc3Qgb2YgbGlzdHMgY29udGFpbmluZyB0aGUgcm93IGVudHJpZXMgaW4gdGhlIHRhYmxlLlxuIyAqIF9jb2x1bW5zXyAtIFRoZSBjb2x1bW4gbmFtZXMgaW4gdGhlIHRhYmxlLCB0aGUgY29sdW1uIG5hbWVzIG1hcCB0aGUgZW50cmllcyBpbiBlYWNoIHJvd1xuIyAqIF9tZXRhZGF0YV8gLVxuIyBUaGUgdGFibGUga2V5cyAgbmFtaW5nIGlzIGluc3BpcmVkIGJ5IGBgcGFuZGFzLkRhdGFGcmFtZS50b19kaWN0KG9yaWVudD0ncmVjb3JkcycpLlxuXG5jbGFzcyBJbnRlcmFjdGl2ZS5UYWJsZSBleHRlbmRzIENvbHVtbkRhdGFTb3VyY2VcbiAgbWV0YWRhdGE6IChhcmdzKS0+IEBfbWV0YWRhdGEuZ2V0IGFyZ3MuLi5cblxuICAjIEBwYXJhbSBbU3RyaW5nXSBkYXRhX29yX3VybCB1cmwgdG8gYSBqc29uIGVuZHBvaW50IGNvbnRhaW5pbmcgdGhlIGtleXMgYGB2YWx1ZXNgYCwgYGBcbiAgIyBAcGFyYW0gW09iamVjdF0gZGF0YV9vcl91cmxcbiAgY29uc3RydWN0b3I6IChkYXRhX29yX3VybCwgQG5hbWU9bnVsbCktPlxuICAgICMjIFRoZSB0YWJsZSBjYW4gYmUgcmVuYW1lZCAjIyNcbiAgICBAX25hbWUgPSBAY3Vyc29yLnNlbGVjdCAnbmFtZSdcbiAgICBAX25hbWUuc2V0IEBuYW1lXG4gICAgQF9tZXRhZGF0YSA9IEBjdXJzb3Iuc2VsZWN0ICdtZXRhZGF0YSdcbiAgICBzdXBlcigpXG4gICAgQGxvYWQgZGF0YV9vcl91cmxcblxuICBsb2FkOiAoZGF0YV9vcl91cmwpLT5cbiAgICBpZiAnc3RyaW5nJyBpbiBbdHlwZW9mIGRhdGFfb3JfdXJsXVxuICAgICAgZDMuanNvbiBkYXRhLCAodGFibGVfZGF0YSk9PlxuICAgICAgICB0YWJsZV9kYXRhWyd1cmwnXSA9IEBfcmF3XG4gICAgICAgIEBzdGFnZVxuICAgICAgICAgIHJhdzogdGFibGVfZGF0YVxuICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSB0YWJsZV9kYXRhLmxlbmd0aFxuICAgICAgICAsXG4gICAgICAgICAgbWV0aG9kOiAnbG9hZCdcbiAgICAgICAgICBhcmdzOiBbZGF0YV9vcl91cmxdXG4gICAgICAgIHN1cGVyKClcbiAgICBlbHNlXG4gICAgICBkYXRhID0gZGF0YV9vcl91cmxcbiAgICAgIEBzdGFnZVxuICAgICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbXVxuICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IHt9XG4gICAgICAgIHJlYWRtZTogZGF0YS5yZWFkbWUgPyBudWxsXG4gICAgICAgIGluZGV4OiBkMy5yYW5nZSBkYXRhLnZhbHVlcz8ubGVuZ3RoID8gMFxuICAgICAgLFxuICAgICAgICBtZXRob2Q6ICdsb2FkJ1xuICAgICAgICBhcmdzOiBbZGF0YV1cbiAgICAgIHN1cGVyKClcblxuSW50ZXJhY3RpdmUuVGFibGU6OmV4cHIgPVxuICBjb25jYXQ6IC0+XG4gIGhlYWQ6IC0+XG4gIHRhaWw6IC0+XG4gIHNvcnQ6IC0+XG4gIGZpbHRlcjogLT5cbiAgbWFwOiAtPlxuXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fc3RyaW5nID0gLT5cbkludGVyYWN0aXZlLlRhYmxlOjp0b19qc29uID0gIC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuVGFibGVcbiJdfQ==
