
/*

- Templates as a JS function
    -> Hello word sample

- JSX-like syntax, with 2 notable differences
    - Template-specific syntax elements are transformed into JS statements instead of JS expressions.     
    This allows to mix any JS statements (like for loops) with template syntax entities
    - Text nodes must be explicitly defined (with '#' separators) because JS can be inserted between start and end element tags

- Control-statements in JS
    -> if / for / let (but also local variables: let, do-while, etc.)

- Change management based on data observation -> trax framework

- Attributes, properties, and binding values

- Components as function calls

- Component content as argument

- Component content only evaluated when projected (delay / delay projection)

- Component parameters can be expressed as nodes
    -> Advanced components don't need to parse their content 
    and rely on naming conventions to extract information
    (e.g. custom select)

- JS import/export to share components

- Decorators (built-in and custom)

- Labels

- TODO: Lazy-loading

Design principles
- Cover as many use cases as possible - i.e. design choices must not block developers
- Lean on JS/TS when concepts already exist
- Explicit non-ambiguous syntax: simple rules, no exceptions
- Limited concepts, more composable
- Play nicely with other libraries: must be easily combined with other frameworks

*/

