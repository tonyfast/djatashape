/** A PegJS grammar for Python DataShape **/

{
  function toObject( array ){
    /** Convert an array of {key,value} objects to an objecy **/
    var tmp = {};
    array.forEach( function(entry){
        tmp[entry.key] = entry.value;
    });
    if ( tmp === {} ){ return null; }
    return tmp;
  };
}

/** First Parsing Expression **/
datashape = output:(shapes / structure / type ) _ { return output; }

/** Array Shapes trail with a type **/
shapes = _ shape:(shape)+ _ type:datashape {
  return {
    shape: shape,
    type: type
  };
}

/** The shape is an integer or ``var`` separated by an asterisk **/
shape = shape:( integer / "var" ) _ '*' _  { return shape; }

/** Object DataShape defintion **/
structure =  '{' _ entries:structure_entries? entry:(structure_entry) '}' {
  entries = entries ? entries : [];
  entries.push(entry = entry ? entry : void(0));
  return toObject( entries );
}

/** key/value pairs separated with a colon **/
structure_entry = key:string _ ':' _ value:datashape { return { key: key, value: value,}; }
structure_entries = entries:( entry:structure_entry _ ',' _ { return entry; })+ { return entries; }

/** DataShape types **/
type = inferred:'?'? type:types params:compound? {
  if (!(params)){ return {type: type}; };
  if (inferred){ params['inferred'] = true; };
  return {type: type, params: params };
}

types = (t:'int' b:("8"/"16"/"32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    (t:'unit' b:("8"/"16"/"32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    (t:'float' b:("8"/"16"/"32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    (t:'decimal' b:("32"/"64"/"128")? { return t+(b==null?'32':b) }) /
    t:('char' / 'json' / 'void' / 'pointer' / 'complex' / 'string' / 'bytes' / 'datetime' / 'categorical') { return t;  }

compound = '[' arg:(simple_type / args:(compound_type)+ { return args; } ) _ ']' { return arg; }

simple_type = value:types { return { key: 'type', value: value } }

compound_type  =  _ entries:compound_entries? entry:(compound_entry) {
  entries = entries ? entries : [];
  entries.push(entry = entry ? entry : void(0));
  return toObject( entries );
}

compound_entries = entries:(entry:compound_entry  _ ',' _ { return entry; } )+ { return entries };
compound_entry = key:string _ '=' _ value:(literal_string/types/list) { return { key: key, value: value,};  } /
  value:types { return {key: 'type', value: value}; }

list = '['_ entries:(_ v:literal_string _ ',' { return v;})* _ entry:literal_string _ ']' {
  entries = entries ? entries : [];
  entries.push(entry = entry ? entry : void(0));
  return entries;
}


literal_string = ( '"' s:string '"' {return s;} / "'" s:string "'" {return s;})
string = chars:([a-zA-Z0-9_ ])+ { return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }

_  = [\\ \\t\\r\\n]*
