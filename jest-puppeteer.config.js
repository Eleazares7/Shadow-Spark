// C:/wamp64/www/EdgardoGame/jest-puppeteer.config.js
export default {
    launch: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    browserContext: 'default',
  };