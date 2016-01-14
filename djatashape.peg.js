datashape = output:(struct / dimensions / type ) _ { return output; }

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

string = chars:([a-zA-Z0-9_])+ { debugger; return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }
_  = [ \t\r\n]*
__ = [ \t\r\n]+
