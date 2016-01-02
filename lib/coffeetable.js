(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Baobab, CoffeeTable, Content, Publisher, d3;

Baobab = require("baobab");

d3 = require("d3");

Publisher = require('./publisher');

Content = require('./content');

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


},{"./content":2,"./publisher":10,"baobab":"baobab","d3":"d3"}],2:[function(require,module,exports){
var Content, Interactive, Manager,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');

Interactive = require('./interactive');

Content = (function(superClass) {
  var _column_index;

  extend(Content, superClass);

  Content.prototype._base_class = Interactive;

  _column_index = 'selector';

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


},{"./interactive":3,"./manager":9}],3:[function(require,module,exports){
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


},{"./interactive/table":8,"baobab":"baobab"}],4:[function(require,module,exports){
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
  }

  Column.prototype.update = function() {};

  return Column;

})(Expression);

module.exports = Interactive.Column;


},{"../interactive":3,"./expression":6}],5:[function(require,module,exports){
var Interactive, d3,
  slice = [].slice;

d3 = require("d3");

Interactive = require('../interactive');

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

module.exports = Interactive.Compute;


},{"../interactive":3,"d3":"d3"}],6:[function(require,module,exports){
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


},{"../interactive":3,"./history":7}],7:[function(require,module,exports){
var Compute, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('../interactive');

Compute = require('./compute');

Interactive.History = (function(superClass) {
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

module.exports = Interactive.History;


},{"../interactive":3,"./compute":5}],8:[function(require,module,exports){
var Column, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Interactive = require('../interactive');

Column = require('./columns');

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

})(Columns);

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

module.exports = Interactive.Table;


},{"../interactive":3,"./columns":4,"d3":"d3"}],9:[function(require,module,exports){
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

  Manager.prototype.compute = function() {};

  return Manager;

})(Interactive);

module.exports = Manager;


},{"./interactive":3}],10:[function(require,module,exports){
var Manager, Publisher, Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Manager = require('./manager');

Template = require('./template');

Publisher = (function(superClass) {
  extend(Publisher, superClass);

  Publisher.prototype._base_class = Template;

  Publisher.prototype._column_index = 'selector';

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


},{"./manager":9,"./template":11}],11:[function(require,module,exports){
var Template, d3;

d3 = require('d3');

Template = (function() {
  function Template(selector) {
    this.selector = selector;
    this.selection = d3.selectAll(this.selector);
  }

  return Template;

})();

module.exports = Template;


},{"d3":"d3"}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2NvbnRlbnQuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb2x1bW5zLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb21wdXRlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9leHByZXNzaW9uLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9oaXN0b3J5LmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS90YWJsZS5jb2ZmZWUiLCJzcmMvbWFuYWdlci5jb2ZmZWUiLCJzcmMvcHVibGlzaGVyLmNvZmZlZSIsInNyYy90ZW1wbGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsU0FBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSOztBQUNiLE9BQUEsR0FBVyxPQUFBLENBQVEsV0FBUjs7QUFlTDtFQU9TLHFCQUFDLE9BQUQsRUFBYSxVQUFiLEVBQTRCLEtBQTVCOztNQUFDLFVBQVE7OztNQUFJLGFBQVc7OztNQUFJLFFBQU07O0lBQzdDLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQVEsT0FBUjtJQUNmLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsU0FBQSxDQUFVLFVBQVY7SUFDbEIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLElBQUEsQ0FBSyxLQUFMO0VBSEY7O3dCQUtiLE9BQUEsR0FBUzs7Ozs7O0FBR1gsTUFBTSxDQUFDLE9BQVAsR0FBaUI7RUFDZixhQUFBLFdBRGU7RUFFZixJQUFBLEVBRmU7RUFHZixRQUFBLE1BSGU7Ozs7O0FDakNqQixJQUFBLDZCQUFBO0VBQUE7OztB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T0FBUCxHQUFpQjs7OztBQ2JqQixJQUFBLDRCQUFBO0VBQUE7OztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0FBRUw7OztzQkFDSixXQUFBLEdBQWE7O3NCQUNiLGFBQUEsR0FBZTs7RUFDRixtQkFBQyxJQUFELEVBQU0sV0FBTjtBQUNYLFFBQUE7O01BRGlCLGNBQVk7OztNQUM3QixPQUFROztJQUNSO0lBQ0EsMkNBQ0U7TUFBQSxNQUFBLHNDQUFzQixDQUFDLEVBQUQsQ0FBdEI7TUFDQSxPQUFBLHlDQUF3QixDQUFDLFVBQUQsQ0FEeEI7TUFFQSxRQUFBLDBDQUEwQjtRQUFBLEVBQUEsRUFDeEI7VUFBQSxXQUFBLEVBQWEsMkNBQWI7U0FEd0I7T0FGMUI7TUFJQSxNQUFBLEVBQVEsZ0NBSlI7S0FERjtJQU1BLFdBQVcsQ0FBQyxPQUFaLENBQW9CLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO2VBQ2xCLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBSyxDQUFDLElBQWhCLEVBQXNCLEtBQUssQ0FBQyxJQUE1QjtNQURrQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7RUFUVzs7OztHQUhTOztBQWV4QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2xCakIsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBRUM7RUFDUyxrQkFBQyxRQUFEO0lBQUMsSUFBQyxDQUFBLFdBQUQ7SUFDWixJQUFDLENBQUEsU0FBRCxHQUFhLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBQyxDQUFBLFFBQWQ7RUFERjs7Ozs7O0FBR2YsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5kMyA9IHJlcXVpcmUgXCJkM1wiXG5QdWJsaXNoZXIgPSAgcmVxdWlyZSAnLi9wdWJsaXNoZXInXG5Db250ZW50ID0gIHJlcXVpcmUgJy4vY29udGVudCdcblxuXG4jIGludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuI1xuIyBAZXhhbXBsZSBMZXQncyBnZXQgc3RhcnRlZFxuIyAgIHRhYmxlID0gbmV3IENvZmZlZVRhYmxlXG4jICAgICBjb2x1bW5zOiBbXG4jICAgICAgICd4J1xuIyAgICAgICAneSdcbiMgICAgIF1cbiMgICAgIHZhbHVlczogW1xuIyAgICAgICBbMSwgMl1cbiMgICAgICAgWzMsIDhdXG4jICAgICBdXG5jbGFzcyBDb2ZmZWVUYWJsZVxuICAjIENvbnN0cnVjdCBhIG5ldyBhbmltYWwuXG4gICNcbiAgIyBAcGFyYW0gW09iamVjdF0gY29udGVudCBjb250YWlucyBtYW55IFRhYnVsYXIgZGF0YXNldHNcbiAgIyBAcGFyYW0gW09iamVjdF0gcHVibGlzaGVycyBjb250YWlucyBtYW55IERPTSBzZWxlY3Rpb25zXG4gICMgQHBhcmFtIFtPYmplY3RdIGJvb2tzIHVzZSBwdWJsaXNoZXJzIHRvIHByZXNlbnQgYW5kIHVwZGF0ZSBjb250ZWVudFxuICAjXG4gIGNvbnN0cnVjdG9yOiAoY29udGVudD17fSwgcHVibGlzaGVycz17fSwgYm9va3M9e30pLT5cbiAgICBAY29udGVudCA9IG5ldyBDb250ZW50IGNvbnRlbnRcbiAgICBAcHVibGlzaGVycyA9IG5ldyBQdWJsaXNoZXIgcHVibGlzaGVyc1xuICAgIEBib29rcyA9IG5ldyBCb29rIGJvb2tzXG5cbiAgdmVyc2lvbjogJzAuMS4wJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb2ZmZWVUYWJsZVxuICBkM1xuICBCYW9iYWJcbn1cbiIsIk1hbmFnZXIgPSByZXF1aXJlICcuL21hbmFnZXInXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5cbiMgQ29udGVudCBpcyBhIGNvbGxlY3Rpb24gb2YgSW50ZXJhY3RpdmUgVGFidWxhciBkYXRhIHNvdXJjZXMuICBDb250ZW50XG4jIGNhbiBiZSBjb25zdW1lZCBieSBhIHB1Ymxpc2hlci4gIEJvdGggZGF0YSBhbmQgbWV0YWRhdGEgb2YgdGhlIHRhYmxlIGNhblxuIyBiZSBpbmplY3RlZCBpbnRvIHRoZSBkb21cbmNsYXNzIENvbnRlbnQgZXh0ZW5kcyBNYW5hZ2VyXG4gIF9iYXNlX2NsYXNzOiBJbnRlcmFjdGl2ZVxuICBfY29sdW1uX2luZGV4ID0gJ3NlbGVjdG9yJ1xuICBjb25zdHJ1Y3RvcjogKGRhdGEsdG9fcmVnaXN0ZXI9W10pLT5cbiAgICBzdXBlclxuICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyA/IFsnc2VsZWN0b3InXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRlbnRcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcblRhYmxlID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZS90YWJsZSdcblxuIyBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZXMgbWFuaXB1bGF0ZSB0YWJsZSBlZy4gYGBzb3J0YGAsYGB1bmlxdWVgYCxgYGZpbHRlcmBgLGBgbWFwYGAsIGBgZ3JvdXBieWBgLCBgYGpvaW5gYCAuXG4jIGBgQmFvYmFiYGAgdHJlZXMgYXJlIGludGVyYWN0aXZlIGFuZCBpbW11dGFibGUuICBUaGV5IG1hbmFnZSB0aGUgc3RhdGUgb2YgdGhlXG4jIHRhYnVsYXIgZGF0YS5cbiMgSW50ZXJhY3RpdmUgbWFpbnRhaW5zOlxuIyAqIFRhYmxlIG1ldGFkYXRhXG4jICogQ29sdW1uRGF0YVNvdXJjZXMgYGBjb2x1bW5fZGF0YV9zb3VyY2VgYCBhbmQgUm93IERhdGFTb3VyY2UgYGB2YWx1ZXNgYFxuIyAqIGBgSGlzdG9yeWBgIG9mIHRoZSBjb21wdXRlIGFwcGxpZWQgdG8gdGhlIHRhYmxlLlxuIyBAZXhhbXBsZSBjcmVhdGUgYSBuZXcgSW50ZXJhY3RpdmUgRGF0YSBTb3VyY2VcbiMgICB0YWJsZSA9IG5ldyBJbnRlcmFjdGl2ZVxuIyAgICAgY29sdW1uczogW1xuIyAgICAgICAneCdcbiMgICAgICAgJ3knXG4jICAgICBdXG4jICAgICB2YWx1ZXM6IFtcbiMgICAgICAgWzEsIDJdXG4jICAgICAgIFszLCA4XVxuIyAgICAgXVxuIyAgICAgbWV0YWRhdGE6XG4jICAgICAgIHg6IHt1bml0czonaW5jaCcsYWxpYXM6J2xlbmd0aCBvZiByZWN0YW5nbGUnfVxuIyAgICAgICB5OiB7dW5pdHM6J2luY2gnLGFsaWFzOid3aWR0aCBvZiByZWN0YW5nbGUnfVxuY2xhc3MgSW50ZXJhY3RpdmUgZXh0ZW5kcyBUYWJsZVxuICByZWFkbWU6IC0+IEBfcmVhZG1lLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIHRhYmxlX25hbWUpLT5cbiAgICBAdHJlZSA9IG5ldyBCYW9iYWIge31cbiAgICBAY3Vyc29yID0gQHRyZWUuc2VsZWN0IDBcbiAgICBAX3JlYWRtZSA9IEBjdXJzb3Iuc2VsZWN0ICdyZWFkbWUnXG4gICAgc3VwZXIgZGF0YV9vcl91cmwsIHRhYmxlX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICB1cGRhdGU6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29sdW1uXG4iLCJkMyA9IHJlcXVpcmUgXCJkM1wiXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db21wdXRlXG4gIGNvbXB1dGU6ICgpLT5cbiAgICAjIyMgQ29tcHV0ZSBjaGFuZ2VzIHRoZSBzdGF0ZSBvZiB0aGUgZGF0YSB0cmVlICMjI1xuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICB0aGlzXG5cbiAgc3RhZ2U6IChuZXdfc3RhdGUsZXhwcmVzc2lvbj1udWxsKS0+XG4gICAgW3VwZGF0ZV9zdGF0ZSwgbW9ua2V5c10gPSBAX3NwbGl0X3VwZGF0ZV9vYmplY3QgbmV3X3N0YXRlXG4gICAgQGN1cnNvci5kZWVwTWVyZ2UgdXBkYXRlX3N0YXRlXG4gICAgaWYgbW9ua2V5cy5sZW5ndGggPiAwXG4gICAgICBmb3IgbW9ua2V5IGluIG1vbmtleXNcbiAgICAgICAgQGN1cnNvci5zZXQgbW9ua2V5LnBhdGgsIG1vbmtleS52YWx1ZVxuICAgIHRoaXNcblxuICBfc3BsaXRfdXBkYXRlX29iamVjdDogKCB1cGRhdGVkX3N0YXRlLCBwYXRoPVtdLCBtb25rZXlzPVtdICktPlxuICAgICMjIyBQcnVuZSBhbmQgc2V0IHRoZSBCYW9iYWIgbW9ua2V5cyBhbmQgcmV0dXJuIG9ubHkgdGhlIHZhbHVlcyBjb21wbGlhbnQgd2l0aCBkZWVwTWVyZ2UgIyMjXG4gICAgZDMuZW50cmllcyB1cGRhdGVkX3N0YXRlXG4gICAgICAgIC5mb3JFYWNoIChlbnRyeSk9PlxuICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkoZW50cnkudmFsdWUpXG4gICAgICAgICAgICAjIyMgZG8gbm90aGluZyAjIyNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZihlbnRyeS52YWx1ZSkgaW4gWydvYmplY3QnXVxuICAgICAgICAgICAgaWYgcGF5bG9hZFtlbnRyeS5rZXldWydoYXNEeW5hbWljUGF0aHMnXT9cbiAgICAgICAgICAgICAgbW9ua2V5cy5wdXNoXG4gICAgICAgICAgICAgICAgcGF0aDogW3BhdGguLi4sZW50cnkua2V5XVxuICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZVxuICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZFtlbnRyeS5rZXldXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBfc3BsaXRfbWVyZ2Vfb2JqZWN0IHVwZGF0ZWRfc3RhdGVbZW50cnkua2V5XSwgW3BhdGguLi4sZW50cnkua2V5XSwgbW9ua2V5c1xuICAgIFtwYXlsb2FkLG1vbmtleXNdXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29tcHV0ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkhpc3RvcnkgPSByZXF1aXJlICcuL2hpc3RvcnknXG5cbmNsYXNzIEludGVyYWN0aXZlLkV4cHJlc3Npb24gZXh0ZW5kcyBIaXN0b3J5XG4gIGV4cHJlc3Npb246IChhcmdzKS0+IEBfZXhwcmVzc2lvbi5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXhwcmVzc2lvbnMgPSBbXVxuICAgIEBfZXhwcmVzc2lvbiA9IEBjdXJzb3Iuc2VsZWN0ICdleHByZXNzaW9uJ1xuICAgIHN1cGVyKClcblxuICBleGVjdXRlOiAoZXhwcmVzc2lvbnMuLi4pLT5cbiAgICBleHByZXNzaW9ucy5mb3JFYWNoICAoZXhwcmVzc2lvbixleHByZXNzaW9uX2NvdW50KS0+XG4gICAgICBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBFeHByZXNzaW9uLnByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXMuRXhwcmVzc2lvbltleHByZXNzaW9uLm1ldGhvZF0gZXhwcmVzc2lvbi5hcmdzLi4uXG4gICAgICBlbHNlIGlmIGV4cHJlc3Npb24ubWV0aG9kIGluIGQzLmtleXMgQHByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXNbZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZVxuICAgICAgICBhc3NlcnQgXCIje0pTT04uc3RyaW5naWZ5IGV4cHJlc3Npb25zfSBpcyBub3QgdW5kZXJzdG9vZC5cIlxuICAgICAgQHN0YWdlIGNvbXB1dGVkX3N0YXRlXG4gICAgICBAY29tcHV0ZSgpXG5cbiAgZ2V0OiAoYXJncyktPiBAY3Vyc29yLmdldCBhcmdzLi4uXG4gIHNldDogKGFyZ3MpLT4gQGN1cnNvci5zZXQgYXJncy4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkV4cHJlc3Npb25cbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2V4cHJlc3Npb24uc3RhcnRSZWNvcmRpbmcgMjBcbiAgICBzdXBlcigpXG4gIGhpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5nZXRIaXN0b3J5KClcbiAgY2xlYXJfaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmNsZWFySGlzdG9yeSgpXG4gIHJlY29yZDogKGV4cHJlc3Npb24pLT5cbiAgICAgIEBleHByZXNzaW9ucy5wdXNoIGV4cHJlc3Npb25cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5IaXN0b3J5XG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkNvbHVtbiA9IHJlcXVpcmUgJy4vY29sdW1ucydcblxuIyBUYWJsZSBhc3NpZ25zIG1ldGFkYXRhIHRvIHRoZSBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuIyBBIHRhYmxlIGlzIGRlc2NyaWJlIGJ5OlxuIyAqIF92YWx1ZXNfIC0gQSBsaXN0IG9mIGxpc3RzIGNvbnRhaW5pbmcgdGhlIHJvdyBlbnRyaWVzIGluIHRoZSB0YWJsZS5cbiMgKiBfY29sdW1uc18gLSBUaGUgY29sdW1uIG5hbWVzIGluIHRoZSB0YWJsZSwgdGhlIGNvbHVtbiBuYW1lcyBtYXAgdGhlIGVudHJpZXMgaW4gZWFjaCByb3dcbiMgKiBfbWV0YWRhdGFfIC1cbiMgVGhlIHRhYmxlIGtleXMgIG5hbWluZyBpcyBpbnNwaXJlZCBieSBgYHBhbmRhcy5EYXRhRnJhbWUudG9fZGljdChvcmllbnQ9J3JlY29yZHMnKS5cblxuY2xhc3MgSW50ZXJhY3RpdmUuVGFibGUgZXh0ZW5kcyBDb2x1bW5zXG4gIG1ldGFkYXRhOiAoYXJncyktPiBAX21ldGFkYXRhLmdldCBhcmdzLi4uXG5cbiAgIyBAcGFyYW0gW1N0cmluZ10gZGF0YV9vcl91cmwgdXJsIHRvIGEganNvbiBlbmRwb2ludCBjb250YWluaW5nIHRoZSBrZXlzIGBgdmFsdWVzYGAsIGBgXG4gICMgQHBhcmFtIFtPYmplY3RdIGRhdGFfb3JfdXJsXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIEBuYW1lPW51bGwpLT5cbiAgICAjIyBUaGUgdGFibGUgY2FuIGJlIHJlbmFtZWQgIyMjXG4gICAgQF9uYW1lID0gQGN1cnNvci5zZWxlY3QgJ25hbWUnXG4gICAgQF9uYW1lLnNldCBAbmFtZVxuICAgIEBfbWV0YWRhdGEgPSBAY3Vyc29yLnNlbGVjdCAnbWV0YWRhdGEnXG4gICAgQGxvYWQgZGF0YV9vcl91cmxcbiAgICBzdXBlcigpXG4gIGxvYWQ6IChkYXRhX29yX3VybCktPlxuICAgIGlmICdzdHJpbmcnIGluIFt0eXBlb2YgZGF0YV9vcl91cmxdXG4gICAgICBkMy5qc29uIGRhdGEsICh0YWJsZV9kYXRhKT0+XG4gICAgICAgIHRhYmxlX2RhdGFbJ3VybCddID0gQF9yYXdcbiAgICAgICAgQHN0YWdlXG4gICAgICAgICAgICByYXc6IHRhYmxlX2RhdGFcbiAgICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSB0YWJsZV9kYXRhLmxlbmd0aFxuICAgICAgICAgICxcbiAgICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgICBhcmdzOiBbZGF0YV9vcl91cmxdXG4gICAgICAgIHN1cGVyKClcbiAgICBlbHNlXG4gICAgICBkYXRhID0gZGF0YV9vcl91cmxcbiAgICAgIEBzdGFnZVxuICAgICAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gW11cbiAgICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IHt9XG4gICAgICAgICAgcmVhZG1lOiBkYXRhLnJlYWRtZSA/IG51bGxcbiAgICAgICAgICBpbmRleDogZDMucmFuZ2UgZGF0YS52YWx1ZXM/Lmxlbmd0aCA/IDBcbiAgICAgICAgLFxuICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgYXJnczogW2RhdGFdXG4gICAgICBzdXBlcigpXG5cblRhYmxlOjpleHByID1cbiAgY29uY2F0OiAtPlxuICBoZWFkOiAtPlxuICB0YWlsOiAtPlxuICBzb3J0OiAtPlxuICBmaWx0ZXI6IC0+XG4gIG1hcDogLT5cblxuVGFibGU6OnRvX3N0cmluZyA9IC0+XG5UYWJsZTo6dG9fanNvbiA9ICAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5cbmNsYXNzIE1hbmFnZXIgZXh0ZW5kcyBJbnRlcmFjdGl2ZVxuICBkaXI6ICgpLT4gQGNvbHVtbl9kYXRhX3NvdXJjZSBAaW5kZXhfY29sdW1uXG4gIHJlZ2lzdGVyOiAoIG5hbWUsIGRhdGFfb3JfdXJsPW51bGwgKS0+XG4gICAgQFtuYW1lXSA9IG5ldyBAX2Jhc2VfY2xhc3MgZGF0YV9vcl91cmxcbiAgICBAW25hbWVdXG4gIHVucmVnaXN0ZXI6ICggbmFtZSApLT5cbiAgY29tbWl0OiAtPlxuXG4gICMgQ29tcHV0ZSBkb2VzIHNvbWUgc3R1ZmZcbiAgY29tcHV0ZTotPlxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbmFnZXJcbiIsIk1hbmFnZXIgPSByZXF1aXJlICcuL21hbmFnZXInXG5UZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGUnXG5cbmNsYXNzIFB1Ymxpc2hlciBleHRlbmRzIE1hbmFnZXJcbiAgX2Jhc2VfY2xhc3M6IFRlbXBsYXRlXG4gIF9jb2x1bW5faW5kZXg6ICdzZWxlY3RvcidcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIEBcbiAgICBzdXBlclxuICAgICAgdmFsdWVzOiBkYXRhLnZhbHVlcyA/IFtbXV1cbiAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyA/IFsnc2VsZWN0b3InXVxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gUHVibGlzaGVyXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5jbGFzcyBUZW1wbGF0ZSBcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IpLT5cbiAgICBAc2VsZWN0aW9uID0gZDMuc2VsZWN0QWxsIEBzZWxlY3RvclxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlXG4iXX0=
