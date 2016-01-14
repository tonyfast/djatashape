datashape = output:(struct / dimensions / compound / type ) _ { return output; }

compound = type:type '[' args:compound_args ']' {
  return {
    type: type,
    args: args,
  }
}

compound_args = args:(arg:compound_arg _ {
	return arg;
})+ {
  var tmp = {};
  args.forEach( function(arg){
  	tmp[arg.key] = arg.value;
  });
  return tmp;
}

compound_arg = key:string '=' value:compound_arg_value {
  return {
    key: key,
    value: value,
  }
} / key:string {
  return {
    key: key,
    value: '',
  }
}

compound_arg_value = string_value / integer / type
struct = '{' _ entries:(entry)+ _ '}' {
	var tmp={};
    entries.forEach(
    	function(d){
    		tmp[d.key] = d.value;
		});
        return tmp;
    }

entry = key:string _ ':' _ value:datashape {
	return {
    	key: key,
        value: value,
    }
}

dimensions = dims:(dim:dimension _ '*' _ {
	return dim;
})+ _ type:datashape {
	return {
    	length: dims,
        type: type,
    }
}

dimension = dim:integer {
	return dim;
}/ 'var' {
	return 'var';
} / type:type {
	return type;
}

type = string

string_value = quotes value:string quotes {
  return value;
}

quotes = ['"'/"'"]

string = chars:([a-zA-Z0-9_])+ { debugger; return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }
_  = [ \t\r\n]*
__ = [ \t\r\n]+
