const bells = new Audio('./assets/happy-bell-alert.wav');
let arrastando = null;

/* ===== CRIAR CRONÔMETRO ===== */
function criarCronometro(dados = null) {
    const c = document.createElement('div');
    c.className = 'cronometro';
    c.dataset.id = dados?.id || crypto.randomUUID();

    c.innerHTML = `
        <div class="drag-handle"></div>
        <button class="remover">✕</button>
        <h1 contenteditable="true">${dados?.titulo || 'Novo Timer'}</h1>
        <p contenteditable="true">${dados?.tempo || '05:00'}</p>
        <div class="acoes">
            <button class="start"><img src="./assets/play.png"></button>
            <button class="pause"><img src="./assets/pause.png"></button>
            <button class="reset"><img src="./assets/reset.png"></button>
        </div>
    `;

    document.body.insertBefore(c, document.querySelector('.add'));

    ativarTimer(c);
    ativarDrag(c);
    salvar();
}

/* ===== TIMER ===== */
function ativarTimer(c) {
    const titulo = c.querySelector('h1');
    const tempoEl = c.querySelector('p');
    const start = c.querySelector('.start');
    const pause = c.querySelector('.pause');
    const reset = c.querySelector('.reset');
    const remover = c.querySelector('.remover');

    let base = parseTempo(tempoEl.innerText);
    let total = base;
    let interval = null;
    let pausado = false;

    if (base <= 0) {
        base = 300;
        total = 300;
        tempoEl.innerText = '05:00';
    }

    tempoEl.addEventListener('blur', () => {
        base = parseTempo(tempoEl.innerText);
        if (base <= 0) base = 300;
        total = base;
        tempoEl.innerText = formatar(base);
        salvar();
    });

    titulo.addEventListener('blur', salvar);

    start.addEventListener('click', () => {
        if (interval) return;
        pausado = false;

        interval = setInterval(() => {
            if (pausado) return;

            tempoEl.innerText = formatar(total);
            total--;

            if (total < 0) {
                clearInterval(interval);
                interval = null;
                tempoEl.innerText = 'Acabou!';
                bells.play();
            }

            salvar();
        }, 1000);
    });

    pause.addEventListener('click', () => {
        pausado = !pausado;
    });

reset.addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    pausado = false;

    total = base;
    tempoEl.innerText = formatar(base);

    // já inicia automaticamente
    interval = setInterval(() => {
        if (pausado) return;

        tempoEl.innerText = formatar(total);
        total--;

        if (total < 0) {
            clearInterval(interval);
            interval = null;
            tempoEl.innerText = 'Acabou!';
            bells.play();
        }

        salvar();
    }, 1000);

    salvar();
});

    remover.addEventListener('click', () => {
        c.remove();
        salvar();
    });
}

/* ===== DRAG & DROP (HANDLE) ===== */
function ativarDrag(c) {
    const handle = c.querySelector('.drag-handle');
    handle.setAttribute('draggable', 'true');

    handle.addEventListener('dragstart', (e) => {
        arrastando = c;
        e.dataTransfer.setData('text/plain', c.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    });

    c.addEventListener('dragover', (e) => e.preventDefault());

    c.addEventListener('drop', () => {
        if (!arrastando || arrastando === c) return;

        const pai = c.parentNode;
        const a = [...pai.children].indexOf(arrastando);
        const b = [...pai.children].indexOf(c);

        if (a < b) {
            pai.insertBefore(arrastando, c.nextSibling);
        } else {
            pai.insertBefore(arrastando, c);
        }

        salvar();
    });
}

/* ===== STORAGE ===== */
function salvar() {
    const dados = [...document.querySelectorAll('.cronometro')].map(c => ({
        id: c.dataset.id,
        titulo: c.querySelector('h1').innerText,
        tempo: c.querySelector('p').innerText
    }));

    localStorage.setItem('cronometros', JSON.stringify(dados));
}

function carregar() {
    const dados = JSON.parse(localStorage.getItem('cronometros'));
    if (!dados || dados.length === 0) {
        criarCronometro();
        return;
    }
    dados.forEach(d => criarCronometro(d));
}

/* ===== UTIL ===== */
function parseTempo(t) {
    if (!t.includes(':')) return 300;
    const [m, s] = t.split(':').map(Number);
    return isNaN(m) || isNaN(s) ? 300 : m * 60 + s;
}

function formatar(seg) {
    return `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;
}

/* ===== BOTÃO + ===== */
document.getElementById('addCronometro').addEventListener('click', criarCronometro);

/* ===== INIT ===== */
window.addEventListener('load', carregar);
