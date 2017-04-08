import React from 'react';
import ReactDOM from 'react-dom';
import {Iterable} from 'immutable';

import App  from './App';
import AppStore  from './store';
import './index.css';

Iterable.prototype[Symbol.for('get')] = function(value) {return this.get(value);} 

var store = new AppStore();
var render = function(v) {
  ReactDOM.render(
      <App components={v} store={store}/>,
    document.getElementById('root')
  );
}

render(store.getState());
store.subscribe(render);

