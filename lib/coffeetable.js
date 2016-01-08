(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Baobab, d3;

Baobab = require("baobab");

d3 = require("d3");


/*
interactive tabular data, optimized for the browser

@example Create a new interactive CoffeeTable
  table = new CoffeeTable
    name: "Polygon"
    readme: "A rectangle"
    metadata: {x:'horizontal direction',y:'vertical direction'}
    columns: ['x', 'y']
    values: [[1, 3],[2, 8],[3,13]]

@example Add a column of data with Concat
  table.concat
    columns:
      z: [5, 4, 3]

@example Add two rows of data with Concat
  table.concat
    values: [
      [4, 18, 2]
      [5, 23, 1]
    ]

@example Add a new column that is a function of existing columns x and y
  table.transform
    t: 'x', 'y', (x, y)->
      d3.zip(x, y).map (v)-> Math.tan v[1]/ v[0]

@example Make a checkpoint or store the current state of the columns and values to reuse later.
  table.compute()

@example Create a new copy with the x and angle columns
  vectors = table.projection 'x','t'
    .copy()

The state of the table  is still the project of x and t.

@example Revert the table back to the last checkpoint.
  table.rewind()

Now the table has for columns

  alert table.name() + ' has ' + table.index().length + ' row  and the fields: ' + table.columns().join(', ')[..-2]

@example Add a categorical columns
  table.transform
      'color': 'y', (y)-> y.map (v)-> ['red','green','blue'][v %% 10]
    .compute()


@example Separate the red and the greens.
  green = table.filter 'color', (color)-> color in ['green']
    .copy()
  red = table.rewind().filter 'color', (color)-> color in ['red']
    .copy()

Separating compute from the values.

CoffeeTable stores a history of the transformations

@example Show Table Expression history
  table.history()
  table.expression()

in the next example an expression is created on the green the table and its
expressions are applied to the red table.  Methods are chainable.

@example Apply expressions to green then use the expressions on red
  green.sort 'x'
    .unique()
    .transform
      prod: 'x', 'y', (x,y)-> d3.zip(x,y).map (v)-> v[1]*v[0]

  red.evaluate green.history()


> Non-column/other cursor content is an array.
 */

window.CoffeeTable = (function() {
  function CoffeeTable(url) {
    this.url = url;
    d3.json(this.url, function(d) {
      return CoffeeTable.__super__.constructor.call(this, d);
    });
  }

  CoffeeTable.prototype.version = '0.1.0';

  return CoffeeTable;

})();

CoffeeTable.Interactive = require('./interactive');

CoffeeTable.InteractiveGraph = require('./interactive');

window.table = new CoffeeTable.Interactive({
  columns: ['x', 'y'],
  values: [[1, 2], [3, 8], [-1, 4], [5, 7]]
});

window.square = new CoffeeTable.Interactive({
  columns: ['x', 'y'],
  values: [[1, 1], [7, 7]]
});

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./interactive":8,"baobab":"baobab","d3":"d3"}],2:[function(require,module,exports){
var Baobab, DataSource, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

d3 = require('d3');

Baobab = require("baobab");

Interactive = require('./index');

DataSource = require('./data');

Interactive.ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource(values, columns) {
    this._cds = this.cursor.select('column_data_source');
    ColumnDataSource.__super__.constructor.call(this, values, columns);
    columns.map((function(_this) {
      return function(column_name) {
        return _this.apply(column_name);
      };
    })(this));
  }


  /* Create a new interactive data source
  table.apply 'mean', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
  table.projection()
   */

  ColumnDataSource.prototype.apply = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._add_derived_column.apply(this, args);
  };


  /*
  Create a new interactive cursor that defines a new Column Data Source
   */

  ColumnDataSource.prototype._add_derived_column = function(name, cursors, fn) {
    if (cursors == null) {
      cursors = [['columns', 0], ['values'], ['.', 'name']];
    }
    if (fn == null) {
      fn = function(columns, values, column_name) {
        var column_index;
        column_index = columns.indexOf(column_name);
        return values.map(function(row_values) {
          return row_values[column_index];
        });
      };
    }
    this._cds.set(name, {
      name: name,
      values: Baobab.monkey.apply(Baobab, slice.call(cursors).concat([fn]))
    });

    /* Always push derived columns to second part of columns */
    if (indexOf.call(['index'].concat(slice.call(this.derived())), name) < 0) {
      return this._columns.select(1).push(name);
    }
  };


  /* Append columns or rows without monkeys */

  ColumnDataSource.prototype.concat = function(arg) {
    var columns, values;
    columns = arg.columns, values = arg.values;
    if (columns != null) {
      d3.entries(columns).forEach((function(_this) {
        return function(arg1) {
          var key, value;
          key = arg1.key, value = arg1.value;

          /* Append the value to the raw columns */
          _this._columns.select(0).push(key);
          _this._values.set(_this.values().map(function(row, i) {
            return slice.call(row).concat([value[i]]);
          }));
          return _this._add_derived_column(key);
        };
      })(this));
    }
    return ColumnDataSource.__super__.concat.call(this, values);
  };

  ColumnDataSource.prototype.column_data_source = function() {
    var columns;
    columns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (columns.length === 0) {
      columns = this.derived();
    }
    return d3.zip.apply(d3, columns.map((function(_this) {
      return function(c) {
        return _this._cds.get(c, 'values');
      };
    })(this)));
  };

  return ColumnDataSource;

})(DataSource);

module.exports = Interactive.ColumnDataSource;


},{"./data":5,"./index":8,"baobab":"baobab","d3":"d3"}],3:[function(require,module,exports){
var Expression, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

d3 = require('d3');

Interactive = require('./index');

Expression = require('./expression');

Interactive.Column = (function(superClass) {
  extend(Column, superClass);

  Column.prototype.columns = function() {
    return d3.merge(this._columns.get());
  };

  Column.prototype.raw = function() {
    return this._columns.get(0);
  };

  Column.prototype.derived = function() {
    return this._columns.get(1);
  };

  function Column(columns) {
    var ref;
    this._columns = this.cursor.select('columns');
    this._columns.set((ref = [columns, []]) != null ? ref : [[], []]);
    this._columns.select(1).on('update', (function(_this) {
      return function(event) {
        return slice.call(event.data.previousData).filter(function(d) {
          var ref1;
          return ref1 = !d, indexOf.call(event.data.currentData, ref1) >= 0;
        }).forEach(function(column_name) {
          return this._cds[column_name].release();
        });
      };
    })(this));
    Column.__super__.constructor.call(this);
  }

  return Column;

})(Expression);

module.exports = Interactive.Column;


},{"./expression":6,"./index":8,"d3":"d3"}],4:[function(require,module,exports){
var Interactive, d3;

d3 = require("d3");

Interactive = require('./index');

Interactive.Compute = (function() {
  function Compute() {}

  Compute.prototype.compute = function() {

    /* Compute changes the state of the data tree */
    this._checkpoint.deepMerge({
      name: this.name(),
      readme: this.readme(),
      values: this.column_data_source(),
      metadata: this.metadata(),
      columns: [this.derived(), this.derived()]
    });
    return this;
  };

  Compute.prototype.rewind = function() {
    this.cursor.deepMerge({
      columns: this._checkpoint.get('columns'),
      values: this._checkpoint.get('values'),
      metadata: this._checkpoint.get('metadata')
    });
    this.columns.select(0).set(this._checkpoint.get('columns'));
    return this;
  };

  return Compute;

})();

module.exports = Interactive.Compute;


},{"./index":8,"d3":"d3"}],5:[function(require,module,exports){
var Interactive, Row,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Row = require('./rows');

Interactive.DataSource = (function(superClass) {
  extend(DataSource, superClass);

  DataSource.prototype.values = function() {
    return this._values.get();
  };

  function DataSource(values, columns) {
    this._values = this.cursor.select('values');
    this._values.set(values != null ? values : []);
    DataSource.__super__.constructor.call(this, values, columns);
  }

  DataSource.prototype.concat = function(values) {
    if (values != null) {
      values.forEach((function(_this) {
        return function(row) {
          return _this._values.push(row);
        };
      })(this));
    }
    return this;
  };

  return DataSource;

})(Row);

module.exports = Interactive.DataSource;


},{"./index":8,"./rows":9}],6:[function(require,module,exports){
var History, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Interactive = require('./index');

History = require('./history');

Interactive.Expression = (function(superClass) {
  extend(Expression, superClass);

  Expression.prototype.expression = function() {
    return this._expression.get();
  };

  function Expression() {
    this.expressions = [];
    this._expression = this.cursor.select('expression');
    this._expression.set([]);
    Expression.__super__.constructor.call(this);
  }

  Expression.prototype.execute = function(expressions) {
    expressions.forEach((function(_this) {
      return function(expression, expression_count) {
        return _this[expression[0]].apply(_this, expression.slice(1));
      };
    })(this));
    return this.compute();
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


},{"./history":7,"./index":8}],7:[function(require,module,exports){
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


},{"./compute":4,"./index":8}],8:[function(require,module,exports){
var Baobab, Interactive, Table, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Baobab = require('baobab');

d3 = require('d3');

Table = require('./table');


/*
An Interactive Table uses immutable cursor trees to track the evolution of
tabular data.
 */

Interactive = (function(superClass) {
  extend(Interactive, superClass);


  /* Table name Baobab cursor */

  Interactive.prototype.name = function() {
    return this._name.get();
  };


  /* Table information in readme Baobab cursor */

  Interactive.prototype.readme = function() {
    return this._readme.get();
  };


  /* Reset the Table back to its initial state */

  Interactive.prototype.reset = function() {
    this.cursor.deepMerge(this._init.get());
    return this;
  };


  /*
  Create a new interactive table.  An Interactive Table is similar to a DataFrame
  in that it is both a list and column data source.  Rows and columns can be
  accessed independently.  Operations can be applied to both rows and columns.
  
  @param [Object] record_orient_data Record orient data contains the columns and
  values.
  
  @example Create a new interactive table
    table = new CoffeeTable
      columns: ['x', 'y']
      values: [
        [1, 2]
        [3, 8]
        [-1,4]
        [5,7]
      ]
   */

  function Interactive(record_orient_data) {
    var ref, ref1;
    this.tree = new Baobab(record_orient_data);
    this.cursor = this.tree.select(0);
    this._init = this.cursor.select('init');
    this._init.set(record_orient_data);
    this._readme = this.cursor.select('readme');
    this._readme.set((ref = record_orient_data.readme) != null ? ref : "");
    this._name = this.cursor.select('name');
    this._name.set((ref1 = record_orient_data.name) != null ? ref1 : "Some name");
    Interactive.__super__.constructor.call(this, this.cursor.project({
      values: ['values'],
      columns: ['columns'],
      metadata: ['metadata']
    }));
    this.compute();
  }


  /*
  Project selects a subset of columns
  @example Selection the index, x, and y
    table.projection 'index','x','y'
   */

  Interactive.prototype.projection = function() {
    var columns;
    columns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this._values.set(this.column_data_source.apply(this, columns));
    this._columns.select(0).set(this.derived());
    this._expression.push(['projection'].concat(slice.call(columns)));
    return this;
  };


  /*
  Transform adds named columns to the table
  @param [Object] transformers is an object of named columns.  The new columns
  are defined by ``cursors`` and a function ``fn``.
  @example Create two new columns mean and std.
    table.transform
      mean: { cursors: ['x','y'], fn: (x,y)-> (x+y)/2 }
      std: { cursors: ['x','y'], fn: require('d3').deviation }
   */

  Interactive.prototype.transform = function(transformers) {
    d3.entries(transformers).forEach((function(_this) {
      return function(arg1) {
        var cursors, fn, i, key, value;
        key = arg1.key, value = arg1.value;
        cursors = 2 <= value.length ? slice.call(value, 0, i = value.length - 1) : (i = 0, []), fn = value[i++];
        return _this._add_derived_column(key, cursors.map(function(col) {
          return ['column_data_source', col, 'values'];
        }), fn);
      };
    })(this));
    this._expression.push(['transform', transformers]);
    return this;
  };


  /*
  Filter elements columns based on a predicate function.
  @param [String] columns a list of columns to include in the predicate function
  @param [Function] fn a predicate function with access to each of the columns.
  
  @example Filter columns ``x`` and ``y``
    table.filter 'x','y', (x,y)-> x > 0 and y < 5
   */

  Interactive.prototype.filter = function() {
    var columns, fn, i, new_values, values;
    columns = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), fn = arguments[i++];
    values = this.column_data_source.apply(this, columns);
    new_values = values.filter(fn);
    this.index.set(new_values.map((function(_this) {
      return function(v) {
        return values.indexOf(v);
      };
    })(this)));
    this.values.set(values);
    this._expression.push(['filter'].concat(slice.call(columns), [fn.toString()]));
    return this;
  };


  /*
  Concatenate new values to the table.
  @param [Object] new_values responds to the keys ``columns`` and ``values`` to
  append in the column direction or row direction, respectively.
  @example Add a Two Rows
    table.concat
      values: [
        [-3,4]
        [1,9]
      ]
  @example Add One Column.  The Array has a length of six because two rows were just added.
    table.concat
      columns:
        z: [-3,4,1,9,6,-4]
   */

  Interactive.prototype.concat = function(value_object) {
    Interactive.__super__.concat.call(this, value_object);
    this._expression.push(['concat', value_object]);
    return this;
  };


  /*
  Apply a function to a column
  @example Apply a function to x depending on y
    table.apply 'x', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
   */

  Interactive.prototype.apply = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    Interactive.__super__.apply.apply(this, args);
    return this._expression.push([
      'apply', args.map(function(arg) {
        return JSON.parse(JSON.stringify(arg));
      })
    ]);
  };

  return Interactive;

})(Table);

module.exports = Interactive;


},{"./table":10,"baobab":"baobab","d3":"d3"}],9:[function(require,module,exports){
var Baobab, Column, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Baobab = require('baobab');

d3 = require('d3');

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

  function Row(values, columns) {
    this._index = this.cursor.select('index');
    this._index.set(d3.range(values.length));
    this._length = this.cursor.select('length');
    this._length.set('length', Baobab.monkey(['values'], function(values) {
      return values.length;
    }));
    this._index.on('update', (function(_this) {
      return function(event) {
        var new_index, old_index;
        new_index = event.data.currentData;
        if (event.data.previousData != null) {
          old_index = event.data.previousData;
          new_index = new_index.map(function(i) {
            return old_index.indexOf(i);
          });
          values = _this.values();
          return _this._values.set(new_index.map(function(i) {
            return values[i];
          }));
        }
      };
    })(this));
    Row.__super__.constructor.call(this, columns);
    this._add_derived_column('index', [['index']], function(index) {
      return index;
    });
  }


  /*
  table.iloc [2,3]
  table._index.set [2,3,0,1]
  table.iloc [2,3]
   */

  Row.prototype.iloc = function(selection) {
    var index, values;
    index = this.index();
    values = this.values();
    if (selection != null) {
      return values = selection.map((function(_this) {
        return function(i) {
          return values[i];
        };
      })(this));
    }
  };


  /*
  table.loc [2,3]
  table._index.set [2,3,0,1]
  table.loc [2,3]
   */

  Row.prototype.loc = function(selection) {
    var index, values;
    index = this.index();
    values = this.values();
    if (selection != null) {
      values = selection.map((function(_this) {
        return function(i) {
          return values[index.indexOf(i)];
        };
      })(this));
    }
    return values;
  };

  Row.prototype.update = function() {};

  return Row;

})(Column);

module.exports = Interactive.Row;


},{"./columns":3,"./index":8,"baobab":"baobab","d3":"d3"}],10:[function(require,module,exports){
var ColumnDataSource, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

ColumnDataSource = require('./column_data_source');

Interactive.Table = (function(superClass) {
  extend(Table, superClass);


  /* Return the metadata of the columns */

  Table.prototype.metadata = function(args) {
    var tmp;
    if (args != null) {
      tmp = {};
      args.forEach((function(_this) {
        return function(arg) {
          return tmp[arg] = arg;
        };
      })(this));
      return this._metadata.project(tmp);
    } else {
      return this._metadata.get;
    }
  };

  function Table(arg1) {
    var columns, metadata, ref, values;
    values = arg1.values, columns = arg1.columns, metadata = arg1.metadata;
    this._metadata = this.cursor.select('metadata');
    this._metadata.set((ref = this._metadata.get()) != null ? ref : metadata);
    Table.__super__.constructor.call(this, values, columns);
    this.compute();
  }

  return Table;

})(ColumnDataSource);


/*
A formatted string of the table.
 */

Interactive.Table.prototype.to_string = function() {};


/*
JSONify the current state of the table.

@param [Boolean] index True includes the index in the JSON string.
 */

Interactive.Table.prototype.to_json = function(index) {
  var cursors;
  if (index == null) {
    index = true;
  }
  cursors = {
    columns: ['columns'],
    values: ['values']
  };
  if (index) {
    cursors['index'] = ['index'];
  }
  return JSON.stringify(this.cursor.project(cursors));
};

module.exports = Interactive.Table;


},{"./column_data_source":2,"./index":8}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaW5kZXguY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3Jvd3MuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3RhYmxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7O0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErRU0sTUFBTSxDQUFDO0VBS0UscUJBQUMsR0FBRDtJQUFDLElBQUMsQ0FBQSxNQUFEO0lBQVEsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsR0FBVCxFQUFjLFNBQUMsQ0FBRDthQUFNLDZDQUFNLENBQU47SUFBTixDQUFkO0VBQVQ7O3dCQUNiLE9BQUEsR0FBUzs7Ozs7O0FBRVgsV0FBVyxDQUFDLFdBQVosR0FBMEIsT0FBQSxDQUFRLGVBQVI7O0FBQzFCLFdBQVcsQ0FBQyxnQkFBWixHQUErQixPQUFBLENBQVEsZUFBUjs7QUFHL0IsTUFBTSxDQUFDLEtBQVAsR0FBbUIsSUFBQSxXQUFXLENBQUMsV0FBWixDQUNqQjtF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LEdBQUksQ0FBQSxHQUFBLENBQUosR0FBVztRQUFuQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYjthQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixHQUFuQixFQUhGO0tBQUEsTUFBQTthQUtFLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFMYjs7RUFEUTs7RUFXRyxlQUFDLElBQUQ7QUFFWCxRQUFBO0lBRmEsY0FBQSxRQUFRLGVBQUEsU0FBUyxnQkFBQTtJQUU5QixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLFVBQWY7SUFDYixJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsOENBQWtDLFFBQWxDO0lBQ0EsdUNBQU0sTUFBTixFQUFjLE9BQWQ7SUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBO0VBTFc7Ozs7R0FiaUI7OztBQW9CaEM7Ozs7QUFHQSxXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxTQUFuQixHQUErQixTQUFBLEdBQUE7OztBQUMvQjs7Ozs7O0FBS0EsV0FBVyxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsT0FBbkIsR0FBNkIsU0FBQyxLQUFEO0FBQzNCLE1BQUE7O0lBRDRCLFFBQU07O0VBQ2xDLE9BQUEsR0FDRTtJQUFBLE9BQUEsRUFBUyxDQUFDLFNBQUQsQ0FBVDtJQUNBLE1BQUEsRUFBUSxDQUFDLFFBQUQsQ0FEUjs7RUFFRixJQUFHLEtBQUg7SUFBYyxPQUFRLENBQUEsT0FBQSxDQUFSLEdBQW1CLENBQUMsT0FBRCxFQUFqQzs7U0FDQSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixPQUFoQixDQUFmO0FBTDJCOztBQU83QixNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5kMyA9IHJlcXVpcmUgXCJkM1wiXG4jIyNcbmludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuXG5AZXhhbXBsZSBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgQ29mZmVlVGFibGVcbiAgdGFibGUgPSBuZXcgQ29mZmVlVGFibGVcbiAgICBuYW1lOiBcIlBvbHlnb25cIlxuICAgIHJlYWRtZTogXCJBIHJlY3RhbmdsZVwiXG4gICAgbWV0YWRhdGE6IHt4Oidob3Jpem9udGFsIGRpcmVjdGlvbicseTondmVydGljYWwgZGlyZWN0aW9uJ31cbiAgICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gICAgdmFsdWVzOiBbWzEsIDNdLFsyLCA4XSxbMywxM11dXG5cbkBleGFtcGxlIEFkZCBhIGNvbHVtbiBvZiBkYXRhIHdpdGggQ29uY2F0XG4gIHRhYmxlLmNvbmNhdFxuICAgIGNvbHVtbnM6XG4gICAgICB6OiBbNSwgNCwgM11cblxuQGV4YW1wbGUgQWRkIHR3byByb3dzIG9mIGRhdGEgd2l0aCBDb25jYXRcbiAgdGFibGUuY29uY2F0XG4gICAgdmFsdWVzOiBbXG4gICAgICBbNCwgMTgsIDJdXG4gICAgICBbNSwgMjMsIDFdXG4gICAgXVxuXG5AZXhhbXBsZSBBZGQgYSBuZXcgY29sdW1uIHRoYXQgaXMgYSBmdW5jdGlvbiBvZiBleGlzdGluZyBjb2x1bW5zIHggYW5kIHlcbiAgdGFibGUudHJhbnNmb3JtXG4gICAgdDogJ3gnLCAneScsICh4LCB5KS0+XG4gICAgICBkMy56aXAoeCwgeSkubWFwICh2KS0+IE1hdGgudGFuIHZbMV0vIHZbMF1cblxuQGV4YW1wbGUgTWFrZSBhIGNoZWNrcG9pbnQgb3Igc3RvcmUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGNvbHVtbnMgYW5kIHZhbHVlcyB0byByZXVzZSBsYXRlci5cbiAgdGFibGUuY29tcHV0ZSgpXG5cbkBleGFtcGxlIENyZWF0ZSBhIG5ldyBjb3B5IHdpdGggdGhlIHggYW5kIGFuZ2xlIGNvbHVtbnNcbiAgdmVjdG9ycyA9IHRhYmxlLnByb2plY3Rpb24gJ3gnLCd0J1xuICAgIC5jb3B5KClcblxuVGhlIHN0YXRlIG9mIHRoZSB0YWJsZSAgaXMgc3RpbGwgdGhlIHByb2plY3Qgb2YgeCBhbmQgdC5cblxuQGV4YW1wbGUgUmV2ZXJ0IHRoZSB0YWJsZSBiYWNrIHRvIHRoZSBsYXN0IGNoZWNrcG9pbnQuXG4gIHRhYmxlLnJld2luZCgpXG5cbk5vdyB0aGUgdGFibGUgaGFzIGZvciBjb2x1bW5zXG5cbiAgYWxlcnQgdGFibGUubmFtZSgpICsgJyBoYXMgJyArIHRhYmxlLmluZGV4KCkubGVuZ3RoICsgJyByb3cgIGFuZCB0aGUgZmllbGRzOiAnICsgdGFibGUuY29sdW1ucygpLmpvaW4oJywgJylbLi4tMl1cblxuQGV4YW1wbGUgQWRkIGEgY2F0ZWdvcmljYWwgY29sdW1uc1xuICB0YWJsZS50cmFuc2Zvcm1cbiAgICAgICdjb2xvcic6ICd5JywgKHkpLT4geS5tYXAgKHYpLT4gWydyZWQnLCdncmVlbicsJ2JsdWUnXVt2ICUlIDEwXVxuICAgIC5jb21wdXRlKClcblxuXG5AZXhhbXBsZSBTZXBhcmF0ZSB0aGUgcmVkIGFuZCB0aGUgZ3JlZW5zLlxuICBncmVlbiA9IHRhYmxlLmZpbHRlciAnY29sb3InLCAoY29sb3IpLT4gY29sb3IgaW4gWydncmVlbiddXG4gICAgLmNvcHkoKVxuICByZWQgPSB0YWJsZS5yZXdpbmQoKS5maWx0ZXIgJ2NvbG9yJywgKGNvbG9yKS0+IGNvbG9yIGluIFsncmVkJ11cbiAgICAuY29weSgpXG5cblNlcGFyYXRpbmcgY29tcHV0ZSBmcm9tIHRoZSB2YWx1ZXMuXG5cbkNvZmZlZVRhYmxlIHN0b3JlcyBhIGhpc3Rvcnkgb2YgdGhlIHRyYW5zZm9ybWF0aW9uc1xuXG5AZXhhbXBsZSBTaG93IFRhYmxlIEV4cHJlc3Npb24gaGlzdG9yeVxuICB0YWJsZS5oaXN0b3J5KClcbiAgdGFibGUuZXhwcmVzc2lvbigpXG5cbmluIHRoZSBuZXh0IGV4YW1wbGUgYW4gZXhwcmVzc2lvbiBpcyBjcmVhdGVkIG9uIHRoZSBncmVlbiB0aGUgdGFibGUgYW5kIGl0c1xuZXhwcmVzc2lvbnMgYXJlIGFwcGxpZWQgdG8gdGhlIHJlZCB0YWJsZS4gIE1ldGhvZHMgYXJlIGNoYWluYWJsZS5cblxuQGV4YW1wbGUgQXBwbHkgZXhwcmVzc2lvbnMgdG8gZ3JlZW4gdGhlbiB1c2UgdGhlIGV4cHJlc3Npb25zIG9uIHJlZFxuICBncmVlbi5zb3J0ICd4J1xuICAgIC51bmlxdWUoKVxuICAgIC50cmFuc2Zvcm1cbiAgICAgIHByb2Q6ICd4JywgJ3knLCAoeCx5KS0+IGQzLnppcCh4LHkpLm1hcCAodiktPiB2WzFdKnZbMF1cblxuICByZWQuZXZhbHVhdGUgZ3JlZW4uaGlzdG9yeSgpXG5cblxuPiBOb24tY29sdW1uL290aGVyIGN1cnNvciBjb250ZW50IGlzIGFuIGFycmF5LlxuXG4jIyNcbmNsYXNzIHdpbmRvdy5Db2ZmZWVUYWJsZVxuICAjIENvbnN0cnVjdCBhIGNvbGxlY3Rpb24gb2YgQ29mZmVlVGFibGUgYm9va3MuXG4gICMgQHBhcmFtIFtPYmplY3RdIGNvbnRlbnQgY29udGFpbnMgbWFueSBUYWJ1bGFyIGRhdGFzZXRzXG4gICMgQHBhcmFtIFtPYmplY3RdIHB1Ymxpc2hlciBjb250YWlucyBtYW55IERPTSBzZWxlY3Rpb25zXG4gICMgQHBhcmFtIFtPYmplY3RdIGJvb2sgdXNlIHB1Ymxpc2hlcnMgdG8gcHJlc2VudCBhbmQgdXBkYXRlIGNvbnRlZW50XG4gIGNvbnN0cnVjdG9yOiAoQHVybCktPiBkMy5qc29uIEB1cmwsIChkKS0+IHN1cGVyIGRcbiAgdmVyc2lvbjogJzAuMS4wJ1xuXG5Db2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5Db2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZUdyYXBoID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcblxuXG53aW5kb3cudGFibGUgPSBuZXcgQ29mZmVlVGFibGUuSW50ZXJhY3RpdmVcbiAgY29sdW1uczogWyd4JywgJ3knXVxuICB2YWx1ZXM6IFtcbiAgICBbMSwgMl1cbiAgICBbMywgOF1cbiAgICBbLTEsNF1cbiAgICBbNSw3XVxuICBdXG53aW5kb3cuc3F1YXJlID0gbmV3IENvZmZlZVRhYmxlLkludGVyYWN0aXZlXG4gIGNvbHVtbnM6IFsneCcsICd5J11cbiAgdmFsdWVzOiBbXG4gICAgWzEsIDFdXG4gICAgWzcsN11cbiAgXVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvZmZlZVRhYmxlXG4gIGQzXG4gIEJhb2JhYlxufVxuIiwiZDMgPSByZXF1aXJlICdkMydcbkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vZGF0YSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZSBleHRlbmRzIERhdGFTb3VyY2VcbiAgY29uc3RydWN0b3I6ICh2YWx1ZXMsIGNvbHVtbnMpLT5cbiAgICBAX2NkcyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5fZGF0YV9zb3VyY2UnXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG4gICAgY29sdW1ucy5tYXAgKGNvbHVtbl9uYW1lKT0+IEBhcHBseSBjb2x1bW5fbmFtZVxuXG4gICMjIyBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VcbiAgdGFibGUuYXBwbHkgJ21lYW4nLCBbJ3gnLCd5J10sICh4LHkpLT4gZDMuemlwKHgseSkubWFwICh2KS0+IGQzLm1lYW4gdlxuICB0YWJsZS5wcm9qZWN0aW9uKClcbiAgIyMjXG4gIGFwcGx5OiAoYXJncy4uLiktPiBAX2FkZF9kZXJpdmVkX2NvbHVtbiBhcmdzLi4uXG4gICMjI1xuICBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgY3Vyc29yIHRoYXQgZGVmaW5lcyBhIG5ldyBDb2x1bW4gRGF0YSBTb3VyY2VcbiAgIyMjXG4gIF9hZGRfZGVyaXZlZF9jb2x1bW46IChuYW1lLCBjdXJzb3JzLCBmbiktPlxuICAgIGN1cnNvcnMgPz0gW1snY29sdW1ucycsMF0sWyd2YWx1ZXMnXSxbJy4nLCduYW1lJ11dXG4gICAgZm4gPz0gKGNvbHVtbnMsdmFsdWVzLGNvbHVtbl9uYW1lKS0+XG4gICAgICBjb2x1bW5faW5kZXggPSBjb2x1bW5zLmluZGV4T2YgY29sdW1uX25hbWVcbiAgICAgIHZhbHVlcy5tYXAgKHJvd192YWx1ZXMpLT4gcm93X3ZhbHVlc1tjb2x1bW5faW5kZXhdXG4gICAgQF9jZHMuc2V0IG5hbWUsXG4gICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgdmFsdWVzOiBCYW9iYWIubW9ua2V5IGN1cnNvcnMuLi4sIGZuXG4gICAgIyMjIEFsd2F5cyBwdXNoIGRlcml2ZWQgY29sdW1ucyB0byBzZWNvbmQgcGFydCBvZiBjb2x1bW5zICMjI1xuICAgIHVubGVzcyBuYW1lIGluIFsnaW5kZXgnLEBkZXJpdmVkKCkuLi5dXG4gICAgICBAX2NvbHVtbnMuc2VsZWN0KDEpLnB1c2ggbmFtZVxuXG5cbiAgIyMjIEFwcGVuZCBjb2x1bW5zIG9yIHJvd3Mgd2l0aG91dCBtb25rZXlzICMjI1xuICBjb25jYXQ6ICh7Y29sdW1ucyx2YWx1ZXN9KS0+XG4gICAgaWYgY29sdW1ucz9cbiAgICAgICNhbGVydCBKU09OLnN0cmluZ2lmeSBjb2x1bW5zXG4gICAgICBkMy5lbnRyaWVzKGNvbHVtbnMpLmZvckVhY2ggKHtrZXksIHZhbHVlfSk9PlxuICAgICAgICAjIyMgQXBwZW5kIHRoZSB2YWx1ZSB0byB0aGUgcmF3IGNvbHVtbnMgIyMjXG4gICAgICAgIEBfY29sdW1ucy5zZWxlY3QoMCkucHVzaCBrZXlcbiAgICAgICAgQF92YWx1ZXMuc2V0IEB2YWx1ZXMoKS5tYXAgKHJvdyxpKT0+IFtyb3cuLi4sdmFsdWVbaV1dXG4gICAgICAgIEBfYWRkX2Rlcml2ZWRfY29sdW1uIGtleVxuICAgIHN1cGVyIHZhbHVlc1xuXG5cbiAgY29sdW1uX2RhdGFfc291cmNlOiAoY29sdW1ucy4uLiktPlxuICAgIGlmIGNvbHVtbnMubGVuZ3RoID09IDAgdGhlbiBjb2x1bW5zID0gQGRlcml2ZWQoKVxuICAgIGQzLnppcCBjb2x1bW5zLm1hcCggKGMpID0+IEBfY2RzLmdldChjLCd2YWx1ZXMnKSkuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5EYXRhU291cmNlXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuRXhwcmVzc2lvbiA9IHJlcXVpcmUgJy4vZXhwcmVzc2lvbidcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uIGV4dGVuZHMgRXhwcmVzc2lvblxuICBjb2x1bW5zOiAoKS0+IGQzLm1lcmdlIEBfY29sdW1ucy5nZXQoKVxuXG4gIHJhdzogKCktPiBAX2NvbHVtbnMuZ2V0IDBcbiAgZGVyaXZlZDogKCktPiBAX2NvbHVtbnMuZ2V0IDFcblxuICBjb25zdHJ1Y3RvcjogKGNvbHVtbnMpLT5cbiAgICBAX2NvbHVtbnMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1ucydcbiAgICAjIFtyYXdfY29sdW1ucywgZGVyaXZlZF9jb2x1bW5zXVxuICAgIEBfY29sdW1ucy5zZXQgW2NvbHVtbnMsW11dID8gW1tdLFtdXVxuICAgICMgdXBkYXRlIHRoZSB2YWx1ZXMgd2hlbiB0aGUgcmF3X2NvbHVtbnMgY2hhbmdlXG4gICAgQF9jb2x1bW5zLnNlbGVjdCgxKS5vbiAndXBkYXRlJywgKGV2ZW50KT0+XG4gICAgICBbZXZlbnQuZGF0YS5wcmV2aW91c0RhdGEuLi5dLmZpbHRlciAoZCk9PiBub3QgZCBpbiBldmVudC5kYXRhLmN1cnJlbnREYXRhXG4gICAgICAgIC5mb3JFYWNoIChjb2x1bW5fbmFtZSktPiBAX2Nkc1tjb2x1bW5fbmFtZV0ucmVsZWFzZSgpXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtblxuIiwiZDMgPSByZXF1aXJlIFwiZDNcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db21wdXRlXG4gIGNvbXB1dGU6ICgpLT5cbiAgICAjIyMgQ29tcHV0ZSBjaGFuZ2VzIHRoZSBzdGF0ZSBvZiB0aGUgZGF0YSB0cmVlICMjI1xuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIG5hbWU6IEBuYW1lKClcbiAgICAgIHJlYWRtZTogQHJlYWRtZSgpXG4gICAgICB2YWx1ZXM6IEBjb2x1bW5fZGF0YV9zb3VyY2UoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBbQGRlcml2ZWQoKSwgQGRlcml2ZWQoKV1cbiAgICB0aGlzXG5cbiAgcmV3aW5kOiAoKS0+XG4gICAgQGN1cnNvci5kZWVwTWVyZ2VcbiAgICAgIGNvbHVtbnM6IEBfY2hlY2twb2ludC5nZXQgJ2NvbHVtbnMnXG4gICAgICB2YWx1ZXM6IEBfY2hlY2twb2ludC5nZXQgJ3ZhbHVlcydcbiAgICAgIG1ldGFkYXRhOiBAX2NoZWNrcG9pbnQuZ2V0ICdtZXRhZGF0YSdcbiAgICBAY29sdW1ucy5zZWxlY3QoMCkuc2V0IEBfY2hlY2twb2ludC5nZXQgJ2NvbHVtbnMnXG4gICAgdGhpc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29tcHV0ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuUm93ID0gcmVxdWlyZSAnLi9yb3dzJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5EYXRhU291cmNlIGV4dGVuZHMgUm93XG4gIHZhbHVlczogKCktPiBAX3ZhbHVlcy5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIEBfdmFsdWVzID0gQGN1cnNvci5zZWxlY3QgJ3ZhbHVlcydcbiAgICBAX3ZhbHVlcy5zZXQgdmFsdWVzID8gW11cbiAgICBzdXBlciB2YWx1ZXMsIGNvbHVtbnNcblxuICBjb25jYXQ6ICh2YWx1ZXMpLT5cbiAgICB2YWx1ZXM/LmZvckVhY2ggKHJvdyk9PiBAX3ZhbHVlcy5wdXNoIHJvd1xuICAgIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5EYXRhU291cmNlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoKS0+IEBfZXhwcmVzc2lvbi5nZXQoKVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXhwcmVzc2lvbnMgPSBbXVxuICAgIEBfZXhwcmVzc2lvbiA9IEBjdXJzb3Iuc2VsZWN0ICdleHByZXNzaW9uJ1xuICAgIEBfZXhwcmVzc2lvbi5zZXQgW11cbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCk9PlxuICAgICAgQFtleHByZXNzaW9uWzBdXSBleHByZXNzaW9uWzEuLl0uLi5cbiAgICBAY29tcHV0ZSgpXG5cbiAgZ2V0OiAoYXJncy4uLiktPiBAY3Vyc29yLmdldCBhcmdzLi4uXG4gIHNldDogKGFyZ3MuLi4pLT4gQGN1cnNvci5zZXQgYXJncy4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkV4cHJlc3Npb25cbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbXB1dGUgPSByZXF1aXJlICcuL2NvbXB1dGUnXG5cbmNsYXNzIEludGVyYWN0aXZlLkhpc3RvcnkgZXh0ZW5kcyBDb21wdXRlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY2hlY2twb2ludCA9IEBjdXJzb3Iuc2VsZWN0ICdjaGVja3BvaW50J1xuICAgIEBfY2hlY2twb2ludC5zZXQge31cbiAgICBAX2V4cHJlc3Npb24uc3RhcnRSZWNvcmRpbmcgMjBcbiAgICBzdXBlcigpXG4gIGhpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5nZXRIaXN0b3J5KClcbiAgY2xlYXJfaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmNsZWFySGlzdG9yeSgpXG4gIHJlY29yZDogKGV4cHJlc3Npb24pLT5cbiAgICBAZXhwcmVzc2lvbnMucHVzaCBleHByZXNzaW9uXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuSGlzdG9yeVxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuZDMgPSByZXF1aXJlICdkMydcblRhYmxlID0gcmVxdWlyZSAnLi90YWJsZSdcblxuIyMjXG5BbiBJbnRlcmFjdGl2ZSBUYWJsZSB1c2VzIGltbXV0YWJsZSBjdXJzb3IgdHJlZXMgdG8gdHJhY2sgdGhlIGV2b2x1dGlvbiBvZlxudGFidWxhciBkYXRhLlxuIyMjXG5jbGFzcyBJbnRlcmFjdGl2ZSBleHRlbmRzIFRhYmxlXG4gICMjIyBUYWJsZSBuYW1lIEJhb2JhYiBjdXJzb3IgIyMjXG4gIG5hbWU6ICgpLT4gQF9uYW1lLmdldCgpXG4gICMjIyBUYWJsZSBpbmZvcm1hdGlvbiBpbiByZWFkbWUgQmFvYmFiIGN1cnNvciAjIyNcbiAgcmVhZG1lOiAoKS0+IEBfcmVhZG1lLmdldCgpXG4gICMjIyBSZXNldCB0aGUgVGFibGUgYmFjayB0byBpdHMgaW5pdGlhbCBzdGF0ZSAgIyMjXG4gIHJlc2V0OiAoKS0+XG4gICAgQGN1cnNvci5kZWVwTWVyZ2UgQF9pbml0LmdldCgpXG4gICAgdGhpc1xuICAjIyNcbiAgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIHRhYmxlLiAgQW4gSW50ZXJhY3RpdmUgVGFibGUgaXMgc2ltaWxhciB0byBhIERhdGFGcmFtZVxuICBpbiB0aGF0IGl0IGlzIGJvdGggYSBsaXN0IGFuZCBjb2x1bW4gZGF0YSBzb3VyY2UuICBSb3dzIGFuZCBjb2x1bW5zIGNhbiBiZVxuICBhY2Nlc3NlZCBpbmRlcGVuZGVudGx5LiAgT3BlcmF0aW9ucyBjYW4gYmUgYXBwbGllZCB0byBib3RoIHJvd3MgYW5kIGNvbHVtbnMuXG5cbiAgQHBhcmFtIFtPYmplY3RdIHJlY29yZF9vcmllbnRfZGF0YSBSZWNvcmQgb3JpZW50IGRhdGEgY29udGFpbnMgdGhlIGNvbHVtbnMgYW5kXG4gIHZhbHVlcy5cblxuICBAZXhhbXBsZSBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgdGFibGVcbiAgICB0YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZVxuICAgICAgY29sdW1uczogWyd4JywgJ3knXVxuICAgICAgdmFsdWVzOiBbXG4gICAgICAgIFsxLCAyXVxuICAgICAgICBbMywgOF1cbiAgICAgICAgWy0xLDRdXG4gICAgICAgIFs1LDddXG4gICAgICBdXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKHJlY29yZF9vcmllbnRfZGF0YSktPlxuXG4gICAgQHRyZWUgPSBuZXcgQmFvYmFiIHJlY29yZF9vcmllbnRfZGF0YVxuICAgIEBjdXJzb3IgPSBAdHJlZS5zZWxlY3QgMFxuXG4gICAgQF9pbml0ID0gQGN1cnNvci5zZWxlY3QgJ2luaXQnXG4gICAgQF9pbml0LnNldCByZWNvcmRfb3JpZW50X2RhdGFcblxuICAgIEBfcmVhZG1lID0gQGN1cnNvci5zZWxlY3QgJ3JlYWRtZSdcbiAgICBAX3JlYWRtZS5zZXQgcmVjb3JkX29yaWVudF9kYXRhLnJlYWRtZSA/IFwiXCJcblxuICAgIEBfbmFtZSA9IEBjdXJzb3Iuc2VsZWN0ICduYW1lJ1xuICAgIEBfbmFtZS5zZXQgcmVjb3JkX29yaWVudF9kYXRhLm5hbWUgPyBcIlNvbWUgbmFtZVwiXG5cbiAgICBzdXBlciBAY3Vyc29yLnByb2plY3RcbiAgICAgIHZhbHVlczogWyd2YWx1ZXMnXVxuICAgICAgY29sdW1uczogWydjb2x1bW5zJ11cbiAgICAgIG1ldGFkYXRhOiBbJ21ldGFkYXRhJ11cblxuICAgIEBjb21wdXRlKClcblxuICAjIyNcbiAgUHJvamVjdCBzZWxlY3RzIGEgc3Vic2V0IG9mIGNvbHVtbnNcbiAgQGV4YW1wbGUgU2VsZWN0aW9uIHRoZSBpbmRleCwgeCwgYW5kIHlcbiAgICB0YWJsZS5wcm9qZWN0aW9uICdpbmRleCcsJ3gnLCd5J1xuICAjIyNcbiAgcHJvamVjdGlvbjogKGNvbHVtbnMuLi4pLT5cbiAgICBAX3ZhbHVlcy5zZXQgQGNvbHVtbl9kYXRhX3NvdXJjZSBjb2x1bW5zLi4uXG4gICAgQF9jb2x1bW5zLnNlbGVjdCgwKS5zZXQgQGRlcml2ZWQoKVxuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsncHJvamVjdGlvbicsIGNvbHVtbnMuLi5dXG4gICAgdGhpc1xuXG4gICMjI1xuICBUcmFuc2Zvcm0gYWRkcyBuYW1lZCBjb2x1bW5zIHRvIHRoZSB0YWJsZVxuICBAcGFyYW0gW09iamVjdF0gdHJhbnNmb3JtZXJzIGlzIGFuIG9iamVjdCBvZiBuYW1lZCBjb2x1bW5zLiAgVGhlIG5ldyBjb2x1bW5zXG4gIGFyZSBkZWZpbmVkIGJ5IGBgY3Vyc29yc2BgIGFuZCBhIGZ1bmN0aW9uIGBgZm5gYC5cbiAgQGV4YW1wbGUgQ3JlYXRlIHR3byBuZXcgY29sdW1ucyBtZWFuIGFuZCBzdGQuXG4gICAgdGFibGUudHJhbnNmb3JtXG4gICAgICBtZWFuOiB7IGN1cnNvcnM6IFsneCcsJ3knXSwgZm46ICh4LHkpLT4gKHgreSkvMiB9XG4gICAgICBzdGQ6IHsgY3Vyc29yczogWyd4JywneSddLCBmbjogcmVxdWlyZSgnZDMnKS5kZXZpYXRpb24gfVxuICAjIyNcbiAgdHJhbnNmb3JtOiAodHJhbnNmb3JtZXJzKS0+XG4gICAgZDMuZW50cmllcyB0cmFuc2Zvcm1lcnNcbiAgICAgIC5mb3JFYWNoICh7a2V5LHZhbHVlfSk9PlxuICAgICAgICBbY3Vyc29ycy4uLixmbl0gPSB2YWx1ZVxuICAgICAgICBAX2FkZF9kZXJpdmVkX2NvbHVtbiBrZXksIGN1cnNvcnMubWFwKChjb2wpLT5bJ2NvbHVtbl9kYXRhX3NvdXJjZScsY29sLCd2YWx1ZXMnXSksIGZuXG4gICAgQF9leHByZXNzaW9uLnB1c2ggWyd0cmFuc2Zvcm0nLCB0cmFuc2Zvcm1lcnNdXG4gICAgdGhpc1xuXG4gICMjI1xuICBGaWx0ZXIgZWxlbWVudHMgY29sdW1ucyBiYXNlZCBvbiBhIHByZWRpY2F0ZSBmdW5jdGlvbi5cbiAgQHBhcmFtIFtTdHJpbmddIGNvbHVtbnMgYSBsaXN0IG9mIGNvbHVtbnMgdG8gaW5jbHVkZSBpbiB0aGUgcHJlZGljYXRlIGZ1bmN0aW9uXG4gIEBwYXJhbSBbRnVuY3Rpb25dIGZuIGEgcHJlZGljYXRlIGZ1bmN0aW9uIHdpdGggYWNjZXNzIHRvIGVhY2ggb2YgdGhlIGNvbHVtbnMuXG5cbiAgQGV4YW1wbGUgRmlsdGVyIGNvbHVtbnMgYGB4YGAgYW5kIGBgeWBgXG4gICAgdGFibGUuZmlsdGVyICd4JywneScsICh4LHkpLT4geCA+IDAgYW5kIHkgPCA1XG4gICMjI1xuICBmaWx0ZXI6IChjb2x1bW5zLi4uLCBmbiktPlxuICAgIHZhbHVlcyA9IEBjb2x1bW5fZGF0YV9zb3VyY2UgY29sdW1ucy4uLlxuICAgIG5ld192YWx1ZXMgPSB2YWx1ZXMuZmlsdGVyIGZuXG4gICAgQGluZGV4LnNldCBuZXdfdmFsdWVzLm1hcCAodik9PiB2YWx1ZXMuaW5kZXhPZiB2XG4gICAgQHZhbHVlcy5zZXQgdmFsdWVzXG4gICAgQF9leHByZXNzaW9uLnB1c2ggWydmaWx0ZXInLCBjb2x1bW5zLi4uLCBmbi50b1N0cmluZygpXVxuICAgIHRoaXNcblxuICAjIyNcbiAgQ29uY2F0ZW5hdGUgbmV3IHZhbHVlcyB0byB0aGUgdGFibGUuXG4gIEBwYXJhbSBbT2JqZWN0XSBuZXdfdmFsdWVzIHJlc3BvbmRzIHRvIHRoZSBrZXlzIGBgY29sdW1uc2BgIGFuZCBgYHZhbHVlc2BgIHRvXG4gIGFwcGVuZCBpbiB0aGUgY29sdW1uIGRpcmVjdGlvbiBvciByb3cgZGlyZWN0aW9uLCByZXNwZWN0aXZlbHkuXG4gIEBleGFtcGxlIEFkZCBhIFR3byBSb3dzXG4gICAgdGFibGUuY29uY2F0XG4gICAgICB2YWx1ZXM6IFtcbiAgICAgICAgWy0zLDRdXG4gICAgICAgIFsxLDldXG4gICAgICBdXG4gIEBleGFtcGxlIEFkZCBPbmUgQ29sdW1uLiAgVGhlIEFycmF5IGhhcyBhIGxlbmd0aCBvZiBzaXggYmVjYXVzZSB0d28gcm93cyB3ZXJlIGp1c3QgYWRkZWQuXG4gICAgdGFibGUuY29uY2F0XG4gICAgICBjb2x1bW5zOlxuICAgICAgICB6OiBbLTMsNCwxLDksNiwtNF1cbiAgIyMjXG4gIGNvbmNhdDogKHZhbHVlX29iamVjdCktPlxuICAgIHN1cGVyIHZhbHVlX29iamVjdFxuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsnY29uY2F0Jyx2YWx1ZV9vYmplY3RdXG4gICAgdGhpc1xuXG4gICMjI1xuICBBcHBseSBhIGZ1bmN0aW9uIHRvIGEgY29sdW1uXG4gIEBleGFtcGxlIEFwcGx5IGEgZnVuY3Rpb24gdG8geCBkZXBlbmRpbmcgb24geVxuICAgIHRhYmxlLmFwcGx5ICd4JywgWyd4JywneSddLCAoeCx5KS0+IGQzLnppcCh4LHkpLm1hcCAodiktPiBkMy5tZWFuIHZcbiAgIyMjXG4gIGFwcGx5OiAoYXJncy4uLiktPlxuICAgIHN1cGVyIGFyZ3MgLi4uXG4gICAgQF9leHByZXNzaW9uLnB1c2ggWydhcHBseScsYXJncy5tYXAgKGFyZyktPiBKU09OLnBhcnNlIEpTT04uc3RyaW5naWZ5IGFyZ11cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuZDMgPSByZXF1aXJlICdkMydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbHVtbiA9IHJlcXVpcmUgJy4vY29sdW1ucydcblxuY2xhc3MgSW50ZXJhY3RpdmUuUm93IGV4dGVuZHMgQ29sdW1uXG4gIGxlbmd0aDogKCktPiBAY3Vyc29yLmdldCAnbGVuZ3RoJ1xuICBpbmRleDogKGFyZ3MuLi4pLT4gQF9pbmRleC5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIEBfaW5kZXggPSBAY3Vyc29yLnNlbGVjdCAnaW5kZXgnXG4gICAgQF9pbmRleC5zZXQgZDMucmFuZ2UgdmFsdWVzLmxlbmd0aFxuICAgIEBfbGVuZ3RoID0gQGN1cnNvci5zZWxlY3QgJ2xlbmd0aCdcbiAgICBAX2xlbmd0aC5zZXQgJ2xlbmd0aCcsIEJhb2JhYi5tb25rZXkgWyd2YWx1ZXMnXSwgKHZhbHVlcyktPiB2YWx1ZXMubGVuZ3RoXG4gICAgQF9pbmRleC5vbiAndXBkYXRlJywgKGV2ZW50KT0+XG4gICAgICBuZXdfaW5kZXggPSBldmVudC5kYXRhLmN1cnJlbnREYXRhXG4gICAgICBpZiBldmVudC5kYXRhLnByZXZpb3VzRGF0YT9cbiAgICAgICAgb2xkX2luZGV4ID0gZXZlbnQuZGF0YS5wcmV2aW91c0RhdGFcbiAgICAgICAgbmV3X2luZGV4ID0gbmV3X2luZGV4Lm1hcCAoaSk9PiBvbGRfaW5kZXguaW5kZXhPZiBpXG4gICAgICAgIHZhbHVlcyA9IEB2YWx1ZXMoKVxuICAgICAgICBAX3ZhbHVlcy5zZXQgbmV3X2luZGV4Lm1hcCAoaSk9PiB2YWx1ZXNbaV1cbiAgICBzdXBlciBjb2x1bW5zXG4gICAgQF9hZGRfZGVyaXZlZF9jb2x1bW4gJ2luZGV4JywgW1snaW5kZXgnXV0sIChpbmRleCktPiBpbmRleFxuXG4gICMjI1xuICB0YWJsZS5pbG9jIFsyLDNdXG4gIHRhYmxlLl9pbmRleC5zZXQgWzIsMywwLDFdXG4gIHRhYmxlLmlsb2MgWzIsM11cbiAgIyMjXG4gIGlsb2M6ICAoc2VsZWN0aW9uKS0+XG4gICAgaW5kZXggPSBAaW5kZXgoKVxuICAgIHZhbHVlcyA9IEB2YWx1ZXMoKVxuICAgIGlmIHNlbGVjdGlvbj9cbiAgICAgIHZhbHVlcyA9IHNlbGVjdGlvbi5tYXAgKGkpPT4gdmFsdWVzW2ldXG4gICMjI1xuICB0YWJsZS5sb2MgWzIsM11cbiAgdGFibGUuX2luZGV4LnNldCBbMiwzLDAsMV1cbiAgdGFibGUubG9jIFsyLDNdXG4gICMjI1xuICBsb2M6IChzZWxlY3Rpb24pLT5cbiAgICBpbmRleCA9IEBpbmRleCgpXG4gICAgdmFsdWVzID0gQHZhbHVlcygpXG4gICAgaWYgc2VsZWN0aW9uP1xuICAgICAgdmFsdWVzID0gc2VsZWN0aW9uLm1hcCAoaSk9PiB2YWx1ZXNbaW5kZXguaW5kZXhPZiBpXVxuICAgIHZhbHVlc1xuICB1cGRhdGU6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuUm93XG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Db2x1bW5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9jb2x1bW5fZGF0YV9zb3VyY2UnXG5cbiMgVGFibGUgYXNzaWducyBtZXRhZGF0YSB0byB0aGUgSW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VcbiMgQSB0YWJsZSBpcyBkZXNjcmliZSBieTpcbiMgKiBfdmFsdWVzXyAtIEEgbGlzdCBvZiBsaXN0cyBjb250YWluaW5nIHRoZSByb3cgZW50cmllcyBpbiB0aGUgdGFibGUuXG4jICogX2NvbHVtbnNfIC0gVGhlIGNvbHVtbiBuYW1lcyBpbiB0aGUgdGFibGUsIHRoZSBjb2x1bW4gbmFtZXMgbWFwIHRoZSBlbnRyaWVzIGluIGVhY2ggcm93XG4jICogX21ldGFkYXRhXyAtXG4jIFRoZSB0YWJsZSBrZXlzICBuYW1pbmcgaXMgaW5zcGlyZWQgYnkgYGBwYW5kYXMuRGF0YUZyYW1lLnRvX2RpY3Qob3JpZW50PSdyZWNvcmRzJykuXG5cbmNsYXNzIEludGVyYWN0aXZlLlRhYmxlIGV4dGVuZHMgQ29sdW1uRGF0YVNvdXJjZVxuICAjIyMgUmV0dXJuIHRoZSBtZXRhZGF0YSBvZiB0aGUgY29sdW1ucyAjIyNcbiAgbWV0YWRhdGE6IChhcmdzKS0+XG4gICAgaWYgYXJncz9cbiAgICAgIHRtcCA9IHt9XG4gICAgICBhcmdzLmZvckVhY2ggKGFyZyk9PiB0bXBbYXJnXSA9IGFyZ1xuICAgICAgQF9tZXRhZGF0YS5wcm9qZWN0IHRtcFxuICAgIGVsc2VcbiAgICAgIEBfbWV0YWRhdGEuZ2V0XG5cbiAgIyBAcGFyYW0gW0FycmF5XSBjb2x1bW5zIFRoZSBuYW1lIG9mIHRoZSB0YWJsZSBjb2x1bW5zXG4gICMgQHBhcmFtIFtBcnJheV0gdmFsdWVzIFRoZSB2YWx1ZXMgb2YgdGhlIHRhYmxlLlxuICAjIEBwYXJhbSBbT2JqZWN0XSBtZXRhZGF0YSBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY29sdW1uc1xuICBjb25zdHJ1Y3RvcjogKHt2YWx1ZXMsIGNvbHVtbnMsIG1ldGFkYXRhfSktPlxuICAgICMjIFRoZSB0YWJsZSBjYW4gYmUgcmVuYW1lZCAjIyNcbiAgICBAX21ldGFkYXRhID0gQGN1cnNvci5zZWxlY3QgJ21ldGFkYXRhJ1xuICAgIEBfbWV0YWRhdGEuc2V0IEBfbWV0YWRhdGEuZ2V0KCkgPyBtZXRhZGF0YVxuICAgIHN1cGVyIHZhbHVlcywgY29sdW1uc1xuICAgIEBjb21wdXRlKClcblxuIyMjXG5BIGZvcm1hdHRlZCBzdHJpbmcgb2YgdGhlIHRhYmxlLlxuIyMjXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fc3RyaW5nID0gLT5cbiMjI1xuSlNPTmlmeSB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgdGFibGUuXG5cbkBwYXJhbSBbQm9vbGVhbl0gaW5kZXggVHJ1ZSBpbmNsdWRlcyB0aGUgaW5kZXggaW4gdGhlIEpTT04gc3RyaW5nLlxuIyMjXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fanNvbiA9IChpbmRleD1vbiktPlxuICBjdXJzb3JzID1cbiAgICBjb2x1bW5zOiBbJ2NvbHVtbnMnXVxuICAgIHZhbHVlczogWyd2YWx1ZXMnXVxuICBpZiBpbmRleCB0aGVuIGN1cnNvcnNbJ2luZGV4J10gPSBbJ2luZGV4J11cbiAgSlNPTi5zdHJpbmdpZnkgQGN1cnNvci5wcm9qZWN0IGN1cnNvcnNcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5UYWJsZVxuIl19
