datashape = output:(struct / dimensions / compound / type ) _ { return output; }

types =
  'bool' { return 'bool'; } /
  'int' { return 'int32'} /
  type:'int'[8,16,32,64,128] { return type; } /
  'uint' { return 'uint32'} /
  type:'uint'[8,16,32,64,128] { return type; } /
  'real' { return 'float64'} /
  type:'float'[8,16,32,64,128] { return type; } /
  type:'decimal'[32,64,128] { return type; } /
  type: 'char' { return type; }/
  type: 'json' { return type; }/
  type: 'date' { return type; }/
  type: 'bytes' { return type; }/
  type: 'string' { return type; }/
  type: 'datetime' { return type; }/
  type: 'categorical' { return type; }/
  type: 'option' { return type; }/
  type: 'pointer' { return type; }/
  type: 'void' { return type; }/




compound = type:types '[' args:compound_args ']' {
  return {
    type: type,
    args: args,
  }
}

compound_args = args:(arg:compound_arg _ ',' _ {
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

compound_arg_value = string_value / integer / types
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
