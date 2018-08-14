const config = {
  PORT: Number(process.env.PORT) || 7070,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  PRINCE_PDF_LICENSE_FILE: process.env.PRINCE_PDF_LICENSE_FILE,
};

module.exports = config;
