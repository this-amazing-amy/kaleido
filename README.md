# Kaleido
Kaleido is a small and easy to use library to manage state in web applications. It was designed specifically with component based view frameworks like [Mithril](https://mithril.js.org/) or [React](https://facebook.github.io/react/) in mind, but it can be used independently. 
It makes use of techniques from functional programming and reactive programming, specifically relying on streams as data structures and lenses as a way to access these data structures' contents.

Currently, the stream implementation is provided by the great library [flyd](https://github.com/paldepind/flyd) and Kaleido depends on [Ramda](ramdajs.com/) as a functional programming utility belt, also providing the lens implementation. However, there are plans to abstract away at least the stream implementation and provide adapters for other popular libraries like _RxJS_ , _Most_ or _Kefir_

## Architecture

![Kaleido Architecture](https://raw.githubusercontent.com/PygmalionPolymorph/kaleido/master/arch.png)

## How to use
### Installation
You can install Kaleido from npm: `npm install kaleido`.
### Instanciating a kaleidoscope

Kaleido exports its main function `scope` as the default export, you can import it like so:
```js
import scope from 'kaleido';
```

You invoke the `scope` function passing in a path to the part of the state you want the scope to live in,  and an optional initial value to set the state to.
```js
const todos = scope(['todos', 'list'], []);
```
This would result in a state of the following shape:
```js
{
  todos: {
    list: []
  }
}
```
After that, inside your view components you can access the current state via
```js
todos.get();
```
And set the state to a new value with
```js
todos.set(['Install Kaleido', 'Be awesome']);
```
Also, you can execute a function taking the current state as an input and setting the state to its result:
```js
todos.do( state => state.concat(['Watch cute kitten videos']) );
// Alternatively, you can use todos.over(...) 
```
This is especially convenient when using curried functions, as offered by [Ramda](ramdajs.com/):
```js
todos.do(append('Ride a unicorn'));
```
You see, Kaleido scopes work just like lenses on the state. And indeed Kaleido uses Ramda lenses under the hood.

But wait, there's more!

The handle returned by  `scope`  also includes an update stream you can subscribe to. Everytime the state is updated, the new state will be passed down the stream.
```js
todos.$.map(console.log);
// Alternatively: todos.stream
```
The update stream is a [*flyd*](https://github.com/paldepind/flyd) stream, so you have access to its API to use and transform the stream however you like.

### Composing state
Composing the state is as easy as instantiating multiple scopes:
It doesn't matter whether you do this in the same component or in different ones:
```js
// todoList.js
const todoItems = scope(['todos', 'list'], []);
const todoInput = scope(['todos', 'input'], '');

// notifications.js
const notifications = scope(['notifications'], []); 
```
This will build a state of the following shape:
```js
{
  todos: {
    list: [],
    input: ''
  },
  notifications: []
}
```
These states are then handled independently.
However, you can import the whole state as a stream from Kaleido. You can then use the `state` stream to inspect the whole app's state or subscribe to changes on all scopes.
```js
import { state } from 'kaleido';

// Debug all state updates
state.map(console.log);
```
## Future plans
* Prevent scope collisions
* Make Kaleido State locally instanceable
* Abstract flyd dependency to be exchangeable with other stream libraries
* Expand readme with architecture
* React bindings
