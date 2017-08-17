# Kaleido

[![Join the chat at https://gitter.im/kaleidostate/kaleido](https://badges.gitter.im/kaleidostate/kaleido.svg)](https://gitter.im/kaleidostate/kaleido?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Kaleido is a small and easy to use library to manage state in web applications. It was designed specifically with component based view frameworks like [Mithril](https://mithril.js.org/) or [React](https://facebook.github.io/react/) in mind, but it can be used independently. 
It makes use of techniques from functional programming and reactive programming, specifically relying on streams as data structures and lenses as a way to access these data structures' contents.

Currently, the stream implementation is provided by the great library [flyd](https://github.com/paldepind/flyd) and Kaleido depends on [Ramda](ramdajs.com/) as a functional programming utility belt, also providing the lens implementation. However, there are plans to abstract away at least the stream implementation and provide adapters for other popular libraries like _RxJS_ , _Most_ or _Kefir_

## Architecture

In modern web development, the trend is going towards modularizing all the things. You have component based view frameworks, modular CSS architectures, even atomic design principles. But somehow, most state management tools come with a quite monolithic approach. State manipulating logic is often concentrated in one place.
While it is advisable to represent your app's state in one central data structure for comprehensibility and maintainability reasons, the approach of having all state manipulation logic in one place is flawed, because it does not scale well.

Consider adding a new functionality to your app, coming with its own piece of state to be stored, logic to manipulate this state, an own kind of view representation and its own styling.  Wouldn't it be great to only have to add code to a separate, additional and confined module, instead of having the view and styling in one file, and the logic in the other?  Essentially, this is what they call the "Open/Closed principle". You want your application be open for extension, but closed for modification.  And this is where Kaleido can come in handy.

Let's have a look at how the data flows in an app using Kaleido:

![Kaleido Architecture](https://raw.githubusercontent.com/PygmalionPolymorph/kaleido/master/doc/arch.png)

This diagram might seem a bit daunting at first, but trust me, it's easy to understand:
The state of your app lives in one space, called _state_. The state is a stream and in it flow many instances of one big object. You guessed it: The state object.  A state might look somewhat similar to this:
```js
{
  scopeA: {
    foo: [],
    bar: '',
  },
  scopeB: {
    baz: 42,
  },
  scopeC: ['this', 'that'],
}
```
Do you see how it is logically separated by so called scopes? A scope is a part of your state. It corresponds to a semantical separation inside your app, there could be for example a _todos_ scope in a Todo application, or a _cart_ scope in some eCommerce context. 
However, it is important to note that scopes do not (have to) map to view components one-to-one. Your view is accessing the state via scopes, but it could access multiple scopes simultaneously. One scope can also be accessed by multiple view components.

_But how does the view access such a scope?_ 
Great question, Jimmy. And the answer comes from the functional programming world: Lenses. (If you're not yet familiar with what lenses are, they are a functional way to access a subpart of a data structure. [Learn more](https://www.schoolofhaskell.com/school/to-infinity-and-beyond/pick-of-the-week/a-little-lens-starter-tutorial))
Upon registering a scope, a lens focusing the desired part of the state is created and can then be used to retrieve the data, set new values, and also manipulate it by passing in a function.

Every time you use those lenses to update a scope, a new state object is passed down the stream and every listeners on the state stream get updated. This is the point where the view framework should get rerendered. (Provided you have made it listen to the state stream. See the [Views](#views) section for more details.)
Additionally, every scope includes an update stream containing all updates only happening on that particular scope. You can use this to build your views reactively by `map`ping over it.
## How to
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

### Accessing the scope
After you have created your scope, inside your view components you can access the current state via
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
You see, Kaleido scopes work just like lenses on the state. And indeed Kaleido uses Ramda's lenses under the hood. But wait, there's more!

### Update streams

The handle returned by  `scope`  also includes an update stream you can subscribe to. Everytime the state is updated, the new state inside the scope will be passed down the stream.
```js
todos.$.map(renderTodoItem);
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
These scopes are then handled independently.
However, you can import the whole state as a stream from Kaleido. You can then use the `state` stream to inspect the whole app's state or subscribe to changes on all scopes.
```js
import { state } from 'kaleido';

// Debug all state updates
state.map(console.log);
```

## Views
### Mithril JS
In mithril, the view is rerendered after an event handler has been called and after a m.request Promise chain. So if your view only updates the state through those, you should be good to go without any further wiring. However, if you update the state from anywhere else, you should either call m.redraw() manually when you have updated the state, or you can redraw the view automatically on every state update with `state.map(m.redraw)`. I haven't tested the latter performancewise though, so you might have to be careful with that.
### React
In React, components get rerendered when their internal state changes. I am currently working on a solution for binding Kaleidoscopes to React component's state so they get rerendered reliably.

## Future plans
* Make Kaleido State locally instanceable
* React bindings
* Evaluate use for other frameworks like Vue, Angular, etc.
* Prevent scope collisions
* Time travel
* Abstract flyd dependency to be exchangeable with other stream libraries

## Postamble
If you have any feedback, spot a mistake or bug or just want to discuss
anything about Kaleido, feel free to contact me in the Kaleido
[gitter](http://gitter.im/kaleidostate/kaleido)!
