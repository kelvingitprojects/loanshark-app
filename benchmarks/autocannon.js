const autocannon = require('autocannon');

async function run() {
  const instance = autocannon({
    url: 'http://localhost:4000/graphql',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.API_KEY || 'change-me'
    },
    body: JSON.stringify({ query: '{ loans { id borrowerName } }' }),
    connections: 50,
    duration: 10
  });

  autocannon.track(instance);
}

run();