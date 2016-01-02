``Interactive`` is Tabular data source.

graph LR;

Interactive((Interactive)) --- Table((Table))
Interactive --- readme

Table --- ColumnDataSource((ColumnDataSource))
Table --- metadata
ColumnDataSource --- Data
ColumnDataSource --- column_data_source

Data((Data)) --- Row((Row))
Data --- values

Row --- Column((Column))
Row --- index

Column --- Expression
Column --- columns

Expression((Expression)) --- History((History))
Expression((Expression)) --- expressions
History((History)) --- checkpoint
