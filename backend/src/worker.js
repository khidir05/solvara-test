// Thin entrypoint so `npm run start:worker` can stay simple.
// This will initialize the BullMQ worker defined in `src/workers/index.js`.

require('./workers');

