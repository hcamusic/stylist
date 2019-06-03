// dependencies
const Koa = require('koa');
const cors = require('@koa/cors');
const axios = require('axios').create({
  baseURL: 'https://hcamusic.org'
});

const app = new Koa();

const injectorStylePattern = /@import url\(".*\/(css_injector)\/.*\);/gm;
// middleware
app.use(async (ctx, next) => {
  const header = { ...ctx.request.header };

  const proxyResponse = await axios({
    ...ctx.request,
    headers: {
      'User-Agent': header['user-agent'],
      Cookie: header.cookie
    },
    transformResponse: [
      data => {
        if (data.startsWith('<')) {
          return (
            '<script src="http://localhost:1234/entry.js"></script>' +
            '<link rel="stylesheet" href="http://localhost:1234/entry.css">' +
            data.replace(injectorStylePattern, '')
          );
        }

        return data;
      }
    ]
  });

  ctx.body = proxyResponse.data;

  await next();
});

app.use(cors());

app.listen(8080);
