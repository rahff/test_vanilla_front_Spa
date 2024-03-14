// node_modules/redux/dist/redux.mjs
var isPlainObject = function(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
};
var miniKindOf = function(val) {
  if (val === undefined)
    return "undefined";
  if (val === null)
    return "null";
  const type = typeof val;
  switch (type) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "function": {
      return type;
    }
  }
  if (Array.isArray(val))
    return "array";
  if (isDate(val))
    return "date";
  if (isError(val))
    return "error";
  const constructorName = ctorName(val);
  switch (constructorName) {
    case "Symbol":
    case "Promise":
    case "WeakMap":
    case "WeakSet":
    case "Map":
    case "Set":
      return constructorName;
  }
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
};
var ctorName = function(val) {
  return typeof val.constructor === "function" ? val.constructor.name : null;
};
var isError = function(val) {
  return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
};
var isDate = function(val) {
  if (val instanceof Date)
    return true;
  return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
};
var kindOf = function(val) {
  let typeOfVal = typeof val;
  if (true) {
    typeOfVal = miniKindOf(val);
  }
  return typeOfVal;
};
var createStore = function(reducer, preloadedState, enhancer) {
  if (typeof reducer !== "function") {
    throw new Error(`Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
  }
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error("It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = undefined;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(`Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = new Map;
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = new Map;
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error("You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(`Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
    }
    if (isDispatching) {
      throw new Error("You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
    }
    let isSubscribed = true;
    ensureCanMutateNextListeners();
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error("You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(`Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
    }
    if (typeof action.type === "undefined") {
      throw new Error('Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
    }
    if (typeof action.type !== "string") {
      throw new Error(`Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
    }
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    const listeners = currentListeners = nextListeners;
    listeners.forEach((listener) => {
      listener();
    });
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(`Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
    }
    currentReducer = nextReducer;
    dispatch({
      type: actionTypes_default.REPLACE
    });
  }
  function observable() {
    const outerSubscribe = subscribe;
    return {
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(`Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
        }
        function observeState() {
          const observerAsObserver = observer;
          if (observerAsObserver.next) {
            observerAsObserver.next(getState());
          }
        }
        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      },
      [symbol_observable_default]() {
        return this;
      }
    };
  }
  dispatch({
    type: actionTypes_default.INIT
  });
  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [symbol_observable_default]: observable
  };
  return store;
};
var warning = function(message) {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(message);
  }
  try {
    throw new Error(message);
  } catch (e) {
  }
};
var getUnexpectedStateShapeWarningMessage = function(inputState, reducers, action, unexpectedKeyCache) {
  const reducerKeys = Object.keys(reducers);
  const argumentName = action && action.type === actionTypes_default.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
  if (reducerKeys.length === 0) {
    return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
  }
  if (!isPlainObject(inputState)) {
    return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
  }
  const unexpectedKeys = Object.keys(inputState).filter((key) => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
  unexpectedKeys.forEach((key) => {
    unexpectedKeyCache[key] = true;
  });
  if (action && action.type === actionTypes_default.REPLACE)
    return;
  if (unexpectedKeys.length > 0) {
    return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
  }
};
var assertReducerShape = function(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, {
      type: actionTypes_default.INIT
    });
    if (typeof initialState === "undefined") {
      throw new Error(`The slice reducer for key "${key}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
    }
    if (typeof reducer(undefined, {
      type: actionTypes_default.PROBE_UNKNOWN_ACTION()
    }) === "undefined") {
      throw new Error(`The slice reducer for key "${key}" returned undefined when probed with a random type. Don't try to handle '${actionTypes_default.INIT}' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
    }
  });
};
var combineReducers = function(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  for (let i = 0;i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (true) {
      if (typeof reducers[key] === "undefined") {
        warning(`No reducer provided for key "${key}"`);
      }
    }
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);
  let unexpectedKeyCache;
  if (true) {
    unexpectedKeyCache = {};
  }
  let shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }
    if (true) {
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        warning(warningMessage);
      }
    }
    let hasChanged = false;
    const nextState = {};
    for (let i = 0;i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        const actionType = action && action.type;
        throw new Error(`When called with an action of type ${actionType ? `"${String(actionType)}"` : "(unknown type)"}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
};
var compose = function(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
};
var applyMiddleware = function(...middlewares) {
  return (createStore2) => (reducer, preloadedState) => {
    const store = createStore2(reducer, preloadedState);
    let dispatch = () => {
      throw new Error("Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    };
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return {
      ...store,
      dispatch
    };
  };
};
var isAction = function(action) {
  return isPlainObject(action) && ("type" in action) && typeof action.type === "string";
};
var $$observable = (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
var symbol_observable_default = $$observable;
var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};
var actionTypes_default = ActionTypes;
// node_modules/immer/dist/immer.mjs
var die = function(error, ...args) {
  if (true) {
    const e = errors[error];
    const msg = typeof e === "function" ? e.apply(null, args) : e;
    throw new Error(`[Immer] ${msg}`);
  }
  throw new Error(`[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`);
};
var isDraft = function(value) {
  return !!value && !!value[DRAFT_STATE];
};
var isDraftable = function(value) {
  if (!value)
    return false;
  return isPlainObject2(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
};
var isPlainObject2 = function(value) {
  if (!value || typeof value !== "object")
    return false;
  const proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  if (Ctor === Object)
    return true;
  return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
};
var each = function(obj, iter) {
  if (getArchtype(obj) === 0) {
    Reflect.ownKeys(obj).forEach((key) => {
      iter(key, obj[key], obj);
    });
  } else {
    obj.forEach((entry, index) => iter(index, entry, obj));
  }
};
var getArchtype = function(thing) {
  const state = thing[DRAFT_STATE];
  return state ? state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
};
var has = function(thing, prop) {
  return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
};
var set = function(thing, propOrOldValue, value) {
  const t = getArchtype(thing);
  if (t === 2)
    thing.set(propOrOldValue, value);
  else if (t === 3) {
    thing.add(value);
  } else
    thing[propOrOldValue] = value;
};
var is = function(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
};
var isMap = function(target) {
  return target instanceof Map;
};
var isSet = function(target) {
  return target instanceof Set;
};
var latest = function(state) {
  return state.copy_ || state.base_;
};
var shallowCopy = function(base, strict) {
  if (isMap(base)) {
    return new Map(base);
  }
  if (isSet(base)) {
    return new Set(base);
  }
  if (Array.isArray(base))
    return Array.prototype.slice.call(base);
  if (!strict && isPlainObject2(base)) {
    if (!getPrototypeOf(base)) {
      const obj = Object.create(null);
      return Object.assign(obj, base);
    }
    return { ...base };
  }
  const descriptors = Object.getOwnPropertyDescriptors(base);
  delete descriptors[DRAFT_STATE];
  let keys = Reflect.ownKeys(descriptors);
  for (let i = 0;i < keys.length; i++) {
    const key = keys[i];
    const desc = descriptors[key];
    if (desc.writable === false) {
      desc.writable = true;
      desc.configurable = true;
    }
    if (desc.get || desc.set)
      descriptors[key] = {
        configurable: true,
        writable: true,
        enumerable: desc.enumerable,
        value: base[key]
      };
  }
  return Object.create(getPrototypeOf(base), descriptors);
};
var freeze = function(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
  }
  Object.freeze(obj);
  if (deep)
    Object.entries(obj).forEach(([key, value]) => freeze(value, true));
  return obj;
};
var dontMutateFrozenCollections = function() {
  die(2);
};
var isFrozen = function(obj) {
  return Object.isFrozen(obj);
};
var getPlugin = function(pluginKey) {
  const plugin = plugins[pluginKey];
  if (!plugin) {
    die(0, pluginKey);
  }
  return plugin;
};
var getCurrentScope = function() {
  return currentScope;
};
var createScope = function(parent_, immer_) {
  return {
    drafts_: [],
    parent_,
    immer_,
    canAutoFreeze_: true,
    unfinalizedDrafts_: 0
  };
};
var usePatchesInScope = function(scope, patchListener) {
  if (patchListener) {
    getPlugin("Patches");
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
};
var revokeScope = function(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
};
var leaveScope = function(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
};
var enterScope = function(immer2) {
  return currentScope = createScope(currentScope, immer2);
};
var revokeDraft = function(draft) {
  const state = draft[DRAFT_STATE];
  if (state.type_ === 0 || state.type_ === 1)
    state.revoke_();
  else
    state.revoked_ = true;
};
var processResult = function(result, scope) {
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== undefined && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
      if (!scope.parent_)
        maybeFreeze(scope, result);
    }
    if (scope.patches_) {
      getPlugin("Patches").generateReplacementPatches_(baseDraft[DRAFT_STATE].base_, result, scope.patches_, scope.inversePatches_);
    }
  } else {
    result = finalize(scope, baseDraft, []);
  }
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : undefined;
};
var finalize = function(rootScope, value, path) {
  if (isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  if (!state) {
    each(value, (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path));
    return value;
  }
  if (state.scope_ !== rootScope)
    return value;
  if (!state.modified_) {
    maybeFreeze(rootScope, state.base_, true);
    return state.base_;
  }
  if (!state.finalized_) {
    state.finalized_ = true;
    state.scope_.unfinalizedDrafts_--;
    const result = state.copy_;
    let resultEach = result;
    let isSet2 = false;
    if (state.type_ === 3) {
      resultEach = new Set(result);
      result.clear();
      isSet2 = true;
    }
    each(resultEach, (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path, isSet2));
    maybeFreeze(rootScope, result, false);
    if (path && rootScope.patches_) {
      getPlugin("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
    }
  }
  return state.copy_;
};
var finalizeProperty = function(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
  if (childValue === targetObject)
    die(5);
  if (isDraft(childValue)) {
    const path = rootPath && parentState && parentState.type_ !== 3 && !has(parentState.assigned_, prop) ? rootPath.concat(prop) : undefined;
    const res = finalize(rootScope, childValue, path);
    set(targetObject, prop, res);
    if (isDraft(res)) {
      rootScope.canAutoFreeze_ = false;
    } else
      return;
  } else if (targetIsSet) {
    targetObject.add(childValue);
  }
  if (isDraftable(childValue) && !isFrozen(childValue)) {
    if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
      return;
    }
    finalize(rootScope, childValue);
    if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && Object.prototype.propertyIsEnumerable.call(targetObject, prop))
      maybeFreeze(rootScope, childValue);
  }
};
var maybeFreeze = function(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
};
var createProxyProxy = function(base, parent) {
  const isArray = Array.isArray(base);
  const state = {
    type_: isArray ? 1 : 0,
    scope_: parent ? parent.scope_ : getCurrentScope(),
    modified_: false,
    finalized_: false,
    assigned_: {},
    parent_: parent,
    base_: base,
    draft_: null,
    copy_: null,
    revoke_: null,
    isManual_: false
  };
  let target = state;
  let traps = objectTraps;
  if (isArray) {
    target = [state];
    traps = arrayTraps;
  }
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state.draft_ = proxy;
  state.revoke_ = revoke;
  return proxy;
};
var peek = function(draft, prop) {
  const state = draft[DRAFT_STATE];
  const source = state ? latest(state) : draft;
  return source[prop];
};
var readPropFromProto = function(state, source, prop) {
  const desc = getDescriptorFromProto(source, prop);
  return desc ? `value` in desc ? desc.value : desc.get?.call(state.draft_) : undefined;
};
var getDescriptorFromProto = function(source, prop) {
  if (!(prop in source))
    return;
  let proto = getPrototypeOf(source);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc)
      return desc;
    proto = getPrototypeOf(proto);
  }
  return;
};
var markChanged = function(state) {
  if (!state.modified_) {
    state.modified_ = true;
    if (state.parent_) {
      markChanged(state.parent_);
    }
  }
};
var prepareCopy = function(state) {
  if (!state.copy_) {
    state.copy_ = shallowCopy(state.base_, state.scope_.immer_.useStrictShallowCopy_);
  }
};
var createProxy = function(value, parent) {
  const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
  const scope = parent ? parent.scope_ : getCurrentScope();
  scope.drafts_.push(draft);
  return draft;
};
var current = function(value) {
  if (!isDraft(value))
    die(10, value);
  return currentImpl(value);
};
var currentImpl = function(value) {
  if (!isDraftable(value) || isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  let copy;
  if (state) {
    if (!state.modified_)
      return state.base_;
    state.finalized_ = true;
    copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
  } else {
    copy = shallowCopy(value, true);
  }
  each(copy, (key, childValue) => {
    set(copy, key, currentImpl(childValue));
  });
  if (state) {
    state.finalized_ = false;
  }
  return copy;
};
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
var errors = [
  function(plugin) {
    return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
  },
  function(thing) {
    return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
  },
  "This object has been frozen and should not be mutated",
  function(data) {
    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
  },
  "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
  "Immer forbids circular references",
  "The first or second argument to `produce` must be a function",
  "The third argument to `produce` must be a function or undefined",
  "First argument to `createDraft` must be a plain object, an array, or an immerable object",
  "First argument to `finishDraft` must be a draft returned by `createDraft`",
  function(thing) {
    return `'current' expects a draft, got: ${thing}`;
  },
  "Object.defineProperty() cannot be used on an Immer draft",
  "Object.setPrototypeOf() cannot be used on an Immer draft",
  "Immer only supports deleting array indices",
  "Immer only supports setting array indices and the 'length' property",
  function(thing) {
    return `'original' expects a draft, got: ${thing}`;
  }
];
var getPrototypeOf = Object.getPrototypeOf;
var objectCtorString = Object.prototype.constructor.toString();
var plugins = {};
var currentScope;
var objectTraps = {
  get(state, prop) {
    if (prop === DRAFT_STATE)
      return state;
    const source = latest(state);
    if (!has(source, prop)) {
      return readPropFromProto(state, source, prop);
    }
    const value = source[prop];
    if (state.finalized_ || !isDraftable(value)) {
      return value;
    }
    if (value === peek(state.base_, prop)) {
      prepareCopy(state);
      return state.copy_[prop] = createProxy(value, state);
    }
    return value;
  },
  has(state, prop) {
    return prop in latest(state);
  },
  ownKeys(state) {
    return Reflect.ownKeys(latest(state));
  },
  set(state, prop, value) {
    const desc = getDescriptorFromProto(latest(state), prop);
    if (desc?.set) {
      desc.set.call(state.draft_, value);
      return true;
    }
    if (!state.modified_) {
      const current2 = peek(latest(state), prop);
      const currentState = current2?.[DRAFT_STATE];
      if (currentState && currentState.base_ === value) {
        state.copy_[prop] = value;
        state.assigned_[prop] = false;
        return true;
      }
      if (is(value, current2) && (value !== undefined || has(state.base_, prop)))
        return true;
      prepareCopy(state);
      markChanged(state);
    }
    if (state.copy_[prop] === value && (value !== undefined || (prop in state.copy_)) || Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
      return true;
    state.copy_[prop] = value;
    state.assigned_[prop] = true;
    return true;
  },
  deleteProperty(state, prop) {
    if (peek(state.base_, prop) !== undefined || (prop in state.base_)) {
      state.assigned_[prop] = false;
      prepareCopy(state);
      markChanged(state);
    } else {
      delete state.assigned_[prop];
    }
    if (state.copy_) {
      delete state.copy_[prop];
    }
    return true;
  },
  getOwnPropertyDescriptor(state, prop) {
    const owner = latest(state);
    const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (!desc)
      return desc;
    return {
      writable: true,
      configurable: state.type_ !== 1 || prop !== "length",
      enumerable: desc.enumerable,
      value: owner[prop]
    };
  },
  defineProperty() {
    die(11);
  },
  getPrototypeOf(state) {
    return getPrototypeOf(state.base_);
  },
  setPrototypeOf() {
    die(12);
  }
};
var arrayTraps = {};
each(objectTraps, (key, fn) => {
  arrayTraps[key] = function() {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});
arrayTraps.deleteProperty = function(state, prop) {
  if (isNaN(parseInt(prop)))
    die(13);
  return arrayTraps.set.call(this, state, prop, undefined);
};
arrayTraps.set = function(state, prop, value) {
  if (prop !== "length" && isNaN(parseInt(prop)))
    die(14);
  return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
var Immer2 = class {
  constructor(config) {
    this.autoFreeze_ = true;
    this.useStrictShallowCopy_ = false;
    this.produce = (base, recipe, patchListener) => {
      if (typeof base === "function" && typeof recipe !== "function") {
        const defaultBase = recipe;
        recipe = base;
        const self = this;
        return function curriedProduce(base2 = defaultBase, ...args) {
          return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
        };
      }
      if (typeof recipe !== "function")
        die(6);
      if (patchListener !== undefined && typeof patchListener !== "function")
        die(7);
      let result;
      if (isDraftable(base)) {
        const scope = enterScope(this);
        const proxy = createProxy(base, undefined);
        let hasError = true;
        try {
          result = recipe(proxy);
          hasError = false;
        } finally {
          if (hasError)
            revokeScope(scope);
          else
            leaveScope(scope);
        }
        usePatchesInScope(scope, patchListener);
        return processResult(result, scope);
      } else if (!base || typeof base !== "object") {
        result = recipe(base);
        if (result === undefined)
          result = base;
        if (result === NOTHING)
          result = undefined;
        if (this.autoFreeze_)
          freeze(result, true);
        if (patchListener) {
          const p = [];
          const ip = [];
          getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
          patchListener(p, ip);
        }
        return result;
      } else
        die(1, base);
    };
    this.produceWithPatches = (base, recipe) => {
      if (typeof base === "function") {
        return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
      }
      let patches, inversePatches;
      const result = this.produce(base, recipe, (p, ip) => {
        patches = p;
        inversePatches = ip;
      });
      return [result, patches, inversePatches];
    };
    if (typeof config?.autoFreeze === "boolean")
      this.setAutoFreeze(config.autoFreeze);
    if (typeof config?.useStrictShallowCopy === "boolean")
      this.setUseStrictShallowCopy(config.useStrictShallowCopy);
  }
  createDraft(base) {
    if (!isDraftable(base))
      die(8);
    if (isDraft(base))
      base = current(base);
    const scope = enterScope(this);
    const proxy = createProxy(base, undefined);
    proxy[DRAFT_STATE].isManual_ = true;
    leaveScope(scope);
    return proxy;
  }
  finishDraft(draft, patchListener) {
    const state = draft && draft[DRAFT_STATE];
    if (!state || !state.isManual_)
      die(9);
    const { scope_: scope } = state;
    usePatchesInScope(scope, patchListener);
    return processResult(undefined, scope);
  }
  setAutoFreeze(value) {
    this.autoFreeze_ = value;
  }
  setUseStrictShallowCopy(value) {
    this.useStrictShallowCopy_ = value;
  }
  applyPatches(base, patches) {
    let i;
    for (i = patches.length - 1;i >= 0; i--) {
      const patch = patches[i];
      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }
    if (i > -1) {
      patches = patches.slice(i + 1);
    }
    const applyPatchesImpl = getPlugin("Patches").applyPatches_;
    if (isDraft(base)) {
      return applyPatchesImpl(base, patches);
    }
    return this.produce(base, (draft) => applyPatchesImpl(draft, patches));
  }
};
var immer = new Immer2;
var produce = immer.produce;
var produceWithPatches = immer.produceWithPatches.bind(immer);
var setAutoFreeze = immer.setAutoFreeze.bind(immer);
var setUseStrictShallowCopy = immer.setUseStrictShallowCopy.bind(immer);
var applyPatches = immer.applyPatches.bind(immer);
var createDraft = immer.createDraft.bind(immer);
var finishDraft = immer.finishDraft.bind(immer);

// node_modules/reselect/dist/reselect.mjs
var assertIsFunction = function(func, errorMessage = `expected a function, instead received ${typeof func}`) {
  if (typeof func !== "function") {
    throw new TypeError(errorMessage);
  }
};
var assertIsObject = function(object, errorMessage = `expected an object, instead received ${typeof object}`) {
  if (typeof object !== "object") {
    throw new TypeError(errorMessage);
  }
};
var assertIsArrayOfFunctions = function(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
  if (!array.every((item) => typeof item === "function")) {
    const itemTypes = array.map((item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
    throw new TypeError(`${errorMessage}[${itemTypes}]`);
  }
};
var getDependencies = function(createSelectorArgs) {
  const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
  assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions, but received the following types: `);
  return dependencies;
};
var collectInputSelectorResults = function(dependencies, inputSelectorArgs) {
  const inputSelectorResults = [];
  const { length } = dependencies;
  for (let i = 0;i < length; i++) {
    inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
  }
  return inputSelectorResults;
};
var tripleEq = function(a, b) {
  return a === b;
};
var getValue = function(cell) {
  if (!(cell instanceof Cell)) {
    console.warn("Not a valid cell! ", cell);
  }
  return cell.value;
};
var createCell = function(initialValue, isEqual = tripleEq) {
  return new Cell(initialValue, isEqual);
};
var createTag = function() {
  return createCell(null, neverEq);
};
var createNode = function(value) {
  if (Array.isArray(value)) {
    return new ArrayTreeNode(value);
  }
  return new ObjectTreeNode(value);
};
var createCacheNode = function() {
  return {
    s: UNTERMINATED,
    v: undefined,
    o: null,
    p: null
  };
};
var weakMapMemoize = function(func, options = {}) {
  let fnNode = createCacheNode();
  const { resultEqualityCheck } = options;
  let lastResult;
  let resultsCount = 0;
  function memoized() {
    let cacheNode = fnNode;
    const { length } = arguments;
    for (let i = 0, l = length;i < l; i++) {
      const arg = arguments[i];
      if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
        let objectCache = cacheNode.o;
        if (objectCache === null) {
          cacheNode.o = objectCache = new WeakMap;
        }
        const objectNode = objectCache.get(arg);
        if (objectNode === undefined) {
          cacheNode = createCacheNode();
          objectCache.set(arg, cacheNode);
        } else {
          cacheNode = objectNode;
        }
      } else {
        let primitiveCache = cacheNode.p;
        if (primitiveCache === null) {
          cacheNode.p = primitiveCache = new Map;
        }
        const primitiveNode = primitiveCache.get(arg);
        if (primitiveNode === undefined) {
          cacheNode = createCacheNode();
          primitiveCache.set(arg, cacheNode);
        } else {
          cacheNode = primitiveNode;
        }
      }
    }
    const terminatedNode = cacheNode;
    let result;
    if (cacheNode.s === TERMINATED) {
      result = cacheNode.v;
    } else {
      result = func.apply(null, arguments);
      resultsCount++;
    }
    terminatedNode.s = TERMINATED;
    if (resultEqualityCheck) {
      const lastResultValue = lastResult?.deref?.() ?? lastResult;
      if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
        result = lastResultValue;
        resultsCount !== 0 && resultsCount--;
      }
      const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
      lastResult = needsWeakRef ? new Ref(result) : result;
    }
    terminatedNode.v = result;
    return result;
  }
  memoized.clearCache = () => {
    fnNode = createCacheNode();
    memoized.resetResultsCount();
  };
  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };
  return memoized;
};
var createSelectorCreator = function(memoizeOrOptions, ...memoizeOptionsFromArgs) {
  const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
    memoize: memoizeOrOptions,
    memoizeOptions: memoizeOptionsFromArgs
  } : memoizeOrOptions;
  const createSelector2 = (...createSelectorArgs) => {
    let recomputations = 0;
    let dependencyRecomputations = 0;
    let lastResult;
    let directlyPassedOptions = {};
    let resultFunc = createSelectorArgs.pop();
    if (typeof resultFunc === "object") {
      directlyPassedOptions = resultFunc;
      resultFunc = createSelectorArgs.pop();
    }
    assertIsFunction(resultFunc, `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`);
    const combinedOptions = {
      ...createSelectorCreatorOptions,
      ...directlyPassedOptions
    };
    const {
      memoize,
      memoizeOptions = [],
      argsMemoize = weakMapMemoize,
      argsMemoizeOptions = [],
      devModeChecks = {}
    } = combinedOptions;
    const finalMemoizeOptions = ensureIsArray(memoizeOptions);
    const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
    const dependencies = getDependencies(createSelectorArgs);
    const memoizedResultFunc = memoize(function recomputationWrapper() {
      recomputations++;
      return resultFunc.apply(null, arguments);
    }, ...finalMemoizeOptions);
    let firstRun = true;
    const selector = argsMemoize(function dependenciesChecker() {
      dependencyRecomputations++;
      const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
      lastResult = memoizedResultFunc.apply(null, inputSelectorResults);
      if (true) {
        const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
        if (identityFunctionCheck.shouldRun) {
          identityFunctionCheck.run(resultFunc, inputSelectorResults, lastResult);
        }
        if (inputStabilityCheck.shouldRun) {
          const inputSelectorResultsCopy = collectInputSelectorResults(dependencies, arguments);
          inputStabilityCheck.run({ inputSelectorResults, inputSelectorResultsCopy }, { memoize, memoizeOptions: finalMemoizeOptions }, arguments);
        }
        if (firstRun)
          firstRun = false;
      }
      return lastResult;
    }, ...finalArgsMemoizeOptions);
    return Object.assign(selector, {
      resultFunc,
      memoizedResultFunc,
      dependencies,
      dependencyRecomputations: () => dependencyRecomputations,
      resetDependencyRecomputations: () => {
        dependencyRecomputations = 0;
      },
      lastResult: () => lastResult,
      recomputations: () => recomputations,
      resetRecomputations: () => {
        recomputations = 0;
      },
      memoize,
      argsMemoize
    });
  };
  Object.assign(createSelector2, {
    withTypes: () => createSelector2
  });
  return createSelector2;
};
var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
  if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
    let isInputSameAsOutput = false;
    try {
      const emptyObject = {};
      if (resultFunc(emptyObject) === emptyObject)
        isInputSameAsOutput = true;
    } catch {
    }
    if (isInputSameAsOutput) {
      let stack = undefined;
      try {
        throw new Error;
      } catch (e) {
        ({ stack } = e);
      }
      console.warn("The result function returned its own inputs without modification. e.g\n`createSelector([state => state.todos], todos => todos)`\nThis could lead to inefficient memoization and unnecessary re-renders.\nEnsure transformation logic is in the result function, and extraction logic is in the input selectors.", { stack });
    }
  }
};
var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
  const { memoize, memoizeOptions } = options;
  const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
  const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);
  const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);
  if (!areInputSelectorResultsEqual) {
    let stack = undefined;
    try {
      throw new Error;
    } catch (e) {
      ({ stack } = e);
    }
    console.warn("An input selector returned a different result when passed same arguments.\nThis means your output selector will likely run more frequently than intended.\nAvoid returning a new reference inside your input selector, e.g.\n`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`", {
      arguments: inputSelectorArgs,
      firstInputs: inputSelectorResults,
      secondInputs: inputSelectorResultsCopy,
      stack
    });
  }
};
var globalDevModeChecks = {
  inputStabilityCheck: "once",
  identityFunctionCheck: "once"
};
var ensureIsArray = (item) => {
  return Array.isArray(item) ? item : [item];
};
var getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
  const { identityFunctionCheck, inputStabilityCheck } = {
    ...globalDevModeChecks,
    ...devModeChecks
  };
  return {
    identityFunctionCheck: {
      shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
      run: runIdentityFunctionCheck
    },
    inputStabilityCheck: {
      shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
      run: runInputStabilityCheck
    }
  };
};
var $REVISION = 0;
var CURRENT_TRACKER = null;
var Cell = class {
  revision = $REVISION;
  _value;
  _lastValue;
  _isEqual = tripleEq;
  constructor(initialValue, isEqual = tripleEq) {
    this._value = this._lastValue = initialValue;
    this._isEqual = isEqual;
  }
  get value() {
    CURRENT_TRACKER?.add(this);
    return this._value;
  }
  set value(newValue) {
    if (this.value === newValue)
      return;
    this._value = newValue;
    this.revision = ++$REVISION;
  }
};
var neverEq = (a, b) => false;
var consumeCollection = (node) => {
  let tag = node.collectionTag;
  if (tag === null) {
    tag = node.collectionTag = createTag();
  }
  getValue(tag);
};
var REDUX_PROXY_LABEL = Symbol();
var nextId = 0;
var proto = Object.getPrototypeOf({});
var ObjectTreeNode = class {
  constructor(value) {
    this.value = value;
    this.value = value;
    this.tag.value = value;
  }
  proxy = new Proxy(this, objectProxyHandler);
  tag = createTag();
  tags = {};
  children = {};
  collectionTag = null;
  id = nextId++;
};
var objectProxyHandler = {
  get(node, key) {
    function calculateResult() {
      const { value } = node;
      const childValue = Reflect.get(value, key);
      if (typeof key === "symbol") {
        return childValue;
      }
      if (key in proto) {
        return childValue;
      }
      if (typeof childValue === "object" && childValue !== null) {
        let childNode = node.children[key];
        if (childNode === undefined) {
          childNode = node.children[key] = createNode(childValue);
        }
        if (childNode.tag) {
          getValue(childNode.tag);
        }
        return childNode.proxy;
      } else {
        let tag = node.tags[key];
        if (tag === undefined) {
          tag = node.tags[key] = createTag();
          tag.value = childValue;
        }
        getValue(tag);
        return childValue;
      }
    }
    const res = calculateResult();
    return res;
  },
  ownKeys(node) {
    consumeCollection(node);
    return Reflect.ownKeys(node.value);
  },
  getOwnPropertyDescriptor(node, prop) {
    return Reflect.getOwnPropertyDescriptor(node.value, prop);
  },
  has(node, prop) {
    return Reflect.has(node.value, prop);
  }
};
var ArrayTreeNode = class {
  constructor(value) {
    this.value = value;
    this.value = value;
    this.tag.value = value;
  }
  proxy = new Proxy([this], arrayProxyHandler);
  tag = createTag();
  tags = {};
  children = {};
  collectionTag = null;
  id = nextId++;
};
var arrayProxyHandler = {
  get([node], key) {
    if (key === "length") {
      consumeCollection(node);
    }
    return objectProxyHandler.get(node, key);
  },
  ownKeys([node]) {
    return objectProxyHandler.ownKeys(node);
  },
  getOwnPropertyDescriptor([node], prop) {
    return objectProxyHandler.getOwnPropertyDescriptor(node, prop);
  },
  has([node], prop) {
    return objectProxyHandler.has(node, prop);
  }
};
var StrongRef = class {
  constructor(value) {
    this.value = value;
  }
  deref() {
    return this.value;
  }
};
var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;
var UNTERMINATED = 0;
var TERMINATED = 1;
var createSelector = createSelectorCreator(weakMapMemoize);
var createStructuredSelector = Object.assign((inputSelectorsObject, selectorCreator = createSelector) => {
  assertIsObject(inputSelectorsObject, `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof inputSelectorsObject}`);
  const inputSelectorKeys = Object.keys(inputSelectorsObject);
  const dependencies = inputSelectorKeys.map((key) => inputSelectorsObject[key]);
  const structuredSelector = selectorCreator(dependencies, (...inputSelectorResults) => {
    return inputSelectorResults.reduce((composition, value, index) => {
      composition[inputSelectorKeys[index]] = value;
      return composition;
    }, {});
  });
  return structuredSelector;
}, { withTypes: () => createStructuredSelector });

// node_modules/redux-thunk/dist/redux-thunk.mjs
var createThunkMiddleware = function(extraArgument) {
  const middleware = ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
  return middleware;
};
var thunk = createThunkMiddleware();
var withExtraArgument = createThunkMiddleware;

// node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
var createAction = function(type, prepareAction) {
  function actionCreator(...args) {
    if (prepareAction) {
      let prepared = prepareAction(...args);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        ...("meta" in prepared) && {
          meta: prepared.meta
        },
        ...("error" in prepared) && {
          error: prepared.error
        }
      };
    }
    return {
      type,
      payload: args[0]
    };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  actionCreator.match = (action) => isAction(action) && action.type === type;
  return actionCreator;
};
var isActionCreator = function(action) {
  return typeof action === "function" && ("type" in action) && hasMatchFunction(action);
};
var getMessage = function(type) {
  const splitType = type ? `${type}`.split("/") : [];
  const actionName = splitType[splitType.length - 1] || "actionCreator";
  return `Detected an action creator with type "${type || "unknown"}" being dispatched. 
Make sure you're calling the action creator before dispatching, i.e. \`dispatch(${actionName}())\` instead of \`dispatch(${actionName})\`. This is necessary even if the action has no payload.`;
};
var createActionCreatorInvariantMiddleware = function(options = {}) {
  if (false) {
  }
  const {
    isActionCreator: isActionCreator2 = isActionCreator
  } = options;
  return () => (next) => (action) => {
    if (isActionCreator2(action)) {
      console.warn(getMessage(action.type));
    }
    return next(action);
  };
};
var getTimeMeasureUtils = function(maxDelay, fnName) {
  let elapsed = 0;
  return {
    measureTime(fn) {
      const started = Date.now();
      try {
        return fn();
      } finally {
        const finished = Date.now();
        elapsed += finished - started;
      }
    },
    warnIfExceeded() {
      if (elapsed > maxDelay) {
        console.warn(`${fnName} took ${elapsed}ms, which is more than the warning threshold of ${maxDelay}ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`);
      }
    }
  };
};
var freezeDraftable = function(val) {
  return isDraftable(val) ? produce(val, () => {
  }) : val;
};
var emplace = function(map, key, handler) {
  if (map.has(key)) {
    let value = map.get(key);
    if (handler.update) {
      value = handler.update(value, key, map);
      map.set(key, value);
    }
    return value;
  }
  if (!handler.insert)
    throw new Error("No insert provided for key not already in map");
  const inserted = handler.insert(key, map);
  map.set(key, inserted);
  return inserted;
};
var isImmutableDefault = function(value) {
  return typeof value !== "object" || value == null || Object.isFrozen(value);
};
var trackForMutations = function(isImmutable, ignorePaths, obj) {
  const trackedProperties = trackProperties(isImmutable, ignorePaths, obj);
  return {
    detectMutations() {
      return detectMutations(isImmutable, ignorePaths, trackedProperties, obj);
    }
  };
};
var trackProperties = function(isImmutable, ignorePaths = [], obj, path = "", checkedObjects = new Set) {
  const tracked = {
    value: obj
  };
  if (!isImmutable(obj) && !checkedObjects.has(obj)) {
    checkedObjects.add(obj);
    tracked.children = {};
    for (const key in obj) {
      const childPath = path ? path + "." + key : key;
      if (ignorePaths.length && ignorePaths.indexOf(childPath) !== -1) {
        continue;
      }
      tracked.children[key] = trackProperties(isImmutable, ignorePaths, obj[key], childPath);
    }
  }
  return tracked;
};
var detectMutations = function(isImmutable, ignoredPaths = [], trackedProperty, obj, sameParentRef = false, path = "") {
  const prevObj = trackedProperty ? trackedProperty.value : undefined;
  const sameRef = prevObj === obj;
  if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
    return {
      wasMutated: true,
      path
    };
  }
  if (isImmutable(prevObj) || isImmutable(obj)) {
    return {
      wasMutated: false
    };
  }
  const keysToDetect = {};
  for (let key in trackedProperty.children) {
    keysToDetect[key] = true;
  }
  for (let key in obj) {
    keysToDetect[key] = true;
  }
  const hasIgnoredPaths = ignoredPaths.length > 0;
  for (let key in keysToDetect) {
    const nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      const hasMatches = ignoredPaths.some((ignored) => {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        continue;
      }
    }
    const result = detectMutations(isImmutable, ignoredPaths, trackedProperty.children[key], obj[key], sameRef, nestedPath);
    if (result.wasMutated) {
      return result;
    }
  }
  return {
    wasMutated: false
  };
};
var createImmutableStateInvariantMiddleware = function(options = {}) {
  if (false) {
  } else {
    let stringify2 = function(obj, serializer, indent, decycler) {
      return JSON.stringify(obj, getSerialize2(serializer, decycler), indent);
    }, getSerialize2 = function(serializer, decycler) {
      let stack = [], keys = [];
      if (!decycler)
        decycler = function(_, value) {
          if (stack[0] === value)
            return "[Circular ~]";
          return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
        };
      return function(key, value) {
        if (stack.length > 0) {
          var thisPos = stack.indexOf(this);
          ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
          ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
          if (~stack.indexOf(value))
            value = decycler.call(this, key, value);
        } else
          stack.push(value);
        return serializer == null ? value : serializer.call(this, key, value);
      };
    };
    var stringify = stringify2, getSerialize = getSerialize2;
    let {
      isImmutable = isImmutableDefault,
      ignoredPaths,
      warnAfter = 32
    } = options;
    const track = trackForMutations.bind(null, isImmutable, ignoredPaths);
    return ({
      getState
    }) => {
      let state = getState();
      let tracker = track(state);
      let result;
      return (next) => (action) => {
        const measureUtils = getTimeMeasureUtils(warnAfter, "ImmutableStateInvariantMiddleware");
        measureUtils.measureTime(() => {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          if (result.wasMutated) {
            throw new Error(`A state mutation was detected between dispatches, in the path '${result.path || ""}'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
          }
        });
        const dispatchedAction = next(action);
        measureUtils.measureTime(() => {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          if (result.wasMutated) {
            throw new Error(`A state mutation was detected inside a dispatch, in the path: ${result.path || ""}. Take a look at the reducer(s) handling the action ${stringify2(action)}. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
          }
        });
        measureUtils.warnIfExceeded();
        return dispatchedAction;
      };
    };
  }
};
var isPlain = function(val) {
  const type = typeof val;
  return val == null || type === "string" || type === "boolean" || type === "number" || Array.isArray(val) || isPlainObject(val);
};
var findNonSerializableValue = function(value, path = "", isSerializable = isPlain, getEntries, ignoredPaths = [], cache) {
  let foundNestedSerializable;
  if (!isSerializable(value)) {
    return {
      keyPath: path || "<root>",
      value
    };
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (cache?.has(value))
    return false;
  const entries = getEntries != null ? getEntries(value) : Object.entries(value);
  const hasIgnoredPaths = ignoredPaths.length > 0;
  for (const [key, nestedValue] of entries) {
    const nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      const hasMatches = ignoredPaths.some((ignored) => {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        continue;
      }
    }
    if (!isSerializable(nestedValue)) {
      return {
        keyPath: nestedPath,
        value: nestedValue
      };
    }
    if (typeof nestedValue === "object") {
      foundNestedSerializable = findNonSerializableValue(nestedValue, nestedPath, isSerializable, getEntries, ignoredPaths, cache);
      if (foundNestedSerializable) {
        return foundNestedSerializable;
      }
    }
  }
  if (cache && isNestedFrozen(value))
    cache.add(value);
  return false;
};
var isNestedFrozen = function(value) {
  if (!Object.isFrozen(value))
    return false;
  for (const nestedValue of Object.values(value)) {
    if (typeof nestedValue !== "object" || nestedValue === null)
      continue;
    if (!isNestedFrozen(nestedValue))
      return false;
  }
  return true;
};
var createSerializableStateInvariantMiddleware = function(options = {}) {
  if (false) {
  } else {
    const {
      isSerializable = isPlain,
      getEntries,
      ignoredActions = [],
      ignoredActionPaths = ["meta.arg", "meta.baseQueryMeta"],
      ignoredPaths = [],
      warnAfter = 32,
      ignoreState = false,
      ignoreActions = false,
      disableCache = false
    } = options;
    const cache = !disableCache && WeakSet ? new WeakSet : undefined;
    return (storeAPI) => (next) => (action) => {
      if (!isAction(action)) {
        return next(action);
      }
      const result = next(action);
      const measureUtils = getTimeMeasureUtils(warnAfter, "SerializableStateInvariantMiddleware");
      if (!ignoreActions && !(ignoredActions.length && ignoredActions.indexOf(action.type) !== -1)) {
        measureUtils.measureTime(() => {
          const foundActionNonSerializableValue = findNonSerializableValue(action, "", isSerializable, getEntries, ignoredActionPaths, cache);
          if (foundActionNonSerializableValue) {
            const {
              keyPath,
              value
            } = foundActionNonSerializableValue;
            console.error(`A non-serializable value was detected in an action, in the path: \`${keyPath}\`. Value:`, value, "\nTake a look at the logic that dispatched this action: ", action, "\n(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)", "\n(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)");
          }
        });
      }
      if (!ignoreState) {
        measureUtils.measureTime(() => {
          const state = storeAPI.getState();
          const foundStateNonSerializableValue = findNonSerializableValue(state, "", isSerializable, getEntries, ignoredPaths, cache);
          if (foundStateNonSerializableValue) {
            const {
              keyPath,
              value
            } = foundStateNonSerializableValue;
            console.error(`A non-serializable value was detected in the state, in the path: \`${keyPath}\`. Value:`, value, `
Take a look at the reducer(s) handling this action type: ${action.type}.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)`);
          }
        });
        measureUtils.warnIfExceeded();
      }
      return result;
    };
  }
};
var isBoolean = function(x) {
  return typeof x === "boolean";
};
var configureStore = function(options) {
  const getDefaultMiddleware = buildGetDefaultMiddleware();
  const {
    reducer = undefined,
    middleware,
    devTools = true,
    preloadedState = undefined,
    enhancers = undefined
  } = options || {};
  let rootReducer;
  if (typeof reducer === "function") {
    rootReducer = reducer;
  } else if (isPlainObject(reducer)) {
    rootReducer = combineReducers(reducer);
  } else {
    throw new Error("`reducer` is a required argument, and must be a function or an object of functions that can be passed to combineReducers");
  }
  if (!IS_PRODUCTION && middleware && typeof middleware !== "function") {
    throw new Error("`middleware` field must be a callback");
  }
  let finalMiddleware;
  if (typeof middleware === "function") {
    finalMiddleware = middleware(getDefaultMiddleware);
    if (!IS_PRODUCTION && !Array.isArray(finalMiddleware)) {
      throw new Error("when using a middleware builder function, an array of middleware must be returned");
    }
  } else {
    finalMiddleware = getDefaultMiddleware();
  }
  if (!IS_PRODUCTION && finalMiddleware.some((item) => typeof item !== "function")) {
    throw new Error("each middleware provided to configureStore must be a function");
  }
  let finalCompose = compose;
  if (devTools) {
    finalCompose = composeWithDevTools({
      trace: !IS_PRODUCTION,
      ...typeof devTools === "object" && devTools
    });
  }
  const middlewareEnhancer = applyMiddleware(...finalMiddleware);
  const getDefaultEnhancers = buildGetDefaultEnhancers(middlewareEnhancer);
  if (!IS_PRODUCTION && enhancers && typeof enhancers !== "function") {
    throw new Error("`enhancers` field must be a callback");
  }
  let storeEnhancers = typeof enhancers === "function" ? enhancers(getDefaultEnhancers) : getDefaultEnhancers();
  if (!IS_PRODUCTION && !Array.isArray(storeEnhancers)) {
    throw new Error("`enhancers` callback must return an array");
  }
  if (!IS_PRODUCTION && storeEnhancers.some((item) => typeof item !== "function")) {
    throw new Error("each enhancer provided to configureStore must be a function");
  }
  if (!IS_PRODUCTION && finalMiddleware.length && !storeEnhancers.includes(middlewareEnhancer)) {
    console.error("middlewares were provided, but middleware enhancer was not included in final enhancers - make sure to call `getDefaultEnhancers`");
  }
  const composedEnhancer = finalCompose(...storeEnhancers);
  return createStore(rootReducer, preloadedState, composedEnhancer);
};
var executeReducerBuilderCallback = function(builderCallback) {
  const actionsMap = {};
  const actionMatchers = [];
  let defaultCaseReducer;
  const builder = {
    addCase(typeOrActionCreator, reducer) {
      if (true) {
        if (actionMatchers.length > 0) {
          throw new Error("`builder.addCase` should only be called before calling `builder.addMatcher`");
        }
        if (defaultCaseReducer) {
          throw new Error("`builder.addCase` should only be called before calling `builder.addDefaultCase`");
        }
      }
      const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
      if (!type) {
        throw new Error("`builder.addCase` cannot be called with an empty action type");
      }
      if (type in actionsMap) {
        throw new Error(`\`builder.addCase\` cannot be called with two reducers for the same action type '${type}'`);
      }
      actionsMap[type] = reducer;
      return builder;
    },
    addMatcher(matcher, reducer) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error("`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
        }
      }
      actionMatchers.push({
        matcher,
        reducer
      });
      return builder;
    },
    addDefaultCase(reducer) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error("`builder.addDefaultCase` can only be called once");
        }
      }
      defaultCaseReducer = reducer;
      return builder;
    }
  };
  builderCallback(builder);
  return [actionsMap, actionMatchers, defaultCaseReducer];
};
var isStateFunction = function(x) {
  return typeof x === "function";
};
var createReducer = function(initialState, mapOrBuilderCallback) {
  if (true) {
    if (typeof mapOrBuilderCallback === "object") {
      throw new Error("The object notation for `createReducer` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createReducer");
    }
  }
  let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
  let getInitialState;
  if (isStateFunction(initialState)) {
    getInitialState = () => freezeDraftable(initialState());
  } else {
    const frozenInitialState = freezeDraftable(initialState);
    getInitialState = () => frozenInitialState;
  }
  function reducer(state = getInitialState(), action) {
    let caseReducers = [actionsMap[action.type], ...finalActionMatchers.filter(({
      matcher
    }) => matcher(action)).map(({
      reducer: reducer2
    }) => reducer2)];
    if (caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }
    return caseReducers.reduce((previousState, caseReducer) => {
      if (caseReducer) {
        if (isDraft(previousState)) {
          const draft = previousState;
          const result = caseReducer(draft, action);
          if (result === undefined) {
            return previousState;
          }
          return result;
        } else if (!isDraftable(previousState)) {
          const result = caseReducer(previousState, action);
          if (result === undefined) {
            if (previousState === null) {
              return previousState;
            }
            throw new Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          return produce(previousState, (draft) => {
            return caseReducer(draft, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer.getInitialState = getInitialState;
  return reducer;
};
var isAnyOf = function(...matchers) {
  return (action) => {
    return matchers.some((matcher) => matches(matcher, action));
  };
};
var unwrapResult = function(action) {
  if (action.meta && action.meta.rejectedWithValue) {
    throw action.payload;
  }
  if (action.error) {
    throw action.error;
  }
  return action.payload;
};
var isThenable = function(value) {
  return value !== null && typeof value === "object" && typeof value.then === "function";
};
var getType = function(slice, actionKey) {
  return `${slice}/${actionKey}`;
};
var buildCreateSlice = function({
  creators
} = {}) {
  const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
  return function createSlice2(options) {
    const {
      name,
      reducerPath = name
    } = options;
    if (!name) {
      throw new Error("`name` is a required option for createSlice");
    }
    if (typeof process !== "undefined" && true) {
      if (options.initialState === undefined) {
        console.error("You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`");
      }
    }
    const reducers = (typeof options.reducers === "function" ? options.reducers(buildReducerCreators()) : options.reducers) || {};
    const reducerNames = Object.keys(reducers);
    const context = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    };
    const contextMethods = {
      addCase(typeOrActionCreator, reducer2) {
        const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
        if (!type) {
          throw new Error("`context.addCase` cannot be called with an empty action type");
        }
        if (type in context.sliceCaseReducersByType) {
          throw new Error("`context.addCase` cannot be called with two reducers for the same action type: " + type);
        }
        context.sliceCaseReducersByType[type] = reducer2;
        return contextMethods;
      },
      addMatcher(matcher, reducer2) {
        context.sliceMatchers.push({
          matcher,
          reducer: reducer2
        });
        return contextMethods;
      },
      exposeAction(name2, actionCreator) {
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      }
    };
    reducerNames.forEach((reducerName) => {
      const reducerDefinition = reducers[reducerName];
      const reducerDetails = {
        reducerName,
        type: getType(name, reducerName),
        createNotation: typeof options.reducers === "function"
      };
      if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
        handleThunkCaseReducerDefinition(reducerDetails, reducerDefinition, contextMethods, cAT);
      } else {
        handleNormalReducerDefinition(reducerDetails, reducerDefinition, contextMethods);
      }
    });
    function buildReducer() {
      if (true) {
        if (typeof options.extraReducers === "object") {
          throw new Error("The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice");
        }
      }
      const [extraReducers = {}, actionMatchers = [], defaultCaseReducer = undefined] = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers];
      const finalCaseReducers = {
        ...extraReducers,
        ...context.sliceCaseReducersByType
      };
      return createReducer(options.initialState, (builder) => {
        for (let key in finalCaseReducers) {
          builder.addCase(key, finalCaseReducers[key]);
        }
        for (let sM of context.sliceMatchers) {
          builder.addMatcher(sM.matcher, sM.reducer);
        }
        for (let m of actionMatchers) {
          builder.addMatcher(m.matcher, m.reducer);
        }
        if (defaultCaseReducer) {
          builder.addDefaultCase(defaultCaseReducer);
        }
      });
    }
    const selectSelf = (state) => state;
    const injectedSelectorCache = new Map;
    let _reducer;
    function reducer(state, action) {
      if (!_reducer)
        _reducer = buildReducer();
      return _reducer(state, action);
    }
    function getInitialState() {
      if (!_reducer)
        _reducer = buildReducer();
      return _reducer.getInitialState();
    }
    function makeSelectorProps(reducerPath2, injected = false) {
      function selectSlice(state) {
        let sliceState = state[reducerPath2];
        if (typeof sliceState === "undefined") {
          if (injected) {
            sliceState = getInitialState();
          } else if (true) {
            throw new Error("selectSlice returned undefined for an uninjected slice reducer");
          }
        }
        return sliceState;
      }
      function getSelectors(selectState = selectSelf) {
        const selectorCache = emplace(injectedSelectorCache, injected, {
          insert: () => new WeakMap
        });
        return emplace(selectorCache, selectState, {
          insert: () => {
            const map = {};
            for (const [name2, selector] of Object.entries(options.selectors ?? {})) {
              map[name2] = wrapSelector(selector, selectState, getInitialState, injected);
            }
            return map;
          }
        });
      }
      return {
        reducerPath: reducerPath2,
        getSelectors,
        get selectors() {
          return getSelectors(selectSlice);
        },
        selectSlice
      };
    }
    const slice = {
      name,
      reducer,
      actions: context.actionCreators,
      caseReducers: context.sliceCaseReducersByName,
      getInitialState,
      ...makeSelectorProps(reducerPath),
      injectInto(injectable, {
        reducerPath: pathOpt,
        ...config
      } = {}) {
        const newReducerPath = pathOpt ?? reducerPath;
        injectable.inject({
          reducerPath: newReducerPath,
          reducer
        }, config);
        return {
          ...slice,
          ...makeSelectorProps(newReducerPath, true)
        };
      }
    };
    return slice;
  };
};
var wrapSelector = function(selector, selectState, getInitialState, injected) {
  function wrapper(rootState, ...args) {
    let sliceState = selectState(rootState);
    if (typeof sliceState === "undefined") {
      if (injected) {
        sliceState = getInitialState();
      } else if (true) {
        throw new Error("selectState returned undefined for an uninjected slice reducer");
      }
    }
    return selector(sliceState, ...args);
  }
  wrapper.unwrapped = selector;
  return wrapper;
};
var buildReducerCreators = function() {
  function asyncThunk(payloadCreator, config) {
    return {
      _reducerDefinitionType: "asyncThunk",
      payloadCreator,
      ...config
    };
  }
  asyncThunk.withTypes = () => asyncThunk;
  return {
    reducer(caseReducer) {
      return Object.assign({
        [caseReducer.name](...args) {
          return caseReducer(...args);
        }
      }[caseReducer.name], {
        _reducerDefinitionType: "reducer"
      });
    },
    preparedReducer(prepare, reducer) {
      return {
        _reducerDefinitionType: "reducerWithPrepare",
        prepare,
        reducer
      };
    },
    asyncThunk
  };
};
var handleNormalReducerDefinition = function({
  type,
  reducerName,
  createNotation
}, maybeReducerWithPrepare, context) {
  let caseReducer;
  let prepareCallback;
  if ("reducer" in maybeReducerWithPrepare) {
    if (createNotation && !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)) {
      throw new Error("Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation.");
    }
    caseReducer = maybeReducerWithPrepare.reducer;
    prepareCallback = maybeReducerWithPrepare.prepare;
  } else {
    caseReducer = maybeReducerWithPrepare;
  }
  context.addCase(type, caseReducer).exposeCaseReducer(reducerName, caseReducer).exposeAction(reducerName, prepareCallback ? createAction(type, prepareCallback) : createAction(type));
};
var isAsyncThunkSliceReducerDefinition = function(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "asyncThunk";
};
var isCaseReducerWithPrepareDefinition = function(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "reducerWithPrepare";
};
var handleThunkCaseReducerDefinition = function({
  type,
  reducerName
}, reducerDefinition, context, cAT) {
  if (!cAT) {
    throw new Error("Cannot use `create.asyncThunk` in the built-in `createSlice`. Use `buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })` to create a customised version of `createSlice`.");
  }
  const {
    payloadCreator,
    fulfilled,
    pending,
    rejected,
    settled,
    options
  } = reducerDefinition;
  const thunk2 = cAT(type, payloadCreator, options);
  context.exposeAction(reducerName, thunk2);
  if (fulfilled) {
    context.addCase(thunk2.fulfilled, fulfilled);
  }
  if (pending) {
    context.addCase(thunk2.pending, pending);
  }
  if (rejected) {
    context.addCase(thunk2.rejected, rejected);
  }
  if (settled) {
    context.addMatcher(thunk2.settled, settled);
  }
  context.exposeCaseReducer(reducerName, {
    fulfilled: fulfilled || noop,
    pending: pending || noop,
    rejected: rejected || noop,
    settled: settled || noop
  });
};
var noop = function() {
};
var createDraftSafeSelectorCreator = (...args) => {
  const createSelector2 = createSelectorCreator(...args);
  const createDraftSafeSelector2 = Object.assign((...args2) => {
    const selector = createSelector2(...args2);
    const wrappedSelector = (value, ...rest) => selector(isDraft(value) ? current(value) : value, ...rest);
    Object.assign(wrappedSelector, selector);
    return wrappedSelector;
  }, {
    withTypes: () => createDraftSafeSelector2
  });
  return createDraftSafeSelector2;
};
var createDraftSafeSelector = createDraftSafeSelectorCreator(weakMapMemoize);
var composeWithDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
  if (arguments.length === 0)
    return;
  if (typeof arguments[0] === "object")
    return compose;
  return compose.apply(null, arguments);
};
var devToolsEnhancer = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__ : function() {
  return function(noop3) {
    return noop3;
  };
};
var hasMatchFunction = (v) => {
  return v && typeof v.match === "function";
};
var Tuple = class _Tuple extends Array {
  constructor(...items) {
    super(...items);
    Object.setPrototypeOf(this, _Tuple.prototype);
  }
  static get [Symbol.species]() {
    return _Tuple;
  }
  concat(...arr) {
    return super.concat.apply(this, arr);
  }
  prepend(...arr) {
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new _Tuple(...arr[0].concat(this));
    }
    return new _Tuple(...arr.concat(this));
  }
};
var buildGetDefaultMiddleware = () => function getDefaultMiddleware(options) {
  const {
    thunk: thunk2 = true,
    immutableCheck = true,
    serializableCheck = true,
    actionCreatorCheck = true
  } = options ?? {};
  let middlewareArray = new Tuple;
  if (thunk2) {
    if (isBoolean(thunk2)) {
      middlewareArray.push(thunk);
    } else {
      middlewareArray.push(withExtraArgument(thunk2.extraArgument));
    }
  }
  if (true) {
    if (immutableCheck) {
      let immutableOptions = {};
      if (!isBoolean(immutableCheck)) {
        immutableOptions = immutableCheck;
      }
      middlewareArray.unshift(createImmutableStateInvariantMiddleware(immutableOptions));
    }
    if (serializableCheck) {
      let serializableOptions = {};
      if (!isBoolean(serializableCheck)) {
        serializableOptions = serializableCheck;
      }
      middlewareArray.push(createSerializableStateInvariantMiddleware(serializableOptions));
    }
    if (actionCreatorCheck) {
      let actionCreatorOptions = {};
      if (!isBoolean(actionCreatorCheck)) {
        actionCreatorOptions = actionCreatorCheck;
      }
      middlewareArray.unshift(createActionCreatorInvariantMiddleware(actionCreatorOptions));
    }
  }
  return middlewareArray;
};
var SHOULD_AUTOBATCH = "RTK_autoBatch";
var createQueueWithTimer = (timeout) => {
  return (notify) => {
    setTimeout(notify, timeout);
  };
};
var rAF = typeof window !== "undefined" && window.requestAnimationFrame ? window.requestAnimationFrame : createQueueWithTimer(10);
var autoBatchEnhancer = (options = {
  type: "raf"
}) => (next) => (...args) => {
  const store = next(...args);
  let notifying = true;
  let shouldNotifyAtEndOfTick = false;
  let notificationQueued = false;
  const listeners = new Set;
  const queueCallback = options.type === "tick" ? queueMicrotask : options.type === "raf" ? rAF : options.type === "callback" ? options.queueNotification : createQueueWithTimer(options.timeout);
  const notifyListeners = () => {
    notificationQueued = false;
    if (shouldNotifyAtEndOfTick) {
      shouldNotifyAtEndOfTick = false;
      listeners.forEach((l) => l());
    }
  };
  return Object.assign({}, store, {
    subscribe(listener2) {
      const wrappedListener = () => notifying && listener2();
      const unsubscribe = store.subscribe(wrappedListener);
      listeners.add(listener2);
      return () => {
        unsubscribe();
        listeners.delete(listener2);
      };
    },
    dispatch(action) {
      try {
        notifying = !action?.meta?.[SHOULD_AUTOBATCH];
        shouldNotifyAtEndOfTick = !notifying;
        if (shouldNotifyAtEndOfTick) {
          if (!notificationQueued) {
            notificationQueued = true;
            queueCallback(notifyListeners);
          }
        }
        return store.dispatch(action);
      } finally {
        notifying = true;
      }
    }
  });
};
var buildGetDefaultEnhancers = (middlewareEnhancer) => function getDefaultEnhancers(options) {
  const {
    autoBatch = true
  } = options ?? {};
  let enhancerArray = new Tuple(middlewareEnhancer);
  if (autoBatch) {
    enhancerArray.push(autoBatchEnhancer(typeof autoBatch === "object" ? autoBatch : undefined));
  }
  return enhancerArray;
};
var IS_PRODUCTION = false;
var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};
var matches = (matcher, action) => {
  if (hasMatchFunction(matcher)) {
    return matcher.match(action);
  } else {
    return matcher(action);
  }
};
var commonProperties = ["name", "message", "stack", "code"];
var RejectWithValue = class {
  constructor(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  _type;
};
var FulfillWithMeta = class {
  constructor(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  _type;
};
var miniSerializeError = (value) => {
  if (typeof value === "object" && value !== null) {
    const simpleError = {};
    for (const property of commonProperties) {
      if (typeof value[property] === "string") {
        simpleError[property] = value[property];
      }
    }
    return simpleError;
  }
  return {
    message: String(value)
  };
};
var createAsyncThunk = (() => {
  function createAsyncThunk2(typePrefix, payloadCreator, options) {
    const fulfilled = createAction(typePrefix + "/fulfilled", (payload, requestId, arg, meta) => ({
      payload,
      meta: {
        ...meta || {},
        arg,
        requestId,
        requestStatus: "fulfilled"
      }
    }));
    const pending = createAction(typePrefix + "/pending", (requestId, arg, meta) => ({
      payload: undefined,
      meta: {
        ...meta || {},
        arg,
        requestId,
        requestStatus: "pending"
      }
    }));
    const rejected = createAction(typePrefix + "/rejected", (error, requestId, arg, payload, meta) => ({
      payload,
      error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
      meta: {
        ...meta || {},
        arg,
        requestId,
        rejectedWithValue: !!payload,
        requestStatus: "rejected",
        aborted: error?.name === "AbortError",
        condition: error?.name === "ConditionError"
      }
    }));
    function actionCreator(arg) {
      return (dispatch, getState, extra) => {
        const requestId = options?.idGenerator ? options.idGenerator(arg) : nanoid();
        const abortController = new AbortController;
        let abortHandler;
        let abortReason;
        function abort(reason) {
          abortReason = reason;
          abortController.abort();
        }
        const promise = async function() {
          let finalAction;
          try {
            let conditionResult = options?.condition?.(arg, {
              getState,
              extra
            });
            if (isThenable(conditionResult)) {
              conditionResult = await conditionResult;
            }
            if (conditionResult === false || abortController.signal.aborted) {
              throw {
                name: "ConditionError",
                message: "Aborted due to condition callback returning false."
              };
            }
            const abortedPromise = new Promise((_, reject) => {
              abortHandler = () => {
                reject({
                  name: "AbortError",
                  message: abortReason || "Aborted"
                });
              };
              abortController.signal.addEventListener("abort", abortHandler);
            });
            dispatch(pending(requestId, arg, options?.getPendingMeta?.({
              requestId,
              arg
            }, {
              getState,
              extra
            })));
            finalAction = await Promise.race([abortedPromise, Promise.resolve(payloadCreator(arg, {
              dispatch,
              getState,
              extra,
              requestId,
              signal: abortController.signal,
              abort,
              rejectWithValue: (value, meta) => {
                return new RejectWithValue(value, meta);
              },
              fulfillWithValue: (value, meta) => {
                return new FulfillWithMeta(value, meta);
              }
            })).then((result) => {
              if (result instanceof RejectWithValue) {
                throw result;
              }
              if (result instanceof FulfillWithMeta) {
                return fulfilled(result.payload, requestId, arg, result.meta);
              }
              return fulfilled(result, requestId, arg);
            })]);
          } catch (err) {
            finalAction = err instanceof RejectWithValue ? rejected(null, requestId, arg, err.payload, err.meta) : rejected(err, requestId, arg);
          } finally {
            if (abortHandler) {
              abortController.signal.removeEventListener("abort", abortHandler);
            }
          }
          const skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
          if (!skipDispatch) {
            dispatch(finalAction);
          }
          return finalAction;
        }();
        return Object.assign(promise, {
          abort,
          requestId,
          arg,
          unwrap() {
            return promise.then(unwrapResult);
          }
        });
      };
    }
    return Object.assign(actionCreator, {
      pending,
      rejected,
      fulfilled,
      settled: isAnyOf(rejected, fulfilled),
      typePrefix
    });
  }
  createAsyncThunk2.withTypes = () => createAsyncThunk2;
  return createAsyncThunk2;
})();
var asyncThunkSymbol = Symbol.for("rtk-slice-createasyncthunk");
var asyncThunkCreator = {
  [asyncThunkSymbol]: createAsyncThunk
};
var createSlice = buildCreateSlice();
var listener = "listener";
var completed = "completed";
var cancelled = "cancelled";
var taskCancelled = `task-${cancelled}`;
var taskCompleted = `task-${completed}`;
var listenerCancelled = `${listener}-${cancelled}`;
var listenerCompleted = `${listener}-${completed}`;
var assertFunction = (func, expected) => {
  if (typeof func !== "function") {
    throw new Error(`${expected} is not a function`);
  }
};
var alm = "listenerMiddleware";
var getListenerEntryPropsFrom = (options) => {
  let {
    type,
    actionCreator,
    matcher,
    predicate,
    effect
  } = options;
  if (type) {
    predicate = createAction(type).match;
  } else if (actionCreator) {
    type = actionCreator.type;
    predicate = actionCreator.match;
  } else if (matcher) {
    predicate = matcher;
  } else if (predicate) {
  } else {
    throw new Error("Creating or removing a listener requires one of the known fields for matching an action");
  }
  assertFunction(effect, "options.listener");
  return {
    predicate,
    type,
    effect
  };
};
var createListenerEntry = Object.assign((options) => {
  const {
    type,
    predicate,
    effect
  } = getListenerEntryPropsFrom(options);
  const id = nanoid();
  const entry = {
    id,
    effect,
    type,
    predicate,
    pending: new Set,
    unsubscribe: () => {
      throw new Error("Unsubscribe not initialized");
    }
  };
  return entry;
}, {
  withTypes: () => createListenerEntry
});
var addListener = Object.assign(createAction(`${alm}/add`), {
  withTypes: () => addListener
});
var clearAllListeners = createAction(`${alm}/removeAll`);
var removeListener = Object.assign(createAction(`${alm}/remove`), {
  withTypes: () => removeListener
});
var ORIGINAL_STATE = Symbol.for("rtk-state-proxy-original");

// src/core/todoList/todo.events.js
var payload = (payload2) => ({ payload: payload2 });
var todoAddedEvent = createAction("todoListSlice/addTodo", payload);
var todoRemovedEvent = createAction("todoListSlice/removeTodo", payload);
var todoDoneEvent = createAction("todoListSlice/doneTodo", payload);
var todoAlreadyExistEvent = createAction("todoListSlice/setError", payload);

// src/core/todoList/todo.reducer.js
var addTodo = (state, event) => {
  return {
    ...state,
    todos: [
      ...state.todos,
      event.payload
    ],
    error: null
  };
};
var removeTodo = (state, event) => {
  return {
    ...state,
    todos: state.todos.filter((todo) => todo.id !== event.payload)
  };
};
var doneTodo = (state, event) => {
  return {
    ...state,
    todos: state.todos.map((todo) => {
      if (todo.id === event.payload) {
        todo = { ...todo, done: true };
      }
      return todo;
    })
  };
};
var setError = (state, event) => {
  return {
    ...state,
    error: event.payload
  };
};

// src/core/todoList/todo.state.js
var todoListSliceKey = "todoListSlice";
var todoListSlice = createSlice({
  name: todoListSliceKey,
  initialState: {
    todos: [
      {
        description: "do something",
        done: false,
        id: "1"
      }
    ],
    error: null
  },
  reducers: {
    addTodo,
    removeTodo,
    doneTodo,
    setError
  }
});

// src/core/todoList/todo.use-cases.js
var makeTodo = (idProvider) => (description) => ({ description, done: false, id: idProvider() });
var getTodos = (store) => store.getState()[todoListSliceKey].todos;
var addTodoInList = (store, todoFactory) => (value) => {
  const alreadyExist = getTodos(store).some((todo) => todo.description === value);
  if (alreadyExist)
    store.dispatch(todoAlreadyExistEvent("todo already exists"));
  else
    store.dispatch(todoAddedEvent(todoFactory(value)));
};
var removeTodoInList = (store) => (todoId) => {
  store.dispatch(todoRemovedEvent(todoId));
};
var doneTodoInList = (store) => (todoId) => {
  store.dispatch(todoDoneEvent(todoId));
};

// src/core/cards/cards.reducer.js
var setCards = (state, event) => {
  return {
    ...state,
    cards: event.payload,
    isLoading: false
  };
};

// src/core/cards/cards.state.js
var cardListSliceKey = "cardListSlice";
var cardListSlice = createSlice({
  name: cardListSliceKey,
  initialState: {
    cards: [],
    isLoading: true
  },
  reducers: {
    setCards
  }
});

// src/core/store.js
var rootReducer = combineReducers({
  [todoListSliceKey]: todoListSlice.reducer,
  [cardListSliceKey]: cardListSlice.reducer
});
var store = configureStore({
  reducer: rootReducer
});

// src/core/selector.js
var stateSelector = (store2, index) => store2.getState()[index];

// src/UI/utils.js
var ngIf = (expression, template) => {
  if (expression)
    return template;
  return "";
};
var ngIfElse = (expression, ifTemplate, elseTemplate) => {
  if (expression)
    return ifTemplate;
  return elseTemplate;
};
var ngFor = (iterable, fnTemplate) => {
  return iterable.map((item) => fnTemplate(item)).join("");
};

// src/UI/components.js
var errorComponent = (message) => `<span>${message}</span>`;
var todoButtons = (todo) => `
    <button data-action="done" ${ngIf(todo.done, "disabled")} data-id="${todo.id}">Done</button>
    <button data-action="delete" data-id="${todo.id}">Delete</button>
`;
var todoComponent = (todo) => `<li>${todo.description} ${todoButtons(todo)}</li>`;
var cardComponent = (card) => `<div><h3>${card.title}</h3><img alt="${card.img.alt}" height="200" width="200" src="${card.img.url}"><p>${card.description}</p></div>`;
var headerComponent = (model) => `
    <header>
        <ul>
            <li><router-link data-path="/">Todo</router-link></li>
            <li><router-link data-path="/cards">Cards</router-link></li>
        </ul>
    </header>`;

// src/UI/todoList.view.js
class TodoListView {
  #model = (store2) => stateSelector(store2, todoListSliceKey);
  #store;
  #root;
  #useCases;
  #addBtn;
  #doneBtns;
  #deleteBtns;
  #addInput;
  #domApi;
  #unsubscribe;
  constructor(store2, useCases, domApi) {
    this.#domApi = domApi;
    this.#store = store2;
    this.#useCases = useCases;
  }
  getModel() {
    return this.#model(this.#store);
  }
  getRootElement() {
    return this.#root;
  }
  #render() {
    this.#root = this.#domApi.querySelector("#app");
    this.#root.innerHTML = todoListComponentRender(this.getModel());
  }
  init() {
    this.#unsubscribe = this.#store.subscribe(this.#refresh.bind(this));
    this.#refresh();
  }
  #addListeners() {
    this.#addBtn = this.#domApi.querySelector("#addTodoBtn");
    this.#doneBtns = this.#domApi.querySelectorAll("[data-action='done']");
    this.#deleteBtns = this.#domApi.querySelectorAll("[data-action='delete']");
    this.#addInput = this.#domApi.querySelector("#addTodoInput");
    this.#addBtn.addEventListener("click", () => {
      this.addTodo(this.#addInput.value);
    });
    this.#doneBtns.forEach((button) => button.addEventListener("click", (event) => {
      const todoId = event.target.dataset.id;
      this.doneTodo(todoId);
    }));
    this.#deleteBtns.forEach((button) => button.addEventListener("click", (event) => {
      const todoId = event.target.dataset.id;
      this.deleteTodo(todoId);
    }));
  }
  addTodo(value) {
    this.#useCases.addTodo(value);
  }
  doneTodo(value) {
    this.#useCases.doneTodo(value);
  }
  deleteTodo(value) {
    this.#useCases.deleteTodo(value);
  }
  #refresh() {
    this.#render();
    this.#addListeners();
  }
  destroy() {
    this.#unsubscribe();
  }
}
var todoListComponentRender = (todoModel, headerModel) => {
  return `
    ${headerComponent(headerModel)}
    <div>
        <ul>
            ${ngFor(todoModel.todos, todoComponent)}
        </ul>
        <input id="addTodoInput" type="text">
        ${ngIf(todoModel.error, errorComponent(todoModel.error))}
        <button id="addTodoBtn">Add</button>
    </div>
    `;
};

// src/data/cards.data.js
var cardsData = [
  {
    title: "Two cats plays",
    img: {
      alt: "cats",
      url: "https://cats.com/wp-content/uploads/2020/10/Are-My-Cats-Fighting-or-Playing-Feature.jpg"
    },
    description: "This two cat both fighting each over to playing together"
  },
  {
    title: "Kitten kills a mouse",
    img: {
      alt: "kitten",
      url: "https://cdn.mos.cms.futurecdn.net/Xu6jixmdqUpUCqRjpVYuGh-650-80.jpg.webp"
    },
    description: "This kitten plays with a fake mouse"
  }
];

// src/adapters/adapters.js
var idProvider = () => Math.random().toString(36).substring(7).split("").join(".");
var fetchCard = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(cardsData), 200);
  });
};

// src/UI/cardList.view.js
class CardListView {
  #domApi;
  #store;
  #useCases;
  #model = (store2) => stateSelector(store2, cardListSliceKey);
  #root;
  #unsubscribe;
  constructor(store2, useCases, domApi) {
    this.#domApi = domApi;
    this.#store = store2;
    this.#useCases = useCases;
  }
  getModel() {
    return this.#model(this.#store);
  }
  getRootElement() {
    return this.#root;
  }
  #render() {
    this.#root = this.#domApi.querySelector("#app");
    this.#root.innerHTML = cardListComponentRender(this.getModel());
  }
  init() {
    this.#unsubscribe = this.#store.subscribe(this.#refresh.bind(this));
    this.#refresh();
    this.#useCases.query();
  }
  #refresh() {
    console.log("model", this.getModel());
    this.#render();
    this.#addListeners();
  }
  #addListeners() {
  }
  destroy() {
    this.#unsubscribe();
  }
}
var cardList = (cards) => `
    <div>
        <ul>
            ${ngFor(cards, cardComponent)}
        </ul>
    </div>`;
var loader = () => `<p>...Loading</p>`;
var cardListComponentRender = (cardsModel, headerModel) => {
  return `
    ${headerComponent(headerModel)}
    ${ngIfElse(cardsModel.isLoading, loader(), cardList(cardsModel.cards))}
    `;
};

// src/core/cards/cards.events.js
var payload2 = (payload3) => ({ payload: payload3 });
var cardsReceivedEvent = createAction("cardListSlice/setCards", payload2);

// src/core/cards/cards.use-cases.js
var queryCards = (store2, fetchCard2) => {
  return () => {
    fetchCard2().then((cards) => store2.dispatch(cardsReceivedEvent(cards)));
  };
};

// src/UI/router.js
var todoListProvider = {
  addTodo: addTodoInList(store, makeTodo(idProvider)),
  deleteTodo: removeTodoInList(store),
  doneTodo: doneTodoInList(store)
};
var cardListProvider = {
  query: queryCards(store, fetchCard)
};
var todoListView = new TodoListView;

class Router {
  #state = "/";
  #currentView;
  static #INSTANCE = null;
  static getInstance() {
    if (Router.#INSTANCE === null) {
      Router.#INSTANCE = new Router;
    }
    return Router.#INSTANCE;
  }
  #init() {
    switch (this.#state) {
      case "/":
        if (this.#currentView)
          this.#currentView.destroy();
        this.#currentView = new TodoListView(store, todoListProvider, document);
        this.#currentView.init();
        break;
      case "/cards":
        if (this.#currentView)
          this.#currentView.destroy();
        this.#currentView = new CardListView(store, cardListProvider, document);
        this.#currentView.init();
        break;
      default:
        throw new Error("unknown path");
    }
  }
  navigate(path) {
    this.#state = path;
    this.#init();
  }
}

class RouterLink extends HTMLElement {
  #router;
  #path;
  constructor() {
    super();
    this.#router = Router.getInstance();
    this.#path = this.getAttribute("data-path");
    this.addEventListener("click", this.#handleClick.bind(this));
  }
  #handleClick(event) {
    event.preventDefault();
    this.#router.navigate(this.#path);
  }
}

// src/index.js
var main = function() {
  customElements.define("router-link", RouterLink);
  const router2 = Router.getInstance();
  window.addEventListener("popstate", () => {
    router2.navigate(window.location.pathname);
  });
  router2.navigate("/");
};
main();
