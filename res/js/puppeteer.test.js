const puppeteer = require('puppeteer');

// Espera breve
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Shadow & Spark Puppeteer Tests', () => {
    let browser;
    let page;

    // Configuración inicial
    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto('http://localhost/shadowspark/index.html', { waitUntil: 'networkidle0' });
    });

    // Cierre del navegador
    afterAll(async () => {
        await browser.close();
    });

    // Prueba de carga
    test('La página carga correctamente', async () => {
        const title = await page.title();
        expect(title).toBe('Shadow & Spark');
        const canvas = await page.$('#canvas');
        expect(canvas).not.toBeNull();
    }, 5000);

    // Prueba de Canvas
    test('El Canvas tiene el tamaño correcto', async () => {
        const size = await page.evaluate(() => {
            const canvas = document.querySelector('#canvas');
            return { width: canvas.width, height: canvas.height };
        });
        expect(size.width).toBeGreaterThan(0); // Ejemplo, ajusta al tamaño real
        expect(size.height).toBeGreaterThan(0);
    }, 5000);

    // Pruebas de controles de Shadow
    test('Shadow se mueve a la derecha con D', async () => {
        await page.keyboard.press('KeyD');
        await delay(100);
        const position = await page.evaluate(() => window.shadowPosition?.x || 0);
        expect(position).toBeGreaterThan(0); // Verifica movimiento
    }, 5000);

    test('Shadow salta con W', async () => {
        await page.keyboard.press('KeyW');
        await delay(100);
        const jumping = await page.evaluate(() => window.shadowJumping || false);
        expect(jumping).toBe(true); // Verifica salto
    }, 5000);

    // Pruebas de controles de Spark
    test('Spark se mueve a la derecha con Flecha Derecha', async () => {
        await page.keyboard.press('ArrowRight');
        await delay(100);
        const position = await page.evaluate(() => window.sparkPosition?.x || 0);
        expect(position).toBeGreaterThan(0); // Verifica movimiento
    }, 5000);

    test('Spark salta con Flecha Arriba', async () => {
        await page.keyboard.press('ArrowUp');
        await delay(100);
        const jumping = await page.evaluate(() => window.sparkJumping || false);
        expect(jumping).toBe(true); // Verifica salto
    }, 5000);

    // Pruebas de interacción
    test('Spark activa palancas con Flecha Abajo', async () => {
        await page.keyboard.press('ArrowDown');
        await delay(100);
        const lever = await page.evaluate(() => window.leverActivated || false);
        expect(lever).toBe(true); // Verifica activación
    }, 5000);

    // Pruebas de ítems
    test('Recolectar una llave funciona', async () => {
        await page.keyboard.press('KeyK'); // Ejemplo para llaves
        await delay(100);
        const keys = await page.evaluate(() => window.keysCollected || 0);
        expect(keys).toBeGreaterThan(0); // Verifica recolección
    }, 5000);

    // Pruebas de niveles
    test('El Nivel 1 se carga', async () => {
        await page.click('#startButton'); // Ejemplo de botón para iniciar
        await delay(200);
        const level = await page.evaluate(() => window.currentLevel || 0);
        expect(level).toBe(1); // Verifica carga del nivel
    }, 5000);

    // Prueba de colaboración
    test('Shadow y Spark sincronizan acciones', async () => {
        await page.keyboard.press('KeyD'); // Shadow mueve
        await page.keyboard.press('ArrowDown'); // Spark activa
        await delay(200);
        const door = await page.evaluate(() => window.doorOpened || false);
        expect(door).toBe(true); // Verifica sincronización
    }, 5000);
});