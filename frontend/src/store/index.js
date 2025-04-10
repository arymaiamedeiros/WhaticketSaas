import { createStore } from 'redux';
import rootReducer from './reducers'; // Ajuste o caminho conforme necessário

const store = createStore(rootReducer);

export default store;
