# redux-wings

a collection of utilities for streamlining modular Redux development by letting you quickly make synchronous or asynchronous actions.


## Overview

1. [Installation](#installation)
2. [Utilities](#utils)
3. [Examples](#examples)
4. [Note](#important-note)


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
- `PROCESSING` 
- `SUCCESS` 
- `ERROR`

## Examples

Below is an example of generating actions painlessly for
logging in and logging out.

So lets say in our `actions.js` (part of our session ducks module at `[root]/modules/session/` folder),
we wish to generate actions that hadnle our login state as well as track how the request is going. 

We could do that via the following:


**`modules/session/sessionActions.js`**
```
import { 
    createActions 
} from 'redux-wings'
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

const { actions, asyncReducer } = createActions({
    sliceNamespace : 'session',
    actions : [
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
                                         // to attach AsyncStates to `loginState` in
                                         // reducer for return object
        }, 
        'logout' // creates action dispatcher + "session/LOGOUT" type
    ]
});

// we now have access to all of the following! 

const  {
    loginRequest,
    logout, 
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT,
    asyncReducer 
} = actions; 

// async reducer will now also be available 
// to easily plug in our loginState variable
// functionality!
```

Continuing the above example, when combining our reducers using `combineReducers`, we can simply `compose` our reducers to easily augment functionality.

!Important Note: to properly process your existing state, the asyncReducer must be specified first
(`compose` actually processes reducer arguments from right-to-left)

**`reducers.js`**
```
import { 
    combineReducers, compose 
} from 'redux'
import session from './modules/session'
import users from './modules/users'
import misc from './modules/misc'

// compose our session reducer to contain "loginState"
// as defined in sessionActions.js

const sessionReducer = compose(session.actions.asyncReducer, session.reducer);

export default combineReducers({
    session  : sessionReducer,
    users    : users.reducer,
    feedback : feedback.reducer
});
```


## Note

This is a new library. If you have any issues, please feel free to submit as I appreciate any feedback! P.R.s and discussion for changes are also welcome.

Also it is well understood that the example could be way better 😅 (and there should be very explicit API here as well soon)

Thanks.