const autocannon = require('autocannon');

async function run() {
  const target = process.env.API_URL || 'https://loanshark-api.onrender.com/graphql';

  const instance = autocannon({
    url: target,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.API_KEY || 'change-me'
    },
    body: JSON.stringify({
      query: '{ loans { id borrowerName } }'
    }),
    connections: 50,
    duration: 10
  });

  autocannon.track(instance);
}

run();
