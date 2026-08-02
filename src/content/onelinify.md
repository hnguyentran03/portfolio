A web app that compresses a Python, JavaScript, or Lua snippet into a single line of pure-lambda code. Variable bindings become lambda applications, loops and recursion are tied with the Z combinator, and accumulator loops are rewritten into comprehensions or `.filter`/`.map`/`.reduce` chains where they fit. Three compilers share one strategy but have fully independent implementations. Python and Lua transform server-side behind a small Flask API, while JavaScript is compiled entirely in the browser, so a JS snippet never leaves the machine. No compiler ever *executes* input or output. Everything is parse → transform → re-emit.

## Features

- One-lines Python, JavaScript, and Lua with three independent statement-to-expression compilers
- Z-combinator encodings for recursion, `while`, and every flavor of `for` loop
- Accumulator loops recognized and rewritten to list/set/dict comprehensions, `sum(...)`, or `.filter`/`.map`/`.reduce` chains
- Multi-function programs supported by inlining helpers as anonymous lambdas at their call sites
- Out-of-scope constructs and semantic traps are rejected with line-numbered errors instead of being subtly miscompiled
- JavaScript compiles fully client-side
- Every transformer self-checks its output by re-parsing it (never running it)
- Behavioral test suite that executes each original snippet and its one-liner and asserts they agree

## Implementation details

The three implementations at a glance.

| Language | Runs | Parser | Output |
|---|---|---|---|
| Python | server | stdlib `ast` | transformed AST unparsed to one line |
| Lua | server | `luaparser` | source text emitted directly |
| JavaScript | browser | vendored `acorn` | ESTree re-emitted with vendored `astring` |

### Compiling "the rest of the block"

The heart of each compiler is one recursive function, `compile_block(stmts, tail, bound)`, that turns a statement list into a single expression. It peels off the first statement and wraps the recursive compilation of everything after it (the Python shapes shown, with JS and Lua equivalents).

| Statement | Compiles to |
|---|---|
| `x = e` | `(lambda x: <rest>)(e)`, binding as lambda application |
| bare expression | `(lambda _: <rest>)(expr)`, value discarded into a fresh ignore parameter |
| `return e` | `e`, with the rest of the block dropped |
| `def f: ...` | `(lambda f: <rest>)(<compiled function>)` |

Compilation is effectively continuation-passing at the block level: every construct answers "what expression is the rest of this scope?" and wraps it. Compiler-generated names can never capture user names, because each compiler seeds its fresh-name generator with every identifier appearing anywhere in the source.

### Recursion via the Z combinator

Named recursion has no direct lambda equivalent, so recursive functions are tied with the Z combinator, the strict-evaluation variant of Y (the plain Y combinator would loop forever in an eager language). The eta-expansion `lambda *a, **k: x(x)(*a, **k)` is the crucial delay that stops `x(x)` from evaluating until the function is actually called. The wrapper is only applied when a function's body actually reads its own name, so non-recursive functions compile to bare lambdas.

### Loops as recursion over threaded state

`while` and `for` compile to a Z-combinator loop function over a *state tuple*, made of the variables the loop assigns that anything afterward reads. A small liveness analysis keeps the tuple minimal and deterministic. Each iteration ends by re-invoking the loop with updated state, and when the test fails the final state tuple is returned and rebound for the rest of the block. Each language keeps its own iteration semantics. Python `for` materializes the iterable and recurses structurally on head/tail, JavaScript `for...of` spreads to a real array and threads state as arrays (JS has no tuples), Lua's numeric `for` compiles the counter and sign-of-step logic explicitly, and Lua's generic `for` compiles the actual iterator-triple protocol so `pairs`/`ipairs` and custom iterators work.

### Conditionals

An `if` compiles one of three ways. If a branch returns, the continuation is duplicated into both arms and joined with a conditional expression. Because compilation stops at `return`, an always-returning branch discards its copy, so code growth only happens for genuinely mixed branches. If neither branch assigns anything read later, the branches run purely for side effects. Otherwise the variables both branches might assign are threaded through as a state tuple, with each branch supplying its own values.

### Emitting Lua source and the missing ternary

`luaparser` has no single-line-guaranteeing printer, so the Lua compiler emits source text directly. Every compiled fragment carries the metadata composition needs: operator precedence for minimal-but-correct parenthesization, whether the expression may expand to multiple values (parenthesizing truncates multiple values in Lua, so that must never happen where extra values matter), and whether it is statically truthy. Truthiness gates the ternary encoding. Lua has no conditional expression, so `cond ? A : B` becomes `cond and A or B` only when `A` is provably neither `nil` nor `false`, and otherwise a thunk form that is also transparent to multiple return values. Since `luaparser` also provides no load/store contexts or scope utilities, all the name analysis the compiler depends on is hand-rolled.

### Rejecting rather than miscompiling

Beyond each validator's banned-construct list, the compilers detect semantic traps the lambda encoding cannot honor. Lambdas capture bindings at definition point while all three languages resolve free names at call time, so a function that reads a variable reassigned after its definition is rejected. So is mutation through subscripts, attributes, or table fields, since the encoding can only rebind names, not mutate structures observed elsewhere. As a final guard, every transformer asserts its output is one line and re-parses it (compile-only, never executed), and raises an internal error rather than returning garbage.

### Testing

The test suite is behavioral. Each test transforms a snippet, then executes both the original and the one-liner and asserts they agree across a battery of calls. Lua tests run through `lupa`, a real Lua runtime embedded in Python, and the JavaScript compiler has a parallel `node --test` suite using the same execute-and-compare approach, alongside per-feature tests that pin down each compilation case and each rejection message.
