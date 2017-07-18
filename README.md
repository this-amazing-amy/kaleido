# Kaleidos
Kaleidos is a small and easy to use library to manage state in web applications. It was designed specifically with component based view frameworks like [Mithril](https://mithril.js.org/) or [React](https://facebook.github.io/react/) in mind, but it can be used independently. 
It makes use of techniques from functional programming and reactive programming, specifically relying on streams as data structures and lenses as a way to access these data structures' contents.

Currently, the stream implementation is provided by the great library [flyd](https://github.com/paldepind/flyd) and Kaleidos also depends on [Ramda](ramdajs.com/) as a functional programming utility belt, also providing the lens implementation. However, there are plans to abstract away at least the stream implementation and provide adapters for other popular libraries like _RxJS_ , _Most_ or _Kefir_

## How to use
### Instanciating a KaleidosScope

Kaleidos exports its main function `scope` as the default export, you can import it like so:
```
import scope from 'kaleidos';
```

You invoke the `scope` function passing in a path to the part of the state you want the scope to live in,  and an optional initial value to set the state to.
```
const todos = scope(['todos', 'list'], []);
```
This would result in a state of the following shape:
```
{
  todos: {
    list: []
  }
}
```
After that, inside your view components you can access the current state via
```
todos.get();
```
And set the state to a new value with
```
todos.set(['Install Kaleidos', 'Be awesome']);
```
Also, you can execute a function taking the current state as an input and setting the state to its result:
```
todos.do( state => state.concat(['Watch cute kitten videos']) );
// Alternatively, you can use todos.over(...) 
```
This is especially convenient when using curried functions, as offered by [Ramda](ramdajs.com/):
```
todos.do(append('Ride a unicorn'));
```
You see, Kaleidos scopes work just like lenses on the state. And indeed Kaleidos uses Ramda lenses under the hood.

But wait, there's more!

The handle returned by  `scope`  also includes an update stream you can subscribe to. Everytime the state is updated, the new state will be passed down the stream.
```
todos.$.map(console.log);
// Alternatively: todos.stream
```
The update stream is a [*flyd*](https://github.com/paldepind/flyd) stream, so you have access to its API to use and transform the stream however you like.

### Composing state
Composing the state is as easy as instantiating multiple scopes:
It doesn't matter whether you do this in the same component or in different ones:
```
// todoList.js
const todoItems = scope(['todos', 'list'], []);
const todoInput = scope(['todos', 'input'], '');

// notifications.js
const notifications = scope(['notifications'], []); 
```
This will build a state of the following shape:
```
{
	todos: {
		list: [],
		input: ''
	},
	notifications: []
}
```
These states are then handled independently.
However, you can import the whole state as a stream from Kaleidos. You can then use the `state` stream to inspect the whole app's state or subscribe to changes on all scopes.
```
import { state } from 'kaleidos';

// Debug all state updates
state.map(console.log);
```
## Future plans
* Prevent scope collisions
* Make Kaleidos State locally instanceable
* Abstract flyd dependency to be exchangeable with other stream libraries
* Expand readme with architecture
* React bindings
