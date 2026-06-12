// ======================================
// DRONE GUARDIÃO DA FLORESTA
// AGRINHO 2026 — CAPANEMA - PR
// Aluno: Gabriel — 1º TDS
// Colégio São Cristóvão
// Professor Orientador: Jean Ceconi
// ======================================

// ======================================
// CONSTANTES DO JOGO (Melhora legibilidade e manutenção)
// ======================================
const TELA_INICIO = "inicio";
const TELA_INTRODUCAO = "introducao";
const TELA_JOGO = "jogo";
const TELA_PAUSE = "pause"; // Nova tela de pausa
const TELA_FIM = "fim";

const DRONE_WIDTH = 180;
const DRONE_HEIGHT = 100;
const ARVORE_WIDTH = 90;
const ARVORE_HEIGHT = 130;
const ABELHA_SIZE = 70;
const QUATI_SIZE = 120;
const ONCA_WIDTH = 280;
const ONCA_HEIGHT = 180;

const PONTOS_POR_ACERTO = 10;
const TEMPO_FEEDBACK_MS = 2000;
const ALTURA_SOLO = 155;

const INTRO_DRONE_SPEED = 3;
const INTRO_MESSAGE_DURATION = 300;

// ======================================
// IMAGENS
// ======================================
var fundo;
var droneIMG;
var arvoreIMG;
var abelhaIMG;
var quatiIMG;
var oncaIMG;
var fundoParallax;

// ======================================
// ESTADO GLOBAL DO JOGO (Centralizado para melhor gerenciamento)
// ======================================
var gameState = {
  tela: TELA_INICIO,
  droneX: 100,
  droneY: 180,
  pontos: 0,
  arvoresPlantadas: 3,
  faseAtual: 0,
  acertos: 0,
  mostrarOnca: false,
  oncaX: -ONCA_WIDTH,
  oncaDirecao: 1,
  oncaVelocidade: 1.5,

  // Estado da introdução
  introDroneX: -DRONE_WIDTH,
  introDroneTargetX: 0, // Será definido no setup
  introMensagemAlpha: 0,
  introMensagemTempo: 0,

  // Estado da animação final
  animacaoFinalAtiva: false,
  particulasVitoria: [],
  somVitoriaTocando: false,

  // Feedback visual
  mensagemErro: false,
  tempoInicioErro: 0,
  mensagemAcerto: false,
  tempoInicioAcerto: 0,
  fadeAlpha: 0,

  // Efeitos visuais
  shakeScreen: 0, // Intensidade do tremor de tela
  pontosFlutuantes: [], // Para animação de pontos ganhos
};

// ======================================
// ANIMAIS
// ======================================
var abelhas = [];
var quatis = [];

// ======================================
// SEMENTE E CRESCIMENTO
// ======================================
var sementes = [];
var arvoresCrescendo = [];
var audioCtx = null;

// ======================================
// PERGUNTAS
// ======================================
var perguntas = [
  {
    pergunta: "Qual atitude economiza agua?",
    a: "Desperdicar",
    b: "Irrigacao consciente",
    correta: "b"
  },
  {
    pergunta: "O que protege a natureza?",
    a: "Queimadas",
    b: "Preservar florestas",
    correta: "b"
  },
  {
    pergunta: "Qual energia e sustentavel?",
    a: "Energia solar",
    b: "Poluicao",
    correta: "a"
  },
  {
    pergunta: "O que devemos proteger?",
    a: "Os rios",
    b: "A fumaca",
    correta: "a"
  },
  {
    pergunta: "O que evita poluicao?",
    a: "Reciclagem",
    b: "Queimar lixo",
    correta: "a"
  },
  {
    pergunta: "Qual atitude ajuda animais?",
    a: "Desmatamento",
    b: "Preservacao",
    correta: "b"
  },
  {
    pergunta: "O que devemos economizar?",
    a: "Agua",
    b: "Poluicao",
    correta: "a"
  },
  {
    pergunta: "Qual pratica ajuda o solo?",
    a: "Preservar vegetacao",
    b: "Jogar lixo",
    correta: "a"
  },
  {
    pergunta: "O que e agro sustentavel?",
    a: "Produzir preservando",
    b: "Poluir rios",
    correta: "a"
  },
  {
    pergunta: "Qual atitude melhora o futuro?",
    a: "Cuidar do ambiente",
    b: "Destruir florestas",
    correta: "a"
  }
];

// ======================================
// CLASSES PARA ENTIDADES DO JOGO
// ======================================

// Classe para Abelhas
class Abelha {
  constructor(x, y, velocidade) {
    this.x = x;
    this.y = y;
    this.velocidade = velocidade;
    this.offsetY = random(TWO_PI);
  }

  update() {
    this.x += this.velocidade;
    if (this.x > width + 100) {
      this.x = -100;
      this.y = random(height - 350, height - 250);
      this.velocidade = random(2 + gameState.faseAtual * 0.2, 4 + gameState.faseAtual * 0.2); // Dificuldade progressiva
    }
  }

  display() {
    const ay = this.y + sin(frameCount * 0.08 + this.offsetY) * 6;
    if (abelhaIMG) {
      image(abelhaIMG, this.x, ay, ABELHA_SIZE, ABELHA_SIZE);
    } else {
      fill(255, 200, 0);
      noStroke();
      ellipse(this.x + ABELHA_SIZE / 2, ay + ABELHA_SIZE / 2, ABELHA_SIZE * 0.7, ABELHA_SIZE * 0.6);
    }
  }
}

// Classe para Quatis
class Quati {
  constructor(x, y, velocidade) {
    this.x = x;
    this.y = y;
    this.velocidade = velocidade;
  }

  update() {
    this.x += this.velocidade;
    if (this.x > width + 100) {
      this.x = -150;
      this.velocidade = random(1 + gameState.faseAtual * 0.1, 2 + gameState.faseAtual * 0.1); // Dificuldade progressiva
    }
  }

  display() {
    if (quatiIMG) {
      image(quatiIMG, this.x, this.y, QUATI_SIZE, QUATI_SIZE);
    } else {
      fill(160, 100, 60);
      noStroke();
      ellipse(this.x + QUATI_SIZE / 2, this.y + QUATI_SIZE / 2, QUATI_SIZE * 0.8, QUATI_SIZE * 0.7);
    }
  }
}

// Classe para Sementes
class Semente {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.dx = targetX;
    this.dy = targetY;
    this.vx = (targetX - startX) * 0.035;
    this.vy = -8;
    this.gravidade = 0.45;
    this.pousou = false;
    this.alpha = 255;
    this.rotacao = 0;
    this.particulasRastro = [];
  }

  update() {
    if (!this.pousou) {
      this.vy += this.gravidade;
      this.x += this.vx;
      this.y += this.vy;
      this.rotacao += 0.12;

      if (frameCount % 3 === 0) {
        this.particulasRastro.push(new ParticulaRastro(this.x, this.y));
      }

      for (let i = this.particulasRastro.length - 1; i >= 0; i--) {
        this.particulasRastro[i].update();
        if (this.particulasRastro[i].isDead()) {
          this.particulasRastro.splice(i, 1);
        }
      }

      if (this.y >= this.dy) {
        this.y = this.dy;
        this.pousou = true;
        somPouso();
      }
    } else {
      this.alpha -= 8;
    }
  }

  display() {
    for (let p of this.particulasRastro) {
      p.display();
    }

    if (!this.pousou) {
      push();
      translate(this.x, this.y);
      rotate(this.rotacao);
      noStroke();
      fill(0, 0, 0, 60);
      ellipse(2, 2, 16, 12);
      fill(120, 70, 20);
      ellipse(0, 0, 16, 12);
      fill(160, 100, 40);
      ellipse(-2, -1, 7, 4);
      pop();
    } else {
      noStroke();
      fill(120, 70, 20, this.alpha);
      ellipse(this.x, this.y, 14, 10);
    }
  }

  isDead() {
    return this.pousou && this.alpha <= 0;
  }
}

// Classe para Árvores Crescendo
class ArvoreCrescendo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.escala = 0.0;
    this.maxEscala = 1.0;
    this.crescendo = true;
    this.particulasSolo = gerarParticulasSolo(x + ARVORE_WIDTH / 2, y + ARVORE_HEIGHT - 15);
  }

  update() {
    if (this.crescendo) {
      this.escala += 0.012;
      if (this.escala >= this.maxEscala) {
        this.escala = this.maxEscala;
        this.crescendo = false;
      }
    }
    for (let i = this.particulasSolo.length - 1; i >= 0; i--) {
      this.particulasSolo[i].update();
      if (this.particulasSolo[i].isDead()) {
        this.particulasSolo.splice(i, 1);
      }
    }
  }

  display() {
    if (this.crescendo) {
      noFill();
      stroke(0, 220, 0, map(this.escala, 0, 1, 200, 0));
      strokeWeight(3);
      ellipse(
        this.x + ARVORE_WIDTH / 2,
        this.y + ARVORE_HEIGHT - 5,
        (ARVORE_WIDTH + 40) * this.escala,
        (ARVORE_HEIGHT + 40) * this.escala
      );
      noStroke();
    }

    push();
    translate(this.x + ARVORE_WIDTH / 2, this.y + ARVORE_HEIGHT);
    scale(this.escala);
    translate(-(this.x + ARVORE_WIDTH / 2), -(this.y + ARVORE_HEIGHT));

    if (arvoreIMG) {
      image(arvoreIMG, this.x, this.y, ARVORE_WIDTH, ARVORE_HEIGHT);
    } else {
      noStroke();
      fill(80, 50, 20);
      rect(35, 85, 20, 45);
      fill(34, 139, 34);
      triangle(45, 0, 0, 85, 90, 85);
      fill(0, 160, 0);
      triangle(45, 20, 8, 90, 82, 90);
    }
    pop();

    for (let p of this.particulasSolo) {
      p.display();
    }
  }

  isDead() {
    return !this.crescendo && this.particulasSolo.length === 0;
  }
}

// Classe para Partículas de Solo
class ParticulaSolo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3.5, 3.5);
    this.vy = random(-5, -1);
    this.life = 35;
    this.cor = [random(100, 160), random(60, 100), random(20, 50)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.35;
    this.life--;
  }

  display() {
    noStroke();
    fill(this.cor[0], this.cor[1], this.cor[2], map(this.life, 0, 35, 0, 210));
    ellipse(this.x, this.y, 7, 7);
  }

  isDead() {
    return this.life <= 0;
  }
}

// Classe para Partículas de Rastro da Semente
class ParticulaRastro {
  constructor(x, y) {
    this.x = x + random(-5, 5);
    this.y = y + random(-5, 5);
    this.life = 20;
    this.alpha = 120;
    this.size = random(4, 8);
  }

  update() {
    this.life--;
    this.alpha = map(this.life, 0, 20, 0, 120);
  }

  display() {
    noStroke();
    fill(180, 120, 40, this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.life <= 0;
  }
}

// Classe para Partículas do Drone
class ParticulaDrone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.5, 0.5);
    this.vy = random(0.5, 1.5);
    this.life = 30;
    this.alpha = 100;
    this.size = random(2, 5);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.alpha = map(this.life, 0, 30, 0, 100);
  }

  display() {
    noStroke();
    fill(200, 200, 200, this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.life <= 0;
  }
}

var droneParticulas = [];

// Nova classe para partículas da animação de vitória
class ParticulaVitoria {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-5, -1);
    this.gravidade = 0.1;
    this.life = 120;
    this.cor = color(random(200, 255), random(150, 255), random(100, 255), 200);
    this.size = random(5, 15);
    this.rotacao = random(TWO_PI);
    this.rotacaoVel = random(-0.1, 0.1);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravidade;
    this.life--;
    this.rotacao += this.rotacaoVel;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotacao);
    noStroke();
    fill(this.cor, map(this.life, 0, 120, 0, 200));
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);
    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Nova classe para pontos flutuantes
class PontosFlutuantes {
  constructor(x, y, pontos) {
    this.x = x;
    this.y = y;
    this.pontos = "+" + pontos;
    this.alpha = 255;
    this.vy = -1; // Sobe
    this.life = 120; // Tempo de vida
  }

  update() {
    this.y += this.vy;
    this.alpha = map(this.life, 0, 120, 0, 255);
    this.life--;
  }

  display() {
    fill(255, 255, 0, this.alpha); // Amarelo para pontos
    textAlign(CENTER);
    textSize(20);
    text(this.pontos, this.x, this.y);
  }

  isDead() {
    return this.life <= 0;
  }
}


// ======================================
// PRELOAD
// ======================================
function preload() {
  fundo = loadImage("fundo.png");
  // fundoParallax = loadImage("fundo_maior.png");
  droneIMG = loadImage("drone.png");
  arvoreIMG = loadImage("arvore.png");
  abelhaIMG = loadImage("abelha.png");
  quatiIMG = loadImage("quati.png");
  oncaIMG = loadImage("onca.png");
}

// ======================================
// SETUP
// ======================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // Otimização: evita renderização em alta DPI desnecessária
  textFont("sans-serif");
  gameState.introDroneTargetX = width / 2 - DRONE_WIDTH / 2;
  reiniciarJogo();
}

// ======================================
// AUDIO — Web Audio API (sem arquivos)
// ======================================
function iniciarAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function somLancar() {
  iniciarAudio();
  if (!audioCtx) { return; }
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.25);
}

function somPouso() {
  iniciarAudio();
  if (!audioCtx) { return; }
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
}

function somCrescimento() {
  iniciarAudio();
  if (!audioCtx) { return; }
  var notas = [261, 329, 392];
  for (var i = 0; i < notas.length; i++) {
    (function (nota, delay) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(nota, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(0.0, audioCtx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.6);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.65);
    })(notas[i], i * 0.18);
  }
}

function somErro() {
  iniciarAudio();
  if (!audioCtx) { return; }
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.4);
}

function somVitoria() {
  iniciarAudio();
  if (!audioCtx || gameState.somVitoriaTocando) { return; }

  gameState.somVitoriaTocando = true;
  const now = audioCtx.currentTime;

  const noise = audioCtx.createBufferSource();
  const bufferSize = audioCtx.sampleRate * 1;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;
  noise.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(100, now);
  filter.frequency.linearRampToValueAtTime(1000, now + 1.5);
  filter.Q.setValueAtTime(10, now);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.05, now);
  noiseGain.gain.linearRampToValueAtTime(0.0, now + 2.0);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + 2.0);

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const osc3 = audioCtx.createOscillator();
  const gainVitoria = audioCtx.createGain();

  osc1.type = "triangle";
  osc2.type = "triangle";
  osc3.type = "triangle";

  osc1.frequency.setValueAtTime(261.63, now + 1.8);
  osc2.frequency.setValueAtTime(329.63, now + 1.8);
  osc3.frequency.setValueAtTime(392.00, now + 1.8);

  gainVitoria.gain.setValueAtTime(0.0, now + 1.8);
  gainVitoria.gain.linearRampToValueAtTime(0.3, now + 2.0);
  gainVitoria.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

  osc1.connect(gainVitoria);
  osc2.connect(gainVitoria);
  osc3.connect(gainVitoria);
  gainVitoria.connect(audioCtx.destination);

  osc1.start(now + 1.8);
  osc2.start(now + 1.8);
  osc3.start(now + 1.8);

  osc1.stop(now + 3.0);
  osc2.stop(now + 3.0);
  osc3.stop(now + 3.0);

  setTimeout(() => {
    gameState.somVitoriaTocando = false;
  }, 3000);
}


// ======================================
// DRAW PRINCIPAL
// ======================================
function draw() {
  // Aplica tremor de tela se ativo
  if (gameState.shakeScreen > 0) {
    translate(random(-gameState.shakeScreen, gameState.shakeScreen), random(-gameState.shakeScreen, gameState.shakeScreen));
    gameState.shakeScreen -= 0.5; // Diminui o tremor gradualmente
  }

  desenharFundo();
  desenharArvoresEstaticas();
  desenharAnimais();

  atualizarEDesenharSementes();
  atualizarEDesenharArvoresCrescendo();

  // Desenha pontos flutuantes
  for (let i = gameState.pontosFlutuantes.length - 1; i >= 0; i--) {
    const p = gameState.pontosFlutuantes[i];
    p.update();
    p.display();
    if (p.isDead()) {
      gameState.pontosFlutuantes.splice(i, 1);
    }
  }

  if (gameState.tela === TELA_INICIO) {
    telaInicio();
  } else if (gameState.tela === TELA_INTRODUCAO) {
    telaIntroducao();
  } else if (gameState.tela === TELA_JOGO) {
    telaJogo();
  } else if (gameState.tela === TELA_PAUSE) {
    telaJogo(); // Desenha o jogo por baixo
    telaPause();
  } else if (gameState.tela === TELA_FIM) {
    telaFinal();
  }

  desenharFeedbackMensagens();
  drawCreditos();
  aplicarTransicaoTela();
}

// ======================================
// FUNÇÕES DE DESENHO E ATUALIZAÇÃO GERAIS
// ======================================

function desenharFundo() {
  if (fundoParallax) {
    let parallaxOffset = map(gameState.droneX, 0, width, 0, -width / 4);
    image(fundoParallax, parallaxOffset, 0, fundoParallax.width, height);
    if (fundoParallax.width + parallaxOffset < width) {
      image(fundoParallax, fundoParallax.width + parallaxOffset, 0, fundoParallax.width, height);
    }
  } else if (fundo) {
    image(fundo, 0, 0, width, height);
  } else {
    background(34, 139, 34);
  }
}

function desenharArvoresEstaticas() {
  const yArvore = height - ALTURA_SOLO;
  const espacamento = width / (gameState.arvoresPlantadas + 1);

  for (let i = 0; i < gameState.arvoresPlantadas; i++) {
    const x = espacamento * (i + 1) - ARVORE_WIDTH / 2;
    if (arvoreIMG) {
      image(arvoreIMG, x, yArvore, ARVORE_WIDTH, ARVORE_HEIGHT);
    } else {
      fill(80, 50, 20);
      noStroke();
      rect(x + 35, yArvore + 80, 20, 50);
      fill(34, 139, 34);
      triangle(x + 45, yArvore, x, yArvore + 85, x + 90, yArvore + 85);
    }
  }
}

function desenharAnimais() {
  for (let a of abelhas) {
    if (gameState.tela === TELA_JOGO) a.update(); // Atualiza apenas no jogo
    a.display();
  }
  for (let q of quatis) {
    if (gameState.tela === TELA_JOGO) q.update(); // Atualiza apenas no jogo
    q.display();
  }
}

function atualizarEDesenharSementes() {
  for (let i = sementes.length - 1; i >= 0; i--) {
    const s = sementes[i];
    if (gameState.tela === TELA_JOGO) s.update(); // Atualiza apenas no jogo
    s.display();
    if (s.isDead()) {
      sementes.splice(i, 1);
    }
  }
}

function atualizarEDesenharArvoresCrescendo() {
  for (let i = arvoresCrescendo.length - 1; i >= 0; i--) {
    const a = arvoresCrescendo[i];
    if (gameState.tela === TELA_JOGO) a.update(); // Atualiza apenas no jogo
    a.display();
    if (a.isDead()) {
      arvoresCrescendo.splice(i, 1);
    }
  }
}

function desenharFeedbackMensagens() {
  if (gameState.mensagemErro) { drawMensagemErro(); }
  if (gameState.mensagemAcerto) { drawMensagemAcerto(); }
}

function aplicarTransicaoTela() {
  if (gameState.fadeAlpha > 0) {
    fill(0, gameState.fadeAlpha);
    rect(0, 0, width, height);
    gameState.fadeAlpha = max(0, gameState.fadeAlpha - 5);
  }
}

// ======================================
// TELA INICIAL
// ======================================
function telaInicio() {
  const cx = width / 2;
  const boxW = min(700, width - 40);
  const boxH = 360;
  const boxX = cx - boxW / 2;
  const boxY = height / 2 - 220;

  fill(255, 245);
  noStroke();
  rect(boxX, boxY, boxW, boxH, 20);

  fill(0, 100, 0);
  textAlign(CENTER);
  textSize(larguraAdaptada(38, 26));
  text("DRONE GUARDIAO DA FLORESTA", cx, boxY + 60);

  fill(50);
  textSize(larguraAdaptada(20, 14));
  text("Agrinho 2026  |  Capanema - PR", cx, boxY + 100);
  text("Parque Nacional do Iguacu", cx, boxY + 128);

  if (droneIMG) {
    image(droneIMG, cx - DRONE_WIDTH / 2, boxY + 148, DRONE_WIDTH, DRONE_HEIGHT);
  } else {
    fill(30, 144, 255);
    rect(cx - DRONE_WIDTH / 2, boxY + 148, DRONE_WIDTH, DRONE_HEIGHT, 8);
  }

  const btnW = 240;
  const btnH = 60;
  const btnX = cx - btnW / 2;
  const btnY = boxY + boxH + 28;

  const hover = mouseIsOverButton(btnX, btnY, btnW, btnH);
  fill(hover ? color(0, 200, 0) : color(0, 170, 0));
  noStroke();
  rect(btnX, btnY, btnW, btnH, 15);

  fill(255);
  textSize(larguraAdaptada(28, 20));
  text("INICIAR", cx, btnY + btnH / 2 + 10);

  // Armazena o botão para clique
  currentButtons = [{ id: "iniciar", x: btnX, y: btnY, w: btnW, h: btnH }];
}

// ======================================
// TELA DE INTRODUÇÃO
// ======================================
function telaIntroducao() {
  if (gameState.introDroneX < gameState.introDroneTargetX) {
    gameState.introDroneX += INTRO_DRONE_SPEED;
    if (gameState.introDroneX >= gameState.introDroneTargetX) {
      gameState.introDroneX = gameState.introDroneTargetX;
      gameState.introMensagemTempo = frameCount;
    }
  }

  const droneIntroY = height * 0.28 + sin(frameCount * 0.03) * 12;
  if (droneIMG) {
    image(droneIMG, gameState.introDroneX, droneIntroY, DRONE_WIDTH, DRONE_HEIGHT);
  } else {
    fill(30, 144, 255);
    noStroke();
    rect(gameState.introDroneX, droneIntroY, DRONE_WIDTH, DRONE_HEIGHT, 8);
  }

  if (frameCount % 5 === 0) {
    droneParticulas.push(new ParticulaDrone(gameState.introDroneX + DRONE_WIDTH / 2, droneIntroY + DRONE_HEIGHT - 10));
  }
  atualizarEDesenharParticulasDrone();

  if (gameState.introMensagemTempo > 0) {
    const tempoPassado = frameCount - gameState.introMensagemTempo;
    if (tempoPassado < INTRO_MESSAGE_DURATION) {
      gameState.introMensagemAlpha = map(tempoPassado, 0, INTRO_MESSAGE_DURATION / 4, 0, 255, true);
      gameState.introMensagemAlpha = map(tempoPassado, INTRO_MESSAGE_DURATION * 3 / 4, INTRO_MESSAGE_DURATION, 255, 0, true);
    } else {
      gameState.introMensagemAlpha = 0;
      mudarTela(TELA_JOGO);
    }

    fill(0, 0, 0, gameState.introMensagemAlpha * 0.8);
    noStroke();
    rect(width / 2 - 300, height / 2 - 80, 600, 160, 15);

    fill(255, gameState.introMensagemAlpha);
    textAlign(CENTER);
    textSize(larguraAdaptada(28, 18));
    text("Sua missão é restaurar a floresta!", width / 2, height / 2 - 20);
    text("Responda corretamente para plantar árvores", width / 2, height / 2 + 20);
    text("e proteger os animais!", width / 2, height / 2 + 50);
  }
}

// ======================================
// TELA DE JOGO
// ======================================
function telaJogo() {
  if (gameState.tela === TELA_JOGO) { // Só move e gera partículas se não estiver pausado
    moverDrone();
    if (frameCount % 5 === 0) {
      droneParticulas.push(new ParticulaDrone(gameState.droneX + DRONE_WIDTH / 2, gameState.droneY + DRONE_HEIGHT - 10));
    }
  }
  desenharDrone();
  atualizarEDesenharParticulasDrone();
  mostrarPergunta();
  mostrarHUD();
  barraProgresso();
}

// ======================================
// TELA DE PAUSA
// ======================================
function telaPause() {
  fill(0, 0, 0, 180); // Fundo escuro semi-transparente
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(larguraAdaptada(50, 30));
  text("PAUSADO", width / 2, height / 2 - 50);

  textSize(larguraAdaptada(25, 18));
  text("Pressione 'P' para continuar", width / 2, height / 2 + 20);
}


// ======================================
// DRONE
// ======================================
function moverDrone() {
  gameState.droneX += 2;
  if (gameState.droneX > width) {
    gameState.droneX = -DRONE_WIDTH;
  }
  gameState.droneY = height * 0.28 + sin(frameCount * 0.03) * 12;
}

function desenharDrone() {
  if (droneIMG) {
    image(droneIMG, gameState.droneX, gameState.droneY, DRONE_WIDTH, DRONE_HEIGHT);
  } else {
    fill(30, 144, 255);
    noStroke();
    rect(gameState.droneX, gameState.droneY, DRONE_WIDTH, DRONE_HEIGHT, 8);
  }
}

function atualizarEDesenharParticulasDrone() {
  for (let i = droneParticulas.length - 1; i >= 0; i--) {
    const p = droneParticulas[i];
    p.update();
    p.display();
    if (p.isDead()) {
      droneParticulas.splice(i, 1);
    }
  }
}

// ======================================
// HUD
// ======================================
function mostrarHUD() {
  fill(0, 0, 0, 160);
  noStroke();
  rect(15, 15, 240, 195, 12);

  noFill();
  stroke(0, 200, 0, 120);
  strokeWeight(2);
  rect(15, 15, 240, 195, 12);
  noStroke();

  fill(255);
  textAlign(LEFT);
  textSize(22);
  text("Pontos:  " + gameState.pontos, 35, 58);
  text("Arvores: " + gameState.arvoresPlantadas, 35, 90);
  text("Abelhas: " + abelhas.length, 35, 122);
  text("Quatis:  " + quatis.length, 35, 154);
  text("Fase:    " + (gameState.faseAtual + 1) + "/" + perguntas.length, 35, 186);
}

// ======================================
// BARRA DE PROGRESSO
// ======================================
function barraProgresso() {
  const bx = width - 280;
  const by = 15;
  const bw = 240;
  const bh = 28;

  fill(0, 0, 0, 140);
  noStroke();
  rect(bx - 10, by - 5, bw + 20, bh + 28, 10);

  fill(60);
  rect(bx, by, bw, bh, 6);

  const progresso = map(gameState.faseAtual, 0, perguntas.length, 0, bw);
  fill(0, 200, 0);
  rect(bx, by, progresso, bh, 6);

  noFill();
  stroke(255, 255, 255, 60);
  strokeWeight(1);
  rect(bx, by, bw, bh, 6);
  noStroke();

  fill(255);
  textAlign(CENTER);
  textSize(15);
  text("Progresso: " + gameState.faseAtual + " / " + perguntas.length,
    bx + bw / 2, by + bh + 20);
}

// ======================================
// PERGUNTA
// ======================================
var currentButtons = []; // Para gerenciar botões dinamicamente

function mostrarPergunta() {
  const p = perguntas[gameState.faseAtual];
  if (!p) { return; }

  const cx = width / 2;
  const boxW = min(700, width - 40);
  const boxX = cx - boxW / 2;
  const boxY = 18;

  fill(255, 245);
  noStroke();
  rect(boxX, boxY, boxW, 178, 18);

  fill(0, 130, 0);
  textAlign(LEFT);
  textSize(16);
  text("Pergunta " + (gameState.faseAtual + 1) + " de " + perguntas.length,
    boxX + 20, boxY + 26);

  fill(0);
  textAlign(CENTER);
  textSize(larguraAdaptada(26, 17));
  text(p.pergunta, cx, boxY + 68);

  const btnW = min(260, boxW / 2 - 20);
  const btnH = 52;
  const btnAx = cx - btnW - 18;
  const btnBx = cx + 18;
  const btnY = boxY + 102;

  const hoverA = mouseIsOverButton(btnAx, btnY, btnW, btnH);
  const hoverB = mouseIsOverButton(btnBx, btnY, btnW, btnH);

  fill(hoverA ? color(170, 220, 170) : color(220));
  rect(btnAx, btnY, btnW, btnH, 14);

  fill(hoverB ? color(170, 220, 170) : color(220));
  rect(btnBx, btnY, btnW, btnH, 14);

  fill(0);
  textSize(larguraAdaptada(19, 13));
  textAlign(CENTER);
  text("A - " + p.a, btnAx + btnW / 2, btnY + btnH / 2 + 7);
  text("B - " + p.b, btnBx + btnW / 2, btnY + btnH / 2 + 7);

  // Armazena os botões para clique
  currentButtons = [
    { id: "respostaA", x: btnAx, y: btnY, w: btnW, h: btnH },
    { id: "respostaB", x: btnBx, y: btnY, w: btnW, h: btnH }
  ];
}

// ======================================
// LANCAR SEMENTE
// ======================================
function lancarSemente() {
  const sx = gameState.droneX + DRONE_WIDTH / 2;
  const sy = gameState.droneY + DRONE_HEIGHT * 0.8;

  const proximoTotal = gameState.arvoresPlantadas;
  const espacamento = width / (proximoTotal + 1);
  const destinoX = espacamento * proximoTotal - ARVORE_WIDTH / 2 + ARVORE_WIDTH / 2;
  const destinoY = height - ALTURA_SOLO;

  sementes.push(new Semente(sx, sy, destinoX, destinoY));
  somLancar();
}

// ======================================
// PARTICULAS DE SOLO (Gerador para a classe ParticulaSolo)
// ======================================
function gerarParticulasSolo(x, y) {
  const pts = [];
  for (let i = 0; i < 12; i++) {
    pts.push(new ParticulaSolo(x, y));
  }
  return pts;
}

// ======================================
// FEEDBACK — ERRO
// ======================================
function drawMensagemErro() {
  const tempoDecorrido = millis() - gameState.tempoInicioErro;
  if (tempoDecorrido < TEMPO_FEEDBACK_MS) {
    const alpha = map(tempoDecorrido, 0, TEMPO_FEEDBACK_MS, 210, 0);
    fill(180, 0, 0, alpha);
    noStroke();
    rect(width / 2 - 270, height - 125, 540, 62, 12);
    fill(255, alpha);
    textAlign(CENTER);
    textSize(26);
    text("DESMATAMENTO!  -1 arvore", width / 2, height - 83);
  } else {
    gameState.mensagemErro = false;
  }
}

// ======================================
// FEEDBACK — ACERTO
// ======================================
function drawMensagemAcerto() {
  const tempoDecorrido = millis() - gameState.tempoInicioAcerto;
  if (tempoDecorrido < TEMPO_FEEDBACK_MS) {
    const alpha = map(tempoDecorrido, 0, TEMPO_FEEDBACK_MS, 210, 0);
    fill(0, 160, 0, alpha);
    noStroke();
    rect(width / 2 - 270, height - 125, 540, 62, 12);
    fill(255, alpha);
    textAlign(CENTER);
    textSize(26);
    text("Correto! +" + PONTOS_POR_ACERTO + " pontos  +1 arvore!", width / 2, height - 83);
  } else {
    gameState.mensagemAcerto = false;
  }
}

// ======================================
// CREDITOS
// ======================================
function drawCreditos() {
  fill(0, 0, 0, 130);
  noStroke();
  rect(width - 430, height - 38, 425, 30, 8);
  fill(220);
  textAlign(RIGHT);
  textSize(13);
  text(
    "Aluno: Gabriel | 1 TDS | Col. Sao Cristovao | Prof. Jean Ceconi",
    width - 12,
    height - 18
  );
}

// ======================================
// TELA FINAL
// ======================================
function telaFinal() {
  const cx = width / 2;
  const boxW = min(760, width - 40);
  const boxH = min(560, height - 80);
  const boxX = cx - boxW / 2;
  const boxY = 40;

  fill(255, 245);
  noStroke();
  rect(boxX, boxY, boxW, boxH, 20);

  const percentual = gameState.pontos / (perguntas.length * PONTOS_POR_ACERTO);
  let titulo, corR, corG, corB;

  if (percentual >= 0.8) {
    titulo = "MISSAO CUMPRIDA!";
    corR = 0; corG = 140; corB = 0;
    if (!gameState.animacaoFinalAtiva) {
      gameState.animacaoFinalAtiva = true;
      somVitoria();
    }
  } else if (percentual >= 0.5) {
    titulo = "BOM TRABALHO!";
    corR = 180; corG = 130; corB = 0;
  } else {
    titulo = "PRECISA MELHORAR";
    corR = 180; corG = 0; corB = 0;
  }

  fill(corR, corG, corB);
  textAlign(CENTER);
  textSize(larguraAdaptada(44, 28));
  text(titulo, cx, boxY + 65);

  fill(0);
  textSize(larguraAdaptada(24, 16));
  text("Pontuacao: " + gameState.pontos, cx, boxY + 115);
  text("Arvores Plantadas: " + gameState.arvoresPlantadas, cx, boxY + 153);
  text("Abelhas no ecossistema: " + abelhas.length, cx, boxY + 191);
  text("Quatis: " + quatis.length, cx, boxY + 229);
  text("Acertos: " + gameState.acertos + " de " + perguntas.length, cx, boxY + 267);

  fill(0, 120, 0);
  textSize(larguraAdaptada(20, 14));
  text(
    "Voce ajudou a restaurar a floresta do Iguacu!",
    cx, boxY + 318
  );
  text(
    "Continue cuidando do meio ambiente.",
    cx, boxY + 348
  );

  if (oncaIMG && gameState.mostrarOnca) {
    gameState.oncaX += gameState.oncaVelocidade * gameState.oncaDirecao;

    if (gameState.oncaDirecao === 1 && gameState.oncaX > width - ONCA_WIDTH - 50) {
      gameState.oncaDirecao = -1;
    } else if (gameState.oncaDirecao === -1 && gameState.oncaX < 50) {
      gameState.oncaDirecao = 1;
    }

    push();
    translate(gameState.oncaX + ONCA_WIDTH / 2, height - ALTURA_SOLO - ONCA_HEIGHT / 2);
    if (gameState.oncaDirecao === -1) {
      scale(-1, 1);
    }
    image(oncaIMG, -ONCA_WIDTH / 2, -ONCA_HEIGHT / 2, ONCA_WIDTH, ONCA_HEIGHT);
    pop();
  }

  if (gameState.animacaoFinalAtiva) {
    if (frameCount % 5 === 0 && gameState.particulasVitoria.length < 100) {
      gameState.particulasVitoria.push(new ParticulaVitoria(random(width), random(height / 2)));
    }

    for (let i = gameState.particulasVitoria.length - 1; i >= 0; i--) {
      const p = gameState.particulasVitoria[i];
      p.update();
      p.display();
      if (p.isDead()) {
        gameState.particulasVitoria.splice(i, 1);
      }
    }
  }

  const btnW = 280;
  const btnH = 55;
  const btnX = cx - btnW / 2;
  const btnY = boxY + boxH - 72;

  const hover = mouseIsOverButton(btnX, btnY, btnW, btnH);
  fill(hover ? color(0, 200, 0) : color(0, 170, 0));
  noStroke();
  rect(btnX, btnY, btnW, btnH, 14);
  fill(255);
  textSize(larguraAdaptada(24, 17));
  text("JOGAR NOVAMENTE", cx, btnY + btnH / 2 + 9);

  currentButtons = [{ id: "reiniciar", x: btnX, y: btnY, w: btnW, h: btnH }];
}

// ======================================
// VERIFICACAO
// ======================================
function verificar(resposta) {
  iniciarAudio();

  const correta = perguntas[gameState.faseAtual].correta;

  if (resposta === correta) {
    gameState.pontos += PONTOS_POR_ACERTO;
    gameState.arvoresPlantadas++;
    gameState.acertos++;

    gameState.mensagemAcerto = true;
    gameState.tempoInicioAcerto = millis();
    gameState.pontosFlutuantes.push(new PontosFlutuantes(mouseX, mouseY, PONTOS_POR_ACERTO)); // Animação de pontos

    lancarSemente();

    const ultimaSemente = sementes[sementes.length - 1];
    if (ultimaSemente) {
      arvoresCrescendo.push(new ArvoreCrescendo(ultimaSemente.dx - ARVORE_WIDTH / 2, height - ALTURA_SOLO - ARVORE_HEIGHT));
      somCrescimento();
    }

    abelhas.push(new Abelha(
      random(-500, -50),
      random(height - 350, height - 250),
      random(2 + gameState.faseAtual * 0.2, 4 + gameState.faseAtual * 0.2)
    ));

    if (gameState.acertos % 3 === 0) {
      quatis.push(new Quati(
        random(-500, -50),
        height - ALTURA_SOLO,
        random(1 + gameState.faseAtual * 0.1, 2 + gameState.faseAtual * 0.1)
      ));
    }

  } else {
    gameState.arvoresPlantadas--;
    if (gameState.arvoresPlantadas < 0) { gameState.arvoresPlantadas = 0; }
    gameState.mensagemErro = true;
    gameState.tempoInicioErro = millis();
    somErro();
    gameState.shakeScreen = 10; // Ativa tremor de tela
  }

  gameState.faseAtual++;
  if (gameState.faseAtual >= perguntas.length) {
    mudarTela(TELA_FIM);
    gameState.mostrarOnca = true;
    gameState.oncaX = random(50, width - ONCA_WIDTH - 50);
    gameState.oncaDirecao = random([-1, 1]);
  }
}

// ======================================
// GERENCIAMENTO DE TELAS
// ======================================
function mudarTela(novaTela) {
  gameState.tela = novaTela;
  gameState.fadeAlpha = 255; // Inicia o fade para a nova tela
  currentButtons = []; // Limpa os botões da tela anterior
}

// ======================================
// REINICIAR
// ======================================
function reiniciarJogo() {
  gameState = { // Reinicia o objeto de estado completo
    tela: TELA_INICIO,
    droneX: 100,
    droneY: 180,
    pontos: 0,
    arvoresPlantadas: 3,
    faseAtual: 0,
    acertos: 0,
    mostrarOnca: false,
    oncaX: -ONCA_WIDTH,
    oncaDirecao: 1,
    oncaVelocidade: 1.5,

    introDroneX: -DRONE_WIDTH,
    introDroneTargetX: width / 2 - DRONE_WIDTH / 2,
    introMensagemAlpha: 0,
    introMensagemTempo: 0,

    animacaoFinalAtiva: false,
    particulasVitoria: [],
    somVitoriaTocando: false,

    mensagemErro: false,
    tempoInicioErro: 0,
    mensagemAcerto: false,
    tempoInicioAcerto: 0,
    fadeAlpha: 255, // Inicia o fade para a tela de início

    shakeScreen: 0,
    pontosFlutuantes: [],
  };

  abelhas = [];
  quatis = [];
  sementes = [];
  arvoresCrescendo = [];
  droneParticulas = [];
}

// ======================================
// CLIQUES E TECLAS
// ======================================
function mousePressed() {
  iniciarAudio(); // Garante que o áudio possa ser iniciado

  if (gameState.tela === TELA_INICIO) {
    const btn = currentButtons.find(b => b.id === "iniciar");
    if (btn && mouseIsOverButton(btn.x, btn.y, btn.w, btn.h)) {
      mudarTela(TELA_INTRODUCAO);
    }
  } else if (gameState.tela === TELA_JOGO) {
    const btnA = currentButtons.find(b => b.id === "respostaA");
    const btnB = currentButtons.find(b => b.id === "respostaB");
    if (btnA && mouseIsOverButton(btnA.x, btnA.y, btnA.w, btnA.h)) { verificar("a"); }
    if (btnB && mouseIsOverButton(btnB.x, btnB.y, btnB.w, btnB.h)) { verificar("b"); }
  } else if (gameState.tela === TELA_FIM) {
    const btn = currentButtons.find(b => b.id === "reiniciar");
    if (btn && mouseIsOverButton(btn.x, btn.y, btn.w, btn.h)) {
      reiniciarJogo();
    }
  }
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    if (gameState.tela === TELA_JOGO) {
      mudarTela(TELA_PAUSE);
    } else if (gameState.tela === TELA_PAUSE) {
      mudarTela(TELA_JOGO);
    }
  }
}

// ======================================
// UTILITARIOS
// ======================================
function mouseIsOverButton(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function larguraAdaptada(grande, pequeno) {
  return width > 600 ? grande : pequeno;
}

// ======================================
// RESPONSIVO
// ======================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recalcula posições dependentes do tamanho da tela
  gameState.introDroneTargetX = width / 2 - DRONE_WIDTH / 2;
  // Se o jogo estiver na tela de introdução e o drone já tiver parado, ajusta a posição
  if (gameState.tela === TELA_INTRODUCAO && gameState.introDroneX === width / 2 - DRONE_WIDTH / 2) {
    gameState.introDroneX = gameState.introDroneTargetX;
  }
}