# Redux, React-Redux, and Redux Toolkit

## Table of Contents
1. [Redux](#redux)
2. [React-Redux](#react-redux)
3. [Redux Toolkit](#redux-toolkit)
4. [Best Practices](#best-practices)

---

## Redux

### What is Redux?

Redux is a **standalone** JavaScript library for managing and centralizing application state. It can be used with any JavaScript framework or even vanilla JavaScript - you don't need React to use Redux.

**Key Concept:** Redux provides a predictable state container that helps manage application state in a centralized store.

### Core Principles

1. **Single Source of Truth:** The entire application state is stored in a single object tree within a store
2. **State is Read-Only:** The only way to change state is by dispatching actions
3. **Changes are Made with Pure Functions:** Reducers are pure functions that take the previous state and an action, and return the next state

### Basic Redux Concepts

**Store:** Holds the entire state of your application  
**Actions:** Plain JavaScript objects that describe what happened  
**Reducers:** Pure functions that specify how the state changes in response to actions  
**Dispatch:** Method to send actions to the store

### Example: Single Reducer and Action

```javascript
// 1. Define Action Types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// 2. Create Action Creators
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// 3. Define Initial State
const initialState = {
  count: 0
};

// 4. Create Reducer
const counterReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};

// 5. Create Store
import { createStore } from 'redux';
const store = createStore(counterReducer);

// 6. Usage
console.log(store.getState()); // { count: 0 }

store.dispatch(increment());
console.log(store.getState()); // { count: 1 }

store.dispatch(decrement());
console.log(store.getState()); // { count: 0 }

// 7. Subscribe to changes
store.subscribe(() => {
  console.log('State changed:', store.getState());
});
```

### Example: Multiple Reducers and Actions

```javascript
// User Actions
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

const login = (user) => ({ type: LOGIN, payload: user });
const logout = () => ({ type: LOGOUT });

// User Reducer
const userInitialState = {
  isAuthenticated: false,
  user: null
};

const userReducer = (state = userInitialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null
      };
    default:
      return state;
  }
};

// Cart Actions
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';

const addItem = (item) => ({ type: ADD_ITEM, payload: item });
const removeItem = (itemId) => ({ type: REMOVE_ITEM, payload: itemId });

// Cart Reducer
const cartInitialState = {
  items: []
};

const cartReducer = (state = cartInitialState, action) => {
  switch (action.type) {
    case ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
};

// Combine Reducers
import { createStore, combineReducers } from 'redux';

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer
});

const store = createStore(rootReducer);

// Usage
store.dispatch(login({ id: 1, name: 'John' }));
store.dispatch(addItem({ id: 101, name: 'Product A' }));

console.log(store.getState());
// {
//   user: { isAuthenticated: true, user: { id: 1, name: 'John' } },
//   cart: { items: [{ id: 101, name: 'Product A' }] }
// }
```

### Problem with Plain Redux

Writing plain Redux requires a lot of boilerplate code:
- Manually defining action types
- Creating action creators
- Writing switch statements in reducers
- Lots of repetitive code

This is where **Redux Toolkit** comes in to simplify the process.

---

## React-Redux

### What is React-Redux?

React-Redux is the official React binding for Redux. It connects Redux state management with React components.

**Key Understanding:** Redux state is NOT React state. It's a separate state management system. React-Redux bridges the gap by making Redux state work seamlessly with React's component re-rendering.

### Why React-Redux?

Without React-Redux:
1. Redux state changes don't automatically trigger React component re-renders
2. You need to manually pass the store as props through multiple component levels (prop drilling)
3. You have to manually subscribe to store changes and update components

With React-Redux:
1. Components automatically re-render when Redux state changes
2. Easy access to Redux state and dispatch via hooks (useSelector, useDispatch)
3. No prop drilling needed

### Core Concepts

**Provider:** Wraps your app and makes the Redux store available to all components  
**useSelector:** Hook to extract data from Redux store  
**useDispatch:** Hook to dispatch actions to Redux store

### Setup React-Redux

```javascript
// store.js
import { createStore } from 'redux';

const initialState = {
  count: 0,
  user: null
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const store = createStore(rootReducer);
export default store;
```

```javascript
// index.js or App.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

```javascript
// Counter.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

const Counter = () => {
  // Access Redux state
  const count = useSelector((state) => state.count);
  const user = useSelector((state) => state.user);
  
  // Get dispatch function
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch({ type: 'INCREMENT' });
  };

  const handleDecrement = () => {
    dispatch({ type: 'DECREMENT' });
  };

  const handleLogin = () => {
    dispatch({ 
      type: 'SET_USER', 
      payload: { id: 1, name: 'John Doe' } 
    });
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleDecrement}>Decrement</button>
      
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};

export default Counter;
```


## Redux Toolkit

### What is Redux Toolkit?

Redux Toolkit (RTK) is the official, opinionated, batteries-included toolset for efficient Redux development. It simplifies Redux code by providing utility functions that reduce boilerplate.

**Key Benefits:**
- Automatic action creators
- Simpler reducer logic with Immer (allows "mutating" syntax)
- Built-in thunk support for async operations
- Better TypeScript support
- Less boilerplate code

### Installation

```bash
npm install @reduxjs/toolkit react-redux
```

### Core APIs

1. **configureStore:** Creates the Redux store with good defaults
2. **createSlice:** Automatically generates action creators and reducers
3. **createAsyncThunk:** For async operations
4. **createAction:** Manually create actions (less common with slices)
5. **createReducer:** Manually create reducers (less common with slices)

---

## createSlice

The most common and recommended way to write Redux logic. It automatically creates actions and reducers.

### Basic Example

```javascript
// features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  status: 'idle'
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer allows direct mutation
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    }
  }
});

// Action creators are automatically generated
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Reducer is exported as default
export default counterSlice.reducer;
```

**Important Notes:**
- **name:** Used as prefix for action types (e.g., "counter/increment")
- **reducers:** Each key becomes an action creator with the same name
- Action type is automatically: `${name}/${reducerKey}` (e.g., "counter/increment")
- You can get the action type using: `increment.type` returns "counter/increment"

### Configure Store

```javascript
// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,  // state.counter will access this reducer
    user: userReducer         // state.user will access this reducer
  }
});
```

**Important:** The key in the reducer object becomes the state property name:
- `counter: counterReducer` means you access state as `state.counter`
- The slice name and reducer key don't have to match

### Using in Components

```javascript
// Counter.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount, reset } from './counterSlice';

const Counter = () => {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
    </div>
  );
};

export default Counter;
```

---

## createAction and createReducer

When you need more control or want to manually create actions and reducers (less common with Redux Toolkit).

### Example

```javascript
import { createAction, createReducer } from '@reduxjs/toolkit';

// Create Actions
const increment = createAction('reward/increment');
const decrement = createAction('reward/decrement');
const incrementByAmount = createAction('reward/incrementByAmount');

// You can call: increment() to get { type: 'reward/increment' }
// With payload: incrementByAmount(5) to get { type: 'reward/incrementByAmount', payload: 5 }

// Initial State
const initialState = {
  points: 15
};

// Create Reducer using builder callback
const rewardReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(increment, (state, action) => {
      state.points += 1;
    })
    .addCase(decrement, (state, action) => {
      state.points -= 1;
    })
    .addCase(incrementByAmount, (state, action) => {
      state.points += action.payload;
    });
});

export default rewardReducer;
```

### Alternative: Map Object Notation

```javascript
const rewardReducer = createReducer(initialState, {
  [increment]: (state, action) => {
    state.points += 1;
  },
  [decrement]: (state, action) => {
    state.points -= 1;
  },
  [incrementByAmount]: (state, action) => {
    state.points += action.payload;
  }
});
```

---

## extraReducers

IMPORTANT: Used when a slice needs to respond to actions from OTHER slices or async thunks.

### Use Cases

1. Responding to actions defined in another slice
2. Handling async operations with createAsyncThunk
3. Listening to actions from multiple sources

### Example: Responding to Another Slice

```javascript
// features/account/accountSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const accountSlice = createSlice({
  name: 'account',
  initialState: { balance: 100 },
  reducers: {
    deposit: (state, action) => {
      state.balance += action.payload;
    },
    withdraw: (state, action) => {
      state.balance -= action.payload;
    }
  }
});

export const { deposit, withdraw } = accountSlice.actions;
export default accountSlice.reducer;
```

```javascript
// features/bonus/bonusSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { deposit } from '../account/accountSlice';

export const bonusSlice = createSlice({
  name: 'bonus',
  initialState: { points: 0 },
  reducers: {
    addBonus: (state, action) => {
      state.points += action.payload;
    }
  },
  extraReducers: (builder) => {
    // Respond to the deposit action from accountSlice
    builder.addCase(deposit, (state, action) => {
      if (action.payload >= 100) {
        state.points += 10; // Award bonus for deposits >= 100
      }
    });
  }
});

export const { addBonus } = bonusSlice.actions;
export default bonusSlice.reducer;
```

---

## createAsyncThunk

For handling asynchronous operations like API calls.

### Basic Structure

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create Async Thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',  // action type prefix
  async (arg, thunkAPI) => {
    const response = await axios.get('https://api.example.com/users');
    return response.data; // This becomes the fulfilled action payload
  }
);

// Thunk automatically generates three action types:
// - users/fetchUsers/pending
// - users/fetchUsers/fulfilled
// - users/fetchUsers/rejected

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default usersSlice.reducer;
```

### Advanced Async Thunk Example

```javascript
// features/posts/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://api.example.com/posts?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { getState, dispatch }) => {
    const { auth } = getState(); // Access current state
    const response = await fetch('https://api.example.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(postData)
    });
    return await response.json();
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId) => {
    await fetch(`https://api.example.com/posts/${postId}`, {
      method: 'DELETE'
    });
    return postId; // Return id for removal from state
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentPage: 1
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(post => post.id !== action.payload);
      });
  }
});

export const { setPage } = postsSlice.actions;
export default postsSlice.reducer;
```

### Using Async Thunks in Components

```javascript
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, createPost, deletePost } from './postsSlice';

const PostsList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts(1)); // Fetch posts for user 1
  }, [dispatch]);

  const handleCreatePost = () => {
    dispatch(createPost({
      title: 'New Post',
      body: 'Post content'
    }));
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePost(postId));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreatePost}>Create Post</button>
      {items.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button onClick={() => handleDeletePost(post.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
```

---


## Best Practices

### 1. File Structure

```
src/
  app/
    store.js
  features/
    cart/
      cartSlice.js
      Cart.jsx
    products/
      productsSlice.js
      ProductsList.jsx
    auth/
      authSlice.js
      Login.jsx
```

### 2. Naming Conventions

- Slice files: `featureSlice.js` (e.g., `cartSlice.js`)
- Action names: Use descriptive verbs (e.g., `addToCart`, `removeFromCart`)
- Slice name: Use singular form (e.g., `cart`, not `carts`)

### 3. State Organization

- Keep state normalized (avoid deeply nested objects)
- Store only serializable data in Redux
- Don't store UI state that doesn't need to be global

### 4. Selectors

Create reusable selectors for computed state:

```javascript
// In slice file
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

// In component
const total = useSelector(selectCartTotal);
const itemCount = useSelector(selectCartItemCount);
```

### 5. Async Operations

- Always handle pending, fulfilled, and rejected states
- Use try-catch in async thunks
- Show loading states to users
- Display error messages

### 6. Performance

- Use memoized selectors with `createSelector` from `reselect`
- Split large slices into smaller ones
- Use `useSelector` wisely to avoid unnecessary re-renders

```javascript
// Bad: Re-renders on any state change
const state = useSelector(state => state);

// Good: Re-renders only when cart.items changes
const cartItems = useSelector(state => state.cart.items);
```

### 7. TypeScript Support

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    }
  }
});
```

---

## Quick Reference

### Redux Toolkit vs Plain Redux

| Feature | Plain Redux | Redux Toolkit |
|---------|-------------|---------------|
| Action Creators | Manual | Auto-generated |
| Reducers | Switch statements | Object methods |
| Immutability | Manual spread operators | Immer (built-in) |
| Store Setup | Verbose | configureStore |
| Async Logic | Custom middleware | createAsyncThunk |
| Boilerplate | High | Low |

### Common Hooks

```javascript
import { useSelector, useDispatch } from 'react-redux';

// Get state
const data = useSelector((state) => state.feature.data);

// Get dispatch function
const dispatch = useDispatch();

// Dispatch actions
dispatch(actionCreator());
dispatch(actionCreator(payload));
```

### extraReducers vs reducers

- **reducers:** For actions defined in the same slice
- **extraReducers:** For actions from other slices or async thunks

---

## Summary

1. **Redux:** State management library for JavaScript applications
2. **React-Redux:** Connects Redux with React components
3. **Redux Toolkit:** Modern, simplified way to write Redux logic

**Migration Path:**
1. Start with Redux basics to understand concepts
2. Learn React-Redux for React integration
3. Use Redux Toolkit for production applications (recommended)

**When to Use Redux:**
- Large applications with complex state
- State shared across many components
- Frequent state updates
- Need for time-travel debugging
- Team collaboration on state management