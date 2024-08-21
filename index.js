let canvas;
let scr;
let goalDisplay;
let dificuldade = 'normal'; // Inicialização padrão
let pixel = 20;
let pontos = 0;
let objetivo = 1; // Objetivo inicial para fase 1
let faseAtual = 1; // Inicia na fase 1
let direction = 'RIGHT';
let snake = [];
let comida = { x: 0, y: 0 };
let paredes = []; // Array para armazenar as paredes
let jogoRodando = false;
const button1 = document.querySelector('.telaInicio .button-container a:nth-of-type(1)');
const button2 = document.querySelector('.telaInicio .button-container a:nth-of-type(2)');
const button3 = document.querySelector('.telaInicio .button-container a:nth-of-type(3)');
const button4 = document.querySelector('.telaInicio .button-container a:nth-of-type(4)');

function setup() {
    // Cria o canvas e configura o ambiente do jogo
    canvas = createCanvas(500, 500);
    canvas.parent('telaJogo'); // Associando o canvas ao contêiner no HTML
    frameRate(10); // Define a taxa de quadros padrão

    // Seleciona os elementos da pontuação e objetivo
    scr = select('#score');
    goalDisplay = select('#goal');

    // Esconde todas as telas menos a inicial
    select('.gameContainer').hide();
    select('.gameOver').hide();
    select('.win').hide();
    select('.dificuldade').hide();
    select('.fases').hide();
    select('.credits-container').hide();
    select('.opcoes-container').hide();
    select('.telaInicio').show(); // Mostra a tela inicial

    // Configura os botões da interface do usuário
    setupButtons();

    // Pausa o loop do p5.js até o jogo começar
    noLoop();
}

function draw() {
    if (jogoRodando) {
        background(209, 199, 199);
        ciclo();
        desenharParedes();
        fill(255, 0, 0);
        rect(comida.x, comida.y, pixel, pixel);
    }
}

function atualizarObjetivo() {
    if (objetivo === 1) {
        goalDisplay.html(`Objetivo: ${objetivo} pontos - Fase 1/3`);
    } else if (objetivo === 2) {
        goalDisplay.html(`Objetivo: ${objetivo} pontos - Fase 2/3`);
    } else if (objetivo === 3) {
        goalDisplay.html(`Objetivo: ${objetivo} pontos - Fase 3/3`);
    }
}

function perdeu() {
    let gameMusic = select('#gameMusic');
    gameMusic.elt.pause(); // Para a música
    gameMusic.elt.currentTime = 0; // Reinicia a música para o começo
    jogoRodando = false;
    noLoop(); // Pausa o loop do p5.js
    select('.gameContainer').hide();
    select('.gameOver').show().style('display', 'flex');
}

function sortearComida() {
    comida.x = Math.floor(Math.random() * (width / pixel)) * pixel;
    comida.y = Math.floor(Math.random() * (height / pixel)) * pixel;
}

function gerarCobra() {
    fill(0, 255, 0);
    snake.forEach(segments => {
        rect(segments.x, segments.y, pixel, pixel);
    });
}

function gerarParedes() {
    const head = snake[0]; // Cabeça da cobra
    paredes = []; // Limpa paredes anteriores para garantir que novas paredes apareçam

    let numParedes;
    if (faseAtual === 1) {
        numParedes = 6;
    } else if (faseAtual === 2) {
        numParedes = 8;
    } else if (faseAtual === 3) {
        numParedes = 14;
    }

    for (let i = 0; i < numParedes; i++) {
        let parede;
        let validPosition = false;

        while (!validPosition) {
            parede = {
                x: Math.floor(Math.random() * (width / pixel)) * pixel,
                y: Math.floor(Math.random() * (height / pixel)) * pixel
            };

            // Verifica se a parede está fora do raio de 2 blocos da cabeça da cobra
            if (Math.abs(parede.x - head.x) > pixel * 2 || 
                Math.abs(parede.y - head.y) > pixel * 2) {
                validPosition = true;
            }
        }
        paredes.push(parede);
    }
}

function atualizarParedes() {
    gerarParedes(); // Gera novas paredes
    setTimeout(atualizarParedes, 3000); // Chama a função novamente após 3 segundos
}

function desenharParedes() {
    fill(139, 69, 19);
    paredes.forEach(parede => {
        rect(parede.x, parede.y, pixel, pixel);
    });
}

function headDirection() {
    let eatSound = select('#eatSound');
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'RIGHT':
            head.x += pixel;
            break;
        case 'LEFT':
            head.x -= pixel;
            break;
        case 'UP':
            head.y -= pixel;
            break;
        case 'DOWN':
            head.y += pixel;
            break;
    }
    snake.unshift(head);

    if (comida.x === head.x && comida.y === head.y) {
        pontos++;
        scr.html(pontos);
        eatSound.elt.play();
        sortearComida();
        if (pontos >= objetivo) {
            avancarFase(); // Avança para a próxima fase se o objetivo for atingido
        }
    } else {
        snake.pop();
    }
}

function keyPressed() {
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    if (keyCode === UP && direction !== 'DOWN') {
        direction = 'UP';
    } else if (keyCode === DOWN && direction !== 'UP') {
        direction = 'DOWN';
    } else if (keyCode === RIGHT && direction !== 'LEFT') {
        direction = 'RIGHT';
    } else if (keyCode === LEFT && direction !== 'RIGHT') {
        direction = 'LEFT';
    }
}

function checkColision() {
    const head = snake[0];

    // Colisão com as bordas
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
        perdeu();
    }

    // Colisão com o próprio corpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            perdeu();
        }
    }

    // Colisão com as paredes
    for (let i = 0; i < paredes.length; i++) {
        if (head.x === paredes[i].x && head.y === paredes[i].y) {
            perdeu();
        }
    }
}

function ciclo() {
    checkColision();
    headDirection();
    gerarCobra();
}

function iniciarJogo() {
    let gameMusic = select('#gameMusic');
    gameMusic.elt.play(); // Inicia a música

    pontos = 0;
    direction = 'RIGHT';
    snake = [
        { x: pixel * 5, y: pixel * 5 },
        { x: pixel * 4, y: pixel * 5 },
        { x: pixel * 3, y: pixel * 5 },
        { x: pixel * 2, y: pixel * 5 }
    ];
    scr.html(pontos);
    atualizarObjetivo();
    sortearComida();
    gerarParedes();
    atualizarParedes(); // Inicia o ciclo de atualização das paredes a cada 3 segundos

    // Ajusta a velocidade conforme a dificuldade
    if (dificuldade === 'facil') {
        frameRate(7); // Velocidade mais lenta para fácil
    } else if (dificuldade === 'normal') {
        frameRate(10); // Velocidade padrão para normal
    } else if (dificuldade === 'dificil') {
        frameRate(15); // Velocidade mais rápida para difícil
    }

    showAsFlex('.gameContainer'); // Mostra a tela do jogo como flex
    jogoRodando = true;
    loop(); // Inicia o loop do p5.js
}

function avancarFase() {
    if (faseAtual === 1) {
        faseAtual++;
        objetivo = 2; // Objetivo da fase 2
    } else if (faseAtual === 2) {
        faseAtual++;
        objetivo = 3; // Objetivo da fase 3
    } else if (faseAtual === 3) {
        venceuJogo(); // Jogador venceu o jogo
        return;
    }
    iniciarJogo(); // Reinicia o jogo na próxima fase
}

function venceuJogo() {
    noLoop(); // Pausa o loop do p5.js
    select('.gameContainer').hide();
    select('.win').show().style('display', 'flex');
}

function voltarParaInicio() {
    let gameMusic = select('#gameMusic');
    gameMusic.elt.pause(); // Para a música se estiver tocando
    gameMusic.elt.currentTime = 0; // Reinicia a música para o começo

    pontos = 0;
    faseAtual = 1; // Reset da fase
    objetivo = 1; // Reset do objetivo para fase 1
    scr.html('0'); // Reset da pontuação na tela
    select('.gameOver').hide();
    select('.win').hide();
    select('.gameContainer').hide();
    showAsFlex('.telaInicio'); // Volta para a tela de início como flex
    jogoRodando = false;
    noLoop(); // Pausa o loop do p5.js
}

function setupButtons() {
    select('#resetBtn').mousePressed(() => {
        perdeu();
        iniciarJogo();
    });

    select('#back').mousePressed(voltarParaInicio);
    select('#backToStartGameOver').mousePressed(voltarParaInicio);
    select('#backToStartWin').mousePressed(voltarParaInicio);

    // Botões da tela inicial
    select('.telaInicio .button-container a:nth-of-type(1)').mousePressed(() => {
        select('.telaInicio').hide();
        selecionarDificuldade();
    });

    select('.telaInicio .button-container a:nth-of-type(2)').mousePressed(() => {
        select('.inicio').hide();
        showAsFlex('.credits-container'); // Exibe a tela de créditos como flex
        button1.style.display = 'none';
        button2.style.display='none';
        button3.style.display ='none';
        button4.style.display = 'flex';
        select('#voltar').mousePressed(()=>{
            button1.style.display = 'flex';
            button2.style.display='flex';
            button3.style.display ='flex';
            button4.style.display = 'none';
            select('.credits-container').hide();
            select('.inicio').show();
        })
    });

    select('.telaInicio .button-container a:nth-of-type(3)').mousePressed(() => {
        select('.inicio').hide();
        showAsFlex('.opcoes-container'); // Exibe a tela de opções como flex
        button1.style.display = 'none';
        button2.style.display='none';
        button3.style.display ='none';
        button4.style.display = 'flex';
        select('#voltar').mousePressed(()=>{
            button1.style.display = 'flex';
            button2.style.display='flex';
            button3.style.display ='flex';
            button4.style.display = 'none';
            select('.opcoes-container').hide();
            select('.inicio').show();
        })
    });

    // Botão de voltar para a tela inicial a partir de créditos e opções
    select('.credits-container').mousePressed(() => {
        select('.credits-container').hide();
        select('.inicio').show(); // Retorna à tela inicial
    });

    select('.opcoes-container').mousePressed(() => {
        select('.opcoes-container').hide();
        select('.inicio').show(); // Retorna à tela inicial
    });
}

function selecionarDificuldade() {
    select('.telaInicio').hide();
    showAsFlex('.dificuldade');

    select('#facil').mousePressed(() => {
        dificuldade = 'facil';
        selecionarFase();
    });

    select('#normal').mousePressed(() => {
        dificuldade = 'normal';
        selecionarFase();
    });

    select('#dificil').mousePressed(() => {
        dificuldade = 'dificil';
        selecionarFase();
    });
}

function selecionarFase() {
    select('.dificuldade').hide();
    showAsFlex('.fases');

    selectAll('.fases-container div').forEach((option, index) => {
        option.mousePressed(() => {
            faseAtual = index + 1; // Define a fase escolhida
            if (faseAtual === 1) {
                objetivo = 1;
            } else if (faseAtual === 2) {
                objetivo = 2;
            } else if (faseAtual === 3) {
                objetivo = 3;
            }
            select('.fases').hide();
            iniciarJogo();
        });
    });
}

function showAsFlex(selector) {
    select(selector).show().style('display', 'flex');
}
