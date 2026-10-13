// NODE_PATH=/tmp/oge-browser-tests/node_modules node tests/oge-browser.cjs
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('oge-data.js', 'utf8'), context);
const tasks = vm.runInContext('ogeTasks', context);
const server = spawn('python3', ['-m', 'http.server', '4178', '--bind', '127.0.0.1']);
(async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || '/usr/bin/brave', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Test offline resilience: the optional comments CDN must not break the lessons.
    await page.route('https://**/*', route => route.abort());
    const visit = async route => {
      await page.goto(`http://127.0.0.1:4178/index.html#${route}`);
      await page.waitForSelector('#app h1');
    };
    await visit('/oge');
    assert.match(await page.locator('h1').innerText(), /ОГЭ/);
    await page.locator('.main-nav a[data-nav="oge"]').click();
    for (const task of tasks) {
      await visit(`/oge/tasks/${task.number}`);
      assert.match(await page.locator('h1').innerText(), new RegExp(`^${task.number}\\.`));
      await page.locator('#oge-answer').fill('неверно');
      await page.locator('.oge-answer-form button').click();
      assert.match(await page.locator('.oge-feedback').innerText(), task.extended ? /Автоматический балл/ : /Пока неверно/);
      if (!task.extended) {
        await page.locator('#oge-answer').fill(task.answer);
        await page.locator('.oge-answer-form button').click();
        assert.match(await page.locator('.oge-feedback').innerText(), /Верно!/);
        await page.locator('[data-reveal]').click();
        assert.equal(await page.locator('#oge-solution').isVisible(), true);
      }
      await page.locator('[data-reveal]').click();
      assert.equal(await page.locator('#oge-solution').isVisible(), false);
    }
    await visit('/oge/tasks/14');
    await page.locator('#oge-answer').fill('31');
    await page.locator('.oge-answer-form button').click();
    assert.match(await page.locator('.oge-feedback').innerText(), /Верно!/);
    await visit('/oge/tasks/24');
    await page.locator('#oge-answer').fill('−0.2');
    await page.locator('.oge-answer-form button').click();
    assert.match(await page.locator('.oge-feedback').innerText(), /Верно!/);
    await page.evaluate(() => localStorage.setItem('ege-test-progress', 'unchanged'));
    await visit('/oge/preparation');
    await page.locator('[data-oge-check]').first().check();
    assert.match(await page.locator('#oge-progress-text').innerText(), /1 из 30/);
    await page.reload();
    assert.equal(await page.locator('[data-oge-check]').first().isChecked(), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('ege-test-progress')), 'unchanged');
    for (const checkbox of await page.locator('[data-oge-check]').all()) await checkbox.check();
    assert.match(await page.locator('#oge-progress-text').innerText(), /30 из 30 пунктов · 100%/);
    await page.locator('[data-oge-check]').first().uncheck();
    assert.match(await page.locator('#oge-progress-text').innerText(), /29 из 30/);
    for (const route of ['/', '/tasks', '/demo', '/preparation', ...Array.from({length:29},(_,i)=>`/tasks/${i+1}`)]) {
      await visit(route);
      assert.doesNotMatch(await page.locator('h1').innerText(), /Похоже/);
    }
    await visit('/tasks/1');
    const reveal = page.locator('[data-reveal]').first();
    await reveal.click();
    assert.equal(await reveal.getAttribute('aria-expanded'), 'true');
    await visit('/oge/demo');
    assert.equal(await page.locator('iframe').getAttribute('src'), 'assets/oge/oge-geography-demo-2027.pdf');
    for (const filename of ['demo', 'spec', 'codifier']) {
      const response = await page.request.get(`http://127.0.0.1:4178/assets/oge/oge-geography-${filename}-2027.pdf`);
      assert.equal(response.status(), 200);
      assert.equal((await response.body()).subarray(0,5).toString(), '%PDF-');
    }
    // Every internal link rendered on new pages must point to a known route or local file.
    for (const route of ['/oge', '/oge/tasks', '/oge/preparation', '/oge/demo']) {
      await visit(route);
      for (const href of await page.locator('a[href]').evaluateAll(items => items.map(item => item.getAttribute('href')))) {
        if (href.startsWith('#')) assert.match(href, /^#\/(?:oge(?:\/(?:tasks(?:\/(?:[1-9]|[12]\d|30))?|preparation|demo))?|tasks|preparation|demo)?$/);
        else if (!href.startsWith('https:')) assert.equal(fs.existsSync(href), true);
      }
    }
    for (const width of [360, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ['/oge','/oge/tasks','/oge/preparation','/oge/demo', ...tasks.map(t=>`/oge/tasks/${t.number}`), '/', '/tasks/1']) {
        await visit(route);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} overflows at ${width}`);
      }
    }
    await visit('/oge/tasks/18');
    await page.screenshot({ path: '/tmp/oge-mobile.png', fullPage: true });
    // Corrupt storage and blocked storage must not break the app.
    await page.evaluate(() => localStorage.setItem('geoshag:oge:2027:plan:v1', '{bad json'));
    await visit('/oge/preparation');
    await page.reload();
    assert.match(await page.locator('#oge-save-status').innerText(), /недоступно/);
    await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
    await page.reload();
    await page.locator('[data-oge-check]').first().check();
    assert.match(await page.locator('#oge-progress-text').innerText(), /1 из 30/);
    await visit('/oge/tasks/31');
    assert.match(await page.locator('h1').innerText(), /Похоже/);
    assert.deepEqual(errors, []);
    console.log('PASS: 30 OGE exercises, 29 EGE lessons, all routes, answers, reveal, storage, PDF, internal links, 360/390/768px layouts, no JS errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.kill());
