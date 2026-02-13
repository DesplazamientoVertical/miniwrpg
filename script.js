const baseHero = {
  name: 'Aria',
  hp: 100,
  maxHp: 100,
  gold: 30,
  potions: 1,
  baseAttack: 12,
  defending: false,
  role: 'guerrero',
  score: 0,
};

const roleBonus = {
  guerrero: { hp: 20, attack: 0, gold: 0, potions: 0, defense: 0, label: 'Guerrero' },
  mago: { hp: 0, attack: 4, gold: 0, potions: 0, defense: 0, label: 'Mago' },
  picaro: { hp: 0, attack: 0, gold: 20, potions: 1, defense: 0, label: 'Pícaro' },
  paladin: { hp: 25, attack: 1, gold: 0, potions: 0, defense: 2, label: 'Paladín' },
  cazador: { hp: 0, attack: 5, gold: 10, potions: 0, defense: 0, label: 'Cazador' },
  alquimista: { hp: 5, attack: 1, gold: 0, potions: 3, defense: 0, label: 'Alquimista' },
};

const enemies = [
  { name: 'Lobo Sombrío', hp: 70, maxHp: 70, minAtk: 6, maxAtk: 12, reward: 20, location: 'Bosque Marchito' },
  { name: 'Bandido Rojo', hp: 90, maxHp: 90, minAtk: 8, maxAtk: 15, reward: 28, location: 'Camino del Acantilado' },
  { name: 'Gólem Rúnico', hp: 120, maxHp: 120, minAtk: 10, maxAtk: 20, reward: 40, location: 'Ruinas de Ceniza' },
];

let hero = { ...baseHero };
let enemyIndex = 0;
let enemy = { ...enemies[enemyIndex] };
let defeatedEnemies = 0;
let gameStarted = false;
let isBanned = false;
let godMode = false;
const secretNames = {
  instantDeath: 'fjnavarro',
  aestheticArmor: '21n',
  banned: 'donas',
  trueLove: 'ichita',
  godMode: 'desplazamiento vertical',
};

const ui = {
  setupCard: document.getElementById('setupCard'),
  heroNameInput: document.getElementById('heroNameInput'),
  heroRoleSelect: document.getElementById('heroRoleSelect'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn'),
  heroName: document.getElementById('heroName'),
  heroHpText: document.getElementById('heroHpText'),
  heroHpBar: document.getElementById('heroHpBar'),
  enemyName: document.getElementById('enemyName'),
  enemyHpText: document.getElementById('enemyHpText'),
  enemyHpBar: document.getElementById('enemyHpBar'),
  gold: document.getElementById('gold'),
  potions: document.getElementById('potions'),
  baseAttack: document.getElementById('baseAttack'),
  score: document.getElementById('score'),
  attackBtn: document.getElementById('attackBtn'),
  defendBtn: document.getElementById('defendBtn'),
  healBtn: document.getElementById('healBtn'),
  shopBtn: document.getElementById('shopBtn'),
  nextEnemyBtn: document.getElementById('nextEnemyBtn'),
  shopPanel: document.getElementById('shopPanel'),
  buyPotionBtn: document.getElementById('buyPotionBtn'),
  buyAttackBtn: document.getElementById('buyAttackBtn'),
  closeShopBtn: document.getElementById('closeShopBtn'),
  buyAestheticArmorBtn: document.getElementById('buyAestheticArmorBtn'),
  colorblindToggle: document.getElementById('colorblindToggle'),
  locationName: document.getElementById('locationName'),
  log: document.getElementById('log'),
};


function normalizeName(name) {
  return name.trim().toLowerCase();
}

function applyColorblindMode(enabled) {
  document.body.classList.toggle('colorblind-mode', enabled);
  localStorage.setItem('miniwrpgColorblindMode', enabled ? '1' : '0');
}

function forceDefeatBySecret() {
  enemy = {
    name: 'El barbudo hijo de ####',
    hp: 1,
    maxHp: 1,
    minAtk: hero.maxHp,
    maxAtk: hero.maxHp,
    reward: 0,
  };
  addLog('☠️ Te cruzaste con El barbudo hijo de ####.');
  hero.hp = 0;
  updateUI();
  loseGame();
}

function updateSecretShopOptions() {
  const canBuyAestheticArmor = normalizeName(hero.name) === secretNames.aestheticArmor;
  ui.buyAestheticArmorBtn.classList.toggle('hidden', !canBuyAestheticArmor);
}
function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  ui.log.prepend(item);
}

function calculateScore() {
  return defeatedEnemies * 100 + hero.gold + hero.baseAttack * 5;
}

function applyGodModeVisual(enabled) {
  document.body.classList.toggle('god-mode', enabled);
}

function updateUI() {
  hero.score = calculateScore();

  ui.heroName.textContent = `${hero.name} (${roleBonus[hero.role].label})`;
  ui.heroHpText.textContent = `${hero.hp} / ${hero.maxHp}`;
  ui.heroHpBar.max = hero.maxHp;
  ui.heroHpBar.value = hero.hp;

  ui.enemyName.textContent = enemy.name;
  ui.enemyHpText.textContent = `${enemy.hp} / ${enemy.maxHp}`;
  ui.enemyHpBar.max = enemy.maxHp;
  ui.enemyHpBar.value = enemy.hp;
  ui.locationName.textContent = enemy.location || 'Sin lugar';

  ui.gold.textContent = hero.gold;
  ui.potions.textContent = hero.potions;
  ui.baseAttack.textContent = hero.baseAttack;
  ui.score.textContent = hero.score;
}

function setBattleButtons(enabled) {
  ui.attackBtn.disabled = !enabled;
  ui.defendBtn.disabled = !enabled;
  ui.healBtn.disabled = !enabled;
}

function loseGame() {
  setBattleButtons(false);
  ui.nextEnemyBtn.disabled = true;
  addLog(`💀 Has sido derrotado. Tu puntaje final fue ${hero.score}.`);
}

function enemyTurn() {
  if (enemy.hp <= 0 || hero.hp <= 0 || !gameStarted) return;
  let damage = rng(enemy.minAtk, enemy.maxAtk);
  if (hero.defending) {
    damage = Math.max(1, Math.floor(damage / 2));
    addLog('🛡️ Te defendiste y redujiste el daño.');
  }

  if (godMode) {
    damage = 0;
  }

  const mitigation = hero.damageReduction || 0;
  damage = Math.max(0, damage - mitigation);

  hero.hp = Math.max(0, hero.hp - damage);
  hero.defending = false;
  if (godMode) {
    addLog('✨ Modo Dios bloqueó todo el daño recibido.');
  } else {
    addLog(`👹 ${enemy.name} te golpea y pierdes ${damage} de vida.`);
  }

  updateUI();
  if (hero.hp <= 0) {
    loseGame();
  }
}

function attack() {
  if (hero.hp <= 0 || enemy.hp <= 0 || !gameStarted) return;
  const luckBonus = rng(0, 8);
  const crit = Math.random() < 0.2;
  let damage = hero.baseAttack + luckBonus;
  if (crit) damage += 10;

  enemy.hp = Math.max(0, enemy.hp - damage);
  addLog(`⚔️ Atacas y haces ${damage} de daño${crit ? ' (¡crítico!)' : ''}.`);

  if (enemy.hp <= 0) {
    hero.gold += enemy.reward;
    defeatedEnemies += 1;
    addLog(`✅ Venciste a ${enemy.name} y ganaste ${enemy.reward} de oro.`);
    setBattleButtons(false);
    ui.nextEnemyBtn.disabled = enemyIndex >= enemies.length - 1;
  } else {
    enemyTurn();
  }

  updateUI();
}

function defend() {
  if (!gameStarted) return;
  hero.defending = true;
  addLog('🛡️ Te preparas para defender el próximo golpe.');
  enemyTurn();
  updateUI();
}

function heal() {
  if (!gameStarted) return;
  if (hero.potions <= 0) {
    addLog('❌ No tienes pociones.');
    return;
  }
  if (hero.hp === hero.maxHp) {
    addLog('ℹ️ Ya tienes vida completa.');
    return;
  }

  const restored = rng(18, 34);
  hero.hp = Math.min(hero.maxHp, hero.hp + restored);
  hero.potions -= 1;
  addLog(`🧪 Usaste una poción y recuperaste ${restored} de vida.`);
  enemyTurn();
  updateUI();
}

function nextEnemy() {
  if (!gameStarted) return;
  if (enemyIndex >= enemies.length - 1) {
    addLog('🏆 ¡Ya derrotaste a todos los enemigos de Miniw RPG!');
    ui.nextEnemyBtn.disabled = true;
    return;
  }

  enemyIndex += 1;
  enemy = { ...enemies[enemyIndex] };
  setBattleButtons(true);
  ui.nextEnemyBtn.disabled = true;
  addLog(`➡️ Aparece un nuevo enemigo: ${enemy.name}.`);
  updateUI();
}

function toggleShop() {
  if (!gameStarted || isBanned) return;
  ui.shopPanel.classList.toggle('hidden');
}

function buyPotion() {
  if (!gameStarted) return;
  if (hero.gold < 15) {
    addLog('❌ No tienes oro suficiente para poción.');
    return;
  }
  hero.gold -= 15;
  hero.potions += 1;
  addLog('🛒 Compraste una poción.');
  updateUI();
}

function buyAttack() {
  if (!gameStarted) return;
  if (hero.gold < 25) {
    addLog('❌ No tienes oro suficiente para mejorar ataque.');
    return;
  }
  hero.gold -= 25;
  hero.baseAttack += 3;
  addLog('🛒 Mejoraste tu ataque base en +3.');
  updateUI();
}


function buyAestheticArmor() {
  if (!gameStarted) return;
  if (normalizeName(hero.name) !== secretNames.aestheticArmor) {
    addLog('❌ Ese objeto no está disponible para tu héroe.');
    return;
  }
  if (hero.gold < 60) {
    addLog('❌ No tienes oro suficiente para Armadura estética.');
    return;
  }
  hero.gold -= 60;
  addLog('🛒 Compraste Armadura estética. Se ve increíble, pero no hace nada.');
  updateUI();
}

function startGame() {
  if (isBanned) {
    addLog('⛔ Estás baneado. Reinicia la página para volver a jugar.');
    return;
  }

  const selectedName = ui.heroNameInput.value.trim() || 'Héroe';
  const normalizedName = normalizeName(selectedName);

  if (normalizedName === secretNames.banned) {
    isBanned = true;
    gameStarted = false;
    setBattleButtons(false);
    ui.nextEnemyBtn.disabled = true;
    ui.setupCard.classList.remove('hidden');
    ui.shopPanel.classList.add('hidden');
    ui.log.innerHTML = '';
    addLog('⛔ BANEADO. Tenés que reiniciar la página sí o sí.');
    updateUI();
    return;
  }

  const selectedRole = ui.heroRoleSelect.value;
  const bonus = roleBonus[selectedRole] || roleBonus.guerrero;

  hero = {
    ...baseHero,
    name: selectedName,
    role: selectedRole,
    maxHp: baseHero.maxHp + bonus.hp,
    hp: baseHero.hp + bonus.hp,
    baseAttack: baseHero.baseAttack + bonus.attack,
    gold: baseHero.gold + bonus.gold,
    potions: baseHero.potions + bonus.potions,
    damageReduction: bonus.defense || 0,
  };

  enemyIndex = 0;
  enemy = { ...enemies[enemyIndex] };
  defeatedEnemies = 0;
  gameStarted = true;
  ui.setupCard.classList.add('hidden');
  ui.shopPanel.classList.add('hidden');
  setBattleButtons(true);
  ui.nextEnemyBtn.disabled = true;
  ui.log.innerHTML = '';

  addLog(`🎮 Comienza la aventura de ${hero.name} (${bonus.label}).`);

  godMode = normalizedName === secretNames.godMode;
  applyGodModeVisual(godMode);

  if (normalizedName === secretNames.trueLove) {
    addLog('💖 te amo mucho, ganaste');
  }

  if (godMode) {
    addLog('👑 Modo Dios activado');
    hero.baseAttack += 999;
  }

  updateSecretShopOptions();
  updateUI();

  if (normalizeName(hero.name) === secretNames.instantDeath) {
    forceDefeatBySecret();
  }
}

function restartGame() {
  if (isBanned) {
    location.reload();
    return;
  }

  gameStarted = false;
  godMode = false;
  applyGodModeVisual(false);
  hero = { ...baseHero };
  enemyIndex = 0;
  enemy = { ...enemies[enemyIndex] };
  defeatedEnemies = 0;

  setBattleButtons(false);
  ui.nextEnemyBtn.disabled = true;
  ui.setupCard.classList.remove('hidden');
  ui.shopPanel.classList.add('hidden');
  ui.log.innerHTML = '';
  updateSecretShopOptions();

  addLog('🔁 Partida reiniciada. Elige nombre y rol para comenzar de nuevo.');
  updateUI();
}

ui.attackBtn.addEventListener('click', attack);
ui.defendBtn.addEventListener('click', defend);
ui.healBtn.addEventListener('click', heal);
ui.shopBtn.addEventListener('click', toggleShop);
ui.closeShopBtn.addEventListener('click', toggleShop);
ui.buyPotionBtn.addEventListener('click', buyPotion);
ui.buyAttackBtn.addEventListener('click', buyAttack);
ui.buyAestheticArmorBtn.addEventListener('click', buyAestheticArmor);
ui.nextEnemyBtn.addEventListener('click', nextEnemy);
ui.startBtn.addEventListener('click', startGame);
ui.restartBtn.addEventListener('click', restartGame);
ui.colorblindToggle.addEventListener('change', (event) => {
  applyColorblindMode(event.target.checked);
});

const savedColorblindMode = localStorage.getItem('miniwrpgColorblindMode') === '1';
ui.colorblindToggle.checked = savedColorblindMode;
applyColorblindMode(savedColorblindMode);

addLog('🎮 Elige un nombre y un rol para iniciar la aventura.');
updateUI();
