const Koa = require('koa');
const proxy = require('koa-proxy');

const app = new Koa();

const injectorStylePattern = /@import url\(".*\/(css_injector)\/.*\);/gm;

app.use(
  proxy({
    host: 'https://hcamusic.org',
    suppressRequestHeaders: ['accept-encoding'],
    yieldNext: true
  })
);

app.use(async (ctx, next) => {
  const body = ctx.response.body.toString('utf8');
  const headers = ctx.response.header;

  if (headers['content-type'].includes('text/html')) {
    ctx.response.body =
      body
        .replace(/https:\/\/hcamusic.org/g, 'http://localhost:8080')
        .replace(injectorStylePattern, '') +
      '<script src="http://localhost:1234/entry.js"></script>' +
      '<link rel="stylesheet" href="http://localhost:1234/entry.css">';
  }

  await next();
});

app.listen(8080);
