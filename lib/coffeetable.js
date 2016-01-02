(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Catalog, CatalogBase, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');

CatalogBase = (function(superClass) {
  var _column_index;

  extend(CatalogBase, superClass);

  function CatalogBase() {
    return CatalogBase.__super__.constructor.apply(this, arguments);
  }

  CatalogBase.prototype._base_class = require('./interactive');

  _column_index = 'selector';

  return CatalogBase;

})(Manager);

Catalog = (function(superClass) {
  extend(Catalog, superClass);

  function Catalog(data, to_register) {
    var ref, ref1, ref2;
    if (to_register == null) {
      to_register = [];
    }
    Catalog.__super__.constructor.call(this, {
      values: (ref = data.values) != null ? ref : [[]],
      columns: (ref1 = data.columns) != null ? ref1 : ['selector'],
      metadata: (ref2 = data.metadata) != null ? ref2 : {
        id: {
          description: "The name of an interactive table in the catalog."
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

  return Catalog;

})(CatalogBase);

module.exports = Catalog;


},{"./interactive":4,"./manager":13}],2:[function(require,module,exports){
var Baobab, Catalog, CoffeeTable, Environment, d3;

Baobab = require("baobab");

d3 = require("d3");

Environment = require('./environment');

Catalog = require('./catalog');

CoffeeTable = (function() {
  function CoffeeTable(catalog, environment, edges) {
    if (catalog == null) {
      catalog = {};
    }
    if (environment == null) {
      environment = {};
    }
    if (edges == null) {
      edges = {};
    }
    this.catalog = new Catalog(catalog);
    this.environment = new Environment(environment);
  }

  CoffeeTable.prototype.version = '0.1.0';

  return CoffeeTable;

})();

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./catalog":1,"./environment":3,"baobab":"baobab","d3":"d3"}],3:[function(require,module,exports){
var Environment, EnvironmentBase, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');

EnvironmentBase = (function(superClass) {
  extend(EnvironmentBase, superClass);

  function EnvironmentBase() {
    return EnvironmentBase.__super__.constructor.apply(this, arguments);
  }

  EnvironmentBase.prototype._base_class = require('./template');

  EnvironmentBase.prototype._column_index = 'selector';

  return EnvironmentBase;

})(Manager);

Environment = (function(superClass) {
  extend(Environment, superClass);

  function Environment(data, to_register) {
    var ref, ref1, ref2;
    if (to_register == null) {
      to_register = [];
    }
    if (data == null) {
      data = {};
    }
    this;
    Environment.__super__.constructor.call(this, {
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

  return Environment;

})(EnvironmentBase);

module.exports = Environment;


},{"./manager":13,"./template":14}],4:[function(require,module,exports){
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
  }

  return Interactive;

})(Table);

module.exports = Interactive;


},{"./interactive/table":12,"baobab":"baobab"}],5:[function(require,module,exports){
var ColumnDataSource, ColumnDataSourceBase, DataSource,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DataSource = require('./data');

ColumnDataSourceBase = (function(superClass) {
  extend(ColumnDataSourceBase, superClass);

  function ColumnDataSourceBase() {
    return ColumnDataSourceBase.__super__.constructor.apply(this, arguments);
  }

  return ColumnDataSourceBase;

})(DataSource);

ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource() {
    ColumnDataSource.__super__.constructor.call(this);
    this._cds = this.cursor.select('column_data_source');
    this.load();
    this.compute();
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

})(ColumnDataSourceBase);

module.exports = ColumnDataSource;


},{"./data":8}],6:[function(require,module,exports){
var Column, ColumnBase, Expression,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Expression = require('./expression');

ColumnBase = (function(superClass) {
  extend(ColumnBase, superClass);

  function ColumnBase() {
    return ColumnBase.__super__.constructor.apply(this, arguments);
  }

  return ColumnBase;

})(Expression);

Column = (function(superClass) {
  extend(Column, superClass);

  Column.prototype.columns = function(args) {
    var ref;
    return (ref = this._columns).get.apply(ref, args);
  };

  function Column() {
    this._columns = this.cursor.select('columns');
  }

  Column.prototype.update = function() {};

  return Column;

})(ColumnBase);

module.exports = Column;


},{"./expression":9}],7:[function(require,module,exports){
var Compute, d3,
  slice = [].slice;

d3 = require("d3");

Compute = (function() {
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
        var ref;
        if (Array.isArray(entry.value)) {

          /* do nothing */
        } else if ((ref = typeof entry.value) === 'object') {
          if (payload[entry.key]['hasDynamicPaths'] != null) {
            monkeys.push({
              path: slice.call(path).concat([entry.key]),
              value: entry.value
            });
            return delete payload[entry.key];
          } else {
            return _this._split_merge_object(updated_state[entry.key], slice.call(path).concat([entry.key]), monkeys);
          }
        }
      };
    })(this));
    return [payload, monkeys];
  };

  return Compute;

})();

module.exports = Compute;


},{"d3":"d3"}],8:[function(require,module,exports){
var DataSource, DataSourceBase, Row,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Row = require('./rows');

DataSourceBase = (function(superClass) {
  extend(DataSourceBase, superClass);

  function DataSourceBase() {
    return DataSourceBase.__super__.constructor.apply(this, arguments);
  }

  return DataSourceBase;

})(Row);

DataSource = (function(superClass) {
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

})(DataSourceBase);

module.exports = DataSource;


},{"./rows":11}],9:[function(require,module,exports){
var Expression, ExpressionBase, History,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

History = require('./history');

ExpressionBase = (function(superClass) {
  extend(ExpressionBase, superClass);

  function ExpressionBase() {
    return ExpressionBase.__super__.constructor.apply(this, arguments);
  }

  return ExpressionBase;

})(History);

Expression = (function(superClass) {
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

})(ExpressionBase);

module.exports = Expression;


},{"./history":10}],10:[function(require,module,exports){
var Compute, History,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Compute = require('./compute');

History = (function(superClass) {
  extend(History, superClass);

  function History() {
    this._checkpoint = this.cursor.select('checkpoint');
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

module.exports = History;


},{"./compute":7}],11:[function(require,module,exports){
var Column, Row, RowBase,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Column = require('./columns');

RowBase = (function(superClass) {
  extend(RowBase, superClass);

  function RowBase() {
    return RowBase.__super__.constructor.apply(this, arguments);
  }

  return RowBase;

})(Column);

Row = (function(superClass) {
  extend(Row, superClass);

  Row.prototype.index = function(args) {
    var ref;
    return (ref = this._index).get.apply(ref, args);
  };

  function Row() {
    this._index = this.cursor.select('index');
    this.stage(_column_data_source_monkey('index', [
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

})(RowBase);

module.exports = Row;


},{"./columns":6}],12:[function(require,module,exports){
var Column, ColumnDataSource, Table, TableBase, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

ColumnDataSource = require('./column_data_source');

Column = require('./columns');

TableBase = (function(superClass) {
  extend(TableBase, superClass);

  function TableBase() {
    return TableBase.__super__.constructor.apply(this, arguments);
  }

  return TableBase;

})(Column);

Table = (function(superClass) {
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
    this.load(data_or_url);
    Table.__super__.constructor.call(this);
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

})(TableBase);

Table.prototype.expr = {
  concat: function() {},
  head: function() {},
  tail: function() {},
  sort: function() {},
  filter: function() {},
  map: function() {}
};

Table.prototype.to_string = function() {};

Table.prototype.to_json = function() {};

module.exports = Table;


},{"./column_data_source":5,"./columns":6,"d3":"d3"}],13:[function(require,module,exports){
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
    return Manager.__super__.register.call(this);
  };

  Manager.prototype.unregister = function(name) {};

  Manager.prototype.commit = function() {};

  return Manager;

})(Interactive);

module.exports = Manager;


},{"./interactive":4}],14:[function(require,module,exports){
var Template, TemplateBase, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

TemplateBase = (function() {
  function TemplateBase() {}

  return TemplateBase;

})();

Template = (function(superClass) {
  extend(Template, superClass);

  function Template(selector) {
    this.selector = selector;
    this.selection = d3.selectAll(this.selector);
  }

  return Template;

})(TemplateBase);

module.exports = Template;


},{"d3":"d3"}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2F0YWxvZy5jb2ZmZWUiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2Vudmlyb25tZW50LmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1uX2RhdGFfc291cmNlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb2x1bW5zLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb21wdXRlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9kYXRhLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9leHByZXNzaW9uLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9oaXN0b3J5LmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9yb3dzLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS90YWJsZS5jb2ZmZWUiLCJzcmMvbWFuYWdlci5jb2ZmZWUiLCJzcmMvdGVtcGxhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSw2QkFBQTtFQUFBOzs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0FBR0o7QUFDSixNQUFBOzs7Ozs7Ozt3QkFBQSxXQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsYUFBQSxHQUFnQjs7OztHQUZROztBQUtwQjs7O0VBQ1MsaUJBQUMsSUFBRCxFQUFNLFdBQU47QUFDWCxRQUFBOztNQURpQixjQUFZOztJQUM3Qix5Q0FFRTtNQUFBLE1BQUEsc0NBQXNCLENBQUMsRUFBRCxDQUF0QjtNQUVBLE9BQUEseUNBQXdCLENBQUMsVUFBRCxDQUZ4QjtNQUlBLFFBQUEsMENBQTBCO1FBQUEsRUFBQSxFQUN4QjtVQUFBLFdBQUEsRUFBYSxrREFBYjtTQUR3QjtPQUoxQjtNQU1BLE1BQUEsRUFBUSxnQ0FOUjtLQUZGO0lBU0EsV0FBVyxDQUFD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QUUsQ0FBQSxJQUFBLENBQUYsR0FBYyxJQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsV0FBYjtXQUNkLG9DQUFBO0VBRlE7O29CQUdWLFVBQUEsR0FBWSxTQUFFLElBQUYsR0FBQTs7b0JBQ1osTUFBQSxHQUFRLFNBQUEsR0FBQTs7OztHQU5ZOztBQVF0QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ1ZqQixJQUFBLDBCQUFBO0VBQUE7OztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFFQzs7Ozs7OztBQUVBOzs7RUFDUyxrQkFBQyxRQUFEO0lBQUMsSUFBQyxDQUFBLFdBQUQ7SUFDWixJQUFDLENBQUEsU0FBRCxHQUFhLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBQyxDQUFBLFFBQWQ7RUFERjs7OztHQURROztBQUl2QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYW5hZ2VyID0gcmVxdWlyZSAnLi9tYW5hZ2VyJ1xuXG5cbmNsYXNzIENhdGFsb2dCYXNlIGV4dGVuZHMgTWFuYWdlclxuICBfYmFzZV9jbGFzczogcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcbiAgX2NvbHVtbl9pbmRleCA9ICdzZWxlY3RvcidcblxuXG5jbGFzcyBDYXRhbG9nIGV4dGVuZHMgQ2F0YWxvZ0Jhc2VcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgc3VwZXJcbiAgICAgICMgVmFsdWVzIG9mIHRoZSBjYXRhbG9nXG4gICAgICB2YWx1ZXM6IGRhdGEudmFsdWVzID8gW1tdXVxuICAgICAgIyBmZWF0dXJlcyBpbiB0aGUgY2F0YWxvZ1xuICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gWydzZWxlY3RvciddXG4gICAgICAjIGF1Z21lbnRlZCBjb2x1bW4gaW5mb3JtYXRpb25cbiAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8gaWQ6XG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBuYW1lIG9mIGFuIGludGVyYWN0aXZlIHRhYmxlIGluIHRoZSBjYXRhbG9nLlwiXG4gICAgICByZWFkbWU6IFwiSG93IGNhbiBJIGltcG9ydCBhIHJlYWRtZSBmaWxlXCJcbiAgICB0b19yZWdpc3Rlci5mb3JFYWNoICh2YWx1ZSk9PlxuICAgICAgQHJlZ2lzdGVyIHZhbHVlLm5hbWUsIHZhbHVlLmFyZ3NcblxubW9kdWxlLmV4cG9ydHMgPSBDYXRhbG9nXG4iLCJCYW9iYWIgPSByZXF1aXJlIFwiYmFvYmFiXCJcbmQzID0gcmVxdWlyZSBcImQzXCJcbkVudmlyb25tZW50ID0gIHJlcXVpcmUgJy4vZW52aXJvbm1lbnQnXG5DYXRhbG9nID0gIHJlcXVpcmUgJy4vY2F0YWxvZydcblxuXG4jIGludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuI1xuIyBAZXhhbXBsZSBMZXQncyBnZXQgc3RhcnRlZFxuIyAgIHRhYmxlID0gbmV3IENvZmZlZVRhYmxlXG4jICAgICBjb2x1bW5zOiBbXG4jICAgICAgICd4J1xuIyAgICAgICAneSdcbiMgICAgIF1cbiMgICAgIHZhbHVlczogW1xuIyAgICAgICBbMSwgMl1cbiMgICAgICAgWzMsIDhdXG4jICAgICBdXG5jbGFzcyBDb2ZmZWVUYWJsZVxuICBjb25zdHJ1Y3RvcjogKGNhdGFsb2c9e30sIGVudmlyb25tZW50PXt9LCBlZGdlcz17fSktPlxuICAgIEBjYXRhbG9nID0gbmV3IENhdGFsb2cgY2F0YWxvZ1xuICAgIEBlbnZpcm9ubWVudCA9IG5ldyBFbnZpcm9ubWVudCBlbnZpcm9ubWVudFxuICAgICNAZmxvdyA9IG5ldyBARGF0YUZsb3cgZWRnZXNcblxuICB2ZXJzaW9uOiAnMC4xLjAnXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvZmZlZVRhYmxlXG4gIGQzXG4gIEJhb2JhYlxufVxuIiwiTWFuYWdlciA9IHJlcXVpcmUgJy4vbWFuYWdlcidcblxuY2xhc3MgRW52aXJvbm1lbnRCYXNlIGV4dGVuZHMgTWFuYWdlclxuICBfYmFzZV9jbGFzczogcmVxdWlyZSAnLi90ZW1wbGF0ZSdcbiAgX2NvbHVtbl9pbmRleDogJ3NlbGVjdG9yJ1xuY2xhc3MgRW52aXJvbm1lbnQgZXh0ZW5kcyBFbnZpcm9ubWVudEJhc2VcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIEBcbiAgICBzdXBlclxuICAgICAgIyBWYWx1ZXMgb2YgdGhlIGNhdGFsb2dcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAjIGZlYXR1cmVzIGluIHRoZSBjYXRhbG9nXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgICMgYXVnbWVudGVkIGNvbHVtbiBpbmZvcm1hdGlvblxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gRW52aXJvbm1lbnRcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcblRhYmxlID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZS90YWJsZSdcblxuY2xhc3MgSW50ZXJhY3RpdmUgZXh0ZW5kcyBUYWJsZVxuICByZWFkbWU6IC0+IEBfcmVhZG1lLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIHRhYmxlX25hbWUpLT5cbiAgICBAdHJlZSA9IG5ldyBCYW9iYWIge31cbiAgICBAY3Vyc29yID0gQHRyZWUuc2VsZWN0IDBcbiAgICBAX3JlYWRtZSA9IEBjdXJzb3Iuc2VsZWN0ICdyZWFkbWUnXG4gICAgc3VwZXIgZGF0YV9vcl91cmwsIHRhYmxlX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vZGF0YSdcblxuY2xhc3MgQ29sdW1uRGF0YVNvdXJjZUJhc2UgZXh0ZW5kcyBEYXRhU291cmNlXG5cbmNsYXNzIENvbHVtbkRhdGFTb3VyY2UgZXh0ZW5kcyBDb2x1bW5EYXRhU291cmNlQmFzZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcigpXG4gICAgQF9jZHMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1uX2RhdGFfc291cmNlJ1xuICAgIEBsb2FkKClcbiAgICBAY29tcHV0ZSgpXG5cbiAgbG9hZDogKGNvbHVtbnMpIC0+XG4gICAgICBjb2x1bW5zID89IEBjb2x1bW5zKClcbiAgICAgICMjIyBJbmRleCBtb25rZXkgaXMgZGVzdHJveWVkIG9uIHRoZSBmaXJzdCBvcGVyYXRpb24gIyMjXG4gICAgICBjZHMgPSB7fVxuICAgICAgY29sdW1ucyA9IEFycmF5IGNvbHVtbnMuLi5cbiAgICAgIGNvbHVtbnMuZm9yRWFjaCAoY29sdW1uLGNvbHVtbl9pbmRleCk9PlxuICAgICAgICAjIyMgQ3JlYXRlIER5bmFtaWMgTm9kZXMgZm9yIEVhY2ggQ29sdW1uIERhdGEgU291cmNlICMjI1xuICAgICAgICBjZHMgPSBAX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXkgY29sdW1uLCBudWxsLCBjZHNcbiAgICAgIEBzdGFnZSBjZHNcblxuICBfY29sdW1uX25hbWVfYXJyYXk6IChjb2x1bW5zKS0+IGlmIG5vdCBBcnJheS5pc0FycmF5IGNvbHVtbnMgdGhlbiBbY29sdW1uc10gZWxzZSBjb2x1bW5zXG5cbiAgX2NvbHVtbl9kYXRhX3NvdXJjZV9tb25rZXk6IChjb2x1bW4sbW9ua2V5LHRtcD17fSktPlxuICAgICAgdG1wWydjb2x1bW5fZGF0YV9zb3VyY2UnXSA/PSB7fVxuICAgICAgbW9ua2V5ID89IEJhb2JhYi5tb25rZXkgWydjb2x1bW5zJ10sWyd2YWx1ZXMnXSxbJy4nLCduYW1lJ10sIChjb2x1bW5zLHZhbHVlcyxjb2x1bW5fbmFtZSktPlxuICAgICAgICAgICAgICBjb2x1bW5faW5kZXggPSBjb2x1bW5zLmluZGV4T2YgY29sdW1uX25hbWVcbiAgICAgICAgICAgICAgdmFsdWVzLm1hcCAocm93X3ZhbHVlcyk9PiByb3dfdmFsdWVzW2NvbHVtbl9pbmRleF1cbiAgICAgIHRtcFsnY29sdW1uX2RhdGFfc291cmNlJ11bY29sdW1uXSA9XG4gICAgICAgICAgbmFtZTogY29sdW1uXG4gICAgICAgICAgdmFsdWVzOiBtb25rZXlcbiAgICAgIHRtcFxuXG4gIGNvbHVtbl9kYXRhX3NvdXJjZTogKGNvbHVtbnMsZm9yY2VfYXJyYXk9ZmFsc2UpLT5cbiAgICBjb2x1bW5zID0gQF9jb2x1bW5fbmFtZV9hcnJheSBjb2x1bW5zXG4gICAgaWYgY29sdW1ucy5sZW5ndGggPiAxIG9yIGZvcmNlX2FycmF5XG4gICAgICBkMy56aXAgY29sdW1ucy5tYXAoIChjKSA9PiBAX2Nkcy5nZXQoYywndmFsdWVzJykgKS4uLlxuICAgIGVsc2VcbiAgICAgIEBfY2RzLmdldChjb2x1bW5zWzBdLCd2YWx1ZXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbkRhdGFTb3VyY2VcbiIsIkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIENvbHVtbkJhc2UgZXh0ZW5kcyBFeHByZXNzaW9uXG5cbmNsYXNzIENvbHVtbiBleHRlbmRzIENvbHVtbkJhc2VcbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICB1cGRhdGU6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uXG4iLCJkMyA9IHJlcXVpcmUgXCJkM1wiXG5cblxuY2xhc3MgQ29tcHV0ZVxuICBjb21wdXRlOiAoKS0+XG4gICAgIyMjIENvbXB1dGUgY2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhlIGRhdGEgdHJlZSAjIyNcbiAgICBAX2NoZWNrcG9pbnQuZGVlcE1lcmdlXG4gICAgICB2YWx1ZXM6IEB2YWx1ZXMoKVxuICAgICAgaW5kZXg6IEBpbmRleCgpXG4gICAgICBtZXRhZGF0YTogQG1ldGFkYXRhKClcbiAgICAgIGNvbHVtbnM6IEBjb2x1bW5zKClcbiAgICAgIHJlYWRtZTogQHJlYWRtZSgpXG4gICAgdGhpc1xuXG4gIHN0YWdlOiAobmV3X3N0YXRlLGV4cHJlc3Npb249bnVsbCktPlxuICAgIFt1cGRhdGVfc3RhdGUsIG1vbmtleXNdID0gQF9zcGxpdF91cGRhdGVfb2JqZWN0IG5ld19zdGF0ZVxuICAgIEBjdXJzb3IuZGVlcE1lcmdlIHVwZGF0ZV9zdGF0ZVxuICAgIGlmIG1vbmtleXMubGVuZ3RoID4gMFxuICAgICAgZm9yIG1vbmtleSBpbiBtb25rZXlzXG4gICAgICAgIEBjdXJzb3Iuc2V0IG1vbmtleS5wYXRoLCBtb25rZXkudmFsdWVcbiAgICB0aGlzXG5cbiAgX3NwbGl0X3VwZGF0ZV9vYmplY3Q6ICggdXBkYXRlZF9zdGF0ZSwgcGF0aD1bXSwgbW9ua2V5cz1bXSApLT5cbiAgICAjIyMgUHJ1bmUgYW5kIHNldCB0aGUgQmFvYmFiIG1vbmtleXMgYW5kIHJldHVybiBvbmx5IHRoZSB2YWx1ZXMgY29tcGxpYW50IHdpdGggZGVlcE1lcmdlICMjI1xuICAgIGQzLmVudHJpZXMgdXBkYXRlZF9zdGF0ZVxuICAgICAgICAuZm9yRWFjaCAoZW50cnkpPT5cbiAgICAgICAgICBpZiBBcnJheS5pc0FycmF5KGVudHJ5LnZhbHVlKVxuICAgICAgICAgICAgIyMjIGRvIG5vdGhpbmcgIyMjXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2YoZW50cnkudmFsdWUpIGluIFsnb2JqZWN0J11cbiAgICAgICAgICAgIGlmIHBheWxvYWRbZW50cnkua2V5XVsnaGFzRHluYW1pY1BhdGhzJ10/XG4gICAgICAgICAgICAgIG1vbmtleXMucHVzaFxuICAgICAgICAgICAgICAgIHBhdGg6IFtwYXRoLi4uLGVudHJ5LmtleV1cbiAgICAgICAgICAgICAgICB2YWx1ZTogZW50cnkudmFsdWVcbiAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWRbZW50cnkua2V5XVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAX3NwbGl0X21lcmdlX29iamVjdCB1cGRhdGVkX3N0YXRlW2VudHJ5LmtleV0sIFtwYXRoLi4uLGVudHJ5LmtleV0sIG1vbmtleXNcbiAgICBbcGF5bG9hZCxtb25rZXlzXVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXB1dGVcbiIsIlJvdyA9IHJlcXVpcmUgJy4vcm93cydcblxuY2xhc3MgRGF0YVNvdXJjZUJhc2UgZXh0ZW5kcyBSb3dcblxuY2xhc3MgRGF0YVNvdXJjZSBleHRlbmRzIERhdGFTb3VyY2VCYXNlXG4gIHZhbHVlczogKGFyZ3MpLT4gQF92YWx1ZXMuZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF92YWx1ZXMgPSBAY3Vyc29yLnNlbGVjdCAndmFsdWVzJ1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhU291cmNlXG4iLCJIaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBFeHByZXNzaW9uQmFzZSBleHRlbmRzIEhpc3RvcnlcblxuY2xhc3MgRXhwcmVzc2lvbiBleHRlbmRzIEV4cHJlc3Npb25CYXNlXG4gIGV4cHJlc3Npb246IChhcmdzKS0+IEBfZXhwcmVzc2lvbi5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXhwcmVzc2lvbnMgPSBbXVxuICAgIEBfZXhwcmVzc2lvbiA9IEBjdXJzb3Iuc2VsZWN0ICdleHByZXNzaW9uJ1xuICAgIHN1cGVyKClcblxuICBleGVjdXRlOiAoZXhwcmVzc2lvbnMuLi4pLT5cbiAgICBleHByZXNzaW9ucy5mb3JFYWNoICAoZXhwcmVzc2lvbixleHByZXNzaW9uX2NvdW50KS0+XG4gICAgICBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBFeHByZXNzaW9uLnByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXMuRXhwcmVzc2lvbltleHByZXNzaW9uLm1ldGhvZF0gZXhwcmVzc2lvbi5hcmdzLi4uXG4gICAgICBlbHNlIGlmIGV4cHJlc3Npb24ubWV0aG9kIGluIGQzLmtleXMgQHByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXNbZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZVxuICAgICAgICBhc3NlcnQgXCIje0pTT04uc3RyaW5naWZ5IGV4cHJlc3Npb25zfSBpcyBub3QgdW5kZXJzdG9vZC5cIlxuICAgICAgQHN0YWdlIGNvbXB1dGVkX3N0YXRlXG4gICAgICBAY29tcHV0ZSgpXG5cbiAgZ2V0OiAoYXJncyktPiBAY3Vyc29yLmdldCBhcmdzLi4uXG4gIHNldDogKGFyZ3MpLT4gQGN1cnNvci5zZXQgYXJncy4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4cHJlc3Npb25cbiIsIkNvbXB1dGUgPSByZXF1aXJlICcuL2NvbXB1dGUnXG5cbmNsYXNzIEhpc3RvcnkgZXh0ZW5kcyBDb21wdXRlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY2hlY2twb2ludCA9IEBjdXJzb3Iuc2VsZWN0ICdjaGVja3BvaW50J1xuICAgIEBfZXhwcmVzc2lvbi5zdGFydFJlY29yZGluZyAyMFxuICAgIHN1cGVyKClcbiAgaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmdldEhpc3RvcnkoKVxuICBjbGVhcl9oaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uY2xlYXJIaXN0b3J5KClcbiAgcmVjb3JkOiAoZXhwcmVzc2lvbiktPlxuICAgICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhpc3RvcnlcbiIsIkNvbHVtbiA9IHJlcXVpcmUgJy4vY29sdW1ucydcblxuY2xhc3MgUm93QmFzZSBleHRlbmRzIENvbHVtblxuXG5jbGFzcyBSb3cgZXh0ZW5kcyBSb3dCYXNlXG4gIGluZGV4OiAoYXJncyktPiBAX2luZGV4LmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfaW5kZXggPSBAY3Vyc29yLnNlbGVjdCAnaW5kZXgnXG4gICAgQHN0YWdlIF9jb2x1bW5fZGF0YV9zb3VyY2VfbW9ua2V5ICdpbmRleCcsIFtbJ2luZGV4J10sIChpbmRleCktPiBpbmRleF1cbiAgICBzdXBlcigpXG4gIGlsb2M6ICAtPlxuICBsb2M6IC0+XG4gIHVwZGF0ZTogLT5cblxubW9kdWxlLmV4cG9ydHMgPSBSb3dcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5Db2x1bW5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9jb2x1bW5fZGF0YV9zb3VyY2UnXG5Db2x1bW4gPSByZXF1aXJlICcuL2NvbHVtbnMnXG5cblxuY2xhc3MgVGFibGVCYXNlIGV4dGVuZHMgQ29sdW1uXG5cblxuY2xhc3MgVGFibGUgZXh0ZW5kcyBUYWJsZUJhc2VcbiAgbWV0YWRhdGE6IChhcmdzKS0+IEBfbWV0YWRhdGEuZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6IChkYXRhX29yX3VybCwgQG5hbWU9bnVsbCktPlxuICAgICMjIFRoZSB0YWJsZSBjYW4gYmUgcmVuYW1lZCAjIyNcbiAgICBAX25hbWUgPSBAY3Vyc29yLnNlbGVjdCAnbmFtZSdcbiAgICBAX25hbWUuc2V0IEBuYW1lXG4gICAgQF9tZXRhZGF0YSA9IEBjdXJzb3Iuc2VsZWN0ICdtZXRhZGF0YSdcbiAgICBAbG9hZCBkYXRhX29yX3VybFxuICAgIHN1cGVyKClcbiAgbG9hZDogKGRhdGFfb3JfdXJsKS0+XG4gICAgaWYgJ3N0cmluZycgaW4gW3R5cGVvZiBkYXRhX29yX3VybF1cbiAgICAgIGQzLmpzb24gZGF0YSwgKHRhYmxlX2RhdGEpPT5cbiAgICAgICAgdGFibGVfZGF0YVsndXJsJ10gPSBAX3Jhd1xuICAgICAgICBAc3RhZ2VcbiAgICAgICAgICAgIHJhdzogdGFibGVfZGF0YVxuICAgICAgICAgICAgaW5kZXg6IGQzLnJhbmdlIHRhYmxlX2RhdGEubGVuZ3RoXG4gICAgICAgICAgLFxuICAgICAgICAgICAgbWV0aG9kOiAnbG9hZCdcbiAgICAgICAgICAgIGFyZ3M6IFtkYXRhX29yX3VybF1cbiAgICAgICAgc3VwZXIoKVxuICAgIGVsc2VcbiAgICAgIGRhdGEgPSBkYXRhX29yX3VybFxuICAgICAgQHN0YWdlXG4gICAgICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbXVxuICAgICAgICAgIG1ldGFkYXRhOiBkYXRhLm1ldGFkYXRhID8ge31cbiAgICAgICAgICByZWFkbWU6IGRhdGEucmVhZG1lID8gbnVsbFxuICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSBkYXRhLnZhbHVlcz8ubGVuZ3RoID8gMFxuICAgICAgICAsXG4gICAgICAgICAgbWV0aG9kOiAnbG9hZCdcbiAgICAgICAgICBhcmdzOiBbZGF0YV1cbiAgICAgIHN1cGVyKClcblxuVGFibGU6OmV4cHIgPVxuICBjb25jYXQ6IC0+XG4gIGhlYWQ6IC0+XG4gIHRhaWw6IC0+XG4gIHNvcnQ6IC0+XG4gIGZpbHRlcjogLT5cbiAgbWFwOiAtPlxuXG5UYWJsZTo6dG9fc3RyaW5nID0gLT5cblRhYmxlOjp0b19qc29uID0gIC0+XG5cbm1vZHVsZS5leHBvcnRzID0gIFRhYmxlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5cbmNsYXNzIE1hbmFnZXIgZXh0ZW5kcyBJbnRlcmFjdGl2ZVxuICBkaXI6ICgpLT4gQGNvbHVtbl9kYXRhX3NvdXJjZSBAaW5kZXhfY29sdW1uXG4gIHJlZ2lzdGVyOiAoIG5hbWUsIGRhdGFfb3JfdXJsPW51bGwgKS0+XG4gICAgQFtuYW1lXSA9IG5ldyBAX2Jhc2VfY2xhc3MgZGF0YV9vcl91cmxcbiAgICBzdXBlcigpXG4gIHVucmVnaXN0ZXI6ICggbmFtZSApLT5cbiAgY29tbWl0OiAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbmFnZXJcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmNsYXNzIFRlbXBsYXRlQmFzZVxuXG5jbGFzcyBUZW1wbGF0ZSBleHRlbmRzIFRlbXBsYXRlQmFzZVxuICBjb25zdHJ1Y3RvcjogKEBzZWxlY3RvciktPlxuICAgIEBzZWxlY3Rpb24gPSBkMy5zZWxlY3RBbGwgQHNlbGVjdG9yXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVcbiJdfQ==
