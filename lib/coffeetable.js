(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Book, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');


/*
table = new CoffeeTable
table.books.register
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


},{"./interactive":4,"./manager":13}],2:[function(require,module,exports){
var Baobab, Book, CoffeeTable, Content, Publisher, d3;

Baobab = require("baobab");

d3 = require("d3");

Publisher = require('./publisher');

Content = require('./content');

Book = require('./book');

CoffeeTable = (function() {
  function CoffeeTable(content, publishers, books) {
    if (content == null) {
      content = {};
    }
    if (publishers == null) {
      publishers = {};
    }
    if (books == null) {
      books = {};
    }
    this.content = new Content(content);
    this.publishers = new Publisher(publishers);
    this.books = new Book(books);
  }

  CoffeeTable.prototype.version = '0.1.0';

  return CoffeeTable;

})();

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./book":1,"./content":3,"./publisher":14,"baobab":"baobab","d3":"d3"}],3:[function(require,module,exports){
var Content, Interactive, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');

Interactive = require('./interactive');

Content = (function(superClass) {
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

module.exports = Content;


},{"./interactive":4,"./manager":13}],4:[function(require,module,exports){
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


},{"./interactive/table":12,"baobab":"baobab"}],5:[function(require,module,exports){
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


},{"../interactive":4,"./data":8,"baobab":"baobab"}],6:[function(require,module,exports){
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


},{"../interactive":4,"./expression":9}],7:[function(require,module,exports){
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


},{"../interactive":4,"d3":"d3"}],8:[function(require,module,exports){
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


},{"../interactive":4,"./rows":11}],9:[function(require,module,exports){
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


},{"../interactive":4,"./history":10}],10:[function(require,module,exports){
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


},{"../interactive":4,"./compute":7}],11:[function(require,module,exports){
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


},{"../interactive":4,"./columns":6}],12:[function(require,module,exports){
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


},{"../interactive":4,"./column_data_source":5,"d3":"d3"}],13:[function(require,module,exports){
var Interactive, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./interactive');

Manager = (function(superClass) {
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

module.exports = Manager;


},{"./interactive":4}],14:[function(require,module,exports){
var Manager, Publisher, Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');

Template = require('./template');

Publisher = (function(superClass) {
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

module.exports = Publisher;


},{"./manager":13,"./template":15}],15:[function(require,module,exports){
var Template, d3;

d3 = require('d3');

Template = (function() {

  /*
  @params [string] selector css selector a DOM node
   */
  function Template(selector) {
    this.selector = selector;
    this.selection = d3.selectAll(this.selector);
  }

  return Template;

})();

module.exports = Template;


},{"d3":"d3"}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9vay5jb2ZmZWUiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2NvbnRlbnQuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb2x1bW5fZGF0YV9zb3VyY2UuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbnMuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbXB1dGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2RhdGEuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2V4cHJlc3Npb24uY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2hpc3RvcnkuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3Jvd3MuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3RhYmxlLmNvZmZlZSIsInNyYy9tYW5hZ2VyLmNvZmZlZSIsInNyYy9wdWJsaXNoZXIuY29mZmVlIiwic3JjL3RlbXBsYXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsYUFBQTtFQUFBOzs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7OztBQUVWOzs7OztBQUlNOzs7aUJBQ0osV0FBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNBLGNBQUMsSUFBRCxFQUFNLFdBQU47QUFDWCxRQUFBOztNQURpQixjQUFZOzs7TUFDN0IsT0FBUTs7SUFDUixzQ0FDRTtNQUFBLE1BQUEsc0NBQXNCLENBQUMsRUFBRCxDQUF0QjtNQUNBLE9BQUEseUNBQXdCLENBQUMsU0FBRCxFQUFXLFdBQVgsQ0FEeEI7TUFFQSxRQUFBLDBDQUEwQjtRQUFBLEVBQUEsRUFDeEI7VUFBQSxXQUFBLEVBQWEsMkNBQWI7U0FEd0I7T0FGMUI7TUFJQSxNQUFBLEVBQVEsZ0NBSlI7S0FERjtJQU1BLFdBQVcsQ0FBQyxP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QUEsR0FBYTs7RUFDQSxtQkFBQyxJQUFELEVBQU0sV0FBTjtBQUNYLFFBQUE7O01BRGlCLGNBQVk7OztNQUM3QixPQUFROztJQUNSO0lBQ0EsMkNBQ0U7TUFBQSxNQUFBLHNDQUFzQixDQUFDLEVBQUQsQ0FBdEI7TUFDQSxPQUFBLHlDQUF3QixDQUFDLFVBQUQsQ0FEeEI7TUFFQSxRQUFBLDBDQUEwQjtRQUFBLEVBQUEsRUFDeEI7VUFBQSxXQUFBLEVBQWEsMkNBQWI7U0FEd0I7T0FGMUI7TUFJQSxNQUFBLEVBQVEsZ0NBSlI7S0FERjtJQU1BLFdBQVcsQ0FBQyxPQUFaLENBQW9CLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO2VBQ2xCLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBSyxDQUFDLElBQWhCLEVBQXNCLEtBQUssQ0FBQyxJQUE1QjtNQURrQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7RUFUVzs7OztHQUZTOztBQWN4QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2pCakIsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBRUM7O0FBQ0o7OztFQUdhLGtCQUFDLFFBQUQ7SUFBQyxJQUFDLENBQUEsV0FBRDtJQUNaLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFDLENBQUEsUUFBZDtFQURGOzs7Ozs7QUFHZixNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYW5hZ2VyID0gcmVxdWlyZSAnLi9tYW5hZ2VyJ1xuXG4jIyNcbnRhYmxlID0gbmV3IENvZmZlZVRhYmxlXG50YWJsZS5ib29rcy5yZWdpc3RlclxuIyMjXG5jbGFzcyBCb29rIGV4dGVuZHMgTWFuYWdlclxuICBfYmFzZV9jbGFzczogcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIHN1cGVyXG4gICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gWydjb250ZW50JywncHVibGlzaGVyJ11cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBuYW1lIG9mIGEgdGVtcGxhdGUgaW4gYW4gZW52aXJvbm1lbnQuXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2tcbiIsIkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuZDMgPSByZXF1aXJlIFwiZDNcIlxuUHVibGlzaGVyID0gIHJlcXVpcmUgJy4vcHVibGlzaGVyJ1xuQ29udGVudCA9ICByZXF1aXJlICcuL2NvbnRlbnQnXG5Cb29rID0gIHJlcXVpcmUgJy4vYm9vaydcblxuIyBpbnRlcmFjdGl2ZSB0YWJ1bGFyIGRhdGEsIG9wdGltaXplZCBmb3IgdGhlIGJyb3dzZXJcbiNcbiMgQGV4YW1wbGUgTGV0J3MgZ2V0IHN0YXJ0ZWRcbiMgICB0YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZVxuIyAgICAgY29sdW1uczogW1xuIyAgICAgICAneCdcbiMgICAgICAgJ3knXG4jICAgICBdXG4jICAgICB2YWx1ZXM6IFtcbiMgICAgICAgWzEsIDJdXG4jICAgICAgIFszLCA4XVxuIyAgICAgXVxuY2xhc3MgQ29mZmVlVGFibGVcbiAgIyBDb25zdHJ1Y3QgYSBuZXcgYW5pbWFsLlxuICAjXG4gICMgQHBhcmFtIFtPYmplY3RdIGNvbnRlbnQgY29udGFpbnMgbWFueSBUYWJ1bGFyIGRhdGFzZXRzXG4gICMgQHBhcmFtIFtPYmplY3RdIHB1Ymxpc2hlcnMgY29udGFpbnMgbWFueSBET00gc2VsZWN0aW9uc1xuICAjIEBwYXJhbSBbT2JqZWN0XSBib29rcyB1c2UgcHVibGlzaGVycyB0byBwcmVzZW50IGFuZCB1cGRhdGUgY29udGVlbnRcbiAgI1xuICBjb25zdHJ1Y3RvcjogKGNvbnRlbnQ9e30sIHB1Ymxpc2hlcnM9e30sIGJvb2tzPXt9KS0+XG4gICAgQGNvbnRlbnQgPSBuZXcgQ29udGVudCBjb250ZW50XG4gICAgQHB1Ymxpc2hlcnMgPSBuZXcgUHVibGlzaGVyIHB1Ymxpc2hlcnNcbiAgICBAYm9va3MgPSBuZXcgQm9vayBib29rc1xuXG4gIHZlcnNpb246ICcwLjEuMCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29mZmVlVGFibGVcbiAgZDNcbiAgQmFvYmFiXG59XG4iLCJNYW5hZ2VyID0gcmVxdWlyZSAnLi9tYW5hZ2VyJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2ludGVyYWN0aXZlJ1xuXG4jIENvbnRlbnQgaXMgYSBjb2xsZWN0aW9uIG9mIEludGVyYWN0aXZlIFRhYnVsYXIgZGF0YSBzb3VyY2VzLiAgQ29udGVudFxuIyBjYW4gYmUgY29uc3VtZWQgYnkgYSBwdWJsaXNoZXIuICBCb3RoIGRhdGEgYW5kIG1ldGFkYXRhIG9mIHRoZSB0YWJsZSBjYW5cbiMgYmUgaW5qZWN0ZWQgaW50byB0aGUgZG9tXG5jbGFzcyBDb250ZW50IGV4dGVuZHMgTWFuYWdlclxuICBfYmFzZV9jbGFzczogSW50ZXJhY3RpdmVcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgc3VwZXJcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiXG4gICAgICByZWFkbWU6IFwiSG93IGNhbiBJIGltcG9ydCBhIHJlYWRtZSBmaWxlXCJcbiAgICB0b19yZWdpc3Rlci5mb3JFYWNoICh2YWx1ZSk9PlxuICAgICAgQHJlZ2lzdGVyIHZhbHVlLm5hbWUsIHZhbHVlLmFyZ3NcblxubW9kdWxlLmV4cG9ydHMgPSBDb250ZW50XG4iLCJCYW9iYWIgPSByZXF1aXJlICdiYW9iYWInXG5UYWJsZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUvdGFibGUnXG5cbiMgSW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VzIG1hbmlwdWxhdGUgdGFibGUgZWcuIGBgc29ydGBgLGBgdW5pcXVlYGAsYGBmaWx0ZXJgYCxgYG1hcGBgLCBgYGdyb3VwYnlgYCwgYGBqb2luYGAgLlxuIyBgYEJhb2JhYmBgIHRyZWVzIGFyZSBpbnRlcmFjdGl2ZSBhbmQgaW1tdXRhYmxlLiAgVGhleSBtYW5hZ2UgdGhlIHN0YXRlIG9mIHRoZVxuIyB0YWJ1bGFyIGRhdGEuXG4jIEludGVyYWN0aXZlIG1haW50YWluczpcbiMgKiBUYWJsZSBtZXRhZGF0YVxuIyAqIENvbHVtbkRhdGFTb3VyY2VzIGBgY29sdW1uX2RhdGFfc291cmNlYGAgYW5kIFJvdyBEYXRhU291cmNlIGBgdmFsdWVzYGBcbiMgKiBgYEhpc3RvcnlgYCBvZiB0aGUgY29tcHV0ZSBhcHBsaWVkIHRvIHRoZSB0YWJsZS5cbiMgQGV4YW1wbGUgY3JlYXRlIGEgbmV3IEludGVyYWN0aXZlIERhdGEgU291cmNlXG4jICAgdGFibGUgPSBuZXcgSW50ZXJhY3RpdmVcbiMgICAgIGNvbHVtbnM6IFtcbiMgICAgICAgJ3gnXG4jICAgICAgICd5J1xuIyAgICAgXVxuIyAgICAgdmFsdWVzOiBbXG4jICAgICAgIFsxLCAyXVxuIyAgICAgICBbMywgOF1cbiMgICAgIF1cbiMgICAgIG1ldGFkYXRhOlxuIyAgICAgICB4OiB7dW5pdHM6J2luY2gnLGFsaWFzOidsZW5ndGggb2YgcmVjdGFuZ2xlJ31cbiMgICAgICAgeToge3VuaXRzOidpbmNoJyxhbGlhczond2lkdGggb2YgcmVjdGFuZ2xlJ31cbmNsYXNzIEludGVyYWN0aXZlIGV4dGVuZHMgVGFibGVcbiAgcmVhZG1lOiAtPiBAX3JlYWRtZS5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKGRhdGFfb3JfdXJsLCB0YWJsZV9uYW1lKS0+XG4gICAgQHRyZWUgPSBuZXcgQmFvYmFiIHt9XG4gICAgQGN1cnNvciA9IEB0cmVlLnNlbGVjdCAwXG4gICAgQF9yZWFkbWUgPSBAY3Vyc29yLnNlbGVjdCAncmVhZG1lJ1xuICAgIHN1cGVyIGRhdGFfb3JfdXJsLCB0YWJsZV9uYW1lXG4gICAgQGNvbXB1dGUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlXG4iLCJCYW9iYWIgPSByZXF1aXJlIFwiYmFvYmFiXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9kYXRhJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db2x1bW5EYXRhU291cmNlIGV4dGVuZHMgRGF0YVNvdXJjZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NkcyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5fZGF0YV9zb3VyY2UnXG4gICAgc3VwZXIoKVxuXG4gIGxvYWQ6IChjb2x1bW5zKSAtPlxuICAgICAgY29sdW1ucyA/PSBAY29sdW1ucygpXG4gICAgICAjIyMgSW5kZXggbW9ua2V5IGlzIGRlc3Ryb3llZCBvbiB0aGUgZmlyc3Qgb3BlcmF0aW9uICMjI1xuICAgICAgY2RzID0ge31cbiAgICAgIGNvbHVtbnMgPSBBcnJheSBjb2x1bW5zLi4uXG4gICAgICBjb2x1bW5zLmZvckVhY2ggKGNvbHVtbixjb2x1bW5faW5kZXgpPT5cbiAgICAgICAgIyMjIENyZWF0ZSBEeW5hbWljIE5vZGVzIGZvciBFYWNoIENvbHVtbiBEYXRhIFNvdXJjZSAjIyNcbiAgICAgICAgY2RzID0gQF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5IGNvbHVtbiwgbnVsbCwgY2RzXG4gICAgICBAc3RhZ2UgY2RzXG5cbiAgX2NvbHVtbl9uYW1lX2FycmF5OiAoY29sdW1ucyktPiBpZiBub3QgQXJyYXkuaXNBcnJheSBjb2x1bW5zIHRoZW4gW2NvbHVtbnNdIGVsc2UgY29sdW1uc1xuXG4gIF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5OiAoY29sdW1uLG1vbmtleSx0bXA9e30pLT5cbiAgICAgIHRtcFsnY29sdW1uX2RhdGFfc291cmNlJ10gPz0ge31cbiAgICAgIG1vbmtleSA/PSBCYW9iYWIubW9ua2V5IFsnY29sdW1ucyddLFsndmFsdWVzJ10sWycuJywnbmFtZSddLCAoY29sdW1ucyx2YWx1ZXMsY29sdW1uX25hbWUpLT5cbiAgICAgICAgICAgICAgY29sdW1uX2luZGV4ID0gY29sdW1ucy5pbmRleE9mIGNvbHVtbl9uYW1lXG4gICAgICAgICAgICAgIHZhbHVlcy5tYXAgKHJvd192YWx1ZXMpPT4gcm93X3ZhbHVlc1tjb2x1bW5faW5kZXhdXG4gICAgICB0bXBbJ2NvbHVtbl9kYXRhX3NvdXJjZSddW2NvbHVtbl0gPVxuICAgICAgICAgIG5hbWU6IGNvbHVtblxuICAgICAgICAgIHZhbHVlczogbW9ua2V5XG4gICAgICB0bXBcblxuICBjb2x1bW5fZGF0YV9zb3VyY2U6IChjb2x1bW5zLGZvcmNlX2FycmF5PWZhbHNlKS0+XG4gICAgY29sdW1ucyA9IEBfY29sdW1uX25hbWVfYXJyYXkgY29sdW1uc1xuICAgIGlmIGNvbHVtbnMubGVuZ3RoID4gMSBvciBmb3JjZV9hcnJheVxuICAgICAgZDMuemlwIGNvbHVtbnMubWFwKCAoYykgPT4gQF9jZHMuZ2V0KGMsJ3ZhbHVlcycpICkuLi5cbiAgICBlbHNlXG4gICAgICBAX2Nkcy5nZXQoY29sdW1uc1swXSwndmFsdWVzJylcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5EYXRhU291cmNlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuRXhwcmVzc2lvbiA9IHJlcXVpcmUgJy4vZXhwcmVzc2lvbidcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uIGV4dGVuZHMgRXhwcmVzc2lvblxuICBjb2x1bW5zOiAoYXJncyktPiBAX2NvbHVtbnMuZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9jb2x1bW5zID0gQGN1cnNvci5zZWxlY3QgJ2NvbHVtbnMnXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtblxuIiwiZDMgPSByZXF1aXJlIFwiZDNcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29tcHV0ZVxuICBjb21wdXRlOiAoKS0+XG4gICAgIyMjIENvbXB1dGUgY2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhlIGRhdGEgdHJlZSAjIyNcbiAgICBjb25zb2xlLmxvZyAxLFxuICAgICAgdmFsdWVzOiBAdmFsdWVzKClcbiAgICAgIGluZGV4OiBAaW5kZXgoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBAY29sdW1ucygpXG4gICAgICByZWFkbWU6IEByZWFkbWUoKVxuXG4gICAgQF9jaGVja3BvaW50LmRlZXBNZXJnZVxuICAgICAgdmFsdWVzOiBAdmFsdWVzKClcbiAgICAgIGluZGV4OiBAaW5kZXgoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBAY29sdW1ucygpXG4gICAgICByZWFkbWU6IEByZWFkbWUoKVxuICAgIHRoaXNcblxuICBzdGFnZTogKG5ld19zdGF0ZSxleHByZXNzaW9uPW51bGwpLT5cbiAgICBbdXBkYXRlX3N0YXRlLCBtb25rZXlzXSA9IEBfc3BsaXRfdXBkYXRlX29iamVjdCBuZXdfc3RhdGVcbiAgICBAY3Vyc29yLmRlZXBNZXJnZSB1cGRhdGVfc3RhdGVcbiAgICBpZiBtb25rZXlzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBtb25rZXkgaW4gbW9ua2V5c1xuICAgICAgICBAY3Vyc29yLnNldCBtb25rZXkucGF0aCwgbW9ua2V5LnZhbHVlXG4gICAgdGhpc1xuXG4gIF9zcGxpdF91cGRhdGVfb2JqZWN0OiAoIHVwZGF0ZWRfc3RhdGUsIHBhdGg9W10sIG1vbmtleXM9W10gKS0+XG4gICAgIyMjIFBydW5lIGFuZCBzZXQgdGhlIEJhb2JhYiBtb25rZXlzIGFuZCByZXR1cm4gb25seSB0aGUgdmFsdWVzIGNvbXBsaWFudCB3aXRoIGRlZXBNZXJnZSAjIyNcbiAgICBkMy5lbnRyaWVzIHVwZGF0ZWRfc3RhdGVcbiAgICAgICAgLmZvckVhY2ggKGVudHJ5KT0+XG4gICAgICAgICAgaWYgQXJyYXkuaXNBcnJheShlbnRyeS52YWx1ZSlcbiAgICAgICAgICAgICMjIyBkbyBub3RoaW5nICMjI1xuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mKGVudHJ5LnZhbHVlKSBpbiBbJ29iamVjdCddXG4gICAgICAgICAgICBpZiB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV1bJ2hhc0R5bmFtaWNQYXRocyddP1xuICAgICAgICAgICAgICBtb25rZXlzLnB1c2hcbiAgICAgICAgICAgICAgICBwYXRoOiBbcGF0aC4uLixlbnRyeS5rZXldXG4gICAgICAgICAgICAgICAgdmFsdWU6IGVudHJ5LnZhbHVlXG4gICAgICAgICAgICAgIGRlbGV0ZSB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQF9zcGxpdF91cGRhdGVfb2JqZWN0IHVwZGF0ZWRfc3RhdGVbZW50cnkua2V5XSwgW3BhdGguLi4sZW50cnkua2V5XSwgbW9ua2V5c1xuICAgIFt1cGRhdGVkX3N0YXRlLG1vbmtleXNdXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29tcHV0ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcblJvdyA9IHJlcXVpcmUgJy4vcm93cydcblxuY2xhc3MgSW50ZXJhY3RpdmUuRGF0YVNvdXJjZSBleHRlbmRzIFJvd1xuICB2YWx1ZXM6IChhcmdzKS0+IEBfdmFsdWVzLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfdmFsdWVzID0gQGN1cnNvci5zZWxlY3QgJ3ZhbHVlcydcbiAgICBzdXBlcigpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuRGF0YVNvdXJjZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkhpc3RvcnkgPSByZXF1aXJlICcuL2hpc3RvcnknXG5cbmNsYXNzIEludGVyYWN0aXZlLkV4cHJlc3Npb24gZXh0ZW5kcyBIaXN0b3J5XG4gIGV4cHJlc3Npb246IChhcmdzKS0+IEBfZXhwcmVzc2lvbi5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXhwcmVzc2lvbnMgPSBbXVxuICAgIEBfZXhwcmVzc2lvbiA9IEBjdXJzb3Iuc2VsZWN0ICdleHByZXNzaW9uJ1xuICAgIHN1cGVyKClcblxuICBleGVjdXRlOiAoZXhwcmVzc2lvbnMuLi4pLT5cbiAgICBleHByZXNzaW9ucy5mb3JFYWNoICAoZXhwcmVzc2lvbixleHByZXNzaW9uX2NvdW50KS0+XG4gICAgICBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBFeHByZXNzaW9uLnByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXMuRXhwcmVzc2lvbltleHByZXNzaW9uLm1ldGhvZF0gZXhwcmVzc2lvbi5hcmdzLi4uXG4gICAgICBlbHNlIGlmIGV4cHJlc3Npb24ubWV0aG9kIGluIGQzLmtleXMgQHByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXNbZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZVxuICAgICAgICBhc3NlcnQgXCIje0pTT04uc3RyaW5naWZ5IGV4cHJlc3Npb25zfSBpcyBub3QgdW5kZXJzdG9vZC5cIlxuICAgICAgQHN0YWdlIGNvbXB1dGVkX3N0YXRlXG4gICAgICBAY29tcHV0ZSgpXG5cbiAgZ2V0OiAoYXJncyktPiBAY3Vyc29yLmdldCBhcmdzLi4uXG4gIHNldDogKGFyZ3MpLT4gQGN1cnNvci5zZXQgYXJncy4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkV4cHJlc3Npb25cbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2NoZWNrcG9pbnQuc2V0IHt9XG4gICAgQF9leHByZXNzaW9uLnN0YXJ0UmVjb3JkaW5nIDIwXG4gICAgc3VwZXIoKVxuICBoaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uZ2V0SGlzdG9yeSgpXG4gIGNsZWFyX2hpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5jbGVhckhpc3RvcnkoKVxuICByZWNvcmQ6IChleHByZXNzaW9uKS0+XG4gICAgICBAZXhwcmVzc2lvbnMucHVzaCBleHByZXNzaW9uXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuSGlzdG9yeVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkNvbHVtbiA9IHJlcXVpcmUgJy4vY29sdW1ucydcblxuY2xhc3MgSW50ZXJhY3RpdmUuUm93IGV4dGVuZHMgQ29sdW1uXG4gIGluZGV4OiAoYXJncyktPiBAX2luZGV4LmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfaW5kZXggPSBAY3Vyc29yLnNlbGVjdCAnaW5kZXgnXG4gICAgQHN0YWdlIEBfY29sdW1uX2RhdGFfc291cmNlX21vbmtleSAnaW5kZXgnLCBbWydpbmRleCddLCAoaW5kZXgpLT4gaW5kZXhdXG4gICAgc3VwZXIoKVxuICBpbG9jOiAgLT5cbiAgbG9jOiAtPlxuICB1cGRhdGU6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuUm93XG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkNvbHVtbkRhdGFTb3VyY2UgPSByZXF1aXJlICcuL2NvbHVtbl9kYXRhX3NvdXJjZSdcblxuIyBUYWJsZSBhc3NpZ25zIG1ldGFkYXRhIHRvIHRoZSBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuIyBBIHRhYmxlIGlzIGRlc2NyaWJlIGJ5OlxuIyAqIF92YWx1ZXNfIC0gQSBsaXN0IG9mIGxpc3RzIGNvbnRhaW5pbmcgdGhlIHJvdyBlbnRyaWVzIGluIHRoZSB0YWJsZS5cbiMgKiBfY29sdW1uc18gLSBUaGUgY29sdW1uIG5hbWVzIGluIHRoZSB0YWJsZSwgdGhlIGNvbHVtbiBuYW1lcyBtYXAgdGhlIGVudHJpZXMgaW4gZWFjaCByb3dcbiMgKiBfbWV0YWRhdGFfIC1cbiMgVGhlIHRhYmxlIGtleXMgIG5hbWluZyBpcyBpbnNwaXJlZCBieSBgYHBhbmRhcy5EYXRhRnJhbWUudG9fZGljdChvcmllbnQ9J3JlY29yZHMnKS5cblxuY2xhc3MgSW50ZXJhY3RpdmUuVGFibGUgZXh0ZW5kcyBDb2x1bW5EYXRhU291cmNlXG4gIG1ldGFkYXRhOiAoYXJncyktPiBAX21ldGFkYXRhLmdldCBhcmdzLi4uXG5cbiAgIyBAcGFyYW0gW1N0cmluZ10gZGF0YV9vcl91cmwgdXJsIHRvIGEganNvbiBlbmRwb2ludCBjb250YWluaW5nIHRoZSBrZXlzIGBgdmFsdWVzYGAsIGBgXG4gICMgQHBhcmFtIFtPYmplY3RdIGRhdGFfb3JfdXJsXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIEBuYW1lPW51bGwpLT5cbiAgICAjIyBUaGUgdGFibGUgY2FuIGJlIHJlbmFtZWQgIyMjXG4gICAgQF9uYW1lID0gQGN1cnNvci5zZWxlY3QgJ25hbWUnXG4gICAgQF9uYW1lLnNldCBAbmFtZVxuICAgIEBfbWV0YWRhdGEgPSBAY3Vyc29yLnNlbGVjdCAnbWV0YWRhdGEnXG4gICAgc3VwZXIoKVxuICAgIEBsb2FkIGRhdGFfb3JfdXJsXG5cbiAgbG9hZDogKGRhdGFfb3JfdXJsKS0+XG4gICAgaWYgJ3N0cmluZycgaW4gW3R5cGVvZiBkYXRhX29yX3VybF1cbiAgICAgIGQzLmpzb24gZGF0YSwgKHRhYmxlX2RhdGEpPT5cbiAgICAgICAgdGFibGVfZGF0YVsndXJsJ10gPSBAX3Jhd1xuICAgICAgICBAc3RhZ2VcbiAgICAgICAgICAgIHJhdzogdGFibGVfZGF0YVxuICAgICAgICAgICAgaW5kZXg6IGQzLnJhbmdlIHRhYmxlX2RhdGEubGVuZ3RoXG4gICAgICAgICAgLFxuICAgICAgICAgICAgbWV0aG9kOiAnbG9hZCdcbiAgICAgICAgICAgIGFyZ3M6IFtkYXRhX29yX3VybF1cbiAgICAgICAgc3VwZXIoKVxuICAgIGVsc2VcbiAgICAgIGRhdGEgPSBkYXRhX29yX3VybFxuICAgICAgQHN0YWdlXG4gICAgICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbXVxuICAgICAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8ge31cbiAgICAgICAgICByZWFkbWU6IGRhdGEucmVhZG1lID8gbnVsbFxuICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSBkYXRhLnZhbHVlcz8ubGVuZ3RoID8gMFxuICAgICAgICAsXG4gICAgICAgICAgbWV0aG9kOiAnbG9hZCdcbiAgICAgICAgICBhcmdzOiBbZGF0YV1cbiAgICAgIHN1cGVyKClcblxuSW50ZXJhY3RpdmUuVGFibGU6OmV4cHIgPVxuICBjb25jYXQ6IC0+XG4gIGhlYWQ6IC0+XG4gIHRhaWw6IC0+XG4gIHNvcnQ6IC0+XG4gIGZpbHRlcjogLT5cbiAgbWFwOiAtPlxuXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fc3RyaW5nID0gLT5cbkludGVyYWN0aXZlLlRhYmxlOjp0b19qc29uID0gIC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuVGFibGVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcblxuY2xhc3MgTWFuYWdlciBleHRlbmRzIEludGVyYWN0aXZlXG4gIGRpcjogKCktPiBAY29sdW1uX2RhdGFfc291cmNlIEBpbmRleF9jb2x1bW5cbiAgcmVnaXN0ZXI6ICggbmFtZSwgZGF0YV9vcl91cmw9bnVsbCApLT5cbiAgICBAW25hbWVdID0gbmV3IEBfYmFzZV9jbGFzcyBkYXRhX29yX3VybFxuICAgIEBbbmFtZV1cbiAgdW5yZWdpc3RlcjogKCBuYW1lICktPlxuICBjb21taXQ6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gTWFuYWdlclxuIiwiTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFuYWdlcidcblRlbXBsYXRlID0gcmVxdWlyZSAnLi90ZW1wbGF0ZSdcblxuY2xhc3MgUHVibGlzaGVyIGV4dGVuZHMgTWFuYWdlclxuICBfYmFzZV9jbGFzczogVGVtcGxhdGVcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIEBcbiAgICBzdXBlclxuICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyA/IFsnc2VsZWN0b3InXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gUHVibGlzaGVyXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5jbGFzcyBUZW1wbGF0ZVxuICAjIyNcbiAgQHBhcmFtcyBbc3RyaW5nXSBzZWxlY3RvciBjc3Mgc2VsZWN0b3IgYSBET00gbm9kZVxuICAjIyNcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IpLT5cbiAgICBAc2VsZWN0aW9uID0gZDMuc2VsZWN0QWxsIEBzZWxlY3RvclxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlXG4iXX0=
