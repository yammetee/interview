import fs from "node:fs";
import path from "node:path";

const explanations = {
  "sudheerj-q-030-why-do-you-need-modules":
    "Modules matter because they create explicit boundaries between pieces of code. Instead of relying on shared globals, a module can export only the API it wants other files to use, which makes dependencies easier to track and refactor.",
  "sudheerj-q-039-why-do-you-need-a-cookie":
    "Cookies are useful when small pieces of state must survive across page loads and, when needed, be sent with HTTP requests. They are commonly used for sessions and preferences, but they should be kept small and configured carefully with security attributes.",
  "sudheerj-q-047-why-do-you-need-web-storage":
    "Web storage is intended for client-side data that does not need to be sent on every HTTP request. This is the key difference from cookies: localStorage and sessionStorage are easier for browser-only state, but they are still not appropriate for sensitive secrets.",
  "sudheerj-q-100-is-there-any-relation-between-java-and-javascript":
    "The similar names are mostly historical branding. JavaScript shares some surface-level syntax with C-style languages, but its runtime model, prototype-based object system, and browser integration are completely different from Java.",
  "sudheerj-q-109-why-is-javascript-treated-as-single-threaded":
    "The important interview point is that JavaScript executes user code on one main call stack. The environment can still do work outside that stack, such as timers, networking, or worker threads, but callbacks re-enter JavaScript through the event loop.",
  "sudheerj-q-111-what-is-ecmascript":
    "ECMAScript is the specification; JavaScript is the language implementation developers use. Browser engines and runtimes such as Node.js implement ECMAScript features and add host APIs around them.",
  "sudheerj-q-112-what-is-json":
    "JSON is language-independent even though its syntax was inspired by JavaScript objects. The main practical distinction is that JSON is data, not code: it supports a limited set of value types and must be parsed before use.",
  "sudheerj-q-137-is-the-notation-represents-a-special-operator":
    "JavaScript parses `!--` as separate operators, not as one custom operator. Understanding this helps avoid misreading compact expressions: operator precedence and evaluation order decide the result.",
  "sudheerj-q-140-what-is-an-app-shell-model":
    "The app shell model separates the stable application frame from the dynamic content. This works well for PWAs because the shell can be cached and shown quickly while fresh data is loaded separately.",
  "sudheerj-q-153-what-is-the-need-of-tree-shaking":
    "Tree shaking depends on static module structure, especially ES modules, so the bundler can prove which exports are unused. It is most effective when libraries are authored in a way that avoids hidden side effects.",
  "sudheerj-q-154-is-it-recommended-to-use-eval":
    "`eval()` is dangerous because it executes strings as code in the current context. Besides security risks, it also makes optimization and static analysis harder, so most real use cases should be solved with normal functions or structured data.",
  "sudheerj-q-180-what-is-the-purpose-of-the-freeze-method":
    "`Object.freeze()` only freezes the object itself, not deeply nested objects. It is useful for protecting object shape and top-level values, but deep immutability requires recursively freezing nested references.",
  "sudheerj-q-220-what-are-the-advantages-of-getters-and-setters":
    "Getters and setters let an object expose property-like syntax while still running code behind the scenes. They are useful for computed values and validation, but overusing them can hide expensive or surprising behavior behind simple property access.",
  "sudheerj-q-224-what-are-primitive-data-types":
    "Primitive values are immutable values stored and compared by value, except that `null` has the historical `typeof null === \"object\"` quirk. Methods like `'abc'.toUpperCase()` work because JavaScript temporarily boxes primitives when needed.",
  "sudheerj-q-254-what-are-the-advantages-of-typescript-over-javascript":
    "TypeScript improves developer feedback before runtime by adding static types and tooling. It does not change what the JavaScript engine executes; TypeScript code is checked and then compiled to JavaScript.",
  "sudheerj-q-266-what-is-the-mean-stack":
    "The main idea of the MEAN stack is using JavaScript across the application: Angular in the browser, Node and Express on the server, and MongoDB as the database. That can reduce context switching, but each layer still has its own runtime concerns.",
  "sudheerj-q-268-why-do-you-need-obfuscation":
    "Obfuscation makes code harder to read, but it is not real security by itself. Client-side JavaScript is always delivered to users, so obfuscation should be treated as a deterrent rather than protection for secrets.",
  "sudheerj-q-270-what-are-the-advantages-of-minification":
    "Minification improves delivery performance by reducing bytes sent over the network. It is usually combined with compression and bundling, and source maps are used when developers still need readable production debugging.",
  "sudheerj-q-326-is-postmessage-secure":
    "`postMessage` can be safe when both sides validate `origin`, message shape, and expected source. The risk comes from treating every incoming message as trusted, especially when using `*` as the target origin.",
  "sudheerj-q-330-is-postmessages-synchronous":
    "Modern `postMessage` communication is asynchronous, so the receiver handles the message later through an event listener. Code should not expect a sent message to be processed before the next line runs.",
  "sudheerj-q-331-what-paradigm-is-javascript":
    "JavaScript supports multiple styles in the same program. You can write procedural code, use objects and prototypes, or compose functions; good JavaScript often mixes these approaches depending on the problem.",
  "sudheerj-q-333-is-javascript-faster-than-server-side-script":
    "This comparison depends on what work is being measured. Client-side JavaScript can avoid a server round trip for UI logic, but server-side code may be faster or necessary for database access, security, and heavy backend computation.",
  "sudheerj-q-335-what-is-the-purpose-of-double-tilde-operator":
    "`~~` coerces a value to a 32-bit signed integer, which can look like truncation for positive numbers. It is not a full replacement for `Math.floor()` because it overflows outside 32-bit range and behaves differently for negative values.",
  "sudheerj-q-417-what-are-the-differences-between-arguments-object-and-rest-parameter":
    "Rest parameters are the modern option because they create a real array and make the accepted arguments explicit in the function signature. `arguments` is legacy, array-like, and can be harder to reason about with arrow functions and strict mode.",
  "sudheerj-q-418-what-are-the-differences-between-spread-operator-and-rest-parameter":
    "The same `...` syntax has opposite roles depending on position. In a function parameter list it gathers values into an array; in a call, array literal, or object literal it expands values outward.",
  "sudheerj-q-436-what-is-function-execution-context":
    "A function execution context contains the function's local environment, arguments, scope chain, and `this` binding. It is created per invocation, which is why repeated calls to the same function get separate local variables.",
  "sudheerj-q-458-what-are-the-benefits-higher-order-functions":
    "Higher-order functions are powerful because they let behavior be passed around as data. This is the foundation for common JavaScript APIs such as `map`, `filter`, callbacks, middleware, and function composition.",
  "sudheerj-q-032-what-is-a-service-worker":
    "A service worker acts as a programmable network proxy for a site. Because it runs separately from the page, it can intercept requests, manage caches, and support offline behavior, but it cannot directly access the DOM.",
  "sudheerj-q-035-what-is-indexeddb":
    "IndexedDB is useful when localStorage is too small or too simple. It is asynchronous, supports transactions, and can store structured data, making it better for offline-first apps and larger client-side datasets.",
  "sudheerj-q-037-what-is-a-post-message":
    "`postMessage` exists because the same-origin policy normally blocks direct cross-origin access. It creates a controlled message channel, but the receiving side must still validate the origin and message payload.",
  "sudheerj-q-043-what-is-the-main-difference-between-localstorage-and-sessionstorage":
    "Both APIs expose the same Storage-style interface, but their lifetime differs. `localStorage` persists until explicitly cleared, while `sessionStorage` is scoped to the current tab or page session.",
  "sudheerj-q-051-what-are-the-restrictions-of-web-workers-on-dom":
    "Web workers run on a separate thread-like execution context, so they cannot touch page-specific objects such as `window` or `document`. Communication with the page must happen through messages.",
  "sudheerj-q-058-what-are-server-sent-events":
    "SSE is best for one-way server-to-browser updates such as notifications, logs, or live status. If the client also needs to send frequent messages over the same connection, WebSockets are usually a better fit.",
  "sudheerj-q-096-what-is-same-origin-policy":
    "Same-origin policy is a browser security boundary. It prevents a script loaded from one origin from freely reading sensitive data from another origin, which protects users who are logged into multiple sites.",
  "sudheerj-q-098-is-javascript-a-compiled-or-interpreted-language":
    "Modern JavaScript engines use a pipeline: parse source, create bytecode or intermediate representation, interpret initially, and JIT-compile hot paths. So the simple interview answer is interpreted with JIT compilation in modern engines.",
  "sudheerj-q-105-what-are-the-steps-involved-in-return-false-usage":
    "`return false` is a shorthand with framework-specific meanings in some event systems. In plain modern JavaScript, it is clearer to call `event.preventDefault()` and `event.stopPropagation()` explicitly when those behaviors are intended.",
  "sudheerj-q-113-what-are-the-syntax-rules-of-json":
    "JSON syntax is stricter than JavaScript object literal syntax. Keys must be double-quoted strings, comments are not allowed, and unsupported values such as functions or `undefined` cannot be represented.",
  "sudheerj-q-116-why-do-you-need-json":
    "JSON became common because it is compact, readable, and easy for many languages to parse. It is especially useful at API boundaries where data must be serialized into text and reconstructed on the other side.",
  "sudheerj-q-117-what-are-pwas":
    "PWAs combine web distribution with app-like capabilities. The important pieces are usually responsive UI, HTTPS, a web app manifest, and service workers for caching, offline behavior, or background features.",
  "sudheerj-q-306-what-is-es6":
    "ES6 was a major JavaScript language update that introduced features such as `let`, `const`, classes, modules, arrow functions, promises, template literals, and destructuring. Many later JavaScript patterns assume these features exist.",
  "sudheerj-q-384-what-is-ajax":
    "AJAX describes the pattern of updating a page with data from the server without a full reload. The name mentions XML historically, but modern AJAX-style code commonly uses JSON and APIs such as `fetch`.",
  "sudheerj-q-389-how-do-you-implement-zero-timeout-in-modern-browsers":
    "The purpose is to schedule work after the current call stack without relying on an actual zero-millisecond timer. APIs such as `postMessage`, `MessageChannel`, or microtasks can be used depending on the scheduling behavior needed.",
  "sudheerj-q-392-what-are-different-event-loops":
    "Different hosts define their own event loop behavior around JavaScript execution. Browsers coordinate tasks, microtasks, rendering, and user input, while Node.js has phases for timers, I/O callbacks, polling, check callbacks, and close callbacks.",
  "sudheerj-q-399-what-is-the-difference-between-shim-and-polyfill":
    "A polyfill usually implements a missing standard API so code can use it as if the environment supported it natively. A shim is a broader compatibility layer and may include non-standard adaptation code.",
  "sudheerj-q-401-what-is-babel":
    "Babel lets developers write newer JavaScript syntax while still supporting older environments. Syntax transforms change code shape, while polyfills or runtime helpers are needed for missing built-in APIs.",
  "sudheerj-q-447-what-are-the-possible-side-effects-in-javascript":
    "A side effect is any observable change outside the function's return value. Side effects are not always bad, but isolating them makes code easier to test, reuse, and reason about.",
  "sudheerj-q-029-what-are-modules":
    "Modules make dependencies explicit through imports and exports. This helps avoid global namespace pollution and lets bundlers analyze the dependency graph for optimization.",
  "sudheerj-q-031-what-is-scope-in-javascript":
    "Scope controls where identifiers can be resolved. JavaScript uses lexical scope, meaning nested functions remember the scope where they were created, which is also the basis of closures.",
  "sudheerj-q-068-why-do-you-need-strict-mode":
    "Strict mode changes JavaScript from a more permissive mode into one that throws errors for several unsafe patterns. It helps catch accidental globals, invalid assignments, and some silent failures earlier.",
  "sudheerj-q-083-what-are-the-problems-with-global-variables":
    "Global variables create hidden coupling because any script can read or modify them. This increases the chance of name collisions, order-dependent bugs, and tests that affect each other through shared state.",
  "sudheerj-q-099-is-javascript-a-case-sensitive-language":
    "Case sensitivity means `user`, `User`, and `USER` are different identifiers. This applies to variables, function names, object properties, and language keywords, so inconsistent casing can create separate values instead of updating the intended one.",
  "sudheerj-q-146-what-are-the-benefits-of-keeping-declarations-at-the-top":
    "Putting declarations near the top makes the function's local dependencies easier to scan. It also reduces confusion around hoisting, although modern code often prefers declaring variables close to first use with `let` and `const`.",
  "sudheerj-q-147-what-are-the-benefits-of-initializing-variables":
    "Initialization makes the intended type and starting state clearer. It also avoids accidental `undefined` values flowing through the program before the variable receives a meaningful value.",
  "sudheerj-q-165-what-is-the-purpose-of-breakpoints-in-debugging":
    "Breakpoints pause execution at a specific line so you can inspect the current call stack, variables, and control flow. They are more precise than logging when you need to understand how state changes step by step.",
  "sudheerj-q-269-what-is-minification":
    "Minification is a delivery optimization, not a semantic transformation. Correct minification preserves behavior while removing unnecessary bytes, usually before compression and deployment.",
  "sudheerj-q-272-what-are-the-common-tools-used-for-minification":
    "Minifiers parse JavaScript and output a smaller equivalent program. In modern projects, minification is often handled by bundlers or build tools rather than by running a standalone minifier manually.",
  "sudheerj-q-305-list-down-some-of-the-features-of-es6":
    "ES6 features are important because they changed the default style of modern JavaScript. `let` and `const`, modules, arrow functions, promises, and destructuring are now common assumptions in frontend and Node.js code.",
  "sudheerj-q-329-can-i-avoid-using-postmessages-completely":
    "Even if application code does not call `postMessage` directly, embedded widgets, analytics, authentication flows, and third-party scripts may use it. Security review should therefore include message listeners and origin checks.",
  "sudheerj-q-402-is-node-js-completely-single-threaded":
    "Node.js runs JavaScript callbacks on a main event loop thread, but libuv and native modules can use worker threads internally for I/O or CPU-related operations. This is why Node can handle async work without making user JavaScript itself parallel by default.",
  "sudheerj-q-412-what-is-deno":
    "Deno was created to address several Node.js design pain points, such as security defaults, TypeScript support, and standard tooling. It still runs JavaScript on V8, but it exposes a different runtime API and permission model.",
  "sudheerj-q-420-what-are-the-built-in-iterables":
    "An iterable is any object that implements `Symbol.iterator`. Built-in iterables work naturally with `for...of`, spread syntax, destructuring, and APIs that consume iterator protocols.",
  "sudheerj-q-461-give-an-example-of-statements-affected-by-automatic-semicolon-insertio":
    "ASI is mostly predictable, but it becomes dangerous around line breaks after `return`, `throw`, `break`, `continue`, and before expressions that can be parsed as continuations. Knowing these cases prevents subtle runtime bugs.",
  "sudheerj-q-232-what-is-nodejs":
    "Node.js is JavaScript running outside the browser with APIs for networking, files, streams, and processes. Its non-blocking I/O model makes it a strong fit for servers that handle many concurrent connections.",
  "sudheerj-q-385-what-are-the-different-ways-to-deal-with-asynchronous-code":
    "These approaches represent different levels of abstraction over async work. Callbacks are the lowest-level pattern, promises model a future value, and `async/await` makes promise-based code read more like synchronous control flow.",
  "sudheerj-q-398-what-is-a-microtask-queue":
    "Microtasks have higher priority than normal task callbacks and run after the current call stack finishes. This is why promise callbacks often execute before `setTimeout` callbacks scheduled with zero delay.",
  "sudheerj-q-403-what-are-the-common-use-cases-of-observables":
    "Observables are useful when values arrive over time and there may be multiple emissions. This makes them a natural fit for streams such as UI events, WebSocket messages, intervals, and reactive state changes.",
  "sudheerj-q-404-what-is-rxjs":
    "RxJS provides a vocabulary for composing asynchronous streams with operators such as mapping, filtering, merging, retrying, and cancellation. It is most useful when an application has complex event or data-flow coordination.",
  "sudheerj-q-351-does-javascript-uses-mixins":
    "Mixins are a composition pattern rather than a dedicated JavaScript keyword. They can be useful for sharing behavior across unrelated objects, but overuse can make method origins and conflicts harder to trace.",
  "sudheerj-q-353-benefits":
    "The benefit of mixin-style composition is flexibility: behavior can be shared without forcing every object into the same inheritance tree. The tradeoff is that naming conflicts and implicit dependencies must be managed carefully.",
  "sudheerj-q-093-what-are-the-tools-or-techniques-used-for-debugging-javascript-code":
    "Debugging tools help inspect runtime behavior instead of guessing from source code alone. DevTools breakpoints, the `debugger` statement, and targeted logging each fit different stages of investigation.",
  "sudheerj-q-223-what-are-the-conventions-to-be-followed-for-the-usage-of-switch-case":
    "Good `switch` usage is mostly about predictability. Avoid duplicate cases, include `break` or intentional fall-through comments, and use `default` when there is a meaningful fallback path.",
  "sudheerj-q-322-what-are-the-advantages-of-module-loaders":
    "Module loaders help control how modules are resolved, transformed, and executed. They are especially useful when code needs dynamic loading, isolation, or compilation steps before running.",
  "sudheerj-q-463-what-are-the-real-world-use-cases-of-proxy":
    "A proxy can intercept operations such as property reads, writes, and function calls. This makes it powerful for reactivity, validation, logging, access control, and building abstractions around plain objects.",
};

let updated = 0;

for (const file of fs.readdirSync("data/cards").filter((name) => name.endsWith(".json") && name !== "index.json")) {
  const fullPath = path.join("data/cards", file);
  const deck = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  for (const card of deck.cards || []) {
    const explanation = explanations[card.id];
    if (!explanation) continue;
    if ((card.explanation?.en || "").trim()) continue;
    card.explanation = { ...(card.explanation || {}), en: explanation };
    updated += 1;
  }
  fs.writeFileSync(fullPath, `${JSON.stringify(deck, null, 2)}\n`);
}

console.log(JSON.stringify({ updated }, null, 2));
