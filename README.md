# redux-wings

a collection of utilities for streamlining modular Redux development.


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

## Examples

Below is an example of generating actions painlessly for
logging in and logging out

```
import { createActions } from 'redux-wings'
import api from 'my-app/api'

// creates a new set of Redux actions
// for asynchronously logging in within
// "session" slice and then a standalone 
// action type/action creator for logging out

const actions = createActions({
    'session' : [
        {
            namespace : 'login',
            requestHandler ({ username, password }) {
                return api.login({ username, password })
                    .then( result => new Promise((resolve, reject) => {
                        
                        // re-route user to landing page
                        // before resolving login success

                        appHistory.goTo('/feedback/share');
                        resolve(result);

                        // "session/LOGIN_SUCCESS" is dispatched
                        //  automatically afterwards,
                        //  but if we get a failed action,
                        // "session/LOGIN_ERROR"

                    }));
            }
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

## Important Note

This is a new library. If you have any issues, please feel free to submit as I appreciate any feedback! P.R.s and discussion for changes are also welcome.

Thanks.