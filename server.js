const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body').default;
const cors = require('@koa/cors');
const customId = require('custom-id');

let allTickets = [
  {
    id: '1',
    name: 'Do something',
    description: 'bla-bla-bla-bla-bla',
    status: false,
    created: '05.02.2020, 08:00:00',
  },
  {
    id: '2',
    name: 'Do something else',
    description: 'tro-lo-lo',
    status: false,
    created: '05.02.2020, 15:00:00',
  },
];

const app = new Koa();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use(cors());

app.use(async (ctx) => {
  const { method } = ctx.request.query;

  switch (method) {
    case 'allTickets':
      ctx.response.body = allTickets;
      return;

    case 'ticketById': {
      const correctTicket = allTickets
        .find((el) => el.id.toString() === ctx.request.query.id);

      ctx.response.body = correctTicket;
      return;
    }

    case 'createTicket':
      ctx.response.body = 'OK';
      ctx.request.body.id = customId({ lowerCase: true });
      ctx.request.body.status = false;

      allTickets.push(ctx.request.body);
      return;

    case 'changeStatus':
      ctx.response.body = allTickets;
      allTickets.forEach((el) => {
        if (el.id === ctx.request.query.id) {
          if (el.status) {
            el.status = false;
            return;
          }
          el.status = true;
        }
      });
      return;

    case 'deleteTicket':
      allTickets = allTickets.filter((el) => el.id !== ctx.request.query.id);

      ctx.response.body = allTickets;
      return;

    case 'editTicket':
      allTickets.forEach((el) => {
        if (el.id === ctx.request.query.id) {
          el.name = ctx.request.body.name;
          el.description = ctx.request.body.description;
        }
      });

      ctx.response.body = allTickets;
      return;

    default:
      ctx.response.status = 404;
  }
});

const server = http.createServer(app.callback());
const port = 7070;

server.listen(port, (err) => {
  if (err) {
    console.error(err);

    return;
  }

  console.log('it`s alive!!!');
});
