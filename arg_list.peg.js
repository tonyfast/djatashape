start =','?  first_arg next_args? ','?
first_arg = string
next_args = (',' string)+

string = chars:([a-zA-Z0-9_])+ { debugger; return chars.join('') }
integer = value:[0-9]+ { return parseFloat(value.join(""), 10); }
_  = [ \t\r\n]*
__ = [ \t\r\n]+
