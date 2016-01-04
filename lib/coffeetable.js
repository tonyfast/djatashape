(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Book, Editor, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Book = require('./index');

Editor = require('./editor');

Interactive = require('../interactive/index');


/*
Content is a collection of Interactive Tabular data sources.  Content
can be consumed by a publisher.
 */

Book.Content = (function(superClass) {
  extend(Content, superClass);

  Content.prototype._base_class = Interactive;

  Content.prototype._columns = ['name'];

  Content.prototype._metadata = {
    alias: "The name of Tabular data in the SPA"
  };

  Content.prototype._readme = "";

  function Content(entries) {
    Content.__super__.constructor.call(this, {
      name: 'content',
      values: d3.keys(entries).map(function(v) {
        return [v];
      }),
      columns: this._columns,
      metadata: this._metadata,
      readme: this._readme
    });
    d3.entries(entries).forEach((function(_this) {
      return function(arg) {
        var key, value;
        key = arg.key, value = arg.value;
        value['name'] = key;
        return _this[key] = new Interactive(value);
      };
    })(this));
  }

  return Content;

})(Interactive);

module.exports = Book.Content;


},{"../interactive/index":13,"./editor":2,"./index":3,"d3":"d3"}],2:[function(require,module,exports){
var Book, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Book = require('./index');

Interactive = require('../interactive/index');


/*
Manager attaches keyed tables and selections to the Publisher, Content, and Book
 */

Book.Editor = (function(superClass) {
  extend(Editor, superClass);

  Editor.prototype.dir = function() {
    return this.column_data_source(this.index_column);
  };

  function Editor(_values, _name) {
    var ref;
    this._values = _values;
    this._name = _name;
    Editor.__super__.constructor.call(this, {
      columns: this._columns,
      values: (ref = this._values) != null ? ref : [],
      metadata: this._metadata,
      readme: this._readme,
      name: this._name
    });
  }

  Editor.prototype.register = function(name, value) {
    this[name] = new this._base_class(value, name);
    this._values.push([name]);
    return this[name];
  };

  Editor.prototype.unregister = function(name) {};

  Editor.prototype.commit = function() {};

  return Editor;

})(Interactive);

module.exports = Book.Editor;


},{"../interactive/index":13,"./index":3,"d3":"d3"}],3:[function(require,module,exports){
var Book, Editor, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

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

  Book.prototype._columns = ['alias', 'content', 'publisher'];

  Book.prototype._metadata = {
    alias: 'Alias of Book that connects Content and a Publisher'
  };

  Book.prototype._readme = '';

  function Book(values) {
    Book.__super__.constructor.call(this, values);
    d3.range(this.length()).forEach((function(_this) {
      return function(i) {
        return _this[_this._cds.get('alias', 'values', i)] = {
          content: _this.content[_this.get('column_data_source', 'content', 'values', i)],
          publisher: _this.publisher[_this.get('column_data_source', 'publisher', 'values', i)]
        };
      };
    })(this));
  }

  return Book;

})(Editor);

module.exports = Book;


},{"../interactive/index":13,"./editor":2,"d3":"d3"}],4:[function(require,module,exports){
var Book, Editor, Interactive, Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Book = require('./index');

Editor = require('./editor');

Template = require('./template');

Interactive = require('../interactive/index');


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

  Publisher.prototype._metadata = {
    name: 'Name of the Publisher',
    selector: 'CSS selector to publisher'
  };

  Publisher.prototype._readme = "";

  function Publisher(value) {
    Publisher.__super__.constructor.call(this, {
      name: 'publisher',
      values: value,
      columns: ['name', 'selector'],
      metadata: this._metadata,
      readme: this._readme
    });
    value.forEach((function(_this) {
      return function(entry) {
        return _this[entry[0]] = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Template, entry, function(){});
      };
    })(this));
  }

  return Publisher;

})(Interactive);

module.exports = Book.Publisher;


},{"../interactive/index":13,"./editor":2,"./index":3,"./template":5}],5:[function(require,module,exports){
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
  function Template(name, selector1, data) {
    this.name = name;
    this.selector = selector1;
    if (data == null) {
      data = [];
    }
    this._into_selection(d3.select('body'), this.selector, data);
    this.selection = d3.selectAll(this.selector);
  }


  /*
  @param [string] selectors tagName.className1.className2#id
  @param [object] data nested arrays
  @param [string] direction append after the last child
   */

  Template.prototype.render = function(selectors, data, direction) {
    var first_selection;
    first_selection = this._into_selection(this.selection, selectors, data, direction);
    return new Book.Template(first_selection);
  };

  Template.prototype._into_selection = function(selection, selectors, data, direction, first_selection) {
    var class_name, classes, i, id, j, last_class, len, ref, ref1, ref2, ref3, selector, tag;
    if (direction == null) {
      direction = 'down';
    }
    if (first_selection == null) {
      first_selection = null;
    }
    ref = selectors.split('>'), selector = ref[0], selectors = 2 <= ref.length ? slice.call(ref, 1) : [];
    ref1 = selector.split('.'), tag = ref1[0], classes = 3 <= ref1.length ? slice.call(ref1, 1, i = ref1.length - 1) : (i = 1, []), last_class = ref1[i++];
    if (last_class != null) {
      ref2 = last_class.split('#'), last_class = ref2[0], id = ref2[1];
    } else {
      ref3 = tag.split('#'), tag = ref3[0], id = ref3[1];
      if (tag.length === 0) {
        tag = null;
      }
    }
    if (tag == null) {
      tag = 'div';
    }
    if (id == null) {
      id = null;
    }
    selection = selection.selectAll(selector).data(data);
    if (first_selection == null) {
      first_selection = selection;
    }
    if (direction === 'down' || direction === 'right') {
      selection.enter().append(tag);
    } else if (direction === 'up' || direction === 'left') {
      selection.enter().insert(tag, ':first-child');
    }
    for (j = 0, len = classes.length; j < len; j++) {
      class_name = classes[j];
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
var Baobab, Book, Content, InteractiveGraph, Publisher, d3;

Baobab = require("baobab");

d3 = require("d3");

Publisher = require('./book/publisher');

Content = require('./book/content');

Book = require('./book/index');

InteractiveGraph = require('./interactive/interactive_graph');


/*
interactive tabular data, optimized for the browser

@example A complete example.
      d3.select('body').html('').append('div').attr 'id','table'
      d3.select('body').append('div').append('span').attr 'id','text'

      books = new CoffeeTable
          rectangle:
            columns: ['x', 'y']
            values: [[1, 2],[3, 8]]
        , [['table','#table'],['text','#text']]
        , [['table','rectangle','table'],['text','rectangle','text']]

      books.book['table'].render 'tr.values>th.index', (()->@index()), 'left'
      books.book['table'].render 'tr.values>td.values', (()->@columns())
      books.book['table'].render 'tr.columns>th.columns', (()->[null, @columns()...]),  'up'
      books.book['table'].glue
        content:
          index: (index)=> books.book['table'].render 'tr.values>th.index'
          values: (values)=> books.book['table'].render 'tr.values > td.values', values
        browser:
          th.columns:
            click: (data)-> @sort data
            mouseon: (data)-> console.log data
 */

window.CoffeeTable = (function() {
  function CoffeeTable(contents, publishers, books) {
    if (contents == null) {
      contents = {};
    }
    if (publishers == null) {
      publishers = {};
    }
    if (books == null) {
      books = {};
    }
    this.content = new Content(contents);
    this.publisher = new Publisher(publishers);
    this.book = new InteractiveGraph('book', books, this.content, this.publisher);
  }

  CoffeeTable.prototype.version = '0.1.0';

  return CoffeeTable;

})();

CoffeeTable.Template = require('./book/template');

CoffeeTable.Interactive = require('./interactive');

CoffeeTable.InteractiveGraph = require('./interactive');

CoffeeTable.Publisher = Publisher;

window.books = new CoffeeTable({
  rectangle: {
    columns: ['x', 'y'],
    values: [[1, 2], [3, 8]]
  }
}, [['table', '#table'], ['text', '#text']], [['table', 'rectangle', 'table'], ['text', 'rectangle', 'text']]);

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./book/content":1,"./book/index":3,"./book/publisher":4,"./book/template":5,"./interactive":13,"./interactive/interactive_graph":14,"baobab":"baobab","d3":"d3"}],7:[function(require,module,exports){
var Baobab, DataSource, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Baobab = require("baobab");

Interactive = require('./index');

DataSource = require('./data');

Interactive.ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource(values, columns) {
    this._cds = this.cursor.select('column_data_source');
    ColumnDataSource.__super__.constructor.call(this, values, columns);
    this.load(columns);
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
      return function(column) {

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


},{"./data":10,"./index":13,"baobab":"baobab","d3":"d3"}],8:[function(require,module,exports){
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

  function Column(columns) {
    this._columns = this.cursor.select('columns');
    this._columns.set(columns != null ? columns : []);
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
        var ref, ref1;
        if (Array.isArray(entry.value)) {

          /* do nothing */
        } else if ((ref = typeof entry.value) === 'object') {
          if (((ref1 = updated_state[entry.key]) != null ? ref1['hasDynamicPaths'] : void 0) != null) {
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

  function DataSource(values, columns) {
    this._values = this.cursor.select('values');
    this._values.set(values != null ? values : []);
    DataSource.__super__.constructor.call(this, columns);
  }

  return DataSource;

})(Row);

module.exports = Interactive.DataSource;


},{"./index":13,"./rows":15}],11:[function(require,module,exports){
var History, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Interactive = require('./index');

History = require('./history');

Interactive.Expression = (function(superClass) {
  extend(Expression, superClass);

  Expression.prototype.expression = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
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

  Expression.prototype.get = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this.cursor).get.apply(ref, args);
  };

  Expression.prototype.set = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
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


  /*
  @param [String] name The name of the table.
  @param [Array] values m lists of lists with n elements.  Represents a table or
  dataframe like object
  @param [Array] columns A list of column names for the corresponding values
  @param [Object] metadata An object with keys that are column names.  The keys
  can define arbitrary objects.
  @param [String] readme Some metadata about the table itself.
   */

  Interactive.prototype.name = function() {
    return this.cursor.get('name');
  };

  Interactive.prototype.readme = function() {
    return this.cursor.get('readme');
  };

  function Interactive(arg) {
    var columns, metadata, name, readme, values;
    name = arg.name, values = arg.values, columns = arg.columns, metadata = arg.metadata, readme = arg.readme;
    this.tree = new Baobab({
      name: name
    });
    this.cursor = this.tree.select(0);
    this._readme = this.cursor.select('readme');
    this._readme.set(readme != null ? readme : "");
    Interactive.__super__.constructor.call(this, values, columns, metadata);
    this.compute();
  }

  return Interactive;

})(Table);

module.exports = Interactive;


},{"./table":16,"baobab":"baobab"}],14:[function(require,module,exports){
var Baobab, Interactive, InteractiveGraph, Table, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Baobab = require('baobab');

d3 = require('d3');

Interactive = require('./index');

Table = require('./table');

InteractiveGraph = (function(superClass) {
  extend(InteractiveGraph, superClass);


  /*
  @param [String] name The name of the Interactive Graph.
  @param [Array] values m lists of lists with n elements.  Represents a table or
  dataframe like object
  @param [Array] columns A list of column names for the corresponding values
  @param [Object] metadata An object with keys that are column names.  The keys
  can define arbitrary objects.
  @param [String] readme Some metadata about the table itself.
   */

  function InteractiveGraph(name, edges, parent, child, columns) {
    var metadata;
    this.parent = parent;
    this.child = child;
    metadata = {};
    metadata[this.parent.name()] = {
      alias: "parent",
      description: "Parent Data Source to Child template"
    };
    metadata[this.child.name()] = {
      alias: "child",
      description: "Parent Data Source to Child template"
    };
    InteractiveGraph.__super__.constructor.call(this, {
      name: name,
      values: edges,
      columns: ['name', this.parent.name(), this.child.name()],
      metadata: metadata,
      readme: "A Connection between a Tabular Data Source and Template."
    });
    this._extend_column_data_source(metadata);
  }

  InteractiveGraph.prototype._extend_column_data_source = function(metadata) {
    var cds;
    this._column_data_source_monkey('parent', Baobab.monkey([this.parent.name()], function(value) {
      return value;
    }));
    cds = this._column_data_source_monkey('child', Baobab.monkey([this.child.name()], function(value) {
      return value;
    }), cds);
    return this.stage(cds);
  };

  return InteractiveGraph;

})(Interactive);

module.exports = InteractiveGraph;


},{"./index":13,"./table":16,"baobab":"baobab","d3":"d3"}],15:[function(require,module,exports){
var Baobab, Column, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Baobab = require('baobab');

Interactive = require('./index');

Column = require('./columns');

Interactive.Row = (function(superClass) {
  extend(Row, superClass);

  Row.prototype.length = function() {
    return this.cursor.get('length');
  };

  Row.prototype.index = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this._index).get.apply(ref, args);
  };

  function Row(columns) {
    this._index = this.cursor.select('index');
    this._length = this.cursor.select('length');
    this._length.set('length', Baobab.monkey(['values'], function(values) {
      return values.length;
    }));
    this.stage(this._column_data_source_monkey('index', Baobab.monkey(['index'], function(index) {
      return index;
    })));
    Row.__super__.constructor.call(this, columns);
  }

  Row.prototype.iloc = function() {};

  Row.prototype.loc = function() {};

  Row.prototype.update = function() {};

  return Row;

})(Column);

module.exports = Interactive.Row;


},{"./columns":8,"./index":13,"baobab":"baobab"}],16:[function(require,module,exports){
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

  function Table(values, columns, metadata) {
    this._metadata = this.cursor.select('metadata');
    this._metadata.set(metadata);
    Table.__super__.constructor.call(this, values, columns);
  }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9vay9jb250ZW50LmNvZmZlZSIsInNyYy9ib29rL2VkaXRvci5jb2ZmZWUiLCJzcmMvYm9vay9pbmRleC5jb2ZmZWUiLCJzcmMvYm9vay9wdWJsaXNoZXIuY29mZmVlIiwic3JjL2Jvb2svdGVtcGxhdGUuY29mZmVlIiwic3JjL2NvZmZlZXRhYmxlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb2x1bW5fZGF0YV9zb3VyY2UuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbnMuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbXB1dGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2RhdGEuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2V4cHJlc3Npb24uY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2hpc3RvcnkuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2luZGV4LmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9pbnRlcmFjdGl2ZV9ncmFwaC5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvcm93cy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvdGFibGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSw2QkFBQTtFQUFBOzs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSOztBQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLHNCQUFSOzs7QUFFZDs7Ozs7QUFJTSxJQUFJLENBQUM7OztvQkFDVCxXQUFBLEdBQWE7O29CQUNiLFFBQUEsR0FBVSxDQUFDLE1BQUQ7O29CQUNWLFNBQUEsR0FDRTtJQUFBLEtBQUEsRUFBTyxxQ0FBUDs7O29CQUNGLE9BQUEsR0FBUzs7RUFFSSxpQkFB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VUFBZjtJQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLFFBQWY7SUFDQSx1Q0FBTSxNQUFOLEVBQWMsT0FBZDtFQUpXOzs7O0dBTGlCOztBQVdoQyxXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxJQUFuQixHQUNFO0VBQUEsTUFBQSxFQUFRLFNBQUEsR0FBQSxDQUFSO0VBQ0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUROO0VBRUEsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUZOO0VBR0EsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUhOO0VBSUEsTUFBQSxFQUFRLFNBQUEsR0FBQSxDQUpSO0VBS0EsR0FBQSxFQUFLLFNBQUEsR0FBQSxDQUxMOzs7QUFPRixXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxTQUFuQixHQUErQixTQUFBLEdBQUE7O0FBQy9CLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLE9BQW5CLEdBQThCLFNBQUEsR0FBQTs7QUFFOUIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImQzID0gcmVxdWlyZSAnZDMnXG5Cb29rID0gcmVxdWlyZSAnLi9pbmRleCdcbkVkaXRvciA9IHJlcXVpcmUgJy4vZWRpdG9yJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZS9pbmRleCdcblxuIyMjXG5Db250ZW50IGlzIGEgY29sbGVjdGlvbiBvZiBJbnRlcmFjdGl2ZSBUYWJ1bGFyIGRhdGEgc291cmNlcy4gIENvbnRlbnRcbmNhbiBiZSBjb25zdW1lZCBieSBhIHB1Ymxpc2hlci5cbiMjI1xuY2xhc3MgQm9vay5Db250ZW50IGV4dGVuZHMgSW50ZXJhY3RpdmVcbiAgX2Jhc2VfY2xhc3M6IEludGVyYWN0aXZlXG4gIF9jb2x1bW5zOiBbJ25hbWUnXVxuICBfbWV0YWRhdGE6XG4gICAgYWxpYXM6IFwiVGhlIG5hbWUgb2YgVGFidWxhciBkYXRhIGluIHRoZSBTUEFcIlxuICBfcmVhZG1lOiBcIlwiXG5cbiAgY29uc3RydWN0b3I6IChlbnRyaWVzKS0+XG4gICAgc3VwZXJcbiAgICAgIG5hbWU6ICdjb250ZW50J1xuICAgICAgdmFsdWVzOiBkMy5rZXlzKGVudHJpZXMpLm1hcCgodiktPlt2XSlcbiAgICAgIGNvbHVtbnM6IEBfY29sdW1uc1xuICAgICAgbWV0YWRhdGE6IEBfbWV0YWRhdGFcbiAgICAgIHJlYWRtZTogQF9yZWFkbWVcblxuICAgIGQzLmVudHJpZXMoZW50cmllcykuZm9yRWFjaCAoe2tleSx2YWx1ZX0pPT5cbiAgICAgIHZhbHVlWyduYW1lJ10gPSBrZXlcbiAgICAgIEBba2V5XSA9IG5ldyBJbnRlcmFjdGl2ZSB2YWx1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2suQ29udGVudFxuIiwiZDMgPSByZXF1aXJlICdkMydcbkJvb2sgPSByZXF1aXJlICcuL2luZGV4J1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZS9pbmRleCdcblxuIyMjXG5NYW5hZ2VyIGF0dGFjaGVzIGtleWVkIHRhYmxlcyBhbmQgc2VsZWN0aW9ucyB0byB0aGUgUHVibGlzaGVyLCBDb250ZW50LCBhbmQgQm9va1xuIyMjXG5jbGFzcyBCb29rLkVkaXRvciBleHRlbmRzIEludGVyYWN0aXZlXG4gIGRpcjogKCktPiBAY29sdW1uX2RhdGFfc291cmNlIEBpbmRleF9jb2x1bW5cbiAgY29uc3RydWN0b3I6IChAX3ZhbHVlcyxAX25hbWUpLT5cbiAgICBzdXBlclxuICAgICAgY29sdW1uczogQF9jb2x1bW5zXG4gICAgICB2YWx1ZXM6IEBfdmFsdWVzID8gW11cbiAgICAgIG1ldGFkYXRhOiBAX21ldGFkYXRhXG4gICAgICByZWFkbWU6IEBfcmVhZG1lXG4gICAgICBuYW1lOiBAX25hbWVcblxuICByZWdpc3RlcjogKCBuYW1lLCB2YWx1ZSApLT5cbiAgICBAW25hbWVdID0gbmV3IEBfYmFzZV9jbGFzcyB2YWx1ZSwgbmFtZVxuICAgIEBfdmFsdWVzLnB1c2ggW25hbWVdXG4gICAgQFtuYW1lXVxuICB1bnJlZ2lzdGVyOiAoIG5hbWUgKS0+XG4gIGNvbW1pdDogLT5cblxubW9kdWxlLmV4cG9ydHMgPSBCb29rLkVkaXRvclxuIiwiZDMgPSByZXF1aXJlICdkMydcbkVkaXRvciA9IHJlcXVpcmUgJy4vZWRpdG9yJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZS9pbmRleCdcbiMjI1xuQSBCb29rIHVzZXMgUHVibGlzaGVycyB0byBjcmVhdGUgVGVtcGxhdGVzIHRoYXQgam9pbiB0byBzdWJzZXRzIG9mIENvbnRlbnQuICBUaGVcbkJvb2sgbWFuYWdlciBpcyByZXNwb25zaWJsZSBmb3IgbmVhcmx5IGFsbCBvZiB0aGUgY29udGVudC5cblxuYGBgXG50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZSB7fVxudGFibGUuYm9va3MucmVnaXN0ZXIgJyN0YWJsZScsXG4gIGNvbHVtbnM6IFtcbiAgICBbJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICBdXG4gIHZhbHVlczogW1xuICAgIFsnI3RhYmxlJywnI3RhYmxlJ11cbiAgXVxudGFibGUuYm9va1snI3RhYmxlJ10udHJlZVxudGFibGUuYm9va1snI3RhYmxlJ10uY3Vyc29yXG50YWJsZS5ib29rWycjdGFibGUnXS5jb2x1bW5fZGF0YV9zb3VyY2VcbnRhYmxlLmJvb2tbJyN0YWJsZSddLnNlbGVjdGlvbi5fX2RhdGFfXyAjIGlzIHNvbWUgZGF0YSBhcHBlbmRlZCB0byB0aGUgc2VsZWN0aW9uIGZyb20gdGhlIHRyZWVcbmBgYFxuIyMjXG5jbGFzcyBCb29rIGV4dGVuZHMgRWRpdG9yXG4gIF9iYXNlX2NsYXNzOiBJbnRlcmFjdGl2ZVxuICBfY29sdW1uczogWydhbGlhcycsJ2NvbnRlbnQnLCdwdWJsaXNoZXInXVxuICBfbWV0YWRhdGE6XG4gICAgYWxpYXM6ICdBbGlhcyBvZiBCb29rIHRoYXQgY29ubmVjdHMgQ29udGVudCBhbmQgYSBQdWJsaXNoZXInXG4gIF9yZWFkbWU6ICcnXG5cbiAgY29uc3RydWN0b3I6ICh2YWx1ZXMpLT5cbiAgICBzdXBlciB2YWx1ZXNcbiAgICBkMy5yYW5nZShAbGVuZ3RoKCkpLmZvckVhY2ggKGkpPT5cbiAgICAgIEBbQF9jZHMuZ2V0KCdhbGlhcycsICd2YWx1ZXMnLCBpKV0gPVxuICAgICAgICBjb250ZW50OiBAY29udGVudFtAZ2V0ICdjb2x1bW5fZGF0YV9zb3VyY2UnLCAnY29udGVudCcsICd2YWx1ZXMnLCBpXVxuICAgICAgICBwdWJsaXNoZXI6IEBwdWJsaXNoZXJbQGdldCAnY29sdW1uX2RhdGFfc291cmNlJywgJ3B1Ymxpc2hlcicsICd2YWx1ZXMnLCBpXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQm9va1xuIiwiQm9vayA9IHJlcXVpcmUgJy4vaW5kZXgnXG5FZGl0b3IgPSByZXF1aXJlICcuL2VkaXRvcidcblRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZSdcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUvaW5kZXgnXG5cbiMjI1xuUHVibGlzaGVyIGlzIGEgc3VwZXJjaGFyZ2VkIGQzIHNlbGVjdGlvbi4gIEl0IGFkZHMgc29tZSBjb252aWVuY2UgZnVuY3Rpb25zIHRvXG5lbnRlciwgZXhpdCwgYW5kIHVwZGF0ZSBkYXRhLiAgQWxsIG9mIGQzIHRoZSBzZWxlY3Rpb24gbWV0aG9kcyBhcmUgZXhwb3NlZFxudG8gdGhlIHB1Ymxpc2hlclxuXG5gYGBcbnRhYmxlID0gbmV3IENvZmZlZVRhYmxlIHt9XG50ZW1wbGF0ZSA9IHRhYmxlLnB1Ymxpc2hlci5yZWdpc3RlciAnLmZvbyN0YWJsZSdcbnRlbXBsYXRlLnNlbGVjdGlvbi5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG50ZW1wbGF0ZS5odG1sKCkgPT0gXCJcIjxkaXYgY2xhc3M9XCJmb29cIiBpZD1cInRhYmxlXCI+PC9kaXY+XCJcIlwiXG5cbnRlbXBsYXRlLnJlbmRlciAndGFibGUnLCBbMV1cbnRlbXBsYXRlLnJlbmRlciAnZGl2LnRyLnZhbHVlcyA+IHRkJywgW1xuICBbMSwyXVxuICBbOCw3XVxuXVxuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLnZhbHVlcyA+IHRkJywgdGFibGUuY29udGVudFsnI3RhYmxlJ10udmFsdWVzKClcblxudGVtcGxhdGUucmVuZGVyICd0ci5jb2x1bW5zID4gdGgnLCBbXG4gIFswXVxuXSwgJ3VwJ1xuXG50ZW1wbGF0ZS5yZW5kZXIgJ3RyLmluZGV4ID4gdGgnLCBbXG4gIFtudWxsXVxuICBbMF1cbl0sICdsZWZ0J1xuYGBgXG4jIyNcblxuY2xhc3MgQm9vay5QdWJsaXNoZXIgZXh0ZW5kcyBJbnRlcmFjdGl2ZVxuICBfYmFzZV9jbGFzczogVGVtcGxhdGVcbiAgX21ldGFkYXRhOlxuICAgIG5hbWU6ICdOYW1lIG9mIHRoZSBQdWJsaXNoZXInXG4gICAgc2VsZWN0b3I6ICdDU1Mgc2VsZWN0b3IgdG8gcHVibGlzaGVyJ1xuICBfcmVhZG1lOiBcIlwiXG4gIGNvbnN0cnVjdG9yOiAodmFsdWUpLT5cbiAgICBzdXBlclxuICAgICAgbmFtZTogJ3B1Ymxpc2hlcidcbiAgICAgIHZhbHVlczogdmFsdWVcbiAgICAgIGNvbHVtbnM6IFsnbmFtZScsICdzZWxlY3RvciddXG4gICAgICBtZXRhZGF0YTogQF9tZXRhZGF0YVxuICAgICAgcmVhZG1lOiBAX3JlYWRtZVxuICAgIHZhbHVlLmZvckVhY2ggKGVudHJ5KT0+XG4gICAgICBAW2VudHJ5WzBdXSA9IG5ldyBUZW1wbGF0ZSBlbnRyeS4uLlxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCb29rLlB1Ymxpc2hlclxuIiwiZDMgPSByZXF1aXJlICdkMydcbkJvb2sgPSByZXF1aXJlICcuL2luZGV4J1xuXG4jIyNcbmBgYFxudGVtcGxhdGUuc2VsZWN0aW9uLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcbnRlbXBsYXRlLmh0bWwoKSA9PSBcIlwiPGRpdiBjbGFzcz1cImZvb1wiIGlkPVwidGFibGVcIj48L2Rpdj5cIlwiXCJcblxudGVtcGxhdGUucmVuZGVyICd0YWJsZScsIFsxXVxudGVtcGxhdGUucmVuZGVyICd0ci52YWx1ZXMgPiB0ZCcsIFtbMSwyXSxbOCw3XV1cbnRlbXBsYXRlLnJlbmRlciAndHIudmFsdWVzID4gdGQnLCB0YWJsZS5jb250ZW50WycjdGFibGUnXS52YWx1ZXMoKVxudGVtcGxhdGUucmVuZGVyICd0ci5jb2x1bW5zID4gdGgnLCBbWzBdXSwgJ3VwJ1xudGVtcGxhdGUucmVuZGVyICd0ci5pbmRleCA+IHRoJywgW1tudWxsXSxbMF1dLCAnbGVmdCdcbmBgYFxuIyMjXG5cbmNsYXNzIEJvb2suVGVtcGxhdGVcbiAgIyMjXG4gIEBwYXJhbSBbc3RyaW5nXSBzZWxlY3RvciBjc3Mgc2VsZWN0b3IgYSBET00gbm9kZVxuICAjIyNcbiAgY29uc3RydWN0b3I6IChAbmFtZSwgQHNlbGVjdG9yLCBkYXRhPVtdKS0+XG4gICAgQF9pbnRvX3NlbGVjdGlvbiBkMy5zZWxlY3QoJ2JvZHknKSwgQHNlbGVjdG9yLCBkYXRhXG4gICAgQHNlbGVjdGlvbiA9IGQzLnNlbGVjdEFsbCBAc2VsZWN0b3JcblxuICAjIyNcbiAgQHBhcmFtIFtzdHJpbmddIHNlbGVjdG9ycyB0YWdOYW1lLmNsYXNzTmFtZTEuY2xhc3NOYW1lMiNpZFxuICBAcGFyYW0gW29iamVjdF0gZGF0YSBuZXN0ZWQgYXJyYXlzXG4gIEBwYXJhbSBbc3RyaW5nXSBkaXJlY3Rpb24gYXBwZW5kIGFmdGVyIHRoZSBsYXN0IGNoaWxkXG4gICMjI1xuICByZW5kZXI6IChzZWxlY3RvcnMsIGRhdGEsIGRpcmVjdGlvbiktPlxuICAgIGZpcnN0X3NlbGVjdGlvbiA9IEBfaW50b19zZWxlY3Rpb24gQHNlbGVjdGlvbiwgc2VsZWN0b3JzLCBkYXRhLCBkaXJlY3Rpb25cbiAgICBuZXcgQm9vay5UZW1wbGF0ZSBmaXJzdF9zZWxlY3Rpb25cblxuICBfaW50b19zZWxlY3Rpb246IChzZWxlY3Rpb24sIHNlbGVjdG9ycywgZGF0YSwgZGlyZWN0aW9uPSdkb3duJywgZmlyc3Rfc2VsZWN0aW9uPW51bGwpLT5cbiAgICBbc2VsZWN0b3IsIHNlbGVjdG9ycy4uLl0gPSBzZWxlY3RvcnMuc3BsaXQgJz4nXG4gICAgW3RhZywgY2xhc3Nlcy4uLiwgbGFzdF9jbGFzc10gPSBzZWxlY3Rvci5zcGxpdCgnLicpXG4gICAgaWYgbGFzdF9jbGFzcz9cbiAgICAgIFtsYXN0X2NsYXNzLCBpZF0gPSBsYXN0X2NsYXNzLnNwbGl0ICcjJ1xuICAgIGVsc2VcbiAgICAgIFt0YWcsIGlkXSA9IHRhZy5zcGxpdCAnIydcbiAgICAgIGlmIHRhZy5sZW5ndGggPT0gMCB0aGVuIHRhZyA9IG51bGxcbiAgICB0YWcgPz0gJ2RpdidcbiAgICBpZCA/PSBudWxsXG4gICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLnNlbGVjdEFsbCBzZWxlY3RvclxuICAgICAgLmRhdGEgZGF0YVxuICAgIGZpcnN0X3NlbGVjdGlvbiA/PSBzZWxlY3Rpb25cbiAgICBpZiBkaXJlY3Rpb24gaW4gWydkb3duJywncmlnaHQnXVxuICAgICAgc2VsZWN0aW9uLmVudGVyKCkuYXBwZW5kIHRhZ1xuICAgIGVsc2UgaWYgZGlyZWN0aW9uIGluIFsndXAnLCdsZWZ0J11cbiAgICAgIHNlbGVjdGlvbi5lbnRlcigpLmluc2VydCB0YWcsICc6Zmlyc3QtY2hpbGQnXG4gICAgZm9yIGNsYXNzX25hbWUgaW4gY2xhc3Nlc1xuICAgICAgc2VsZWN0aW9uLmNsYXNzZWQgY2xhc3NfbmFtZSwgdHJ1ZVxuICAgIGlmIGlkPyB0aGVuIHNlbGVjdGlvbi4gYXR0ciAnaWQnLCBpZFxuICAgICMjIyBJIGFtIHVuc3VyZSB3aGVyZSB0aGlzIHNob3VsZCBiZSBwbGFjZWQgIyMjXG4gICAgc2VsZWN0aW9uLmV4aXQoKS5yZW1vdmUoKVxuXG4gICAgaWYgc2VsZWN0b3JzLmxlbmd0aCA+IDFcbiAgICAgIHNlbGVjdGlvbi5mb3JFYWNoIChfZGF0YSk9PlxuICAgICAgICBAX2ludG9fc2VsZWN0aW9uIGQzLnNlbGVjdChAKSwgc2VsZWN0b3JzLmpvaW4oJz4nKSwgX2RhdGEsIGZpcnN0X3NlbGVjdGlvblxuXG4gICAgZmlyc3Rfc2VsZWN0aW9uXG5cbm1vZHVsZS5leHBvcnRzID0gQm9vay5UZW1wbGF0ZVxuIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5kMyA9IHJlcXVpcmUgXCJkM1wiXG5QdWJsaXNoZXIgPSAgcmVxdWlyZSAnLi9ib29rL3B1Ymxpc2hlcidcbkNvbnRlbnQgPSAgcmVxdWlyZSAnLi9ib29rL2NvbnRlbnQnXG5Cb29rID0gIHJlcXVpcmUgJy4vYm9vay9pbmRleCdcbkludGVyYWN0aXZlR3JhcGggPSAgcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZS9pbnRlcmFjdGl2ZV9ncmFwaCdcbiMjI1xuaW50ZXJhY3RpdmUgdGFidWxhciBkYXRhLCBvcHRpbWl6ZWQgZm9yIHRoZSBicm93c2VyXG5cbkBleGFtcGxlIEEgY29tcGxldGUgZXhhbXBsZS5cbiAgICAgIGQzLnNlbGVjdCgnYm9keScpLmh0bWwoJycpLmFwcGVuZCgnZGl2JykuYXR0ciAnaWQnLCd0YWJsZSdcbiAgICAgIGQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnZGl2JykuYXBwZW5kKCdzcGFuJykuYXR0ciAnaWQnLCd0ZXh0J1xuXG4gICAgICBib29rcyA9IG5ldyBDb2ZmZWVUYWJsZVxuICAgICAgICAgIHJlY3RhbmdsZTpcbiAgICAgICAgICAgIGNvbHVtbnM6IFsneCcsICd5J11cbiAgICAgICAgICAgIHZhbHVlczogW1sxLCAyXSxbMywgOF1dXG4gICAgICAgICwgW1sndGFibGUnLCcjdGFibGUnXSxbJ3RleHQnLCcjdGV4dCddXVxuICAgICAgICAsIFtbJ3RhYmxlJywncmVjdGFuZ2xlJywndGFibGUnXSxbJ3RleHQnLCdyZWN0YW5nbGUnLCd0ZXh0J11dXG5cbiAgICAgIGJvb2tzLmJvb2tbJ3RhYmxlJ10ucmVuZGVyICd0ci52YWx1ZXM+dGguaW5kZXgnLCAoKCktPkBpbmRleCgpKSwgJ2xlZnQnXG4gICAgICBib29rcy5ib29rWyd0YWJsZSddLnJlbmRlciAndHIudmFsdWVzPnRkLnZhbHVlcycsICgoKS0+QGNvbHVtbnMoKSlcbiAgICAgIGJvb2tzLmJvb2tbJ3RhYmxlJ10ucmVuZGVyICd0ci5jb2x1bW5zPnRoLmNvbHVtbnMnLCAoKCktPltudWxsLCBAY29sdW1ucygpLi4uXSksICAndXAnXG4gICAgICBib29rcy5ib29rWyd0YWJsZSddLmdsdWVcbiAgICAgICAgY29udGVudDpcbiAgICAgICAgICBpbmRleDogKGluZGV4KT0+IGJvb2tzLmJvb2tbJ3RhYmxlJ10ucmVuZGVyICd0ci52YWx1ZXM+dGguaW5kZXgnXG4gICAgICAgICAgdmFsdWVzOiAodmFsdWVzKT0+IGJvb2tzLmJvb2tbJ3RhYmxlJ10ucmVuZGVyICd0ci52YWx1ZXMgPiB0ZC52YWx1ZXMnLCB2YWx1ZXNcbiAgICAgICAgYnJvd3NlcjpcbiAgICAgICAgICB0aC5jb2x1bW5zOlxuICAgICAgICAgICAgY2xpY2s6IChkYXRhKS0+IEBzb3J0IGRhdGFcbiAgICAgICAgICAgIG1vdXNlb246IChkYXRhKS0+IGNvbnNvbGUubG9nIGRhdGFcblxuXG4jIyNcbmNsYXNzIHdpbmRvdy5Db2ZmZWVUYWJsZVxuICAjIENvbnN0cnVjdCBhIGNvbGxlY3Rpb24gb2YgQ29mZmVlVGFibGUgYm9va3MuXG4gICMgQHBhcmFtIFtPYmplY3RdIGNvbnRlbnQgY29udGFpbnMgbWFueSBUYWJ1bGFyIGRhdGFzZXRzXG4gICMgQHBhcmFtIFtPYmplY3RdIHB1Ymxpc2hlciBjb250YWlucyBtYW55IERPTSBzZWxlY3Rpb25zXG4gICMgQHBhcmFtIFtPYmplY3RdIGJvb2sgdXNlIHB1Ymxpc2hlcnMgdG8gcHJlc2VudCBhbmQgdXBkYXRlIGNvbnRlZW50XG4gIGNvbnN0cnVjdG9yOiAoY29udGVudHM9e30sIHB1Ymxpc2hlcnM9e30sIGJvb2tzPXt9KS0+XG4gICAgQGNvbnRlbnQgPSBuZXcgQ29udGVudCBjb250ZW50c1xuICAgIEBwdWJsaXNoZXIgPSBuZXcgUHVibGlzaGVyIHB1Ymxpc2hlcnNcbiAgICBAYm9vayA9IG5ldyBJbnRlcmFjdGl2ZUdyYXBoICdib29rJywgYm9va3MsIEBjb250ZW50LCBAcHVibGlzaGVyXG4gIHZlcnNpb246ICcwLjEuMCdcblxuQ29mZmVlVGFibGUuVGVtcGxhdGUgPSByZXF1aXJlICcuL2Jvb2svdGVtcGxhdGUnXG5Db2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5Db2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZUdyYXBoID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcbkNvZmZlZVRhYmxlLlB1Ymxpc2hlciA9IFB1Ymxpc2hlclxuXG53aW5kb3cuYm9va3MgPSBuZXcgQ29mZmVlVGFibGVcbiAgICByZWN0YW5nbGU6XG4gICAgICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gICAgICB2YWx1ZXM6IFtbMSwgMl0sWzMsIDhdXVxuICAsIFtbJ3RhYmxlJywnI3RhYmxlJ10sWyd0ZXh0JywnI3RleHQnXV1cbiAgLCBbWyd0YWJsZScsJ3JlY3RhbmdsZScsJ3RhYmxlJ10sWyd0ZXh0JywncmVjdGFuZ2xlJywndGV4dCddXVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb2ZmZWVUYWJsZVxuICBkM1xuICBCYW9iYWJcbn1cbiIsImQzID0gcmVxdWlyZSAnZDMnXG5CYW9iYWIgPSByZXF1aXJlIFwiYmFvYmFiXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkRhdGFTb3VyY2UgPSByZXF1aXJlICcuL2RhdGEnXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbkRhdGFTb3VyY2UgZXh0ZW5kcyBEYXRhU291cmNlXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zKS0+XG4gICAgQF9jZHMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1uX2RhdGFfc291cmNlJ1xuICAgIHN1cGVyIHZhbHVlcywgY29sdW1uc1xuICAgIEBsb2FkIGNvbHVtbnNcblxuICBsb2FkOiAoY29sdW1ucykgLT5cbiAgICBjb2x1bW5zID89IEBjb2x1bW5zKClcbiAgICAjIyMgSW5kZXggbW9ua2V5IGlzIGRlc3Ryb3llZCBvbiB0aGUgZmlyc3Qgb3BlcmF0aW9uICMjI1xuICAgIGNkcyA9IHt9XG4gICAgY29sdW1ucyA9IEFycmF5IGNvbHVtbnMuLi5cblxuICAgIGNvbHVtbnMuZm9yRWFjaCAoY29sdW1uKT0+XG4gICAgICAjIyMgQ3JlYXRlIER5bmFtaWMgTm9kZXMgZm9yIEVhY2ggQ29sdW1uIERhdGEgU291cmNlICMjI1xuICAgICAgY2RzID0gQF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5IGNvbHVtbiwgbnVsbCwgY2RzXG4gICAgQHN0YWdlIGNkc1xuXG4gIF9jb2x1bW5fbmFtZV9hcnJheTogKGNvbHVtbnMpLT4gaWYgbm90IEFycmF5LmlzQXJyYXkgY29sdW1ucyB0aGVuIFtjb2x1bW5zXSBlbHNlIGNvbHVtbnNcblxuICBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleTogKGNvbHVtbixtb25rZXksdG1wPXt9KS0+XG4gICAgdG1wWydjb2x1bW5fZGF0YV9zb3VyY2UnXSA/PSB7fVxuICAgIG1vbmtleSA/PSBCYW9iYWIubW9ua2V5IFsnY29sdW1ucyddLFsndmFsdWVzJ10sWycuJywnbmFtZSddLCAoY29sdW1ucyx2YWx1ZXMsY29sdW1uX25hbWUpLT5cbiAgICAgIGNvbHVtbl9pbmRleCA9IGNvbHVtbnMuaW5kZXhPZiBjb2x1bW5fbmFtZVxuICAgICAgdmFsdWVzLm1hcCAocm93X3ZhbHVlcyktPiByb3dfdmFsdWVzW2NvbHVtbl9pbmRleF1cbiAgICB0bXBbJ2NvbHVtbl9kYXRhX3NvdXJjZSddW2NvbHVtbl0gPVxuICAgICAgICBuYW1lOiBjb2x1bW5cbiAgICAgICAgdmFsdWVzOiBtb25rZXlcbiAgICB0bXBcblxuICBjb2x1bW5fZGF0YV9zb3VyY2U6IChjb2x1bW5zLGZvcmNlX2FycmF5PWZhbHNlKS0+XG5cbiAgICBjb2x1bW5zID0gQF9jb2x1bW5fbmFtZV9hcnJheSBjb2x1bW5zXG4gICAgaWYgY29sdW1ucy5sZW5ndGggPiAxIG9yIGZvcmNlX2FycmF5XG4gICAgICBkMy56aXAgY29sdW1ucy5tYXAoIChjKSA9PiBAX2Nkcy5nZXQoYywndmFsdWVzJykgKS4uLlxuICAgIGVsc2VcbiAgICAgIEBfY2RzLmdldChjb2x1bW5zWzBdLCd2YWx1ZXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtbkRhdGFTb3VyY2VcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAoY29sdW1ucyktPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICAgIEBfY29sdW1ucy5zZXQgY29sdW1ucyA/IFtdXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtblxuIiwiZDMgPSByZXF1aXJlIFwiZDNcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db21wdXRlXG4gIGNvbXB1dGU6ICgpLT5cbiAgICAjIyMgQ29tcHV0ZSBjaGFuZ2VzIHRoZSBzdGF0ZSBvZiB0aGUgZGF0YSB0cmVlICMjI1xuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICB0aGlzXG5cbiAgc3RhZ2U6IChuZXdfc3RhdGUsZXhwcmVzc2lvbj1udWxsKS0+XG5cbiAgICBbdXBkYXRlX3N0YXRlLCBtb25rZXlzXSA9IEBfc3BsaXRfdXBkYXRlX29iamVjdCBuZXdfc3RhdGVcbiAgICBAY3Vyc29yLmRlZXBNZXJnZSB1cGRhdGVfc3RhdGVcbiAgICBpZiBtb25rZXlzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtb25rZXkgaW4gbW9ua2V5c1xuICAgICAgICBAY3Vyc29yLnNldCBtb25rZXkucGF0aCwgbW9ua2V5LnZhbHVlXG4gICAgdGhpc1xuXG4gIF9zcGxpdF91cGRhdGVfb2JqZWN0OiAoIHVwZGF0ZWRfc3RhdGUsIHBhdGg9W10sIG1vbmtleXM9W10gKS0+XG4gICAgIyMjIFBydW5lIGFuZCBzZXQgdGhlIEJhb2JhYiBtb25rZXlzIGFuZCByZXR1cm4gb25seSB0aGUgdmFsdWVzIGNvbXBsaWFudCB3aXRoIGRlZXBNZXJnZSAjIyNcbiAgICBkMy5lbnRyaWVzIHVwZGF0ZWRfc3RhdGVcbiAgICAgICAgLmZvckVhY2ggKGVudHJ5KT0+XG4gICAgICAgICAgaWYgQXJyYXkuaXNBcnJheShlbnRyeS52YWx1ZSlcbiAgICAgICAgICAgICMjIyBkbyBub3RoaW5nICMjI1xuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mKGVudHJ5LnZhbHVlKSBpbiBbJ29iamVjdCddXG4gICAgICAgICAgICBpZiB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV0/WydoYXNEeW5hbWljUGF0aHMnXT9cbiAgICAgICAgICAgICAgbW9ua2V5cy5wdXNoXG4gICAgICAgICAgICAgICAgcGF0aDogW3BhdGguLi4sZW50cnkua2V5XVxuICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZVxuICAgICAgICAgICAgICBkZWxldGUgdXBkYXRlZF9zdGF0ZVtlbnRyeS5rZXldXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBfc3BsaXRfdXBkYXRlX29iamVjdCB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV0sIFtwYXRoLi4uLGVudHJ5LmtleV0sIG1vbmtleXNcbiAgICBbdXBkYXRlZF9zdGF0ZSxtb25rZXlzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbXB1dGVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcblJvdyA9IHJlcXVpcmUgJy4vcm93cydcblxuY2xhc3MgSW50ZXJhY3RpdmUuRGF0YVNvdXJjZSBleHRlbmRzIFJvd1xuICB2YWx1ZXM6IChhcmdzKS0+IEBfdmFsdWVzLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zKS0+XG4gICAgQF92YWx1ZXMgPSBAY3Vyc29yLnNlbGVjdCAndmFsdWVzJ1xuICAgIEBfdmFsdWVzLnNldCB2YWx1ZXMgPyBbXVxuICAgIHN1cGVyIGNvbHVtbnNcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5EYXRhU291cmNlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoYXJncy4uLiktPiBAX2V4cHJlc3Npb24uZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zLi4uKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCktPlxuICAgICAgaWYgZXhwcmVzc2lvbi5tZXRob2QgaW4gZDMua2V5cyBARXhwcmVzc2lvbi5wcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzLkV4cHJlc3Npb25bZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZSBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBwcm90b3R5cGVcbiAgICAgICAgY29tcHV0ZWRfc3RhdGUgPSB0aGlzW2V4cHJlc3Npb24ubWV0aG9kXSBleHByZXNzaW9uLmFyZ3MuLi5cbiAgICAgIGVsc2VcbiAgICAgICAgYXNzZXJ0IFwiI3tKU09OLnN0cmluZ2lmeSBleHByZXNzaW9uc30gaXMgbm90IHVuZGVyc3Rvb2QuXCJcbiAgICAgIEBzdGFnZSBjb21wdXRlZF9zdGF0ZVxuICAgICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MuLi4pLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzLi4uKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2NoZWNrcG9pbnQuc2V0IHt9XG4gICAgQF9leHByZXNzaW9uLnN0YXJ0UmVjb3JkaW5nIDIwXG4gICAgc3VwZXIoKVxuICBoaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uZ2V0SGlzdG9yeSgpXG4gIGNsZWFyX2hpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5jbGVhckhpc3RvcnkoKVxuICByZWNvcmQ6IChleHByZXNzaW9uKS0+XG4gICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkhpc3RvcnlcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcblRhYmxlID0gcmVxdWlyZSAnLi90YWJsZSdcblxuIyBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZXMgbWFuaXB1bGF0ZSB0YWJsZSBlZy4gYGBzb3J0YGAsYGB1bmlxdWVgYCxgYGZpbHRlcmBgLGBgbWFwYGAsIGBgZ3JvdXBieWBgLCBgYGpvaW5gYCAuXG4jIGBgQmFvYmFiYGAgdHJlZXMgYXJlIGludGVyYWN0aXZlIGFuZCBpbW11dGFibGUuICBUaGV5IG1hbmFnZSB0aGUgc3RhdGUgb2YgdGhlXG4jIHRhYnVsYXIgZGF0YS5cbiMgSW50ZXJhY3RpdmUgbWFpbnRhaW5zOlxuIyAqIFRhYmxlIG1ldGFkYXRhXG4jICogQ29sdW1uRGF0YVNvdXJjZXMgYGBjb2x1bW5fZGF0YV9zb3VyY2VgYCBhbmQgUm93IERhdGFTb3VyY2UgYGB2YWx1ZXNgYFxuIyAqIGBgSGlzdG9yeWBgIG9mIHRoZSBjb21wdXRlIGFwcGxpZWQgdG8gdGhlIHRhYmxlLlxuIyBAZXhhbXBsZSBjcmVhdGUgYSBuZXcgSW50ZXJhY3RpdmUgRGF0YSBTb3VyY2VcbiMgICB0YWJsZSA9IG5ldyBJbnRlcmFjdGl2ZVxuIyAgICAgY29sdW1uczogW1xuIyAgICAgICAneCdcbiMgICAgICAgJ3knXG4jICAgICBdXG4jICAgICB2YWx1ZXM6IFtcbiMgICAgICAgWzEsIDJdXG4jICAgICAgIFszLCA4XVxuIyAgICAgXVxuIyAgICAgbWV0YWRhdGE6XG4jICAgICAgIHg6IHt1bml0czonaW5jaCcsYWxpYXM6J2xlbmd0aCBvZiByZWN0YW5nbGUnfVxuIyAgICAgICB5OiB7dW5pdHM6J2luY2gnLGFsaWFzOid3aWR0aCBvZiByZWN0YW5nbGUnfVxuY2xhc3MgSW50ZXJhY3RpdmUgZXh0ZW5kcyBUYWJsZVxuICByZWFkbWU6IC0+IEBfcmVhZG1lLmdldCgpXG4gICMjI1xuICBAcGFyYW0gW1N0cmluZ10gbmFtZSBUaGUgbmFtZSBvZiB0aGUgdGFibGUuXG4gIEBwYXJhbSBbQXJyYXldIHZhbHVlcyBtIGxpc3RzIG9mIGxpc3RzIHdpdGggbiBlbGVtZW50cy4gIFJlcHJlc2VudHMgYSB0YWJsZSBvclxuICBkYXRhZnJhbWUgbGlrZSBvYmplY3RcbiAgQHBhcmFtIFtBcnJheV0gY29sdW1ucyBBIGxpc3Qgb2YgY29sdW1uIG5hbWVzIGZvciB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAgQHBhcmFtIFtPYmplY3RdIG1ldGFkYXRhIEFuIG9iamVjdCB3aXRoIGtleXMgdGhhdCBhcmUgY29sdW1uIG5hbWVzLiAgVGhlIGtleXNcbiAgY2FuIGRlZmluZSBhcmJpdHJhcnkgb2JqZWN0cy5cbiAgQHBhcmFtIFtTdHJpbmddIHJlYWRtZSBTb21lIG1ldGFkYXRhIGFib3V0IHRoZSB0YWJsZSBpdHNlbGYuXG5cbiAgIyMjXG4gIG5hbWU6ICgpLT4gQGN1cnNvci5nZXQgJ25hbWUnXG4gIHJlYWRtZTogKCktPiBAY3Vyc29yLmdldCAncmVhZG1lJ1xuICBjb25zdHJ1Y3RvcjogKHtuYW1lLCB2YWx1ZXMsIGNvbHVtbnMsIG1ldGFkYXRhLCByZWFkbWV9KS0+XG4gICAgQHRyZWUgPSBuZXcgQmFvYmFiXG4gICAgICBuYW1lOiBuYW1lXG4gICAgQGN1cnNvciA9IEB0cmVlLnNlbGVjdCAwXG4gICAgQF9yZWFkbWUgPSBAY3Vyc29yLnNlbGVjdCAncmVhZG1lJ1xuICAgIEBfcmVhZG1lLnNldCByZWFkbWUgPyBcIlwiXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zLCBtZXRhZGF0YVxuICAgIEBjb21wdXRlKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuZDMgPSByZXF1aXJlICdkMydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcblRhYmxlID0gcmVxdWlyZSAnLi90YWJsZSdcblxuIyBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZXMgbWFuaXB1bGF0ZSB0YWJsZSBlZy4gYGBzb3J0YGAsYGB1bmlxdWVgYCxgYGZpbHRlcmBgLGBgbWFwYGAsIGBgZ3JvdXBieWBgLCBgYGpvaW5gYCAuXG4jIGBgQmFvYmFiYGAgdHJlZXMgYXJlIGludGVyYWN0aXZlIGFuZCBpbW11dGFibGUuICBUaGV5IG1hbmFnZSB0aGUgc3RhdGUgb2YgdGhlXG4jIHRhYnVsYXIgZGF0YS5cbiMgSW50ZXJhY3RpdmUgbWFpbnRhaW5zOlxuIyAqIFRhYmxlIG1ldGFkYXRhXG4jICogQ29sdW1uRGF0YVNvdXJjZXMgYGBjb2x1bW5fZGF0YV9zb3VyY2VgYCBhbmQgUm93IERhdGFTb3VyY2UgYGB2YWx1ZXNgYFxuIyAqIGBgSGlzdG9yeWBgIG9mIHRoZSBjb21wdXRlIGFwcGxpZWQgdG8gdGhlIHRhYmxlLlxuIyBAZXhhbXBsZSBjcmVhdGUgYSBuZXcgSW50ZXJhY3RpdmUgRGF0YSBTb3VyY2VcbiMgICB0YWJsZSA9IG5ldyBJbnRlcmFjdGl2ZVxuIyAgICAgY29sdW1uczogW1xuIyAgICAgICAneCdcbiMgICAgICAgJ3knXG4jICAgICBdXG4jICAgICB2YWx1ZXM6IFtcbiMgICAgICAgWzEsIDJdXG4jICAgICAgIFszLCA4XVxuIyAgICAgXVxuIyAgICAgbWV0YWRhdGE6XG4jICAgICAgIHg6IHt1bml0czonaW5jaCcsYWxpYXM6J2xlbmd0aCBvZiByZWN0YW5nbGUnfVxuIyAgICAgICB5OiB7dW5pdHM6J2luY2gnLGFsaWFzOid3aWR0aCBvZiByZWN0YW5nbGUnfVxuY2xhc3MgSW50ZXJhY3RpdmVHcmFwaCBleHRlbmRzIEludGVyYWN0aXZlXG4gICMjI1xuICBAcGFyYW0gW1N0cmluZ10gbmFtZSBUaGUgbmFtZSBvZiB0aGUgSW50ZXJhY3RpdmUgR3JhcGguXG4gIEBwYXJhbSBbQXJyYXldIHZhbHVlcyBtIGxpc3RzIG9mIGxpc3RzIHdpdGggbiBlbGVtZW50cy4gIFJlcHJlc2VudHMgYSB0YWJsZSBvclxuICBkYXRhZnJhbWUgbGlrZSBvYmplY3RcbiAgQHBhcmFtIFtBcnJheV0gY29sdW1ucyBBIGxpc3Qgb2YgY29sdW1uIG5hbWVzIGZvciB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAgQHBhcmFtIFtPYmplY3RdIG1ldGFkYXRhIEFuIG9iamVjdCB3aXRoIGtleXMgdGhhdCBhcmUgY29sdW1uIG5hbWVzLiAgVGhlIGtleXNcbiAgY2FuIGRlZmluZSBhcmJpdHJhcnkgb2JqZWN0cy5cbiAgQHBhcmFtIFtTdHJpbmddIHJlYWRtZSBTb21lIG1ldGFkYXRhIGFib3V0IHRoZSB0YWJsZSBpdHNlbGYuXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKG5hbWUsIGVkZ2VzLCBAcGFyZW50LCBAY2hpbGQsIGNvbHVtbnMpLT5cbiAgICBtZXRhZGF0YSA9IHt9XG4gICAgbWV0YWRhdGFbQHBhcmVudC5uYW1lKCldID1cbiAgICAgIGFsaWFzOiBcInBhcmVudFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJQYXJlbnQgRGF0YSBTb3VyY2UgdG8gQ2hpbGQgdGVtcGxhdGVcIlxuICAgIG1ldGFkYXRhW0BjaGlsZC5uYW1lKCldID1cbiAgICAgIGFsaWFzOiBcImNoaWxkXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhcmVudCBEYXRhIFNvdXJjZSB0byBDaGlsZCB0ZW1wbGF0ZVwiXG4gICAgc3VwZXJcbiAgICAgIG5hbWU6IG5hbWVcbiAgICAgIHZhbHVlczogZWRnZXNcbiAgICAgIGNvbHVtbnM6IFsnbmFtZScsQHBhcmVudC5uYW1lKCksQGNoaWxkLm5hbWUoKV1cbiAgICAgIG1ldGFkYXRhOiBtZXRhZGF0YVxuICAgICAgcmVhZG1lOiBcIkEgQ29ubmVjdGlvbiBiZXR3ZWVuIGEgVGFidWxhciBEYXRhIFNvdXJjZSBhbmQgVGVtcGxhdGUuXCJcbiAgICBAX2V4dGVuZF9jb2x1bW5fZGF0YV9zb3VyY2UgbWV0YWRhdGFcblxuICBfZXh0ZW5kX2NvbHVtbl9kYXRhX3NvdXJjZTogKG1ldGFkYXRhKS0+XG5cbiAgICBAX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXkgJ3BhcmVudCcsIEJhb2JhYi5tb25rZXkgW0BwYXJlbnQubmFtZSgpXSwgKHZhbHVlKS0+IHZhbHVlXG4gICAgY2RzID0gQF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5ICdjaGlsZCcsIEJhb2JhYi5tb25rZXkoW0BjaGlsZC5uYW1lKCldLCAodmFsdWUpLT4gdmFsdWUpLCBjZHNcbiAgICBAc3RhZ2UgY2RzXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmVHcmFwaFxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuQ29sdW1uID0gcmVxdWlyZSAnLi9jb2x1bW5zJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Sb3cgZXh0ZW5kcyBDb2x1bW5cbiAgbGVuZ3RoOiAoKS0+IEBjdXJzb3IuZ2V0ICdsZW5ndGgnXG4gIGluZGV4OiAoYXJncy4uLiktPiBAX2luZGV4LmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAoY29sdW1ucyktPlxuICAgIEBfaW5kZXggPSBAY3Vyc29yLnNlbGVjdCAnaW5kZXgnXG4gICAgQF9sZW5ndGggPSBAY3Vyc29yLnNlbGVjdCAnbGVuZ3RoJ1xuICAgIEBfbGVuZ3RoLnNldCAnbGVuZ3RoJywgQmFvYmFiLm1vbmtleSBbJ3ZhbHVlcyddLCAodmFsdWVzKS0+IHZhbHVlcy5sZW5ndGhcbiAgICBAc3RhZ2UgQF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5ICdpbmRleCcsIEJhb2JhYi5tb25rZXkgWydpbmRleCddLCAoaW5kZXgpLT4gaW5kZXhcblxuICAgIHN1cGVyIGNvbHVtbnNcbiAgaWxvYzogIC0+XG4gIGxvYzogLT5cbiAgdXBkYXRlOiAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlJvd1xuIiwiZDMgPSByZXF1aXJlICdkMydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbHVtbkRhdGFTb3VyY2UgPSByZXF1aXJlICcuL2NvbHVtbl9kYXRhX3NvdXJjZSdcblxuIyBUYWJsZSBhc3NpZ25zIG1ldGFkYXRhIHRvIHRoZSBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuIyBBIHRhYmxlIGlzIGRlc2NyaWJlIGJ5OlxuIyAqIF92YWx1ZXNfIC0gQSBsaXN0IG9mIGxpc3RzIGNvbnRhaW5pbmcgdGhlIHJvdyBlbnRyaWVzIGluIHRoZSB0YWJsZS5cbiMgKiBfY29sdW1uc18gLSBUaGUgY29sdW1uIG5hbWVzIGluIHRoZSB0YWJsZSwgdGhlIGNvbHVtbiBuYW1lcyBtYXAgdGhlIGVudHJpZXMgaW4gZWFjaCByb3dcbiMgKiBfbWV0YWRhdGFfIC1cbiMgVGhlIHRhYmxlIGtleXMgIG5hbWluZyBpcyBpbnNwaXJlZCBieSBgYHBhbmRhcy5EYXRhRnJhbWUudG9fZGljdChvcmllbnQ9J3JlY29yZHMnKS5cblxuY2xhc3MgSW50ZXJhY3RpdmUuVGFibGUgZXh0ZW5kcyBDb2x1bW5EYXRhU291cmNlXG4gIG1ldGFkYXRhOiAoYXJncyktPiBAX21ldGFkYXRhLmdldCBhcmdzLi4uXG5cbiAgIyBAcGFyYW0gW1N0cmluZ10gZGF0YV9vcl91cmwgdXJsIHRvIGEganNvbiBlbmRwb2ludCBjb250YWluaW5nIHRoZSBrZXlzIGBgdmFsdWVzYGAsIGBgXG4gICMgQHBhcmFtIFtPYmplY3RdIGRhdGFfb3JfdXJsXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zLCBtZXRhZGF0YSktPlxuICAgICMjIFRoZSB0YWJsZSBjYW4gYmUgcmVuYW1lZCAjIyNcbiAgICBAX21ldGFkYXRhID0gQGN1cnNvci5zZWxlY3QgJ21ldGFkYXRhJ1xuICAgIEBfbWV0YWRhdGEuc2V0IG1ldGFkYXRhXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG5cbkludGVyYWN0aXZlLlRhYmxlOjpleHByID1cbiAgY29uY2F0OiAtPlxuICBoZWFkOiAtPlxuICB0YWlsOiAtPlxuICBzb3J0OiAtPlxuICBmaWx0ZXI6IC0+XG4gIG1hcDogLT5cblxuSW50ZXJhY3RpdmUuVGFibGU6OnRvX3N0cmluZyA9IC0+XG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fanNvbiA9ICAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iXX0=
