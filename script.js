const baseHero = {
  name: 'Héroe',
  role: 'Guerrero',
  hp: 100,
  maxHp: 100,
  gold: 30,
  potions: 1,
  baseAttack: 12,
  luck: 1,
  defending: false,
  score: 0,
};

const enemies = [
  { name: 'Lobo Sombrío', hp: 70, maxHp: 70, minAtk: 6, maxAtk: 12, reward: 20 },
  { name: 'Bandido Rojo', hp: 90, maxHp: 90, minAtk: 8, maxAtk: 15, reward: 28 },
  { name: 'Gólem Rúnico', hp: 120, maxHp: 120, minAtk: 10, maxAtk: 20, reward: 40 },
];

let hero = { ...baseHero };
let enemyIndex = 0;
let enemy = { ...enemies[enemyIndex] };
let gameStarted = false;

const ui = {
  setupCard: document.getElementById('setupCard'),
  gamePanel: document.getElementById('gamePanel'),
  nameInput: document.getElementById('nameInput'),
  roleSelect: document.getElementById('roleSelect'),
  startBtn: document.getElementById('startBtn'),
  resetBtn: document.getElementById('resetBtn'),
  heroName: document.getElementById('heroName'),
  heroRole: document.getElementById('heroRole'),
  luckStat: document.getElementById('luckStat'),
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
  log: document.getElementById('log'),
};

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLog(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  ui.log.prepend(item);
}

function updateUI() {
  ui.heroName.textContent = hero.name;
  ui.heroRole.textContent = hero.role;
  ui.luckStat.textContent = hero.luck;
  ui.heroHpText.textContent = `${hero.hp} / ${hero.maxHp}`;
  ui.heroHpBar.max = hero.maxHp;
  ui.heroHpBar.value = hero.hp;

  ui.enemyName.textContent = enemy.name;
  ui.enemyHpText.textContent = `${enemy.hp} / ${enemy.maxHp}`;
  ui.enemyHpBar.max = enemy.maxHp;
  ui.enemyHpBar.value = enemy.hp;

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

function startGame() {
  const selectedName = ui.nameInput.value.trim() || 'Aventurero';
  const selectedRole = ui.roleSelect.value;

  hero = { ...baseHero, name: selectedName };

  if (selectedRole === 'guerrero') {
    hero.role = 'Guerrero';
    hero.maxHp = 120;
    hero.hp = 120;
  } else if (selectedRole === 'mago') {
    hero.role = 'Mago';
    hero.baseAttack = 16;
  } else {
    hero.role = 'Pícaro';
    hero.luck = 4;
  }

  enemyIndex = 0;
  enemy = { ...enemies[enemyIndex] };
  ui.log.innerHTML = '';
  ui.setupCard.classList.add('hidden');
  ui.gamePanel.classList.remove('hidden');
  gameStarted = true;

  setBattleButtons(true);
  ui.nextEnemyBtn.disabled = true;
  ui.shopPanel.classList.add('hidden');
  addLog(`🎮 ${hero.name}, ${hero.role}, comienza su aventura.`);
  updateUI();
}

function finishGame(win = false) {
  setBattleButtons(false);
  ui.nextEnemyBtn.disabled = true;
  const msg = win
    ? `🏆 ¡Victoria total! Puntaje final: ${hero.score}.`
    : `💀 Has sido derrotado. Puntaje final: ${hero.score}.`;
  addLog(msg);
}

function enemyTurn() {
  if (enemy.hp <= 0 || hero.hp <= 0) return;
  let damage = rng(enemy.minAtk, enemy.maxAtk);
  if (hero.defending) {
    damage = Math.max(1, Math.floor(damage / 2));
    addLog('🛡️ Te defendiste y redujiste el daño.');
  }

  hero.hp = Math.max(0, hero.hp - damage);
  hero.defending = false;
  addLog(`👹 ${enemy.name} te golpea y pierdes ${damage} de vida.`);

  if (hero.hp <= 0) {
    finishGame(false);
  }
  updateUI();
}

function attack() {
  if (!gameStarted || hero.hp <= 0 || enemy.hp <= 0) return;

  const luckBonus = rng(0, 8 + hero.luck);
  const crit = Math.random() < 0.2 + hero.luck * 0.01;
  let damage = hero.baseAttack + luckBonus;
  if (crit) damage += 10;

  enemy.hp = Math.max(0, enemy.hp - damage);
  hero.score += damage;
  addLog(`⚔️ Atacas y haces ${damage} de daño${crit ? ' (¡crítico!)' : ''}.`);

  if (enemy.hp <= 0) {
    hero.gold += enemy.reward;
    hero.score += enemy.reward * 2;
    addLog(`✅ Venciste a ${enemy.name} y ganaste ${enemy.reward} de oro.`);
    setBattleButtons(false);
    ui.nextEnemyBtn.disabled = enemyIndex >= enemies.length - 1;
    if (enemyIndex >= enemies.length - 1) finishGame(true);
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
  hero.score += Math.floor(restored / 2);
  addLog(`🧪 Usaste una poción y recuperaste ${restored} de vida.`);
  enemyTurn();
  updateUI();
}

function nextEnemy() {
  if (!gameStarted) return;
  if (enemyIndex >= enemies.length - 1) {
    finishGame(true);
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
  if (!gameStarted || hero.hp <= 0) return;
  ui.shopPanel.classList.toggle('hidden');
}

function buyPotion() {
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
  if (hero.gold < 25) {
    addLog('❌ No tienes oro suficiente para mejorar ataque.');
    return;
  }
  hero.gold -= 25;
  hero.baseAttack += 3;
  addLog('🛒 Mejoraste tu ataque base en +3.');
  updateUI();
}

function resetGame() {
  hero = { ...baseHero };
  enemyIndex = 0;
  enemy = { ...enemies[enemyIndex] };
  gameStarted = false;
  ui.shopPanel.classList.add('hidden');
  ui.gamePanel.classList.add('hidden');
  ui.setupCard.classList.remove('hidden');
  ui.log.innerHTML = '';
}

ui.startBtn.addEventListener('click', startGame);
ui.resetBtn.addEventListener('click', resetGame);
ui.attackBtn.addEventListener('click', attack);
ui.defendBtn.addEventListener('click', defend);
ui.healBtn.addEventListener('click', heal);
ui.shopBtn.addEventListener('click', toggleShop);
ui.closeShopBtn.addEventListener('click', toggleShop);
ui.buyPotionBtn.addEventListener('click', buyPotion);
ui.buyAttackBtn.addEventListener('click', buyAttack);
ui.nextEnemyBtn.addEventListener('click', nextEnemy);
