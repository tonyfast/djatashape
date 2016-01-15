{
  function toObject( first, other ){
    /** Convert an array of {key,value} objects to an objecy **/
    var tmp = {};
    if ( !(first == null) ){
      tmp[first.key] = first.value;
      if ( !( other == null) ){
        other.forEach( function(entry){
          tmp[entry.key] = entry.value;
        });
      };
      return tmp;
    } else { return null; };
  };
}

datashape = output:(shapes / structure / type ) _ { return output; }

shapes = _ shape:(shape)+ _ type:datashape {
  return {
    shape: shape,
    type: type
  };
}
shape = shape:(integer / "var") _ '*' _  { return shape; }

structure = '{' arg_comma first_entry:(structure_entry)  other_entries:structure_entries? arg_comma '}' { return toObject(first_entry, other_entries); }
structure_entries = entries:(arg_comma entry:structure_entry { return entry; })+ { return entries; }
structure_entry = key:string _ ':' _ value:datashape { return { key: key, value: value,}; }

type = type:types params:compound? { console.log(1,type);return {type: type, params: toObject(params)}; }

types = type:(
    'int' / 'uint' / 'float' / 'decimal' / 'char' /
    'json' / 'void' / 'pointer' / 'complex' / 'string' / 'bytes' / 'datetime' / 'categorical'
) { return type;  }

compound = '[' arg_comma first_entry:(compound_entries)  other_entries:(compound_entry)+ arg_comma ']' {
  !(other_entries == null) ? other_entries.unshift(first_entry) : null;
  return !(other_entries == null) ? other_entries : first_entry ;
}
compound_entries = ',' entry:compound_entry { return entry; }
compound_entry = key:string _ '=' _ value:(literal_string/datashape) { return { key: key, value: value,};  }

arg_comma = _ ','? _
literal_string = ( '"' string '"' / "'" string "'")
string = chars:([a-zA-Z0-9_])+ { return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }
_  = [ \t\r\n]*
__ = [ \t\r\n]+
