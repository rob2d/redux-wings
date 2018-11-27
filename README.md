# redux-wings

a collection of utilities for streamlining modular Redux development by letting you quickly make synchronous or asynchronous actions.


## Overview

1. [Installation](#installation)
2. [Utilities](#utils)
3. [Examples](#examples)
4. [Important Note](#important-note)


## Installation

```
npm i --save-dev redux-wings
```

## Utilities

**`createActions`** 

Generates actions corresponding to `XXX_SUCCESS`, `XXX_REQUEST`, `XXX_ERROR`, where `XXX` corresponds to your namespace to upper snake case. 

It will also generate an action dispatcher to use in your component via Redux dispatch props under the namespace of `xxxRequest`. 

Check out an example in the next section.


**`AsyncStates`**

An enum for four different possible asynchronous states, those being:
- `IDLE`
- `LOADING` 
- `LOADED` 
- `ERROR`

## Examples

Below is an example of generating actions painlessly for
logging in and logging out

```
import { createActions } from 'redux-wings'
import api from 'my-app/api'
import appHistory from 'utils/appHistory'

// creates a new set of Redux actions
// for asynchronously logging in within
// "session" slice and then a standalone 
// action type/action creator for logging out

// also, by providing "reducerVariable" to
// any async actions, we can get a handy
// reducer function that transforms our
// reducer state to contain the new variable
// at given state variable if necessary

const { actions, reducers } = createActions({
    'session' : [
        {
            namespace : 'login',
            requestHandler ({ username, password }) {
                return api.login({ username, password })
                    .then( result => new Promise((resolve, reject) => {
                        
                        // re-route user to landing page
                        // before resolving login success

                        appHistory.goTo('/welcome');
                        resolve(result);

                        // "session/LOGIN_SUCCESS" is dispatched
                        //  automatically afterwards,
                        //  but if we get a failed action,
                        // "session/LOGIN_ERROR"

                    }));
            },
            stateVariable : 'loginState' // will cause reducers variable being output
                                         // to attach AsyncStates to loginState in
                                         // simple pure function (e.g. sub reducer)
        }, 
        'logout' // creates action dispatcher + "session/LOGOUT" type
    ]
});

// we now have access to all of the following! 😃

const  { 
    loginRequest,
    logout, 
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT
} = actions;
```

Continuing the above example, when creating our store we can `compose` our
new reducer functions to easily augment functionality.

[example needed]

## Important Note

This is a new library. If you have any issues, please feel free to submit as I appreciate any feedback! P.R.s and discussion for changes are also welcome.

Also it is well understood that the example could be way better 😅 (and there should be very explicit API documentation added)

Thanks.