import { DOMRenderer } from 'frosty/dom';
import { App } from './App';

const root = document.getElementById('root');

DOMRenderer.createRoot(root!).mount(<App />);