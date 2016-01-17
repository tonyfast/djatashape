{
  function toObject( array ){
    /** Convert an array of {key,value} objects to an objecy **/
    var tmp = {};
    if ( !( array == null) ){
      console.log(2,array);
      array.forEach( function(entry){
          tmp[entry.key] = entry.value;
      });
    }
    if ( tmp === {} ){ return null; }
    return tmp;
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

structure = '{' arg_comma first_entry:(structure_entry)  other_entries:structure_entries? arg_comma '}' {
  if( !(other_entries ? other_entries.unshift( first_entry ? first_entry : [] ) : null) ){
  	other_entries = null;
  }
  return toObject( other_entries );
}
structure_entries = entries:(',' _ entry:structure_entry { return entry; })+ { return entries; }
structure_entry = key:string _ ':' _ value:datashape { return { key: key, value: value,}; }

type = type:types params:compound? { return {type: type, params: params ? params : {} }; }

types = (t:'int' b:("8"/"16"/"32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    (t:'unit' b:("8"/"16"/"32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    (t:'float' b:("8"/"16"/"32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    (t:'decimal' b:("32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    t:('char' / 'json' / 'void' / 'pointer' / 'complex' / 'string' / 'bytes' / 'datetime' / 'categorical') { return t;  }

compound = '[' arg:(simple_type / args:(compound_type)+ { return args; } ) ']' {console.log('AA',arg);return arg;}

simple_type = value:types { return { key: 'type', value: value } }

compound_type  = first_entry:compound_entry other_entries:(',' _ v:(compound_entries)* { return v; })? arg_comma {

  if( !(other_entries ? other_entries.unshift( first_entry ? first_entry : [] ) : null) ){
  	other_entries = null;
  }
  return toObject( other_entries );
 }

compound_entries = entry:compound_entry { return entry; }
compound_entry = key:string _ '=' _ value:(literal_string/types) { return { key: key, value: value,};  } /
  value:types { return {key: 'type', value: value}; }

arg_comma = _ ','? _
literal_string = ( '"' s:string '"' {return s;} / "'" s:string "'" {return s;})
string = chars:([a-zA-Z0-9_])+ { return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }
_  = [ \t\r\n]*
__ = [ \t\r\n]+
