import _ from 'lodash';
import { useState, useEffect } from 'frosty';

export const App = () => {
  const [counter, setCounter] = useState(0);
  const [counter2, setCounter2] = useState(0);
  const [text, setText] = useState('');
  useEffect(() => {
    const handle = setInterval(() => { setCounter(v => v + 1); }, 1);
    return () => clearTimeout(handle);
  }, []);
  return (
    <div
      style={{
        padding: 64,
        margin: 16,
        backgroundColor: `rgb(${counter % 256}, 0, 0)`,
      }}
      inlineStyle={{
        padding: 32,
        margin: 16,
      }}
    >
      <table bgColor='aliceblue'>
        {_.map(_.range(2), i => <tr>
          {_.map(_.range(2), j => <td>{i * counter + j}</td>)}
        </tr>
        )}
      </table>
      <div innerHTML={`<span>${counter}</span>`} />
      <button onClick={() => setCounter2(v => v + 1)}>Click</button>
      <span>{counter2}</span>
      <input value={text} onInput={(e) => {
        setText(e.currentTarget.value);
      }} />
      <input value={text} onInput={(e) => {
        setText(e.currentTarget.value);
      }} />
    </div>
  );
};
