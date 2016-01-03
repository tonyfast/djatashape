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
var Interactive, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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


},{"../interactive":7,"./manager":3}],3:[function(require,module,exports){
var BookInteractive, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BookInteractive = require('../book');

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
var Manager, Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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


},{"./manager":3,"./template":5}],5:[function(require,module,exports){
var d3,
  slice = [].slice;

d3 = require('d3');


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


},{"d3":"d3"}],6:[function(require,module,exports){
var Baobab, Book, CoffeeTable, Content, Publisher, d3;

Baobab = require("baobab");

d3 = require("d3");

Publisher = require('./book/publisher');

Content = require('./book/content');

Book = require('./book');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9vay5jb2ZmZWUiLCJzcmMvYm9vay9jb250ZW50LmNvZmZlZSIsInNyYy9ib29rL21hbmFnZXIuY29mZmVlIiwic3JjL2Jvb2svcHVibGlzaGVyLmNvZmZlZSIsInNyYy9ib29rL3RlbXBsYXRlLmNvZmZlZSIsInNyYy9jb2ZmZWV0YWJsZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvcm93cy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvdGFibGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVI7OztBQUVWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CTTs7O2lCQUNKLFdBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDQSxjQUFDLElBQUQsRUFBTSxXQUFOO0FBQ1gsUUFBQTs7TUFEaUIsY0FBWTs7O01BQzdCLE9BQVE7O0lBQ1Isc0NBQ0U7TUFBQSxNQUFBLHNDQUFzQixDQUFDLEVBQUQsQ0FBdEI7TUFDQSxPQUFBLHlDQUF3QixDQUFDLFNBQUQsRUFBVyxXQUFYLENBRHhCO01BRUEsUUFBQSwwQ0FBMEI7UUFBQSxFQUFBLEVBQ3hCO1VBQUEsV0FBQSxFQUFhLDJDQUFiO1NBRHdCO09BRjFCO01BSUEs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QSxNQUFBLEVBQVEsTUFBUjtRQUNBLElBQUEsRUFBTSxDQUFDLElBQUQsQ0FETjtPQVBKO2FBU0EsOEJBQUEsRUFyQkY7O0VBREk7Ozs7R0Fid0I7O0FBcUNoQyxXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxJQUFuQixHQUNFO0VBQUEsTUFBQSxFQUFRLFNBQUEsR0FBQSxDQUFSO0VBQ0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUROO0VBRUEsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUZOO0VBR0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUhOO0VBSUEsTUFBQSxFQUFRLFNBQUEsR0FBQSxDQUpSO0VBS0EsR0FBQSxFQUFLLFNBQUEsR0FBQSxDQUxMOzs7QUFPRixXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxTQUFuQixHQUErQixTQUFBLEdBQUE7O0FBQy9CLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLE9BQW5CLEdBQThCLFNBQUEsR0FBQTs7QUFFOUIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIk1hbmFnZXIgPSByZXF1aXJlICcuL2Jvb2svbWFuYWdlcidcblxuIyMjXG5BIEJvb2sgdXNlcyBQdWJsaXNoZXJzIHRvIGNyZWF0ZSBUZW1wbGF0ZXMgdGhhdCBqb2luIHRvIHN1YnNldHMgb2YgQ29udGVudC4gIFRoZVxuQm9vayBtYW5hZ2VyIGlzIHJlc3BvbnNpYmxlIGZvciBuZWFybHkgYWxsIG9mIHRoZSBjb250ZW50LlxuXG5gYGBcbnRhYmxlID0gbmV3IENvZmZlZVRhYmxlIHt9XG50YWJsZS5ib29rcy5yZWdpc3RlciAnI3RhYmxlJyxcbiAgY29sdW1uczogW1xuICAgIFsnY29udGVudCcsJ3B1Ymxpc2hlciddXG4gIF1cbiAgdmFsdWVzOiBbXG4gICAgWycjdGFibGUnLCcjdGFibGUnXVxuICBdXG50YWJsZS5ib29rWycjdGFibGUnXS50cmVlXG50YWJsZS5ib29rWycjdGFibGUnXS5jdXJzb3JcbnRhYmxlLmJvb2tbJyN0YWJsZSddLmNvbHVtbl9kYXRhX3NvdXJjZVxudGFibGUuYm9va1snI3RhYmxlJ10uc2VsZWN0aW9uLl9fZGF0YV9fICMgaXMgc29tZSBkYXRhIGFwcGVuZGVkIHRvIHRoZSBzZWxlY3Rpb24gZnJvbSB0aGUgdHJlZVxuYGBgXG4jIyNcbmNsYXNzIEJvb2sgZXh0ZW5kcyBNYW5hZ2VyXG4gIF9iYXNlX2NsYXNzOiByZXF1aXJlICcuL2ludGVyYWN0aXZlJ1xuICBjb25zdHJ1Y3RvcjogKGRhdGEsdG9fcmVnaXN0ZXI9W10pLT5cbiAgICBkYXRhID89IHt9XG4gICAgc3VwZXJcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gQm9va1xuIiwiTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFuYWdlcidcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5cbiMgQ29udGVudCBpcyBhIGNvbGxlY3Rpb24gb2YgSW50ZXJhY3RpdmUgVGFidWxhciBkYXRhIHNvdXJjZXMuICBDb250ZW50XG4jIGNhbiBiZSBjb25zdW1lZCBieSBhIHB1Ymxpc2hlci4gIEJvdGggZGF0YSBhbmQgbWV0YWRhdGEgb2YgdGhlIHRhYmxlIGNhblxuIyBiZSBpbmplY3RlZCBpbnRvIHRoZSBkb21cbiMjI1xuYGBgXG50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZSB7fVxudGFibGUuY29udGVudC5yZWdpc3RlciAnI3RhYmxlJyxcbiAgY29sdW1uczogW1xuICAgIFsneCcsJ3knXVxuICBdXG4gIHZhbHVlczogW1xuICAgIFsxLDJdXG4gICAgWzgsOV1cbiAgXVxuICBtZXRhZGF0YTpcbiAgICB4OlxuICAgICAgdW5pdHM6ICdpbmNoJ1xuICAgICAgYWx0OiAnd2lkdGgnXG4gICAgeTpcbiAgICAgIHVuaXRzOiAnaW5jaCdcbiAgICAgIGFsdDogJ2hlaWdodCdcblxudGFibGUuY29udGVudFsnI3RhYmxlJ10udHJlZVxudGFibGUuY29udGVudFsnI3RhYmxlJ10uY3Vyc29yXG50YWJsZS5jb250ZW50WycjdGFibGUnXS5jb2x1bW5fZGF0YV9zb3VyY2VcbnRhYmxlLmNvbnRlbnRbJyN0YWJsZSddLnNvcnQoKS51bmlxdWUoKS5maWx0ZXIoKS5tYXAoKVxuYGBgXG4jIyNcbmNsYXNzIEJvb2suQ29udGVudCBleHRlbmRzIE1hbmFnZXJcbiAgX2Jhc2VfY2xhc3M6IEludGVyYWN0aXZlXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSx0b19yZWdpc3Rlcj1bXSktPlxuICAgIHN1cGVyXG4gICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gWydzZWxlY3RvciddXG4gICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IGlkOlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJcIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5Db250ZW50XG4iLCJCb29rSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9ib29rJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcblxuIyMjXG5NYW5hZ2VyIGF0dGFjaGVzIGtleWVkIHRhYmxlcyBhbmQgc2VsZWN0aW9ucyB0byB0aGUgUHVibGlzaGVyLCBDb250ZW50LCBhbmQgQm9va1xuIyMjXG5jbGFzcyBCb29rLk1hbmFnZXIgZXh0ZW5kcyBJbnRlcmFjdGl2ZVxuICBkaXI6ICgpLT4gQGNvbHVtbl9kYXRhX3NvdXJjZSBAaW5kZXhfY29sdW1uXG4gIHJlZ2lzdGVyOiAoIG5hbWUsIGRhdGFfb3JfdXJsPW51bGwgKS0+XG4gICAgQFtuYW1lXSA9IG5ldyBAX2Jhc2VfY2xhc3MgZGF0YV9vcl91cmxcbiAgICBAW25hbWVdXG4gIHVucmVnaXN0ZXI6ICggbmFtZSApLT5cbiAgY29tbWl0OiAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suTWFuYWdlclxuIiwiTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFuYWdlcidcblRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZSdcbiMjI1xuUHVibGlzaGVyIGlzIGEgc3VwZXJjaGFyZ2VkIGQzIHNlbGVjdGlvbi4gIEl0IGFkZHMgc29tZSBjb252aWVuY2UgZnVuY3Rpb25zIHRvXG5lbnRlciwgZXhpdCwgYW5kIHVwZGF0ZSBkYXRhLiAgQWxsIG9mIGQzIHRoZSBzZWxlY3Rpb24gbWV0aG9kcyBhcmUgZXhwb3NlZFxudG8gdGhlIHB1Ymxpc2hlclxuXG5gYGBcbnRhYmxlID0gbmV3IENvZmZlZVRhYmxlIHt9XG50ZW1wbGF0ZSA9IHRhYmxlLnB1Ymxpc2hlci5yZWdpc3RlciAnLmZvbyN0YWJsZSdcbnRlbXBsYXRlLnNlbGVjdGlvbi5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG50ZW1wbGF0ZS5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG5cbnRlbXBsYXRlLnJlbmRlciAndGFibGUnLCBbMV1cbnRlbXBsYXRlLnJlbmRlciAnZGl2LnRyLnZhbHVlcyA+IHRkJywgW1xuICBbMSwyXVxuICBbOCw3XVxuXVxuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLnZhbHVlcyA+IHRkJywgdGFibGUuY29udGVudFsnI3RhYmxlJ10udmFsdWVzKClcblxudGVtcGxhdGUucmVuZGVyICd0ci5jb2x1bW5zID4gdGgnLCBbXG4gIFswXVxuXSwgJ3VwJ1xuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmluZGV4ID4gdGgnLCBbXG4gIFtudWxsXVxuICBbMF1cbl0sICdsZWZ0J1xuYGBgXG4jIyNcblxuY2xhc3MgQm9vay5QdWJsaXNoZXIgZXh0ZW5kcyBNYW5hZ2VyXG4gIF9iYXNlX2NsYXNzOiBUZW1wbGF0ZVxuXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSx0b19yZWdpc3Rlcj1bXSktPlxuICAgIGRhdGEgPz0ge31cbiAgICBAXG4gICAgc3VwZXJcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBuYW1lIG9mIGEgdGVtcGxhdGUgaW4gYW4gZW52aXJvbm1lbnQuXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suUHVibGlzaGVyXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG4jIyNcbmBgYFxudGVtcGxhdGUuc2VsZWN0aW9uLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcbnRlbXBsYXRlLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcblxudGVtcGxhdGUucmVuZGVyICd0YWJsZScsIFsxXVxudGVtcGxhdGUucmVuZGVyICd0ci52YWx1ZXMgPiB0ZCcsIFtbMSwyXSxbOCw3XV1cbnRlbXBsYXRlLnJlbmRlciAndHIudmFsdWVzID4gdGQnLCB0YWJsZS5jb250ZW50WycjdGFibGUnXS52YWx1ZXMoKVxudGVtcGxhdGUucmVuZGVyICd0ci5jb2x1bW5zID4gdGgnLCBbWzBdXSwgJ3VwJ1xudGVtcGxhdGUucmVuZGVyICd0ci5pbmRleCA+IHRoJywgW1tudWxsXSxbMF1dLCAnbGVmdCdcbmBgYFxuIyMjXG5cbmNsYXNzIEJvb2suVGVtcGxhdGVcbiAgIyMjXG4gIEBwYXJhbSBbc3RyaW5nXSBzZWxlY3RvciBjc3Mgc2VsZWN0b3IgYSBET00gbm9kZVxuICAjIyNcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IsIGRhdGE9W1tdXSktPlxuICAgIEBzZWxlY3Rpb24gPSBkMy5zZWxlY3RBbGwgQHNlbGVjdG9yXG4gICAgQF9pbnRvX3NlbGVjdGlvbiBAc2VsZWN0aW9uLCBAc2VsZWN0b3IsIGRhdGFcblxuICAjIyNcbiAgQHBhcmFtIFtzdHJpbmddIHNlbGVjdG9ycyB0YWdOYW1lLmNsYXNzTmFtZTEuY2xhc3NOYW1lMiNpZFxuICBAcGFyYW0gW29iamVjdF0gZGF0YSBuZXN0ZWQgYXJyYXlzXG4gIEBwYXJhbSBbc3RyaW5nXSBkaXJlY3Rpb24gYXBwZW5kIGFmdGVyIHRoZSBsYXN0IGNoaWxkXG4gICMjI1xuICByZW5kZXI6IChzZWxlY3RvcnMsIGRhdGEsIGRpcmVjdGlvbiktPlxuICAgIGZpcnN0X3NlbGVjdGlvbiA9IEBfaW50b19zZWxlY3Rpb24gQHNlbGVjdGlvbiwgc2VsZWN0b3JzLCBkYXRhLCBkaXJlY3Rpb25cbiAgICBuZXcgZmlyc3Rfc2VsZWN0aW9uXG5cbiAgX2ludG9fc2VsZWN0aW9uOiAoc2VsZWN0aW9uLCBzZWxlY3RvcnMsIGRhdGEsIGRpcmVjdGlvbj0nZG93bicsIGZpcnN0X3NlbGVjdGlvbj1udWxsKS0+XG4gICAgW3NlbGVjdG9yLCBzZWxlY3RvcnMuLi5dID0gc2VsZWN0b3JzLnNwbGl0ICc+J1xuICAgIFt0YWcsY2xhc3Nlcy4uLl0gPSBzZWxlY3Rvci5zcGxpdCgnLicpXG4gICAgW2xhc3RfY2xhc3MsaWRdID0gbGFzdF9jbGFzcy5zcGxpdCAnIydcbiAgICBzZWxlY3RvciA/PSAnZGl2J1xuICAgIGNsYXNzZXMgPz0gW11cbiAgICBpZCA/PSBudWxsXG4gICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLnNlbGVjdEFsbCBzZWxlY3RvclxuICAgICAgLmRhdGEgZGF0YVxuICAgIGZpcnN0X3NlbGVjdGlvbiA/PSBzZWxlY3Rpb25cbiAgICBpZiBkaXJlY3Rpb24gaW4gWydkb3duJywncmlnaHQnXVxuICAgICAgc2VsZWN0ZXIuZW50ZXIoKS5hcHBlbmQgdGFnXG4gICAgZWxzZSBpZiBkaXJlY3Rpb24gaW4gWyd1cCcsJ2xlZnQnXVxuICAgICAgc2VsZWN0ZXIuZW50ZXIoKS5pbnNlcnQgdGFnLCAnOmZpcnN0LWNoaWxkJ1xuICAgIGZvciBjbGFzc19uYW1lIGluIGNsYXNzZXNcbiAgICAgIHNlbGVjdGlvbi5jbGFzc2VkIGNsYXNzX25hbWUsIHRydWVcbiAgICBpZiBpZD8gdGhlbiBzZWxlY3Rpb24uIGF0dHIgJ2lkJywgaWRcbiAgICAjIyMgSSBhbSB1bnN1cmUgd2hlcmUgdGhpcyBzaG91bGQgYmUgcGxhY2VkICMjI1xuICAgIHNlbGVjdGlvbi5leGl0KCkucmVtb3ZlKClcblxuICAgIGlmIHNlbGVjdG9ycy5sZW5ndGggPiAxXG4gICAgICBzZWxlY3Rpb24uZm9yRWFjaCAoX2RhdGEpPT5cbiAgICAgICAgQF9pbnRvX3NlbGVjdGlvbiBkMy5zZWxlY3QoQCksIHNlbGVjdG9ycy5qb2luKCc+JyksIF9kYXRhLCBmaXJzdF9zZWxlY3Rpb25cblxuICAgIGZpcnN0X3NlbGVjdGlvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suVGVtcGxhdGVcbiIsIkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuZDMgPSByZXF1aXJlIFwiZDNcIlxuUHVibGlzaGVyID0gIHJlcXVpcmUgJy4vYm9vay9wdWJsaXNoZXInXG5Db250ZW50ID0gIHJlcXVpcmUgJy4vYm9vay9jb250ZW50J1xuQm9vayA9ICByZXF1aXJlICcuL2Jvb2snXG5cbiMgaW50ZXJhY3RpdmUgdGFidWxhciBkYXRhLCBvcHRpbWl6ZWQgZm9yIHRoZSBicm93c2VyXG4jXG4jIEBleGFtcGxlIExldCdzIGdldCBzdGFydGVkXG4jICAgdGFibGUgPSBuZXcgQ29mZmVlVGFibGVcbiMgICAgIGNvbHVtbnM6IFtcbiMgICAgICAgJ3gnXG4jICAgICAgICd5J1xuIyAgICAgXVxuIyAgICAgdmFsdWVzOiBbXG4jICAgICAgIFsxLCAyXVxuIyAgICAgICBbMywgOF1cbiMgICAgIF1cbmNsYXNzIENvZmZlZVRhYmxlXG4gICMgQ29uc3RydWN0IGEgbmV3IGFuaW1hbC5cbiAgI1xuICAjIEBwYXJhbSBbT2JqZWN0XSBjb250ZW50IGNvbnRhaW5zIG1hbnkgVGFidWxhciBkYXRhc2V0c1xuICAjIEBwYXJhbSBbT2JqZWN0XSBwdWJsaXNoZXJzIGNvbnRhaW5zIG1hbnkgRE9NIHNlbGVjdGlvbnNcbiAgIyBAcGFyYW0gW09iamVjdF0gYm9va3MgdXNlIHB1Ymxpc2hlcnMgdG8gcHJlc2VudCBhbmQgdXBkYXRlIGNvbnRlZW50XG4gICNcbiAgY29uc3RydWN0b3I6IChjb250ZW50PXt9LCBwdWJsaXNoZXI9e30sIGJvb2s9e30pLT5cbiAgICBAY29udGVudCA9IG5ldyBDb250ZW50IGNvbnRlbnRcbiAgICBAcHVibGlzaGVyID0gbmV3IFB1Ymxpc2hlciBwdWJsaXNoZXJcbiAgICBAYm9vayA9IG5ldyBCb29rIGJvb2tcblxuICB2ZXJzaW9uOiAnMC4xLjAnXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvZmZlZVRhYmxlXG4gIGQzXG4gIEJhb2JhYlxufVxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuVGFibGUgPSByZXF1aXJlICcuL2ludGVyYWN0aXZlL3RhYmxlJ1xuXG4jIEludGVyYWN0aXZlIGRhdGEgc291cmNlcyBtYW5pcHVsYXRlIHRhYmxlIGVnLiBgYHNvcnRgYCxgYHVuaXF1ZWBgLGBgZmlsdGVyYGAsYGBtYXBgYCwgYGBncm91cGJ5YGAsIGBgam9pbmBgIC5cbiMgYGBCYW9iYWJgYCB0cmVlcyBhcmUgaW50ZXJhY3RpdmUgYW5kIGltbXV0YWJsZS4gIFRoZXkgbWFuYWdlIHRoZSBzdGF0ZSBvZiB0aGVcbiMgdGFidWxhciBkYXRhLlxuIyBJbnRlcmFjdGl2ZSBtYWludGFpbnM6XG4jICogVGFibGUgbWV0YWRhdGFcbiMgKiBDb2x1bW5EYXRhU291cmNlcyBgYGNvbHVtbl9kYXRhX3NvdXJjZWBgIGFuZCBSb3cgRGF0YVNvdXJjZSBgYHZhbHVlc2BgXG4jICogYGBIaXN0b3J5YGAgb2YgdGhlIGNvbXB1dGUgYXBwbGllZCB0byB0aGUgdGFibGUuXG4jIEBleGFtcGxlIGNyZWF0ZSBhIG5ldyBJbnRlcmFjdGl2ZSBEYXRhIFNvdXJjZVxuIyAgIHRhYmxlID0gbmV3IEludGVyYWN0aXZlXG4jICAgICBjb2x1bW5zOiBbXG4jICAgICAgICd4J1xuIyAgICAgICAneSdcbiMgICAgIF1cbiMgICAgIHZhbHVlczogW1xuIyAgICAgICBbMSwgMl1cbiMgICAgICAgWzMsIDhdXG4jICAgICBdXG4jICAgICBtZXRhZGF0YTpcbiMgICAgICAgeDoge3VuaXRzOidpbmNoJyxhbGlhczonbGVuZ3RoIG9mIHJlY3RhbmdsZSd9XG4jICAgICAgIHk6IHt1bml0czonaW5jaCcsYWxpYXM6J3dpZHRoIG9mIHJlY3RhbmdsZSd9XG5jbGFzcyBJbnRlcmFjdGl2ZSBleHRlbmRzIFRhYmxlXG4gIHJlYWRtZTogLT4gQF9yZWFkbWUuZ2V0KClcbiAgY29uc3RydWN0b3I6IChkYXRhX29yX3VybCwgdGFibGVfbmFtZSktPlxuICAgIEB0cmVlID0gbmV3IEJhb2JhYiB7fVxuICAgIEBjdXJzb3IgPSBAdHJlZS5zZWxlY3QgMFxuICAgIEBfcmVhZG1lID0gQGN1cnNvci5zZWxlY3QgJ3JlYWRtZSdcbiAgICBzdXBlciBkYXRhX29yX3VybCwgdGFibGVfbmFtZVxuICAgIEBjb21wdXRlKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vZGF0YSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZSBleHRlbmRzIERhdGFTb3VyY2VcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jZHMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1uX2RhdGFfc291cmNlJ1xuICAgIHN1cGVyKClcblxuICBsb2FkOiAoY29sdW1ucykgLT5cbiAgICAgIGNvbHVtbnMgPz0gQGNvbHVtbnMoKVxuICAgICAgIyMjIEluZGV4IG1vbmtleSBpcyBkZXN0cm95ZWQgb24gdGhlIGZpcnN0IG9wZXJhdGlvbiAjIyNcbiAgICAgIGNkcyA9IHt9XG4gICAgICBjb2x1bW5zID0gQXJyYXkgY29sdW1ucy4uLlxuICAgICAgY29sdW1ucy5mb3JFYWNoIChjb2x1bW4sY29sdW1uX2luZGV4KT0+XG4gICAgICAgICMjIyBDcmVhdGUgRHluYW1pYyBOb2RlcyBmb3IgRWFjaCBDb2x1bW4gRGF0YSBTb3VyY2UgIyMjXG4gICAgICAgIGNkcyA9IEBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleSBjb2x1bW4sIG51bGwsIGNkc1xuICAgICAgQHN0YWdlIGNkc1xuXG4gIF9jb2x1bW5fbmFtZV9hcnJheTogKGNvbHVtbnMpLT4gaWYgbm90IEFycmF5LmlzQXJyYXkgY29sdW1ucyB0aGVuIFtjb2x1bW5zXSBlbHNlIGNvbHVtbnNcblxuICBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleTogKGNvbHVtbixtb25rZXksdG1wPXt9KS0+XG4gICAgICB0bXBbJ2NvbHVtbl9kYXRhX3NvdXJjZSddID89IHt9XG4gICAgICBtb25rZXkgPz0gQmFvYmFiLm1vbmtleSBbJ2NvbHVtbnMnXSxbJ3ZhbHVlcyddLFsnLicsJ25hbWUnXSwgKGNvbHVtbnMsdmFsdWVzLGNvbHVtbl9uYW1lKS0+XG4gICAgICAgICAgICAgIGNvbHVtbl9pbmRleCA9IGNvbHVtbnMuaW5kZXhPZiBjb2x1bW5fbmFtZVxuICAgICAgICAgICAgICB2YWx1ZXMubWFwIChyb3dfdmFsdWVzKT0+IHJvd192YWx1ZXNbY29sdW1uX2luZGV4XVxuICAgICAgdG1wWydjb2x1bW5fZGF0YV9zb3VyY2UnXVtjb2x1bW5dID1cbiAgICAgICAgICBuYW1lOiBjb2x1bW5cbiAgICAgICAgICB2YWx1ZXM6IG1vbmtleVxuICAgICAgdG1wXG5cbiAgY29sdW1uX2RhdGFfc291cmNlOiAoY29sdW1ucyxmb3JjZV9hcnJheT1mYWxzZSktPlxuICAgIGNvbHVtbnMgPSBAX2NvbHVtbl9uYW1lX2FycmF5IGNvbHVtbnNcbiAgICBpZiBjb2x1bW5zLmxlbmd0aCA+IDEgb3IgZm9yY2VfYXJyYXlcbiAgICAgIGQzLnppcCBjb2x1bW5zLm1hcCggKGMpID0+IEBfY2RzLmdldChjLCd2YWx1ZXMnKSApLi4uXG4gICAgZWxzZVxuICAgICAgQF9jZHMuZ2V0KGNvbHVtbnNbMF0sJ3ZhbHVlcycpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5cbiIsImQzID0gcmVxdWlyZSBcImQzXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbXB1dGVcbiAgY29tcHV0ZTogKCktPlxuICAgICMjIyBDb21wdXRlIGNoYW5nZXMgdGhlIHN0YXRlIG9mIHRoZSBkYXRhIHRyZWUgIyMjXG4gICAgY29uc29sZS5sb2cgMSxcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcblxuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICB0aGlzXG5cbiAgc3RhZ2U6IChuZXdfc3RhdGUsZXhwcmVzc2lvbj1udWxsKS0+XG4gICAgW3VwZGF0ZV9zdGF0ZSwgbW9ua2V5c10gPSBAX3NwbGl0X3VwZGF0ZV9vYmplY3QgbmV3X3N0YXRlXG4gICAgQGN1cnNvci5kZWVwTWVyZ2UgdXBkYXRlX3N0YXRlXG4gICAgaWYgbW9ua2V5cy5sZW5ndGggPiAwXG4gICAgICBmb3IgbW9ua2V5IGluIG1vbmtleXNcbiAgICAgICAgQGN1cnNvci5zZXQgbW9ua2V5LnBhdGgsIG1vbmtleS52YWx1ZVxuICAgIHRoaXNcblxuICBfc3BsaXRfdXBkYXRlX29iamVjdDogKCB1cGRhdGVkX3N0YXRlLCBwYXRoPVtdLCBtb25rZXlzPVtdICktPlxuICAgICMjIyBQcnVuZSBhbmQgc2V0IHRoZSBCYW9iYWIgbW9ua2V5cyBhbmQgcmV0dXJuIG9ubHkgdGhlIHZhbHVlcyBjb21wbGlhbnQgd2l0aCBkZWVwTWVyZ2UgIyMjXG4gICAgZDMuZW50cmllcyB1cGRhdGVkX3N0YXRlXG4gICAgICAgIC5mb3JFYWNoIChlbnRyeSk9PlxuICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkoZW50cnkudmFsdWUpXG4gICAgICAgICAgICAjIyMgZG8gbm90aGluZyAjIyNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZihlbnRyeS52YWx1ZSkgaW4gWydvYmplY3QnXVxuICAgICAgICAgICAgaWYgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldWydoYXNEeW5hbWljUGF0aHMnXT9cbiAgICAgICAgICAgICAgbW9ua2V5cy5wdXNoXG4gICAgICAgICAgICAgICAgcGF0aDogW3BhdGguLi4sZW50cnkua2V5XVxuICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZVxuICAgICAgICAgICAgICBkZWxldGUgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBfc3BsaXRfdXBkYXRlX29iamVjdCB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV0sIFtwYXRoLi4uLGVudHJ5LmtleV0sIG1vbmtleXNcbiAgICBbdXBkYXRlZF9zdGF0ZSxtb25rZXlzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbXB1dGVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Sb3cgPSByZXF1aXJlICcuL3Jvd3MnXG5cbmNsYXNzIEludGVyYWN0aXZlLkRhdGFTb3VyY2UgZXh0ZW5kcyBSb3dcbiAgdmFsdWVzOiAoYXJncyktPiBAX3ZhbHVlcy5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX3ZhbHVlcyA9IEBjdXJzb3Iuc2VsZWN0ICd2YWx1ZXMnXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkRhdGFTb3VyY2VcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoYXJncyktPiBAX2V4cHJlc3Npb24uZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zLi4uKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCktPlxuICAgICAgaWYgZXhwcmVzc2lvbi5tZXRob2QgaW4gZDMua2V5cyBARXhwcmVzc2lvbi5wcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzLkV4cHJlc3Npb25bZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZSBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBwcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzW2V4cHJlc3Npb24ubWV0aG9kXSBleHByZXNzaW9uLmFyZ3MuLi5cbiAgICAgIGVsc2VcbiAgICAgICAgYXNzZXJ0IFwiI3tKU09OLnN0cmluZ2lmeSBleHByZXNzaW9uc30gaXMgbm90IHVuZGVyc3Rvb2QuXCJcbiAgICAgIEBzdGFnZSBjb21wdXRlZF9zdGF0ZVxuICAgICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MpLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuQ29tcHV0ZSA9IHJlcXVpcmUgJy4vY29tcHV0ZSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuSGlzdG9yeSBleHRlbmRzIENvbXB1dGVcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jaGVja3BvaW50ID0gQGN1cnNvci5zZWxlY3QgJ2NoZWNrcG9pbnQnXG4gICAgQF9jaGVja3BvaW50LnNldCB7fVxuICAgIEBfZXhwcmVzc2lvbi5zdGFydFJlY29yZGluZyAyMFxuICAgIHN1cGVyKClcbiAgaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmdldEhpc3RvcnkoKVxuICBjbGVhcl9oaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uY2xlYXJIaXN0b3J5KClcbiAgcmVjb3JkOiAoZXhwcmVzc2lvbiktPlxuICAgICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkhpc3RvcnlcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db2x1bW4gPSByZXF1aXJlICcuL2NvbHVtbnMnXG5cbmNsYXNzIEludGVyYWN0aXZlLlJvdyBleHRlbmRzIENvbHVtblxuICBpbmRleDogKGFyZ3MpLT4gQF9pbmRleC5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2luZGV4ID0gQGN1cnNvci5zZWxlY3QgJ2luZGV4J1xuICAgIEBzdGFnZSBAX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXkgJ2luZGV4JywgW1snaW5kZXgnXSwgKGluZGV4KS0+IGluZGV4XVxuICAgIHN1cGVyKClcbiAgaWxvYzogIC0+XG4gIGxvYzogLT5cbiAgdXBkYXRlOiAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlJvd1xuIiwiZDMgPSByZXF1aXJlICdkMydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db2x1bW5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9jb2x1bW5fZGF0YV9zb3VyY2UnXG5cbiMgVGFibGUgYXNzaWducyBtZXRhZGF0YSB0byB0aGUgSW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VcbiMgQSB0YWJsZSBpcyBkZXNjcmliZSBieTpcbiMgKiBfdmFsdWVzXyAtIEEgbGlzdCBvZiBsaXN0cyBjb250YWluaW5nIHRoZSByb3cgZW50cmllcyBpbiB0aGUgdGFibGUuXG4jICogX2NvbHVtbnNfIC0gVGhlIGNvbHVtbiBuYW1lcyBpbiB0aGUgdGFibGUsIHRoZSBjb2x1bW4gbmFtZXMgbWFwIHRoZSBlbnRyaWVzIGluIGVhY2ggcm93XG4jICogX21ldGFkYXRhXyAtXG4jIFRoZSB0YWJsZSBrZXlzICBuYW1pbmcgaXMgaW5zcGlyZWQgYnkgYGBwYW5kYXMuRGF0YUZyYW1lLnRvX2RpY3Qob3JpZW50PSdyZWNvcmRzJykuXG5cbmNsYXNzIEludGVyYWN0aXZlLlRhYmxlIGV4dGVuZHMgQ29sdW1uRGF0YVNvdXJjZVxuICBtZXRhZGF0YTogKGFyZ3MpLT4gQF9tZXRhZGF0YS5nZXQgYXJncy4uLlxuXG4gICMgQHBhcmFtIFtTdHJpbmddIGRhdGFfb3JfdXJsIHVybCB0byBhIGpzb24gZW5kcG9pbnQgY29udGFpbmluZyB0aGUga2V5cyBgYHZhbHVlc2BgLCBgYFxuICAjIEBwYXJhbSBbT2JqZWN0XSBkYXRhX29yX3VybFxuICBjb25zdHJ1Y3RvcjogKGRhdGFfb3JfdXJsLCBAbmFtZT1udWxsKS0+XG4gICAgIyMgVGhlIHRhYmxlIGNhbiBiZSByZW5hbWVkICMjI1xuICAgIEBfbmFtZSA9IEBjdXJzb3Iuc2VsZWN0ICduYW1lJ1xuICAgIEBfbmFtZS5zZXQgQG5hbWVcbiAgICBAX21ldGFkYXRhID0gQGN1cnNvci5zZWxlY3QgJ21ldGFkYXRhJ1xuICAgIHN1cGVyKClcbiAgICBAbG9hZCBkYXRhX29yX3VybFxuXG4gIGxvYWQ6IChkYXRhX29yX3VybCktPlxuICAgIGlmICdzdHJpbmcnIGluIFt0eXBlb2YgZGF0YV9vcl91cmxdXG4gICAgICBkMy5qc29uIGRhdGEsICh0YWJsZV9kYXRhKT0+XG4gICAgICAgIHRhYmxlX2RhdGFbJ3VybCddID0gQF9yYXdcbiAgICAgICAgQHN0YWdlXG4gICAgICAgICAgICByYXc6IHRhYmxlX2RhdGFcbiAgICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSB0YWJsZV9kYXRhLmxlbmd0aFxuICAgICAgICAgICxcbiAgICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgICBhcmdzOiBbZGF0YV9vcl91cmxdXG4gICAgICAgIHN1cGVyKClcbiAgICBlbHNlXG4gICAgICBkYXRhID0gZGF0YV9vcl91cmxcbiAgICAgIEBzdGFnZVxuICAgICAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gW11cbiAgICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IHt9XG4gICAgICAgICAgcmVhZG1lOiBkYXRhLnJlYWRtZSA/IG51bGxcbiAgICAgICAgICBpbmRleDogZDMucmFuZ2UgZGF0YS52YWx1ZXM/Lmxlbmd0aCA/IDBcbiAgICAgICAgLFxuICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgYXJnczogW2RhdGFdXG4gICAgICBzdXBlcigpXG5cbkludGVyYWN0aXZlLlRhYmxlOjpleHByID1cbiAgY29uY2F0OiAtPlxuICBoZWFkOiAtPlxuICB0YWlsOiAtPlxuICBzb3J0OiAtPlxuICBmaWx0ZXI6IC0+XG4gIG1hcDogLT5cblxuSW50ZXJhY3RpdmUuVGFibGU6OnRvX3N0cmluZyA9IC0+XG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fanNvbiA9ICAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iXX0=
