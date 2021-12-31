import express from 'express';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { JSDOM } from 'jsdom';
import { homePageTemplate, page2Template } from './templates';

/**
 * execute `npm run test` to run the test
 */

describe('iframe redirection', function () {
  let connection: Server;
  let port: number;
  let dom: JSDOM;

  test('handles redirection correctly', () =>
    new Promise((resolve, reject) => {
      {
        // here I'm configuring an express test server
        // which will serve pages to the tested iframe

        const app = express();

        // path /page1 redirects to /page2
        app.get('/page1', (_req, res) => {
          res.redirect(`http://localhost:${port}/page2`);
        });

        app.get('/page2', (_req, res) => {
          res
            .status(200)
            .header('content-type', 'text/html; charset=UTF-8')
            .send(page2Template);
        });

        app.get('/', (_req, res) => {
          res
            .status(200)
            .header('content-type', 'text/html; charset=UTF-8')
            .send(homePageTemplate);
        });

        // let's spin the test server and begin the test:

        connection = app.listen(0, async () => {
          port = (connection.address() as AddressInfo).port;

          console.log(`test server running at http://localhost:${port}`);

          // creating dom

          dom = await JSDOM.fromURL(`http://localhost:${port}`, {
            resources: 'usable',
            pretendToBeVisual: true,
          });

          // creating iframe

          const iframe = dom.window.document.createElement('iframe');

          const iframeOnLoad = jest.fn(() => {
            try {
              // the iframe should have been redirected to /page2
              // after trying to load /page1
              const iframeLocation =
                iframe.contentWindow?.document.location.href;
              expect(iframeLocation).toContain('/page2'); // ← FAILS
              resolve(true);
            } catch (err) {
              reject(err);
            }
          });

          const iframeOnError = () => {
            reject(new Error('iframe failed to load'));
          };

          iframe.addEventListener('load', iframeOnLoad, false);
          iframe.addEventListener('error', iframeOnError, false);

          dom.window.document.body.appendChild(iframe);

          // let's try to load /page1 to trigger the redirect
          iframe.src = `http://localhost:${port}/page1`;
        });
      }
    }));

  afterAll((done) => {
    if (dom) dom.window.close();
    connection?.close(() => {
      done();
    });
  });
});
