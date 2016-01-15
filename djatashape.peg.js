{
  function toObject( first, other ){
    /** Convert an array of {key,value} objects to an objecy **/
    var tmp = {};
    tmp[first.key] = first.value;
    console.log(other)
    if ( !( other == null) ){
      other.forEach( function(entry){
        tmp[entry.key] = entry.value;
      });
    };
    return tmp;
  }
}


datashape = output:(shapes / structure / types ) _ { return output; }

types = compound / simple_types

shapes = _ shapes:(shape)+ _ datashape { return shapes;}
shape = shape:(integer / "var") _ '*' { return shape; }

structure = '{' arg_comma first_entry:(structure_entry)  other_entries:structure_entries? arg_comma '}' { return toObject(first_entry, other_entries); }
structure_entries = entries:(arg_comma entry:structure_entry { return entry; })+ { return entries; }
structure_entry = key:string _ ':' _ value:datashape { return { key: key, value: value,} }

compound = type:simple_types '[' arg_comma first_entry:(compound_type_entries)  other_entries:(compound_type_entry)+ arg_comma ']' {
  return {
    type: type,
    args: toObject(first_entry, other_entries),
   }
}
compound_type_entries = ',' entry:compound_type_entry { return entry; }
compound_type_entry = key:string _ '=' _ value:(literal_string/datashape) { return { key: key, value: value,} }


simple_types = string
  'bool' { return 'bool'; } /
  'int' { return 'int32'} /
  type:'int' [8,16,32,64,128] { return type; } /
  'uint' { return 'uint32'} /
  type:'uint' [8,16,32,64,128] { return type; } /
  'real' { return 'float64'} /
  type:'float' [8,16,32,64,128] { return type; } /
  type:'decimal' [32,64,128] { return type; } /
  type: 'char' { return type; }/
  type: 'json' { return type; }/
  type: 'date' { return type; }/
  type: 'bytes' { return type; }/
  type: 'string' { return type; }/
  type: 'datetime' { return type; }/
  type: 'categorical' { return type; }/
  type: 'option' { return type; }/
  type: 'pointer' { return type; }/
  type: 'void' { return type; }

type = string
arg_comma = _ ','? _
literal_string = ( '"' string '"' / "'" string "'")
string = chars:([a-zA-Z0-9_])+ { return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }
_  = [ \t\r\n]*
__ = [ \t\r\n]+