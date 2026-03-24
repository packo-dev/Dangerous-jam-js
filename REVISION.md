# FICHE DE REVISION — Dangerous Harvest

> **Objectif :** Pouvoir expliquer CHAQUE ligne de code a l'oral.
> Organise par fichier, puis par bloc. Chaque section explique le QUOI et le POURQUOI.

---

## TABLE DES MATIERES

1. [HTML — index.html (Menu)](#1-html--indexhtml-menu)
2. [HTML — html/game.html (Jeu)](#2-html--htmlgamehtml-jeu)
3. [CSS — css/style.css (Styles menu)](#3-css--cssstylecss-styles-menu)
4. [CSS — css/game.css (Styles jeu)](#4-css--cssgamecss-styles-jeu)
5. [JS — js/menu.js (Logique menu)](#5-js--jsmenujs-logique-menu)
6. [JS — js/game.js (Moteur de jeu)](#6-js--jsgamejs-moteur-de-jeu)
7. [Concepts cles a connaitre](#7-concepts-cles-a-connaitre)

---

## 1. HTML — index.html (Menu)

### Structure de base

```html
<!DOCTYPE html>
```
- **`<!DOCTYPE html>`** : Declare au navigateur qu'on utilise HTML5. Sans ca, le navigateur peut passer en "mode quirks" (ancien mode de rendu).

```html
<html lang="en">
```
- **`lang="en"`** : Indique la langue du document (anglais). Important pour l'accessibilite et le SEO.

```html
<meta charset="UTF-8">
```
- **`charset="UTF-8"`** : Definit l'encodage des caracteres. UTF-8 supporte tous les caracteres (accents, emojis, etc.).

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
- **`viewport`** : Indique au navigateur mobile de respecter la largeur de l'ecran. `initial-scale=1.0` = pas de zoom au chargement. Essentiel pour le responsive.

```html
<link rel="stylesheet" href="css/style.css">
```
- **`<link>`** : Lie une feuille de style CSS externe. `rel="stylesheet"` dit au navigateur que c'est du CSS. `href` = chemin vers le fichier.

```html
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
```
- Charge les polices **Google Fonts** :
  - `Press Start 2P` : police pixel retro pour le titre et le HUD
  - `Inter` : police moderne pour le texte courant
  - `display=swap` : affiche du texte immediatement avec une police de fallback, puis swap quand la police est chargee

### Corps de la page

```html
<div id="bg-animation"></div>
```
- Conteneur vide pour l'**animation de fond**. Le CSS y applique un pseudo-element `::before` avec des particules qui bougent.

```html
<div id="start-screen">
```
- Conteneur principal du menu. Utilise Flexbox (via CSS) pour centrer tout verticalement et horizontalement.

```html
<img id="logo" src="assets/img/logo.svg" alt="Dangerous Harvest">
```
- **`<img>`** : Affiche le logo SVG. `alt` = texte alternatif si l'image ne charge pas (accessibilite).

```html
<button id="play-btn" class="btn btn-play">PLAY</button>
```
- **`<button>`** : Element cliquable natif. `id` = identifiant unique pour JS. `class` = classes CSS pour le style. On utilise `btn` (style de base) + `btn-play` (style specifique vert).

```html
<div id="rules-modal" class="modal">
```
- **Modal** = fenetre flottante par-dessus la page. `display: none` par defaut (dans le CSS), visible quand JS change `display` en `flex`.

```html
<img src="assets/img/carrot-safe.svg" class="rules-icon" alt="safe">
```
- Petite image dans les regles pour montrer visuellement a quoi ressemble un item safe.

```html
<span class="key-hint">WASD</span>
```
- **`<span>`** : Conteneur inline (ne casse pas la ligne). La classe `key-hint` lui donne un style de touche de clavier.

```html
<script src="js/menu.js"></script>
```
- **`<script>`** : Charge et execute le fichier JavaScript. Place en fin de `<body>` pour que le DOM soit deja charge quand le script s'execute.

---

## 2. HTML — html/game.html (Jeu)

### Canvas

```html
<canvas id="game-canvas"></canvas>
```
- **`<canvas>`** : Element HTML5 qui permet de dessiner en 2D via JavaScript. C'est le "terrain de jeu" ou tout est rendu. Le CSS le place en plein ecran (`100vw x 100vh`). Le JS recupere son **contexte 2D** pour dessiner.

### HUD (Head-Up Display)

```html
<div id="hud">
```
- Interface superposee au canvas. `pointer-events: none` (CSS) = les clics passent a travers, le joueur peut toujours interagir avec le canvas en dessous.

```html
<div id="hearts-container"></div>
```
- Conteneur vide : les coeurs sont crees **dynamiquement par JS** (`renderHearts()`). Chaque coeur est un `<div>` avec un `clip-path` en forme de coeur.

```html
<div id="wave-announce" style="display:none;">
```
- **`style="display:none"`** : Cache l'element directement dans le HTML. JS le rend visible temporairement quand une nouvelle wave commence.

### Game Over

```html
<div id="gameover-screen" class="overlay" style="display:none;">
```
- **Overlay** = couche qui couvre tout l'ecran. `backdrop-filter: blur(8px)` dans le CSS floute le jeu en arriere-plan.

```html
<input type="text" id="player-name" class="name-input" maxlength="12" placeholder="Player" autocomplete="off">
```
- **`<input type="text">`** : Champ de saisie texte.
  - `maxlength="12"` : Limite a 12 caracteres
  - `placeholder="Player"` : Texte grise visible quand le champ est vide
  - `autocomplete="off"` : Desactive les suggestions du navigateur

```html
<link rel="stylesheet" href="../css/game.css">
```
- **`../`** : Remonte d'un dossier. Puisque `game.html` est dans `html/`, il faut remonter pour acceder a `css/`.

---

## 3. CSS — css/style.css (Styles menu)

### Reset

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```
- **`*`** : Selecteur universel, cible TOUS les elements.
- **`margin: 0; padding: 0`** : Supprime les marges/espacements par defaut du navigateur.
- **`box-sizing: border-box`** : La taille d'un element inclut le padding et la bordure. Sans ca, un element de `100px` avec `10px` de padding ferait `120px` de large.

### Body

```css
body {
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
}
```
- **`font-family`** : Police par defaut. Si 'Inter' ne charge pas, utilise `sans-serif`.
- **`overflow: hidden`** : Cache tout ce qui depasse de l'ecran (pas de scrollbar).
- **`100vw` / `100vh`** : `vw` = viewport width, `vh` = viewport height. 100vw = 100% de la largeur de la fenetre.

### Animation de fond

```css
#bg-animation::before {
    content: '';
    width: 200%;
    height: 200%;
    background-image: radial-gradient(2px 2px at 20% 30%, rgba(76, 255, 114, 0.15), transparent);
    animation: bgDrift 30s linear infinite;
}
```
- **`::before`** : Pseudo-element. Cree un element "fantome" avant le contenu. Necessite `content` (meme vide).
- **`radial-gradient`** : Degrade circulaire. Ici, cree de petits points lumineux.
- **`rgba(76, 255, 114, 0.15)`** : Couleur avec transparence. `rgba` = Red, Green, Blue, Alpha (0=transparent, 1=opaque).
- **`animation: bgDrift 30s linear infinite`** : Applique l'animation `bgDrift`, duree 30s, vitesse constante, boucle infinie.

```css
@keyframes bgDrift {
    from { transform: translate(0, 0); }
    to { transform: translate(-50%, -50%); }
}
```
- **`@keyframes`** : Definit une animation CSS. `from`=debut, `to`=fin.
- **`translate(-50%, -50%)`** : Deplace l'element de 50% de sa taille vers la gauche et le haut. Puisque l'element fait 200%, ca cree un defilement continu.

### Flexbox

```css
#start-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
```
- **`display: flex`** : Active le mode Flexbox. Permet d'aligner les enfants facilement.
- **`flex-direction: column`** : Les enfants s'empilent verticalement (par defaut c'est `row` = horizontal).
- **`justify-content: center`** : Centre sur l'**axe principal** (vertical ici car `column`).
- **`align-items: center`** : Centre sur l'**axe secondaire** (horizontal ici).
- **`min-height: 100vh`** : Au minimum la hauteur de l'ecran.

### Boutons

```css
.btn {
    transition: all 0.25s ease;
}
.btn-play:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 35px rgba(76, 255, 114, 0.5);
}
```
- **`transition`** : Anime les changements de proprietes. `all` = toutes les proprietes, `0.25s` = duree, `ease` = acceleration douce.
- **`:hover`** : Pseudo-classe activee quand la souris survole l'element.
- **`transform: translateY(-3px)`** : Deplace l'element de 3px vers le haut. Cree un effet de "levitation".
- **`box-shadow`** : Ombre autour de l'element. `0 0 35px` = pas de decalage X/Y, flou de 35px.

### Gradient

```css
.btn-play {
    background: linear-gradient(135deg, #4cff72 0%, #00cc44 100%);
}
```
- **`linear-gradient`** : Degrade lineaire. `135deg` = angle de 135 degres (diagonale). Va de `#4cff72` (vert clair) a `#00cc44` (vert fonce).

### Modal

```css
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    backdrop-filter: blur(10px);
}
```
- **`display: none`** : Element invisible et retire du flux. JS le passe en `flex` pour l'afficher.
- **`position: fixed`** : Fixe par rapport a la fenetre (ne bouge pas au scroll).
- **`z-index: 1000`** : Couche d'empilement. Plus le nombre est grand, plus l'element est au-dessus des autres.
- **`backdrop-filter: blur(10px)`** : Floute tout ce qui est DERRIERE l'element. Effet "verre depoli".

### Clip-path (coeurs)

```css
.heart {
    clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5...');
}
```
- **`clip-path`** : Decoupe l'element selon une forme. `path()` utilise la syntaxe SVG pour definir une forme de coeur. Tout ce qui est en dehors du path est invisible.

### Grid (Leaderboard)

```css
.lb-row {
    display: grid;
    grid-template-columns: 50px 1fr 100px 80px;
}
```
- **`display: grid`** : Active CSS Grid Layout.
- **`grid-template-columns`** : Definit les colonnes. `50px` = fixe, `1fr` = prend tout l'espace restant (fraction), `100px` et `80px` = fixes.

### nth-child (couleurs podium)

```css
.lb-row:nth-child(2) .lb-rank { color: #ffd700; }
.lb-row:nth-child(3) .lb-rank { color: #c0c0c0; }
.lb-row:nth-child(4) .lb-rank { color: #cd7f32; }
```
- **`:nth-child(n)`** : Selectionne le n-ieme enfant. `nth-child(2)` = 2eme enfant (le 1er est le header). Donc : 2=or, 3=argent, 4=bronze.

### clamp()

```css
font-size: clamp(18px, 3vw, 28px);
```
- **`clamp(min, preferred, max)`** : La taille sera `3vw` (3% de la largeur de l'ecran), mais jamais en dessous de `18px` ni au-dessus de `28px`. Responsif sans media queries.

---

## 4. CSS — css/game.css (Styles jeu)

Memes concepts que `style.css`. Elements specifiques :

```css
#game-canvas {
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 0;
}
```
- Le canvas est en arriere-plan (`z-index: 0`). Le HUD est au-dessus (`z-index: 50`), le game over encore au-dessus (`z-index: 100`).

```css
#hud {
    pointer-events: none;
}
```
- **`pointer-events: none`** : Les clics "traversent" le HUD et atteignent le canvas en dessous. Le HUD est juste un affichage, pas interactif.

```css
.name-input:focus {
    border-color: #4cff72;
    box-shadow: 0 0 15px rgba(76, 255, 114, 0.2);
}
```
- **`:focus`** : Pseudo-classe activee quand l'element a le focus (l'utilisateur clique dedans ou utilise Tab).

```css
.name-input::placeholder {
    color: #444;
}
```
- **`::placeholder`** : Style le texte placeholder de l'input.

---

## 5. JS — js/menu.js (Logique menu)

### Recuperation des elements DOM

```js
const playBtn = document.getElementById("play-btn");
```
- **`document.getElementById()`** : Cherche dans le DOM l'element avec l'`id` specifie. Retourne l'element HTML ou `null`.
- **`const`** : Declare une variable dont la **reference** ne peut pas changer (on ne peut pas reassigner `playBtn`). L'objet lui-meme peut etre modifie.

### Evenements

```js
playBtn.addEventListener("click", () => {
    window.location.href = "html/game.html";
});
```
- **`addEventListener("click", callback)`** : Attache une fonction qui s'execute quand l'utilisateur clique.
- **`() => {}`** : **Arrow function** (ES6). Syntaxe courte pour une fonction anonyme.
- **`window.location.href`** : Change l'URL de la page = navigation vers une autre page.

```js
rulesModal.style.display = "flex";
```
- **`element.style`** : Accede au style inline de l'element. Ici on change `display` de `none` a `flex` pour rendre le modal visible.

```js
window.addEventListener("click", (e) => {
    if (e.target === rulesModal) rulesModal.style.display = "none";
});
```
- **`e`** : L'objet Event. Contient des infos sur l'evenement (quel element a ete clique, position, etc.).
- **`e.target`** : L'element exact qui a ete clique. Si c'est le fond du modal (pas le contenu), on ferme.
- **`===`** : Comparaison stricte (type ET valeur doivent etre identiques). Toujours preferer `===` a `==`.

### Leaderboard

```js
function getLeaderboard() {
    const data = localStorage.getItem("dangerousHarvestLeaderboard");
    return data ? JSON.parse(data) : [];
}
```
- **`localStorage`** : API du navigateur pour stocker des donnees persistantes (survit a la fermeture du navigateur).
- **`localStorage.getItem(key)`** : Lit une valeur. Retourne `null` si la cle n'existe pas.
- **`JSON.parse()`** : Convertit une chaine JSON en objet JavaScript. `localStorage` ne stocke que des strings.
- **`data ? ... : []`** : **Operateur ternaire**. Si `data` est truthy (pas null/undefined), parse-le, sinon retourne un tableau vide.

```js
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
```
- **`Math.floor()`** : Arrondit vers le bas. `Math.floor(3.9)` = 3.
- **`% 60`** : Operateur **modulo**. Donne le reste de la division. `125 % 60` = 5 (125 = 2*60 + 5).
- **`` `${}` ``** : **Template literal** (ES6). Permet d'inserer des expressions JS dans une string.
- **`String(n).padStart(2, "0")`** : Complete la string avec des "0" au debut jusqu'a 2 caracteres. `"5"` → `"05"`.

```js
const displayed = entries.slice(0, maxDisplay);
```
- **`Array.slice(start, end)`** : Retourne une copie d'une partie du tableau (de l'index `start` a `end` exclu). Ne modifie pas l'original.

```js
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
```
- **Protection XSS** : Si un joueur entre `<script>alert('hack')</script>` comme nom, `textContent` le traite comme du texte brut (pas du HTML). `innerHTML` retourne ensuite la version echappee (`&lt;script&gt;`). Empeche l'injection de code.

```js
container.innerHTML = html;
```
- **`innerHTML`** : Remplace tout le contenu HTML d'un element. Plus performant que de creer chaque element individuellement quand on a beaucoup de contenu.

---

## 6. JS — js/game.js (Moteur de jeu)

### C'est le fichier le plus gros. Decoupe par section.

---

### CANVAS SETUP

```js
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
```
- **`canvas`** : L'element HTML `<canvas>`.
- **`getContext("2d")`** : Retourne le **contexte de rendu 2D**. C'est l'objet avec toutes les methodes pour dessiner : `fillRect`, `drawImage`, `arc`, etc. (Il existe aussi `"webgl"` pour la 3D.)

```js
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
```
- Le canvas a une taille **interne** (resolution de dessin) et une taille **CSS** (affichage). On synchronise les deux avec `window.innerWidth/Height`.
- **`resize` event** : Se declenche quand l'utilisateur redimensionne la fenetre.

---

### CONFIGURATION

```js
const CONFIG = {
    PLAYER_SPEED: 5,
    ITEM_SIZE: 36,
    MUTATION_DELAY_BASE: 4000,
    // ...
};
```
- **Objet de configuration** : Toutes les valeurs "magiques" du jeu sont centralisees ici. Avantages :
  - Facile a modifier sans chercher dans le code
  - Noms explicites = auto-documentation
  - Les valeurs ne sont ecrites qu'une seule fois

---

### ASSET LOADING

```js
function loadAssets() {
    return new Promise((resolve) => {
        for (const asset of ASSET_LIST) {
            const img = new Image();
            img.onload = () => {
                assetsLoaded++;
                if (assetsLoaded >= ASSET_LIST.length) resolve();
            };
            img.src = asset.src;
            ASSETS[asset.key] = img;
        }
    });
}
```
- **`new Promise((resolve) => {})`** : Cree une **Promise** (promesse). C'est un objet qui represente une operation asynchrone. `resolve()` est appele quand l'operation est terminee.
- **`new Image()`** : Cree un element `<img>` en memoire (pas visible dans la page).
- **`img.onload`** : Callback appele quand l'image est completement chargee.
- **`img.onerror`** : Callback appele si l'image ne charge pas (on incremente quand meme pour ne pas bloquer).
- **`for...of`** : Boucle sur les elements d'un iterable (tableau, string, etc.). Plus lisible que `for (let i = 0; ...)`.
- On stocke chaque image dans `ASSETS[key]` pour y acceder rapidement plus tard.

```js
loadAssets().then(() => {
    startGame();
    requestAnimationFrame(gameLoop);
});
```
- **`.then()`** : Execute le callback quand la Promise est resolue. Ici, on demarre le jeu seulement APRES que toutes les images sont chargees.

---

### GAME STATE (variables)

```js
let gameState = "playing";
let score = 0;
let items = [];
```
- **`let`** : Variable dont la valeur peut changer (contrairement a `const`). Utilise pour l'etat du jeu qui evolue.
- **`"playing"`** : Le jeu a un **etat** qui determine son comportement : `"playing"` (en cours), `"gameover"` (fini).

---

### PLAYER

```js
const player = {
    x: 0, y: 0,
    width: CONFIG.PLAYER_SIZE,
    height: CONFIG.PLAYER_SIZE,
};
```
- **Objet litéral** : Le joueur est un objet avec ses proprietes. `x, y` = position, `width, height` = taille (pour la collision).

```js
function resetPlayer() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
}
```
- Place le joueur au centre-bas de l'ecran. Appele a chaque debut de partie.

---

### INPUT (gestion clavier)

```js
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
```
- **`keys`** : Objet qui stocke l'etat de chaque touche. `keys["ArrowUp"]` = `true` si la fleche haut est enfoncee.
- **`keydown`** : Se declenche quand une touche est ENFONCEE.
- **`keyup`** : Se declenche quand une touche est RELACHEE.
- **`e.key`** : Le nom de la touche (`"ArrowUp"`, `"w"`, `"d"`, etc.).
- **`e.preventDefault()`** : Empeche le comportement par defaut. Sans ca, les fleches scrolleraient la page.
- **`Array.includes()`** : Verifie si un element est dans le tableau.
- **Pourquoi cet objet `keys` ?** : On ne peut pas lire directement "est-ce que la touche est enfoncee maintenant ?". On doit ecouter les evenements et stocker l'etat.

---

### ITEMS (State Machine)

Chaque item suit un cycle d'etats :

```
entering → safe → warning → dangerous
```

```js
function createItem() {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
```
- **`Math.random()`** : Retourne un nombre aleatoire entre 0 (inclus) et 1 (exclu).
- **`Math.floor(Math.random() * n)`** : Genere un entier aleatoire entre 0 et n-1. Pattern classique pour choisir un element aleatoire dans un tableau.

```js
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: x = Math.random() * canvas.width; y = -CONFIG.ITEM_SIZE; break;
        case 1: x = canvas.width + CONFIG.ITEM_SIZE; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + CONFIG.ITEM_SIZE; break;
        default: x = -CONFIG.ITEM_SIZE; y = Math.random() * canvas.height; break;
    }
```
- **`switch`** : Equivalent a une serie de `if/else if`. Plus lisible quand on compare une variable a plusieurs valeurs.
- **`break`** : Sort du `switch`. Sans `break`, l'execution "tombe" dans le `case` suivant (fall-through).
- **`default`** : Comme le `else` d'un `if`. S'execute si aucun `case` ne correspond.
- Les 4 `case` correspondent aux 4 bords de l'ecran (haut, droite, bas, gauche). L'item apparait hors ecran.

```js
    const mutationDelay = Math.max(
        CONFIG.MUTATION_DELAY_MIN,
        CONFIG.MUTATION_DELAY_BASE - (wave - 1) * 300
    );
```
- **`Math.max(a, b)`** : Retourne le plus grand des deux. Ici, ca garantit que le delai ne descend jamais en dessous de `MUTATION_DELAY_MIN` (1500ms).
- `(wave - 1) * 300` : A chaque wave, le delai diminue de 300ms. Wave 1 = 4000ms, Wave 2 = 3700ms, etc.

```js
    return { x, y, targetX, targetY, state: "entering", ... };
```
- **Shorthand property** (ES6) : `{ x, y }` est equivalent a `{ x: x, y: y }`. Si le nom de la cle = nom de la variable, on peut simplifier.

#### Mise a jour des items

```js
for (let i = items.length - 1; i >= 0; i--) {
```
- **Boucle inversee** : On parcourt le tableau de la fin au debut. OBLIGATOIRE quand on supprime des elements avec `splice` pendant l'iteration. Si on boucle de 0 a N et qu'on supprime l'element 3, l'element 4 prend l'index 3 et est saute.

```js
    const dx = item.targetX - item.x;
    const dy = item.targetY - item.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    item.x += (dx / dist) * item.enterSpeed;
    item.y += (dy / dist) * item.enterSpeed;
```
- **Vecteur de direction normalise** :
  - `dx, dy` = difference de position (vecteur vers la cible)
  - `dist` = distance euclidienne (theoreme de Pythagore : `sqrt(a² + b²)`)
  - `dx/dist, dy/dist` = vecteur de direction de longueur 1 (normalise)
  - Multiplier par `speed` donne un deplacement constant quelle que soit la distance

```js
    item.y += Math.sin((Date.now() / 600) + item.bobOffset) * 0.3;
```
- **Mouvement sinusoidal (bobbing)** : `Math.sin()` retourne un nombre entre -1 et 1. En fonction du temps (`Date.now()`), l'item flotte doucement. `bobOffset` decale la phase pour que tous les items ne bougent pas en meme temps.

```js
    items.splice(i, 1);
    continue;
```
- **`Array.splice(index, count)`** : Supprime `count` elements a partir de `index`. Ici, supprime 1 element a l'index `i`.
- **`continue`** : Saute a l'iteration suivante de la boucle (l'item a ete supprime, pas besoin de continuer a le traiter).

---

### DESSIN (Canvas API)

```js
ctx.save();
ctx.translate(item.x, item.y);
// ... dessin ...
ctx.restore();
```
- **`ctx.save()`** : Sauvegarde l'etat actuel du contexte (transformations, couleurs, etc.) sur une pile.
- **`ctx.translate(x, y)`** : Deplace l'origine du repere. Apres ca, dessiner a (0,0) dessine en fait a (x,y). Pratique pour positionner des objets.
- **`ctx.restore()`** : Restaure l'etat sauvegarde. Annule tous les `translate`, `rotate`, `scale` faits entre `save` et `restore`.

```js
ctx.shadowColor = "#4cff72";
ctx.shadowBlur = 12;
```
- **Shadow** : Ajoute une ombre/lueur autour de tout ce qui est dessine. `shadowColor` = couleur, `shadowBlur` = intensite du flou.

```js
ctx.drawImage(img, -halfSize, -halfSize, size, size);
```
- **`drawImage(image, x, y, width, height)`** : Dessine une image. Les coordonnees negatives `-halfSize` centrent l'image sur l'origine (sinon le coin haut-gauche serait a l'origine).

```js
ctx.rotate(item.angle);
```
- **`ctx.rotate(radians)`** : Tourne le repere. Les items dangereux tournent sur eux-memes (`item.angle += 0.05` a chaque frame).

```js
ctx.scale(scale, scale);
```
- **`ctx.scale(x, y)`** : Agrandit/retrecit le repere. Utilise pour l'effet de pulsation en mode "warning".

```js
ctx.globalAlpha = p.life;
```
- **`globalAlpha`** : Transparence globale (0=invisible, 1=opaque). Les particules deviennent transparentes en mourant (`life` decroit vers 0).

---

### PARTICULES

```js
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        particles.push({
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.02,
        });
    }
}
```
- **`Math.PI * 2`** : Un cercle complet en radians (360 degres).
- **`(Math.PI * 2 / count) * i`** : Repartit les particules uniformement en cercle.
- **`Math.cos(angle)` / `Math.sin(angle)`** : Convertit un angle en coordonnees X/Y. Trigonometrie de base pour le mouvement circulaire.
- **`vx, vy`** : Velocite (vitesse) en X et Y. A chaque frame, la position est mise a jour : `x += vx`.

```js
p.vx *= 0.97;
p.vy *= 0.97;
```
- **Friction/Damping** : Multiplie la vitesse par un nombre < 1 a chaque frame. Les particules ralentissent progressivement (0.97 = perd 3% de vitesse par frame).

---

### COLLISION (AABB)

```js
function checkCollision(a, b) {
    const ax = a.x - a.width / 2;
    const ay = a.y - a.height / 2;
    const bx = b.x - b.width / 2;
    const by = b.y - b.height / 2;
    return (
        ax < bx + b.width &&
        ax + a.width > bx &&
        ay < by + b.height &&
        ay + a.height > by
    );
}
```
- **AABB** = Axis-Aligned Bounding Box. Methode la plus simple de detection de collision.
- On convertit les positions (centre) en coins haut-gauche (`x - width/2`).
- Les 4 conditions verifient que les deux rectangles se **chevauchent** :
  - `ax < bx + b.width` : Le cote gauche de A est a gauche du cote droit de B
  - `ax + a.width > bx` : Le cote droit de A est a droite du cote gauche de B
  - (idem pour Y)
- Si les 4 sont vraies en meme temps = collision.

---

### DAMAGE & INVINCIBILITY

```js
function takeDamage() {
    if (isInvincible || lives <= 0) return;
    lives--;
    isInvincible = true;
    invincibilityTimer = CONFIG.INVINCIBILITY_DURATION;
    screenShakeTimer = CONFIG.SCREEN_SHAKE_DURATION;
}
```
- **Guard clause** : `if (...) return;` quitte la fonction immediatement si le joueur est deja invincible ou mort. Evite de perdre plusieurs vies d'un coup.
- **`lives--`** : Decremente de 1 (equivalent a `lives = lives - 1`).
- **Invincibility frames** : Apres un degat, le joueur est invincible pendant 1.2 secondes. Pattern classique des jeux (comme dans Mario, Zelda, etc.).

---

### SCREEN SHAKE

```js
function applyScreenShake() {
    if (screenShakeTimer > 0) {
        const ratio = screenShakeTimer / CONFIG.SCREEN_SHAKE_DURATION;
        const intensity = CONFIG.SCREEN_SHAKE_INTENSITY * ratio;
        ctx.translate(
            (Math.random() - 0.5) * intensity * 2,
            (Math.random() - 0.5) * intensity * 2
        );
    }
}
```
- **`(Math.random() - 0.5)`** : Donne un nombre entre -0.5 et 0.5. Utilise pour un decalage aleatoire dans les deux directions.
- **`ratio`** : Diminue de 1 a 0 au fil du temps. L'intensite du shake diminue progressivement (ease out).
- En deplacant tout le repere du canvas aleatoirement a chaque frame, on cree un effet de tremblement.

---

### GAME LOOP

```js
function gameLoop(timestamp) {
    const deltaTime = lastTimestamp ? Math.min(timestamp - lastTimestamp, 50) : 16;
    lastTimestamp = timestamp;
    update(deltaTime);
    render();
    requestAnimationFrame(gameLoop);
}
```
- **`requestAnimationFrame(callback)`** : Demande au navigateur d'appeler `callback` avant le prochain rafraichissement d'ecran (~60 fois/seconde). Plus performant et fluide que `setInterval`.
- **`timestamp`** : Le temps en millisecondes fourni par le navigateur. Tres precis.
- **Delta Time** : `timestamp - lastTimestamp` = temps ecoule depuis la derniere frame. CRUCIAL : si on bouge de `5px` par frame et que le PC rame (30fps au lieu de 60fps), le jeu serait 2x plus lent. Avec le delta time, on multiplie la vitesse par le temps ecoule, donc le jeu va a la meme vitesse quel que soit le framerate.
- **`Math.min(..., 50)`** : Plafonne le delta time a 50ms. Si le navigateur se fige 2 secondes, on ne veut pas que le jeu fasse un bond enorme.

```js
function update(deltaTime) {
    if (gameState !== "playing") return;
    elapsedTime += deltaTime;
    score += CONFIG.POINTS_PER_SECOND * (deltaTime / 1000);
    // ...
}
```
- **Separation update/render** : `update()` calcule la logique (positions, collisions, scores), `render()` dessine. C'est un pattern standard du game dev.
- **`deltaTime / 1000`** : Convertit les ms en secondes pour le calcul du score (1 point par seconde).

---

### WAVE SYSTEM

```js
function checkWaveProgress(deltaTime) {
    waveTimer += deltaTime;
    if (waveTimer >= CONFIG.WAVE_DURATION) {
        waveTimer = 0;
        wave++;
        if (Math.random() < CONFIG.NOTHING_SAFE_CHANCE * wave) {
            setTimeout(triggerNothingSafe, 1500);
        }
    }
}
```
- **`waveTimer`** : Accumule le temps. Quand il depasse 30000ms (30s), nouvelle wave.
- **`Math.random() < 0.08 * wave`** : Probabilite qui augmente avec les waves. Wave 1 = 8% de chance, Wave 5 = 40%, etc.
- **`setTimeout(fn, delay)`** : Execute `fn` apres `delay` ms. Ici, l'evenement "Nothing is Safe" arrive 1.5s apres l'annonce de la wave.

```js
function announceWave() {
    waveAnnounceText.style.animation = "none";
    void waveAnnounceText.offsetHeight;
    waveAnnounceText.style.animation = "wavePopIn 0.5s ease-out";
}
```
- **Trick pour relancer une animation CSS** :
  1. `animation = "none"` : Supprime l'animation
  2. `void element.offsetHeight` : Force le navigateur a recalculer le layout (reflow). Le `void` est la pour indiquer qu'on ignore la valeur retournee.
  3. `animation = "..."` : Relance l'animation depuis le debut

---

### LEADERBOARD

```js
function saveToLeaderboard(name, scoreValue, timeValue, waveValue) {
    const entry = {
        name: name.trim().substring(0, 12) || "Player",
        score: scoreValue,
        time: timeValue,
        wave: waveValue,
        date: Date.now(),
    };
    entries.push(entry);
    entries.sort((a, b) => b.score - a.score || b.time - a.time);
```
- **`String.trim()`** : Supprime les espaces au debut et a la fin. `"  John  "` → `"John"`.
- **`String.substring(0, 12)`** : Extrait les 12 premiers caracteres.
- **`|| "Player"`** : Si le nom est vide (string vide = falsy), utilise "Player" par defaut.
- **`Date.now()`** : Retourne le timestamp actuel en ms. Utilise comme identifiant unique de l'entree.
- **`Array.sort((a, b) => ...)`** : Trie le tableau. Si le retour est negatif, `a` vient avant `b`. `b.score - a.score` = tri decroissant par score.
- **`|| b.time - a.time`** : En cas d'egalite de score (`b.score - a.score` = 0, qui est falsy), trie par temps.

```js
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
```
- **`JSON.stringify()`** : Convertit un objet JS en chaine JSON. Necessaire car `localStorage` ne stocke que des strings.

```js
playerNameInput.addEventListener("keydown", (e) => {
    e.stopPropagation();
});
```
- **`e.stopPropagation()`** : Empeche l'evenement de "remonter" vers les parents. Sans ca, taper "W" dans l'input deplace aussi le joueur (car l'ecouteur `keydown` global est aussi actif).

---

## 7. Concepts cles a connaitre

### Mots-cles JavaScript

| Mot-cle | Utilisation |
|---------|-------------|
| `const` | Variable non-reassignable (reference fixe) |
| `let` | Variable reassignable (valeur peut changer) |
| `function` | Declare une fonction nommee |
| `() => {}` | Arrow function (fonction anonyme courte) |
| `return` | Retourne une valeur et quitte la fonction |
| `if/else` | Condition |
| `switch/case` | Condition a valeurs multiples |
| `for` | Boucle classique |
| `for...of` | Boucle sur les elements d'un iterable |
| `while` | Boucle tant que la condition est vraie |
| `break` | Sort d'une boucle ou d'un switch |
| `continue` | Passe a l'iteration suivante |
| `new` | Cree une instance d'un objet |
| `this` | Reference a l'objet courant |
| `null` | Absence volontaire de valeur |
| `undefined` | Variable declaree mais pas initialisee |
| `true/false` | Booleens |

### APIs du navigateur utilisees

| API | A quoi ca sert |
|-----|---------------|
| `document.getElementById()` | Recuperer un element HTML |
| `document.createElement()` | Creer un element HTML |
| `element.addEventListener()` | Ecouter un evenement |
| `element.style` | Modifier le CSS inline |
| `element.classList` | Ajouter/supprimer des classes CSS |
| `element.innerHTML` | Lire/ecrire le HTML interne |
| `element.textContent` | Lire/ecrire le texte brut |
| `canvas.getContext("2d")` | Contexte de dessin 2D |
| `ctx.drawImage()` | Dessiner une image |
| `ctx.fillRect()` | Dessiner un rectangle plein |
| `ctx.arc()` | Dessiner un cercle |
| `ctx.fillText()` | Dessiner du texte |
| `ctx.save() / restore()` | Sauvegarder/restaurer l'etat |
| `ctx.translate() / rotate() / scale()` | Transformations |
| `requestAnimationFrame()` | Boucle de rendu a 60fps |
| `setTimeout()` | Executer du code apres un delai |
| `localStorage` | Stockage persistant cote client |
| `JSON.parse() / stringify()` | Conversion objet ↔ string |
| `window.location.href` | Naviguer vers une autre page |
| `window.innerWidth / innerHeight` | Dimensions de la fenetre |

### Design Patterns utilises

| Pattern | Ou dans le code | Pourquoi |
|---------|----------------|----------|
| **Game Loop** | `gameLoop()` → `update()` → `render()` | Separe la logique du rendu, boucle a 60fps |
| **State Machine** | Item states: entering → safe → warning → dangerous | Gere les comportements complexes de maniere propre |
| **Delta Time** | `deltaTime = timestamp - lastTimestamp` | Gameplay constant quel que soit le framerate |
| **Object Pool** | `items[]`, `particles[]` | Tableaux de toutes les entites actives |
| **Configuration Object** | `CONFIG = { ... }` | Centralise les valeurs de gameplay |
| **Guard Clause** | `if (isInvincible) return;` | Sort tot pour eviter du code imbrique |
| **Observer Pattern** | `addEventListener("click", ...)` | Reagir aux actions utilisateur |

### Formules mathematiques

| Formule | Code | Utilisation |
|---------|------|-------------|
| Distance | `Math.sqrt(dx*dx + dy*dy)` | Theoreme de Pythagore |
| Direction | `dx/dist, dy/dist` | Vecteur normalise (longueur 1) |
| Mouvement | `x += (dx/dist) * speed` | Deplacement vers une cible |
| Oscillation | `Math.sin(time) * amplitude` | Mouvement de va-et-vient |
| Random range | `min + Math.random() * (max-min)` | Nombre aleatoire entre min et max |
| Random int | `Math.floor(Math.random() * n)` | Entier aleatoire entre 0 et n-1 |
| Friction | `velocity *= 0.97` | Ralentissement progressif |

---

> **Conseil pour l'oral :** Si on te demande "a quoi sert cette ligne ?", commence par dire CE QUE CA FAIT en une phrase, puis POURQUOI c'est necessaire. Exemple : "Cette ligne calcule la distance entre l'item et le joueur en utilisant le theoreme de Pythagore, pour que l'item dangereux puisse se deplacer vers le joueur a vitesse constante."
