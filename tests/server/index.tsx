//
//  index.js
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import path from 'path';
import { Server } from '@o2ter/server-js';
import { App } from './main/App';
import { ServerDOMRenderer } from 'frosty/server-dom';

const app = new Server({
  http: 'v1',
  express: {
    cors: {
      credentials: true,
      origin: true,
    },
    rateLimit: {
      windowMs: 1000,
      limit: 1000,
    },
  },
});

app.use(Server.static(path.join(__dirname, 'public'), { cacheControl: true }));

app.express().get('*', async (req, res) => {
  const renderer = new ServerDOMRenderer();
  const component = (
    <html>
      <head>
        <script src="/main_bundle.js" defer />
        <style>{`
html {
  display: flex;
  width: 100%;
}

body, #root {
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
  font-smooth: auto;
}

#root {
  display: flex;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
}
`}</style>
      </head>
      <body>
        <div id="root"><App /></div>
      </body>
    </html>
  );
  res.setHeader('Content-Type', 'text/html');
  res.send(await renderer.renderToString(component));
});

const PORT = !_.isEmpty(process.env.PORT) ? parseInt(process.env.PORT!) : 8080;

app.listen(PORT, () => console.info(`listening on port ${PORT}`));
