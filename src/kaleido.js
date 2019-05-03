import { stream, scan } from 'flyd';
import lens from 'ramda/es/lens';
import path from 'ramda/es/path';
import assocPath from 'ramda/es/assocPath';
import set from 'ramda/es/set';
import view from 'ramda/es/view';
import over from 'ramda/es/over';
import slice from 'ramda/es/slice';
import head from 'ramda/es/head';

// Initialize global state as a stream
export const state = stream({});

// Initialize internal mountpoint store
let stateMounts = {};

/**
 * Initializes the given part of the state.
 * Returns a scope handle which can be used to
 * get the current state of the partial,
 * set a new value or execute a function on it.
 * The scope handle also includes it mounted stream instance
 * so you can subscribe to it and react to changes.
 * */
const scope = (part, initial) => {
  // The update stream of the partial.
  let update;
  // Check, if this partial is already present in the mountpoint store
  // If yes, use the found stream as update stream
  // If no, create a new one.
  if (typeof path(part, stateMounts) === 'undefined') {
    update = stream();
    stateMounts = assocPath(part, update, stateMounts);
  } else {
    update = path(part, stateMounts);
  }

  // Use a enhanced version of the assocPath function from ramda
  // for the state lens, to also notify the partial's update stream,
  // when the lens is used to update the state.
  const streamAssocPath = (v, o) => {
    update(v);
    return assocPath(part, v, o);
  };

  // Create the lens representing the desired part of the state
  const l = lens(path(part), streamAssocPath);

  // Prepare functions to be exposed for using the partial lens:
  // set, view and over
  const setState = v => state(set(l, v, state()))();
  const viewState = () => view(l, state());
  const overState = f => state(over(l, f, state()))();

  // Initialize the state partial with the given initial state
  if (typeof initial !== 'undefined') {
    setState(initial);
  }

  // Return the KaleidoScope instance
  return {
    stream: update,
    $: update,
    set: setState,
    get: viewState,
    do: overState,
  };
};

// Monoidal fold over state updates as a list to represent the state's history.
export const history = scan((hist, curr) => hist.concat([curr]), [], state);

// Get the state update before the last one and set the current state to it.
export const undo = (i = 1) => state(head(slice(-i - 1, -i, history())));


export default scope;
