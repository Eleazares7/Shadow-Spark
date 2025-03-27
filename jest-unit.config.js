// C:/wamp64/www/EdgardoGame/jest-unit.config.js
export default {
    testEnvironment: 'jsdom', // Para pruebas unitarias sin navegador
    testRegex: 'game\\.test\\.js$', // Solo coincide con game.test.js
    transform: {
      '^.+\\.js$': 'babel-jest', // Transforma archivos JS con Babel
    },
  };