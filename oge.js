const ogePdf = 'assets/oge/oge-geography-demo-2027.pdf';
const ogeStorageKey = 'geoshag:oge:2027:plan:v1';
let ogeProgress = {};
let ogeStorageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(ogeStorageKey) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) ogeProgress = saved;
} catch { ogeStorageAvailable = false; }

function ogeNavigation(route) {
  return `<nav class="task-navigation oge-nav" aria-label="Разделы ОГЭ">${[
    ['/oge', 'Обзор ОГЭ'], ['/oge/tasks', 'Задания ОГЭ'], ['/oge/preparation', 'План подготовки'], ['/oge/demo', 'Демоверсия 2027'],
  ].map(([path, label]) => `<a href="#${path}" ${route === path || (path === '/oge/tasks' && route.startsWith('/oge/tasks/')) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}
function ogeHeading(route, title, description) {
  return `<section class="page-heading"><div class="container">${ogeNavigation(route)}<span class="eyebrow">ОГЭ по географии · 2027</span><h1>${title}</h1><p class="lead">${description}</p></div></section>`;
}
function ogeNumberLinks(numbers = ogeTasks.map(task => task.number)) {
  return numbers.map(number => `<a class="number-card" href="#/oge/tasks/${number}" aria-label="ОГЭ ${number}: ${ogeTasks[number - 1].title}">${number}</a>`).join('');
}
function ogeHomePage() {
  return ogeHeading('/oge', 'Твой маршрут к ОГЭ', 'Карты, закономерности и практика — готовься последовательно, отслеживай темы и разбирай ошибки.') + `
    <section class="section section-compact"><div class="container"><div class="benefits">
      <a class="benefit benefit-link" href="#/oge/tasks"><span class="benefit-icon">🧭</span><h2>Задания ОГЭ</h2><p>30 упражнений: ответы, объяснения, карты и таблицы.</p></a>
      <a class="benefit benefit-link" href="#/oge/preparation"><span class="benefit-icon">🗺️</span><h2>План подготовки</h2><p>С сентября до экзамена: темы, практика и личный чек-лист.</p></a>
      <a class="benefit benefit-link" href="#/oge/demo"><span class="benefit-icon">📄</span><h2>Демоверсия 2027</h2><p>Описание экзамена, инструкция и PDF для скачивания.</p></a>
    </div></div></section>`;
}
function ogeTasksPage() {
  return ogeHeading('/oge/tasks', 'Задания ОГЭ', 'Выбери нужный номер и закрепляй навыки на упражнениях, картах и таблицах.') + `
    <section class="all-tasks"><div class="container"><div class="number-grid">${ogeNumberLinks()}</div>
    <div class="topic-grid oge-topics">${ogeTasks.map(task => `<article><a href="#/oge/tasks/${task.number}"><b>${task.number}. ${task.title}</b></a><span>${task.extended ? 'Развёрнутый ответ · самопроверка' : 'Краткий ответ · автоматическая проверка'}</span></article>`).join('')}</div></div></section>`;
}
function ogeTable(caption, headings, rows) {
  return `<div class="oge-table-wrap"><table class="oge-table"><caption>${caption}</caption><thead><tr>${headings.map(item => `<th scope="col">${item}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(item => `<td>${item}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function ogeVisual(type) {
  if (type === 'map') return `<figure class="oge-figure"><svg viewBox="0 0 480 170" role="img" aria-labelledby="oge-map-title"><title id="oge-map-title">Схема: север сверху, А слева, Б справа. Расстояние А–Б на исходной карте 4 см, масштаб 1:25 000.</title><path d="M60 90H360 M420 65V20 M410 35L420 20L430 35" fill="none" stroke="#0b827b" stroke-width="3"/><circle cx="60" cy="90" r="6"/><circle cx="360" cy="90" r="6"/><g font-size="20"><text x="50" y="75">А</text><text x="350" y="75">Б</text><text x="410" y="90">С</text><text x="180" y="80">4 см</text><text x="140" y="140">1:25 000</text></g></svg><figcaption>Учебная схема. Не измеряй экран: используй указанное расстояние исходной карты.</figcaption></figure>`;
  if (type === 'weather') return `<figure class="oge-figure"><svg viewBox="0 0 500 240" role="img" aria-labelledby="oge-weather-title"><title id="oge-weather-title">Центр Н вблизи пункта Б. А западнее, Г южнее. Холодный фронт между Б и В движется на восток к В.</title><g fill="none" stroke="#91b9b4" stroke-width="2"><ellipse cx="190" cy="105" rx="90" ry="65"/><ellipse cx="190" cy="105" rx="145" ry="95"/></g><path d="M310 35V180 M365 160H425 M415 150L425 160L415 170" fill="none" stroke="#2563aa" stroke-width="3"/><path d="M310 50l18 12-18 12z M310 95l18 12-18 12z M310 140l18 12-18 12z" fill="#2563aa"/><g font-size="21"><text x="175" y="105">Н</text><text x="60" y="105">• А</text><text x="200" y="120">• Б</text><text x="380" y="105">• В</text><text x="190" y="220">• Г</text></g></svg><figcaption>Схематическая синоптическая карта. Треугольники — холодный фронт; стрелка — направление его движения.</figcaption></figure>`;
  if (type === 'table') return ogeTable('Учебные климатические данные', ['Пункт', 'Широта', 'Июль, °C'], [['А', '50° с. ш.', '+23'], ['Б', '55° с. ш.', '+20'], ['В', '60° с. ш.', '+17']]);
  if (type === 'population') return ogeTable('Учебные демографические данные за один год, человек', ['Регион', 'Родилось', 'Умерло', 'Прибыло', 'Выбыло'], [['1', '800', '1000', '700', '900'], ['2', '1500', '1100', '500', '600'], ['3', '600', '900', '300', '200']]);
  if (type === 'climate') {
    const temperatures = [9,10,12,15,19,23,26,26,23,18,13,10];
    const rain = [90,75,60,40,25,10,5,10,35,65,85,100];
    return `<figure class="oge-figure"><svg viewBox="0 0 510 270" role="img" aria-labelledby="oge-climate-title"><title id="oge-climate-title">Учебная климатограмма: мягкая зима, жаркое лето, максимум осадков зимой. Точные данные доступны в таблице ниже.</title><g fill="none" stroke="#ccdcd9">${[0,10,20,30].map(value => `<path d="M45 ${210-value*5}H465"/>`).join('')}</g><g font-size="14">${[0,10,20,30].map(value => `<text x="12" y="${215-value*5}">${value}</text><text x="470" y="${215-value*5}">${value*4}</text>`).join('')}<text x="10" y="25">°C</text><text x="460" y="25">мм</text></g>${rain.map((value, i) => `<rect x="${53+i*34}" y="${210-value*1.25}" width="20" height="${value*1.25}" fill="#85bbb4"/>`).join('')}<polyline points="${temperatures.map((value,i) => `${63+i*34},${210-value*5}`).join(' ')}" fill="none" stroke="#b34632" stroke-width="3"/><g font-size="14">${['Я','Ф','М','А','М','И','И','А','С','О','Н','Д'].map((month,i)=>`<text x="${57+i*34}" y="232">${month}</text>`).join('')}</g></svg><figcaption>Линия — температура (левая шкала), столбцы — осадки (правая шкала).</figcaption></figure><details><summary>Точные данные климатограммы</summary>${ogeTable('Учебные среднемесячные значения', ['Месяц','°C','мм'], temperatures.map((value,i) => [i+1,value,rain[i]]))}</details>`;
  }
  if (type === 'text' || type === 'long-text') return `<blockquote class="task-example">Камчатка — полуостров на востоке России. Вблизи его берегов океаническая плита погружается под другую литосферную плиту. Здесь много действующих вулканов; магма может выходить на поверхность. Регион отличается высокой сейсмической активностью.</blockquote>`;
  return '';
}
function ogeTaskPage(task) {
  const route = `/oge/tasks/${task.number}`;
  return ogeHeading(route, `${task.number}. ${task.title}`, task.extended ? 'Авторское упражнение с развёрнутым ответом. Оцени смысл своего объяснения по образцу.' : 'Авторское упражнение с кратким ответом. Сначала реши самостоятельно, затем проверь.') + `
    <section><div class="container content-grid"><div><article class="lesson-block">
      <h2>Попробуй решить</h2><p>${task.question}</p>${ogeVisual(task.visual)}
      <form class="oge-answer-form" data-oge-task="${task.number}"><label for="oge-answer">Твой ответ</label>
        ${task.extended ? '<textarea id="oge-answer" name="answer" rows="5" maxlength="3000" required></textarea>' : '<input id="oge-answer" name="answer" type="text" maxlength="100" autocomplete="off" required aria-describedby="oge-format">'}
        <p id="oge-format" class="source-note">${task.extended ? 'Сформулируй ответ своими словами. Автоматическая оценка развёрнутого ответа не выставляется.' : 'Введи число, слово или цифры без единиц измерения. В последовательностях важен порядок; при выборе двух вариантов — нет.'}</p>
        <button class="button" type="submit">${task.extended ? 'Сравнить с образцом' : 'Проверить ответ'}</button><p class="oge-feedback" role="status" aria-live="polite"></p>
      </form>
      <button class="button button-light" type="button" data-reveal="oge-solution" aria-expanded="false" aria-controls="oge-solution">Показать ответ</button>
      <div class="revealed-answer" id="oge-solution" hidden><p><strong>${task.extended ? 'Возможный ответ' : 'Ответ'}:</strong> ${task.answer}</p><p><strong>Разбор:</strong> ${task.explanation}</p></div>
    </article><nav class="task-navigation" aria-label="Переход между заданиями ОГЭ">${task.number > 1 ? `<a href="#/oge/tasks/${task.number-1}">← Предыдущее</a>` : '<span></span>'}<a href="#/oge/tasks">Все задания</a>${task.number < 30 ? `<a href="#/oge/tasks/${task.number+1}">Следующее →</a>` : '<span></span>'}</nav></div>
    <aside class="practice-card"><p class="practice-label">КАК ЗАНИМАТЬСЯ</p><h2>Разберись, а не запомни</h2><p>Выдели условие, найди нужную карту или данные, проверь ход решения. После ошибки повтори навык завтра и через неделю.</p><a class="button button-light" href="#/oge/preparation">Открыть план</a></aside></div></section>`;
}
function ogePreparationPage() {
  return ogeHeading('/oge/preparation', 'От сентября до экзамена', 'Ориентир — три занятия по 35–45 минут в неделю: теория и атлас, практика, повторение ошибок. Подстрой нагрузку под свой стартовый уровень.') + `
    <section><div class="container"><article class="lesson-block"><h2>Твой прогресс</h2><p id="oge-progress-text" aria-live="polite"></p><progress id="oge-progress" max="30" value="0" aria-label="Выполненные пункты плана ОГЭ"></progress><p class="source-note" id="oge-save-status">Отметки сохраняются только в этом браузере. Прогресс ОГЭ не связан с ЕГЭ.</p></article>
    <div class="plan-grid oge-plan">${ogePlan.map(month => `<article class="lesson-block"><span class="eyebrow">${month.month}</span><h2>${month.title}</h2>${month.checks.map((text,i) => {const id = `${month.id}-${i+1}`; return `<label class="oge-check"><input type="checkbox" data-oge-check="${id}" ${ogeProgress[id] === true ? 'checked' : ''}><span>${text}</span></label>`;}).join('')}<p><strong>Проверка и повторение:</strong> ${month.review}</p>${month.numbers.length ? `<p>Практика по позициям проекта:</p><div class="oge-number-links">${month.numbers.map(n=>`<a href="#/oge/tasks/${n}">${n}</a>`).join('')}</div>` : '<p>Практика: полный вариант и индивидуальные слабые темы.</p>'}</article>`).join('')}</div>
    <article class="lesson-block"><h2>Как работать с планом</h2><p>Галочка означает, что ты выполнил действие, а не гарантирует экзаменационный балл. Если начал позже сентября, сначала проведи диагностику и проходи знакомые темы быстрее. На трудные темы оставляй отдельные занятия, а не увеличивай бесконечно длительность одного урока.</p><p>В журнале ошибок записывай: дату, тему, причину ошибки, верный ход и даты повторения. Для развёрнутых ответов сверяй аргументы с критериями конкретного варианта.</p></article></div></section>`;
}
function ogeDemoPage() {
  return ogeHeading('/oge/demo', 'Демоверсия ОГЭ по географии — 2027', 'Познакомься со структурой экзамена, инструкцией и заданиями.') + `
    <section class="section section-compact"><div class="container"><div class="action-row"><a class="button" href="${ogePdf}" target="_blank" rel="noopener">Открыть PDF</a><a class="button button-light" href="${ogePdf}" download>Скачать PDF</a></div>
    <div class="stat-grid oge-topics"><article><strong>30</strong><span>заданий</span></article><article><strong>150</strong><span>минут</span></article><article><strong>31</strong><span>максимальный первичный балл</span></article><article><strong>12, 29, 30</strong><span>развёрнутые ответы</span></article></div>
    <article class="lesson-block"><h2>Как устроена работа</h2><p>27 заданий с кратким ответом и 3 с развёрнутым. В №1, 4–6, 11, 16–18 ответ — одна цифра; в №2, 3, 7–10, 13–15, 19–28 — число, слово или последовательность цифр. В №24 возможна десятичная дробь. №12 оценивается максимум в 2 балла, остальные — в 1 балл.</p><p>Разрешены географические атласы для 7, 8 и 9 классов, линейка и непрограммируемый калькулятор. В кратком ответе не пиши единицы измерения, а последовательности переноси без пробелов и запятых. Черновик не проверяется.</p><p>Для некоторых позиций приведены альтернативы «ИЛИ»: в экзаменационной работе будет одно задание на каждой позиции.</p></article>
    <article class="lesson-block"><h2>Демоверсия в браузере</h2><p>Если просмотр не поддерживается на телефоне, воспользуйся кнопкой открытия или скачивания выше.</p><iframe class="oge-pdf" src="${ogePdf}" title="Демоверсия ОГЭ по географии 2027" loading="lazy"></iframe></article></div></section>`;
}
function ogePage(route) {
  if (route === '/oge') return ogeHomePage();
  if (route === '/oge/tasks') return ogeTasksPage();
  if (route === '/oge/preparation') return ogePreparationPage();
  if (route === '/oge/demo') return ogeDemoPage();
  const match = route.match(/^\/oge\/tasks\/([1-9]|[12]\d|30)$/);
  return match ? ogeTaskPage(ogeTasks[Number(match[1])-1]) : notFoundPage();
}
function ogeNormalize(value) {
  return value.trim().toLowerCase().replace(/ё/g, 'е').replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/\./g, ',');
}
function ogeCorrect(task, value) {
  let normalized = ogeNormalize(value);
  if (task.visual === 'set') normalized = normalized.split('').sort().join('');
  return task.accepted.some(answer => ogeNormalize(answer) === normalized);
}
function ogeUpdateProgress() {
  const count = ogePlan.reduce((sum, month) => sum + month.checks.filter((_,i) => ogeProgress[`${month.id}-${i+1}`] === true).length, 0);
  const bar = document.querySelector('#oge-progress');
  if (!bar) return;
  bar.value = count;
  document.querySelector('#oge-progress-text').textContent = `${count} из 30 пунктов · ${Math.round(count / 30 * 100)}%`;
  document.querySelector('#oge-save-status').textContent = ogeStorageAvailable ? 'Отметки сохраняются только в этом браузере. Прогресс ОГЭ не связан с ЕГЭ.' : 'Хранилище недоступно: отметки работают в текущей вкладке, но могут не сохраниться после перезагрузки.';
}
function bindOgeEvents() {
  ogeUpdateProgress();
  document.querySelectorAll('[data-oge-check]').forEach(input => input.addEventListener('change', () => {
    ogeProgress[input.dataset.ogeCheck] = input.checked;
    try { localStorage.setItem(ogeStorageKey, JSON.stringify(ogeProgress)); ogeStorageAvailable = true; }
    catch { ogeStorageAvailable = false; }
    ogeUpdateProgress();
  }));
  const form = document.querySelector('[data-oge-task]');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const task = ogeTasks[Number(form.dataset.ogeTask)-1];
    const value = form.elements.answer.value.trim();
    const feedback = form.querySelector('.oge-feedback');
    if (!value) { feedback.textContent = 'Сначала введи свой ответ.'; return; }
    feedback.textContent = task.extended ? 'Сравни смысл ответа с образцом ниже. Автоматический балл не выставляется.' : ogeCorrect(task, value) ? 'Верно! Теперь объясни ход решения своими словами.' : 'Пока неверно. Проверь условие и формат ответа или открой разбор.';
    if (task.extended) {
      document.querySelector('#oge-solution').hidden = false;
      const button = document.querySelector('[data-reveal="oge-solution"]');
      button.setAttribute('aria-expanded', 'true'); button.textContent = 'Скрыть ответ';
    }
  });
  form.elements.answer.addEventListener('input', () => { form.querySelector('.oge-feedback').textContent = ''; });
}
