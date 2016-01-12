/* description: Parses end evaluates mathematical expressions. */

/* lexical grammar */
%lex
%%
[0-9]+("."[0-9]+)?\b  {return 'NUMBER';}
"*"                   {return '*';}
"{"                   return '{'
"}"                   return '}'
","                   return ','
":"                   return ':'
"\\'"                 return "'"
"..."                 return "..."

/lex

%left '*'
%right ':'