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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2NvbnRlbnQuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb2x1bW5zLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9jb21wdXRlLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9leHByZXNzaW9uLmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS9oaXN0b3J5LmNvZmZlZSIsInNyYy9pbnRlcmFjdGl2ZS90YWJsZS5jb2ZmZWUiLCJzcmMvbWFuYWdlci5jb2ZmZWUiLCJzcmMvcHVibGlzaGVyLmNvZmZlZSIsInNyYy90ZW1wbGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsU0FBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSOztBQUNiLE9BQUEsR0FBVyxPQUFBLENBQVEsV0FBUjs7QUFlTDtFQU9TLHFCQUFDLE9BQUQsRUFBYSxVQUFiLEVBQTRCLEtBQTVCOztNQUFDLFVBQVE7OztNQUFJLGFBQVc7OztNQUFJLFFBQU07O0lBQzdDLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxPQUFBLENBQVEsT0FBUjtJQUNmLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsU0FBQSxDQUFVLFVBQVY7SUFDbEIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLElBQUEsQ0FBSyxLQUFMO0VBSEY7O3dCQUtiLE9BQUEsR0FBUzs7Ozs7O0FBR1gsTUFBTSxDQUFDLE9BQVAsR0FBaUI7RUFDZixhQUFBLFdBRGU7RUFFZixJQUFBLEVBRmU7RUFHZixRQUFBLE1BSGU7Ozs7O0FDakNqQixJQUFBLDZCQUFBO0VBQUE7OztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFDVixXQUFBLEdBQWMsT0FBQSxDQUFRLGVBQVI7O0FBS1I7QUFDSixNQUFBOzs7O29CQUFBLFdBQUEsR0FBYTs7RUFDYixhQUFBLEdBQWdCOztFQUNILGlCQUFDLElBQUQsRUFBTSxXQUFOO0FBQ1gsUUFBQTs7TUFEaUIsY0FBWTs7SUFDN0IseUNBRUU7TUFBQSxNQUFBLHNDQUFzQixDQUFDLEVBQUQsQ0FBdEI7TUFFQSxPQUFBLHlDQUF3QixDQUFDLFVBQUQsQ0FGeEI7TUFJQSxRQUFBLDBDQUEwQjtRQUFBLEVBQUEsRUFDeEI7VUFBQSxXQUFBLEVBQWEsa0RBQWI7U0FEd0I7T0FKMUI7TUFNQSxNQUFBLEVBQVEsZ0NBTlI7S0FGRjtJQVNBLFdBQVcsQ0FBQyxPQUFaLENBQW9CLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO2VBQ2xCLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBSyxDQUFDLElBQWhCLEVBQXNCLEtBQUssQ0FBQyxJQUE1QjtNQURrQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7RUFWVzs7OztHQUhPOztBQWdCdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUN0QmpCLElBQUEsMEJBQUE7RUFBQTs7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0FBc0JGOzs7d0JBQ0osTUFBQSxHQUFRLFNBQUE7V0FBRyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBQTtFQUFIOztFQUNLLHFCQUFDLFdBQUQsRUFBYyxVQUFkO0lBQ1gsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLE1BQUEsQ0FBTyxFQUFQO0lBQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxDQUFiO0lBQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxRQUFmO0lBQ1gsNkNBQU0sV0FBTixFQUFtQixVQUFuQjtFQUpXOzs7O0dBRlc7O0FBUTFCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDL0JqQixJQUFBLHVCQUFBO0VBQUE7OztBQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0FBQ2QsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUVQLFdBQVcsQ0FBQzs7O21CQUNoQixPQUFBLEdBQVMsU0FBQyxJQUFEO0FBQVMsUUFBQTtXQUFBLE9BQUEsSUFBQyxDQUFBLFFBQUQsQ0FBUyxDQUFDLEdBQVYsWUFBYyxJQUFkO0VBQVQ7O0VBQ0ksZ0JBQUE7SUFDWCxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLFNBQWY7RUFERDs7bUJBRWIsTUFBQSxHQUFRLFNBQUEsR0FBQTs7OztHQUp1Qjs7QUFNakMsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBVyxDQUFDOzs7O0FDVDdCLElBQUEsZUFBQTtFQUFBOztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztBQUVSLFdBQVcsQ0FBQzs7O29CQUNoQixPQUFBLEdBQVMsU0FBQTs7QUFDUDtJQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixDQUNFO01BQUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUjtNQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FBRCxDQUFBLENBRFA7TUFFQSxRQUFBLEVBQVUsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUZWO01BR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FIVDtNQUlBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBRCxDQUFBLENBSlI7S0FERjtXQU1BO0VBUk87O29CQVVULEtBQUEsR0FBTyxTQUFDLFNBQUQsRUFBVyxVQUFYO0FBQ0wsUUFBQTs7TUFEZ0IsYUFBVzs7SUFDM0IsTUFBMEIsSUFBQyxDQUFBLG9CQUFELENBQXNCLFNBQXRCLENBQTFCLEVBQUMscUJBQUQsRUFBZTtJQUNmLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFrQixZQUFsQjtJQUNBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7QUFDRSxXQUFBLHlDQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLE1BQU0sQ0FBQyxJQUFuQixFQUF5QixNQUFNLENBQUMsS0FBaEM7QUFERixPQURGOztXQUdBO0VBTks7O29CQVFQLG9CQUFBLEdBQXNCLFNBQUUsYUFBRixFQUFpQixJQUFqQixFQUEwQixPQUExQjs7TUFBaUIsT0FBSzs7O01BQUksVUFBUTs7O0FBQ3REO0lBQ0EsRUFBRSxDQUFDLE9BQUgsQ0FBVyxhQUFYLENBQ0ksQ0FBQyxPQURMLENBQ2EsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7QUFDUCxZQUFBO1FBQUEsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxLQUFwQixDQUFIOztBQUNFLDBCQURGO1NBQUEsTUFFSyxXQUFHLE9BQU8sS0FBSyxDQUFDLE1BQWIsS0FBd0IsUUFBM0I7VUFDSCxJQUFHLDZDQUFIO1lBQ0UsT0FBTyxDQUFDLElBQVIsQ0FDRTtjQUFBLElBQUEsRUFBTyxXQUFBLElBQUEsQ0FBQSxRQUFRLENBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUixDQUFQO2NBQ0EsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQURiO2FBREY7bUJBR0EsT0FBTyxPQUFRLENBQUEsS0FBSyxDQUFDLEdBQU4sRUFKakI7V0FBQSxNQUFBO21CQU1FLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixhQUFjLENBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBbkMsRUFBZ0QsV0FBQSxJQUFBLENBQUEsUUFBUSxDQUFBLEtBQUssQ0FBQyxHQUFOLENBQVIsQ0FBaEQsRUFBb0UsT0FBcEUsRUFORjtXQURHOztNQUhFO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURiO1dBWUEsQ0FBQyxPQUFELEVBQVMsT0FBVDtFQWRvQjs7Ozs7O0FBZ0J4QixNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFXLENBQUM7Ozs7QUN0QzdCLElBQUEsb0JBQUE7RUFBQTs7Ozs7QUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztBQUNkLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFFSixXQUFXLENBQUM7Ozt1QkFDaEIsVUFBQSxHQUFZLFNBQUMsSUFBRDtBQUFTLFFBQUE7V0FBQSxPQUFBLElBQUMsQ0FBQSxXQUFELENBQVksQ0FBQyxHQUFiLFlBQWlCLElBQWpCO0VBQVQ7O0VBQ0Msb0JBQUE7SUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxZQUFmO0lBQ2YsMENBQUE7RUFIVzs7dUJBS2IsT0FBQSxHQUFTLFNBQUE7QUFDUCxRQUFBO0lBRFE7V0FDUixXQUFXLENBQUMsT0FBWixDQUFxQixTQUFDLFVBQUQsRUFBWSxnQkFBWjtBQUNuQixVQUFBO01BQUEsVUFBRyxVQUFVLENBQUMsTUFBWCxFQUFBLGFBQXFCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFwQixDQUFyQixFQUFBLEdBQUEsTUFBSDtRQUNFLGNBQUEsR0FBaUIsUUFBQSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFBLFVBQVUsQ0FBQyxNQUFYLENBQWhCLGFBQW1DLFVBQVUsQ0FBQyxJQUE5QyxFQURuQjtPQUFBLE1BRUssV0FBRyxVQUFVLENBQUMsTUFBWCxFQUFBLGFBQXFCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBQyxDQUFBLFNBQVQsQ0FBckIsRUFBQSxJQUFBLE1BQUg7UUFDSCxjQUFBLEdBQWlCLElBQUssQ0FBQSxVQUFVLENBQUMsTUFBWCxDQUFMLGFBQXdCLFVBQVUsQ0FBQyxJQUFuQyxFQURkO09BQUEsTUFBQTtRQUdILE1BQUEsQ0FBUyxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsV0FBZixDQUFELENBQUEsR0FBNEIscUJBQXJDLEVBSEc7O01BSUwsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQO2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQTtJQVJtQixDQUFyQjtFQURPOzt1QkFXVCxHQUFBLEdBQUssU0FBQyxJQUFEO0FBQVMsUUFBQTtXQUFBLE9BQUEsSUFBQyxDQUFBLE1BQUQsQ0FBTyxDQUFDLEdBQVIsWUFBWSxJQUFaO0VBQVQ7O3VCQUNMLEdBQUEsR0FBSyxTQUFDLElBQUQ7QUFBUyxRQUFBO1dBQUEsT0FBQSxJQUFDLENBQUEsTUFBRCxDQUFPLENBQUMsR0FBUixZQUFZLElBQVo7RUFBVDs7OztHQW5COEI7O0FBcUJyQyxNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFXLENBQUM7Ozs7QUN4QjdCLElBQUEsb0JBQUE7RUFBQTs7O0FBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7QUFDZCxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0FBRUosV0FBVyxDQUFDOzs7RUFDSCxpQkFBQTtJQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsWUFBZjtJQUNmLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUE0QixFQUE1QjtJQUNBLHVDQUFBO0VBSFc7O29CQUliLE9BQUEsR0FBUyxTQUFBO1dBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7RUFBSDs7b0JBQ1QsYUFBQSxHQUFlLFNBQUE7V0FBRyxJQUFDLENBQUEsV0FBVyxDQUFDLFlBQWIsQ0FBQTtFQUFIOztvQkFDZixNQUFBLEdBQVEsU0FBQyxVQUFEO1dBQ0osSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFVBQWxCO0VBREk7Ozs7R0FQd0I7O0FBVWxDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQVcsQ0FBQzs7OztBQ2I3QixJQUFBLHVCQUFBO0VBQUE7OztBQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztBQUNkLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7QUFTSCxXQUFXLENBQUM7OztrQkFDaEIsUUFBQSxHQUFVLFNBQUMsSUFBRDtBQUFTLFFBQUE7V0FBQSxPQUFBLElBQUMsQ0FBQSxTQUFELENBQVUsQ0FBQyxHQUFYLFlBQWUsSUFBZjtFQUFUOztFQUlHLGVBQUMsV0FBRCxFQUFjLElBQWQ7SUFBYyxJQUFDLENBQUEsc0JBQUQsT0FBTTtJQUUvQixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLE1BQWY7SUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxJQUFDLENBQUEsSUFBWjtJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsVUFBZjtJQUNiLElBQUMsQ0FBQSxJQUFELENBQU0sV0FBTjtJQUNBLHFDQUFBO0VBTlc7O2tCQU9iLElBQUEsR0FBTSxTQUFDLFdBQUQ7QUFDSixRQUFBO0lBQUEsSUFBRyxRQUFBLE1BQWEsT0FBTyxZQUF2QjthQUNFLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixFQUFjLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxVQUFEO1VBQ1osVUFBVyxDQUFBLEtBQUEsQ0FBWCxHQUFvQixLQUFDLENBQUE7VUFDckIsS0FBQyxDQUFBLEtBQUQsQ0FDSTtZQUFBLEdBQUEsRUFBSyxVQUFMO1lBQ0EsS0FBQSxFQUFPLEVBQUUsQ0FBQyxLQUFILENBQVMsVUFBVSxDQUFDLE1BQXBCLENBRFA7V0FESixFQUlJO1lBQUEsTUFBQSxFQUFRLE1BQVI7WUFDQSxJQUFBLEVBQU0sQ0FBQyxXQUFELENBRE47V0FKSjtpQkFNQSwrQkFBQTtRQVJZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLEVBREY7S0FBQSxNQUFBO01BV0UsSUFBQSxHQUFPO01BQ1AsSUFBQyxDQUFBLEtBQUQsQ0FDSTtRQUFBLE1BQUEsc0NBQXNCLENBQUMsRUFBRCxDQUF0QjtRQUNBLE9BQUEseUNBQXdCLEVBRHhCO1FBRUEsUUFBQSwwQ0FBMEIsRUFGMUI7UUFHQSxNQUFBLHdDQUFzQixJQUh0QjtRQUlBLEtBQUEsRUFBTyxFQUFFLENBQUMsS0FBSCwrRUFBK0IsQ0FBL0IsQ0FKUDtPQURKLEVBT0k7UUFBQSxNQUFBLEVBQVEsTUFBUjtRQUNBLElBQUEsRUFBTSxDQUFDLElBQUQsQ0FETjtPQVBKO2FBU0EsOEJBQUEsRUFyQkY7O0VBREk7Ozs7R0Fad0I7O0FBb0NoQyxLQUFLLENBQUEsU0FBRSxDQUFBLElBQVAsR0FDRTtFQUFBLE1BQUEsRUFBUSxTQUFBLEdBQUEsQ0FBUjtFQUNBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FETjtFQUVBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FGTjtFQUdBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FITjtFQUlBLE1BQUEsRUFBUSxTQUFBLEdBQUEsQ0FKUjtFQUtBLEdBQUEsRUFBSyxTQUFBLEdBQUEsQ0FMTDs7O0FBT0YsS0FBSyxDQUFBLFNBQUUsQ0FBQSxTQUFQLEdBQW1CLFNBQUEsR0FBQTs7QUFDbkIsS0FBSyxDQUFBLFNBQUUsQ0FBQSxPQUFQLEdBQWtCLFNBQUEsR0FBQTs7QUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBVyxDQUFDOzs7O0FDMUQ3QixJQUFBLG9CQUFBO0VBQUE7OztBQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZUFBUjs7QUFFUjs7Ozs7OztvQkFDSixHQUFBLEdBQUssU0FBQTtXQUFLLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFDLENBQUEsWUFBckI7RUFBTDs7b0JBQ0wsUUFBQSxHQUFVLFNBQUUsSUFBRixFQUFRLFdBQVI7O01BQVEsY0FBWTs7SUFDNUIsSUFBRSxDQUFBLElBQUEsQ0FBRixHQUFjLElBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxXQUFiO1dBQ2QsSUFBRSxDQUFBLElBQUE7RUFGTTs7b0JBR1YsVUFBQSxHQUFZLFNBQUUsSUFBRixHQUFBOztvQkFDWixNQUFBLEdBQVEsU0FBQSxHQUFBOztvQkFHUixPQUFBLEdBQVEsU0FBQSxHQUFBOzs7O0dBVFk7O0FBV3RCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDYmpCLElBQUEsNEJBQUE7RUFBQTs7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztBQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7QUFFTDs7O3NCQUNKLFdBQUEsR0FBYTs7c0JBQ2IsYUFBQSxHQUFlOztFQUNGLG1CQUFDLElBQUQsRUFBTSxXQUFOO0FBQ1gsUUFBQTs7TUFEaUIsY0FBWTs7O01BQzdCLE9BQVE7O0lBQ1I7SUFDQSwyQ0FFRTtNQUFBLE1BQUEsc0NBQXNCLENBQUMsRUFBRCxDQUF0QjtNQUVBLE9BQUEseUNBQXdCLENBQUMsVUFBRCxDQUZ4QjtNQUlBLFFBQUEsMENBQTBCO1FBQUEsRUFBQSxFQUN4QjtVQUFBLFdBQUEsRUFBYSwyQ0FBYjtTQUR3QjtPQUoxQjtNQU1BLE1BQUEsRUFBUSxnQ0FOUjtLQUZGO0lBU0EsV0FBVyxDQUFDLE9BQVosQ0FBb0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7ZUFDbEIsS0FBQyxDQUFBLFFBQUQsQ0FBVSxLQUFLLENBQUMsSUFBaEIsRUFBc0IsS0FBSyxDQUFDLElBQTVCO01BRGtCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQjtFQVpXOzs7O0dBSFM7O0FBa0J4QixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ3JCakIsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBRUM7RUFDUyxrQkFBQyxRQUFEO0lBQUMsSUFBQyxDQUFBLFdBQUQ7SUFDWixJQUFDLENBQUEsU0FBRCxHQUFhLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBQyxDQUFBLFFBQWQ7RUFERjs7Ozs7O0FBR2YsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5kMyA9IHJlcXVpcmUgXCJkM1wiXG5QdWJsaXNoZXIgPSAgcmVxdWlyZSAnLi9wdWJsaXNoZXInXG5Db250ZW50ID0gIHJlcXVpcmUgJy4vY29udGVudCdcblxuXG4jIGludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuI1xuIyBAZXhhbXBsZSBMZXQncyBnZXQgc3RhcnRlZFxuIyAgIHRhYmxlID0gbmV3IENvZmZlZVRhYmxlXG4jICAgICBjb2x1bW5zOiBbXG4jICAgICAgICd4J1xuIyAgICAgICAneSdcbiMgICAgIF1cbiMgICAgIHZhbHVlczogW1xuIyAgICAgICBbMSwgMl1cbiMgICAgICAgWzMsIDhdXG4jICAgICBdXG5jbGFzcyBDb2ZmZWVUYWJsZVxuICAjIENvbnN0cnVjdCBhIG5ldyBhbmltYWwuXG4gICNcbiAgIyBAcGFyYW0gW09iamVjdF0gY29udGVudCBjb250YWlucyBtYW55IFRhYnVsYXIgZGF0YXNldHNcbiAgIyBAcGFyYW0gW09iamVjdF0gcHVibGlzaGVycyBjb250YWlucyBtYW55IERPTSBzZWxlY3Rpb25zXG4gICMgQHBhcmFtIFtPYmplY3RdIGJvb2tzIHVzZSBwdWJsaXNoZXJzIHRvIHByZXNlbnQgYW5kIHVwZGF0ZSBjb250ZWVudFxuICAjXG4gIGNvbnN0cnVjdG9yOiAoY29udGVudD17fSwgcHVibGlzaGVycz17fSwgYm9va3M9e30pLT5cbiAgICBAY29udGVudCA9IG5ldyBDb250ZW50IGNvbnRlbnRcbiAgICBAcHVibGlzaGVycyA9IG5ldyBQdWJsaXNoZXIgcHVibGlzaGVyc1xuICAgIEBib29rcyA9IG5ldyBCb29rIGJvb2tzXG5cbiAgdmVyc2lvbjogJzAuMS4wJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb2ZmZWVUYWJsZVxuICBkM1xuICBCYW9iYWJcbn1cbiIsIk1hbmFnZXIgPSByZXF1aXJlICcuL21hbmFnZXInXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5cbiMgQ29udGVudCBpcyBhIGNvbGxlY3Rpb24gb2YgSW50ZXJhY3RpdmUgVGFidWxhciBkYXRhIHNvdXJjZXMuICBDb250ZW50XG4jIGNhbiBiZSBjb25zdW1lZCBieSBhIHB1Ymxpc2hlci4gIEJvdGggZGF0YSBhbmQgbWV0YWRhdGEgb2YgdGhlIHRhYmxlIGNhblxuIyBiZSBpbmplY3RlZCBpbnRvIHRoZSBkb21cbmNsYXNzIENvbnRlbnQgZXh0ZW5kcyBNYW5hZ2VyXG4gIF9iYXNlX2NsYXNzOiBJbnRlcmFjdGl2ZVxuICBfY29sdW1uX2luZGV4ID0gJ3NlbGVjdG9yJ1xuICBjb25zdHJ1Y3RvcjogKGRhdGEsdG9fcmVnaXN0ZXI9W10pLT5cbiAgICBzdXBlclxuICAgICAgIyBWYWx1ZXMgb2YgdGhlIGNhdGFsb2dcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAjIGZlYXR1cmVzIGluIHRoZSBjYXRhbG9nXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgICMgYXVnbWVudGVkIGNvbHVtbiBpbmZvcm1hdGlvblxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYW4gaW50ZXJhY3RpdmUgdGFibGUgaW4gdGhlIGNhdGFsb2cuXCJcbiAgICAgIHJlYWRtZTogXCJIb3cgY2FuIEkgaW1wb3J0IGEgcmVhZG1lIGZpbGVcIlxuICAgIHRvX3JlZ2lzdGVyLmZvckVhY2ggKHZhbHVlKT0+XG4gICAgICBAcmVnaXN0ZXIgdmFsdWUubmFtZSwgdmFsdWUuYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRlbnRcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcblRhYmxlID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZS90YWJsZSdcblxuIyBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZXMgbWFuaXB1bGF0ZSB0YWJsZSBlZy4gYGBzb3J0YGAsYGB1bmlxdWVgYCxgYGZpbHRlcmBgLGBgbWFwYGAsIGBgZ3JvdXBieWBgLCBgYGpvaW5gYCAuXG4jIGBgQmFvYmFiYGAgdHJlZXMgYXJlIGludGVyYWN0aXZlIGFuZCBpbW11dGFibGUuICBUaGV5IG1hbmFnZSB0aGUgc3RhdGUgb2YgdGhlXG4jIHRhYnVsYXIgZGF0YS5cbiMgSW50ZXJhY3RpdmUgbWFpbnRhaW5zOlxuIyAqIFRhYmxlIG1ldGFkYXRhXG4jICogQ29sdW1uRGF0YVNvdXJjZXMgYGBjb2x1bW5fZGF0YV9zb3VyY2VgYCBhbmQgUm93IERhdGFTb3VyY2UgYGB2YWx1ZXNgYFxuIyAqIGBgSGlzdG9yeWBgIG9mIHRoZSBjb21wdXRlIGFwcGxpZWQgdG8gdGhlIHRhYmxlLlxuIyBAZXhhbXBsZSBjcmVhdGUgYSBuZXcgSW50ZXJhY3RpdmUgRGF0YSBTb3VyY2VcbiMgICB0YWJsZSA9IG5ldyBJbnRlcmFjdGl2ZVxuIyAgICAgY29sdW1uczogW1xuIyAgICAgICAneCdcbiMgICAgICAgJ3knXG4jICAgICBdXG4jICAgICB2YWx1ZXM6IFtcbiMgICAgICAgWzEsIDJdXG4jICAgICAgIFszLCA4XVxuIyAgICAgXVxuIyAgICAgbWV0YWRhdGE6XG4jICAgICAgIHg6IHt1bml0czonaW5jaCcsYWxpYXM6J2xlbmd0aCBvZiByZWN0YW5nbGUnfVxuIyAgICAgICB5OiB7dW5pdHM6J2luY2gnLGFsaWFzOid3aWR0aCBvZiByZWN0YW5nbGUnfVxuY2xhc3MgSW50ZXJhY3RpdmUgZXh0ZW5kcyBUYWJsZVxuICByZWFkbWU6IC0+IEBfcmVhZG1lLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIHRhYmxlX25hbWUpLT5cbiAgICBAdHJlZSA9IG5ldyBCYW9iYWIge31cbiAgICBAY3Vyc29yID0gQHRyZWUuc2VsZWN0IDBcbiAgICBAX3JlYWRtZSA9IEBjdXJzb3Iuc2VsZWN0ICdyZWFkbWUnXG4gICAgc3VwZXIgZGF0YV9vcl91cmwsIHRhYmxlX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKGFyZ3MpLT4gQF9jb2x1bW5zLmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICB1cGRhdGU6IC0+XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29sdW1uXG4iLCJkMyA9IHJlcXVpcmUgXCJkM1wiXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4uL2ludGVyYWN0aXZlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db21wdXRlXG4gIGNvbXB1dGU6ICgpLT5cbiAgICAjIyMgQ29tcHV0ZSBjaGFuZ2VzIHRoZSBzdGF0ZSBvZiB0aGUgZGF0YSB0cmVlICMjI1xuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQHZhbHVlcygpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIG1ldGFkYXRhOiBAbWV0YWRhdGEoKVxuICAgICAgY29sdW1uczogQGNvbHVtbnMoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICB0aGlzXG5cbiAgc3RhZ2U6IChuZXdfc3RhdGUsZXhwcmVzc2lvbj1udWxsKS0+XG4gICAgW3VwZGF0ZV9zdGF0ZSwgbW9ua2V5c10gPSBAX3NwbGl0X3VwZGF0ZV9vYmplY3QgbmV3X3N0YXRlXG4gICAgQGN1cnNvci5kZWVwTWVyZ2UgdXBkYXRlX3N0YXRlXG4gICAgaWYgbW9ua2V5cy5sZW5ndGggPiAwXG4gICAgICBmb3IgbW9ua2V5IGluIG1vbmtleXNcbiAgICAgICAgQGN1cnNvci5zZXQgbW9ua2V5LnBhdGgsIG1vbmtleS52YWx1ZVxuICAgIHRoaXNcblxuICBfc3BsaXRfdXBkYXRlX29iamVjdDogKCB1cGRhdGVkX3N0YXRlLCBwYXRoPVtdLCBtb25rZXlzPVtdICktPlxuICAgICMjIyBQcnVuZSBhbmQgc2V0IHRoZSBCYW9iYWIgbW9ua2V5cyBhbmQgcmV0dXJuIG9ubHkgdGhlIHZhbHVlcyBjb21wbGlhbnQgd2l0aCBkZWVwTWVyZ2UgIyMjXG4gICAgZDMuZW50cmllcyB1cGRhdGVkX3N0YXRlXG4gICAgICAgIC5mb3JFYWNoIChlbnRyeSk9PlxuICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkoZW50cnkudmFsdWUpXG4gICAgICAgICAgICAjIyMgZG8gbm90aGluZyAjIyNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZihlbnRyeS52YWx1ZSkgaW4gWydvYmplY3QnXVxuICAgICAgICAgICAgaWYgcGF5bG9hZFtlbnRyeS5rZXldWydoYXNEeW5hbWljUGF0aHMnXT9cbiAgICAgICAgICAgICAgbW9ua2V5cy5wdXNoXG4gICAgICAgICAgICAgICAgcGF0aDogW3BhdGguLi4sZW50cnkua2V5XVxuICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS52YWx1ZVxuICAgICAgICAgICAgICBkZWxldGUgcGF5bG9hZFtlbnRyeS5rZXldXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBfc3BsaXRfbWVyZ2Vfb2JqZWN0IHVwZGF0ZWRfc3RhdGVbZW50cnkua2V5XSwgW3BhdGguLi4sZW50cnkua2V5XSwgbW9ua2V5c1xuICAgIFtwYXlsb2FkLG1vbmtleXNdXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29tcHV0ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkhpc3RvcnkgPSByZXF1aXJlICcuL2hpc3RvcnknXG5cbmNsYXNzIEludGVyYWN0aXZlLkV4cHJlc3Npb24gZXh0ZW5kcyBIaXN0b3J5XG4gIGV4cHJlc3Npb246IChhcmdzKS0+IEBfZXhwcmVzc2lvbi5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXhwcmVzc2lvbnMgPSBbXVxuICAgIEBfZXhwcmVzc2lvbiA9IEBjdXJzb3Iuc2VsZWN0ICdleHByZXNzaW9uJ1xuICAgIHN1cGVyKClcblxuICBleGVjdXRlOiAoZXhwcmVzc2lvbnMuLi4pLT5cbiAgICBleHByZXNzaW9ucy5mb3JFYWNoICAoZXhwcmVzc2lvbixleHByZXNzaW9uX2NvdW50KS0+XG4gICAgICBpZiBleHByZXNzaW9uLm1ldGhvZCBpbiBkMy5rZXlzIEBFeHByZXNzaW9uLnByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXMuRXhwcmVzc2lvbltleHByZXNzaW9uLm1ldGhvZF0gZXhwcmVzc2lvbi5hcmdzLi4uXG4gICAgICBlbHNlIGlmIGV4cHJlc3Npb24ubWV0aG9kIGluIGQzLmtleXMgQHByb3RvdHlwZVxuICAgICAgICBjb21wdXRlZF9zdGF0ZSA9IHRoaXNbZXhwcmVzc2lvbi5tZXRob2RdIGV4cHJlc3Npb24uYXJncy4uLlxuICAgICAgZWxzZVxuICAgICAgICBhc3NlcnQgXCIje0pTT04uc3RyaW5naWZ5IGV4cHJlc3Npb25zfSBpcyBub3QgdW5kZXJzdG9vZC5cIlxuICAgICAgQHN0YWdlIGNvbXB1dGVkX3N0YXRlXG4gICAgICBAY29tcHV0ZSgpXG5cbiAgZ2V0OiAoYXJncyktPiBAY3Vyc29yLmdldCBhcmdzLi4uXG4gIHNldDogKGFyZ3MpLT4gQGN1cnNvci5zZXQgYXJncy4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkV4cHJlc3Npb25cbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi4vaW50ZXJhY3RpdmUnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2V4cHJlc3Npb24uc3RhcnRSZWNvcmRpbmcgMjBcbiAgICBzdXBlcigpXG4gIGhpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5nZXRIaXN0b3J5KClcbiAgY2xlYXJfaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmNsZWFySGlzdG9yeSgpXG4gIHJlY29yZDogKGV4cHJlc3Npb24pLT5cbiAgICAgIEBleHByZXNzaW9ucy5wdXNoIGV4cHJlc3Npb25cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5IaXN0b3J5XG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuLi9pbnRlcmFjdGl2ZSdcbkNvbHVtbiA9IHJlcXVpcmUgJy4vY29sdW1ucydcblxuIyBUYWJsZSBhc3NpZ25zIG1ldGFkYXRhIHRvIHRoZSBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuIyBBIHRhYmxlIGlzIGRlc2NyaWJlIGJ5OlxuIyAqIF92YWx1ZXNfIC0gQSBsaXN0IG9mIGxpc3RzIGNvbnRhaW5pbmcgdGhlIHJvdyBlbnRyaWVzIGluIHRoZSB0YWJsZS5cbiMgKiBfY29sdW1uc18gLSBUaGUgY29sdW1uIG5hbWVzIGluIHRoZSB0YWJsZSwgdGhlIGNvbHVtbiBuYW1lcyBtYXAgdGhlIGVudHJpZXMgaW4gZWFjaCByb3dcbiMgKiBfbWV0YWRhdGFfIC1cbiMgVGhlIHRhYmxlIGtleXMgIG5hbWluZyBpcyBpbnNwaXJlZCBieSBgYHBhbmRhcy5EYXRhRnJhbWUudG9fZGljdChvcmllbnQ9J3JlY29yZHMnKS5cblxuY2xhc3MgSW50ZXJhY3RpdmUuVGFibGUgZXh0ZW5kcyBDb2x1bW5zXG4gIG1ldGFkYXRhOiAoYXJncyktPiBAX21ldGFkYXRhLmdldCBhcmdzLi4uXG5cbiAgIyBAcGFyYW0gW1N0cmluZ10gZGF0YV9vcl91cmwgdXJsIHRvIGEganNvbiBlbmRwb2ludCBjb250YWluaW5nIHRoZSBrZXlzIGBgdmFsdWVzYGAsIGBgXG4gICMgQHBhcmFtIFtPYmplY3RdIGRhdGFfb3JfdXJsXG4gIGNvbnN0cnVjdG9yOiAoZGF0YV9vcl91cmwsIEBuYW1lPW51bGwpLT5cbiAgICAjIyBUaGUgdGFibGUgY2FuIGJlIHJlbmFtZWQgIyMjXG4gICAgQF9uYW1lID0gQGN1cnNvci5zZWxlY3QgJ25hbWUnXG4gICAgQF9uYW1lLnNldCBAbmFtZVxuICAgIEBfbWV0YWRhdGEgPSBAY3Vyc29yLnNlbGVjdCAnbWV0YWRhdGEnXG4gICAgQGxvYWQgZGF0YV9vcl91cmxcbiAgICBzdXBlcigpXG4gIGxvYWQ6IChkYXRhX29yX3VybCktPlxuICAgIGlmICdzdHJpbmcnIGluIFt0eXBlb2YgZGF0YV9vcl91cmxdXG4gICAgICBkMy5qc29uIGRhdGEsICh0YWJsZV9kYXRhKT0+XG4gICAgICAgIHRhYmxlX2RhdGFbJ3VybCddID0gQF9yYXdcbiAgICAgICAgQHN0YWdlXG4gICAgICAgICAgICByYXc6IHRhYmxlX2RhdGFcbiAgICAgICAgICAgIGluZGV4OiBkMy5yYW5nZSB0YWJsZV9kYXRhLmxlbmd0aFxuICAgICAgICAgICxcbiAgICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgICBhcmdzOiBbZGF0YV9vcl91cmxdXG4gICAgICAgIHN1cGVyKClcbiAgICBlbHNlXG4gICAgICBkYXRhID0gZGF0YV9vcl91cmxcbiAgICAgIEBzdGFnZVxuICAgICAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAgICAgY29sdW1uczogZGF0YS5jb2x1bW5zID8gW11cbiAgICAgICAgICBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSA/IHt9XG4gICAgICAgICAgcmVhZG1lOiBkYXRhLnJlYWRtZSA/IG51bGxcbiAgICAgICAgICBpbmRleDogZDMucmFuZ2UgZGF0YS52YWx1ZXM/Lmxlbmd0aCA/IDBcbiAgICAgICAgLFxuICAgICAgICAgIG1ldGhvZDogJ2xvYWQnXG4gICAgICAgICAgYXJnczogW2RhdGFdXG4gICAgICBzdXBlcigpXG5cblRhYmxlOjpleHByID1cbiAgY29uY2F0OiAtPlxuICBoZWFkOiAtPlxuICB0YWlsOiAtPlxuICBzb3J0OiAtPlxuICBmaWx0ZXI6IC0+XG4gIG1hcDogLT5cblxuVGFibGU6OnRvX3N0cmluZyA9IC0+XG5UYWJsZTo6dG9fanNvbiA9ICAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5cbmNsYXNzIE1hbmFnZXIgZXh0ZW5kcyBJbnRlcmFjdGl2ZVxuICBkaXI6ICgpLT4gQGNvbHVtbl9kYXRhX3NvdXJjZSBAaW5kZXhfY29sdW1uXG4gIHJlZ2lzdGVyOiAoIG5hbWUsIGRhdGFfb3JfdXJsPW51bGwgKS0+XG4gICAgQFtuYW1lXSA9IG5ldyBAX2Jhc2VfY2xhc3MgZGF0YV9vcl91cmxcbiAgICBAW25hbWVdXG4gIHVucmVnaXN0ZXI6ICggbmFtZSApLT5cbiAgY29tbWl0OiAtPlxuXG4gICMgQ29tcHV0ZSBkb2VzIHNvbWUgc3R1ZmZcbiAgY29tcHV0ZTotPlxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbmFnZXJcbiIsIk1hbmFnZXIgPSByZXF1aXJlICcuL21hbmFnZXInXG5UZW1wbGF0ZSA9IHJlcXVpcmUgJy4vdGVtcGxhdGUnXG5cbmNsYXNzIFB1Ymxpc2hlciBleHRlbmRzIE1hbmFnZXJcbiAgX2Jhc2VfY2xhc3M6IFRlbXBsYXRlXG4gIF9jb2x1bW5faW5kZXg6ICdzZWxlY3RvcidcbiAgY29uc3RydWN0b3I6IChkYXRhLHRvX3JlZ2lzdGVyPVtdKS0+XG4gICAgZGF0YSA/PSB7fVxuICAgIEBcbiAgICBzdXBlclxuICAgICAgIyBWYWx1ZXMgb2YgdGhlIGNhdGFsb2dcbiAgICAgIHZhbHVlczogZGF0YS52YWx1ZXMgPyBbW11dXG4gICAgICAjIGZlYXR1cmVzIGluIHRoZSBjYXRhbG9nXG4gICAgICBjb2x1bW5zOiBkYXRhLmNvbHVtbnMgPyBbJ3NlbGVjdG9yJ11cbiAgICAgICMgYXVnbWVudGVkIGNvbHVtbiBpbmZvcm1hdGlvblxuICAgICAgbWV0YWRhdGE6IGRhdGEubWV0YWRhdGEgPyBpZDpcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUgb2YgYSB0ZW1wbGF0ZSBpbiBhbiBlbnZpcm9ubWVudC5cIlxuICAgICAgcmVhZG1lOiBcIkhvdyBjYW4gSSBpbXBvcnQgYSByZWFkbWUgZmlsZVwiXG4gICAgdG9fcmVnaXN0ZXIuZm9yRWFjaCAodmFsdWUpPT5cbiAgICAgIEByZWdpc3RlciB2YWx1ZS5uYW1lLCB2YWx1ZS5hcmdzXG5cbm1vZHVsZS5leHBvcnRzID0gUHVibGlzaGVyXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5jbGFzcyBUZW1wbGF0ZSBcbiAgY29uc3RydWN0b3I6IChAc2VsZWN0b3IpLT5cbiAgICBAc2VsZWN0aW9uID0gZDMuc2VsZWN0QWxsIEBzZWxlY3RvclxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlXG4iXX0=
