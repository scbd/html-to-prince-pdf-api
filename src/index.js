const createApp = require('./app');
const winston = require('./logger')(__filename);
const config = require('./config');

winston.debug('Log level is debug');

const app = createApp();
const server = app.listen(config.PORT, () => {
  winston.info(
    'Express server listening on http://localhost:%d/ in %s mode',
    config.PORT,
    app.get('env')
  );
});

function closeServer(signal) {
  winston.error(`${signal} received`);
  process.exit(0);
}

process.on('SIGTERM', closeServer.bind(this, 'SIGTERM'));
process.on('SIGINT',  closeServer.bind(this, 'SIGINT(Ctrl-C)'));

