# Design System — et si mamie etait vege ?

> Reference unique pour tous les composants UI, tokens, typographie et patterns du projet.
> Toute nouvelle page ou composant doit respecter ces conventions.

---

## 1. Couleurs

### Palette principale

| Token              | Hex       | Usage                                        |
| ------------------- | --------- | -------------------------------------------- |
| `primary`           | `#E8450E` | CTA, liens actifs, accents, icones actives   |
| `primary-light`     | `#FF6B3D` | Hover CTA sur fond sombre, highlights        |
| `primary-dark`      | `#C13A0A` | Hover CTA sur fond clair                     |
| `secondary`         | `#2D6A4F` | Succes, toast, badges utilisateur connecte   |
| `secondary-light`   | `#40916C` | Variante hover secondary                     |
| `accent`            | `#F4A261` | Reserve (accentuation douce)                 |

### Neutres

| Token        | Hex       | Usage                                     |
| ------------ | --------- | ----------------------------------------- |
| `bg`         | `#FAFAF8` | Fond global de la page                    |
| `bg-warm`    | `#F5F0EB` | Sections alternees, fond image placeholder|
| `text`       | `#1A1A1A` | Texte principal, titres                   |
| `text-light` | `#6B6B6B` | Texte secondaire, labels, meta            |
| `border`     | `#E8E4DF` | Bordures cartes, separateurs              |

### Couleurs utilitaires

| Pattern                   | Usage                            |
| ------------------------- | -------------------------------- |
| `bg-black/[0.04]`        | Fond input, fond sidebar filtre  |
| `bg-black/[0.06]`        | Fond segment-group               |
| `bg-white/90`             | Badge overlay sur image          |
| `bg-white/95`             | Bouton favori overlay            |
| `bg-primary/10`           | Fond icone label section         |
| `bg-secondary/10`         | Fond badge user connecte, toast  |
| `border-black/5`          | Bordure subtile (bouton favori)  |
| `border-black/10`         | Tag actif                        |
| `text-white/55`           | Sous-titre sur fond sombre       |
| `text-white/70`           | Meta sur fond sombre             |

---

## 2. Typographie

### Familles de polices

| Token           | Police                                    | Usage                                          |
| --------------- | ----------------------------------------- | ---------------------------------------------- |
| `font-display`  | Contrail One, system-ui, Georgia, serif   | Titres h1-h3, noms de recettes, labels hero    |
| `font-accent`   | Space Grotesk, system-ui, sans-serif      | Labels de section, badges, meta chiffrees      |
| `font-sans`     | Satoshi, system-ui, sans-serif            | Corps de texte, liens, boutons, paragraphes    |
| `font-script`   | Caveat, cursive                           | Annotations manuscrites, notes                 |

### Poids disponibles (Satoshi)

- `400` — Regular (corps de texte)
- `500` — Medium (boutons, labels, meta)
- `700` — Bold (titres renforces)

### Taille de base

```
html { font-size: 18px; }
body { letter-spacing: -0.03em; }
```

### Echelle typographique

| Element                | Classes Tailwind                                                      |
| ---------------------- | --------------------------------------------------------------------- |
| **H1 — Hero**          | `font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight` |
| **H1 — Page**          | `font-display text-3xl sm:text-4xl text-text`                         |
| **H2 — Section**       | `font-display text-3xl sm:text-4xl text-text`                         |
| **H2 — Hero CTA**      | `font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight` |
| **H3 — Carte recette** | `font-display text-lg text-text leading-snug`                         |
| **H3 — Carte blog**    | `text-[15px] font-medium text-text leading-snug line-clamp-2`         |
| **H3 — Carte compacte**| `text-sm font-medium text-text truncate`                              |
| **H4 — Footer titre**  | `text-xs font-medium uppercase tracking-wider text-text-light`        |
| **Body**               | `text-sm text-text-light leading-relaxed` ou `text-base text-text-light leading-relaxed` |
| **Caption / meta**     | `text-xs text-text-light`                                             |
| **Label section**       | Classe `.recipe-section-title` (voir CSS custom)                      |
| **Annotation script**   | Classe `.recipe-annotation` (Caveat, 1rem, text-light)               |
| **Compteur accent**     | `font-accent text-sm font-medium text-primary tabular-nums`          |

### Classes CSS custom (typographie)

```css
.recipe-section-title {
  font-family: var(--font-accent);   /* Space Grotesk */
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  display: inline-block;
}

.recipe-annotation {
  font-family: var(--font-script);   /* Caveat */
  font-size: 1rem;
  line-height: 1.4;
  color: var(--color-text-light);
}

.recipe-script-note {
  font-family: var(--font-script);
  font-size: 0.9375rem;
  color: var(--color-text-light);
  font-weight: 500;
}
```

---

## 3. Boutons

### Bouton primaire (CTA)

```
inline-flex items-center justify-center gap-2
px-7 py-3.5
bg-primary text-white text-sm font-medium
rounded-full
hover:bg-primary-dark transition-colors
shadow-lg shadow-primary/20
```

### Bouton primaire sur fond sombre

```
/* Meme structure, hover different */
hover:bg-primary-light transition-colors
/* Pas de shadow-lg */
```

### Bouton secondaire (outline)

```
inline-flex items-center justify-center gap-2
px-7 py-3.5
bg-white border border-border
text-sm font-medium rounded-full text-text
hover:border-text transition-colors shadow-sm
```

### Bouton secondaire sur fond sombre

```
px-7 py-3.5
border border-white/20 text-white/80
text-sm font-medium rounded-full
hover:border-white/50 hover:text-white transition-colors
```

### Bouton filtre mobile

```
inline-flex items-center gap-1.5
px-3 py-2 rounded-lg
border border-border text-sm text-text
hover:border-text/30 transition-colors
```

### Bouton bottom-sheet "Voir N recettes"

```
flex-1 py-3 rounded-xl
bg-primary text-white text-sm font-medium
hover:bg-primary-dark transition-colors
```

### Bouton bottom-sheet "Effacer"

```
flex-1 py-3 rounded-xl
border border-border text-sm font-medium text-text-light
hover:text-text transition-colors
```

### Bouton ghost / lien texte

```
text-sm text-text-light hover:text-primary transition-colors
/* Avec icone fleche : flex items-center gap-1 */
```

### Bouton reset filtres

```
text-sm text-primary hover:text-primary-dark transition-colors
```

### Bouton icone (favori)

```
p-2 rounded-lg
bg-white/95 hover:bg-white transition-colors
shadow-sm border border-black/5
```

### Bouton filtre blog (pill)

```
text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200
flex items-center gap-2

/* Actif */
bg-primary text-white shadow-sm

/* Inactif */
bg-white text-text-light border border-border
hover:border-primary/30 hover:text-text
```

### Bouton sidebar filtre (list item)

```
block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors

/* Actif */
bg-white text-text font-medium shadow-sm

/* Inactif */
text-text-light hover:text-text
```

### Bouton dashed "Voir tout" (Hero carousel)

```
flex flex-col items-center justify-center gap-3
rounded-2xl border-2 border-dashed border-border
hover:border-primary hover:bg-primary/5
transition-all duration-300
```

---

## 4. Cartes

### Carte recette (grille)

```
/* Conteneur */
group overflow-hidden recipe-card-frame relative rounded-xl

/* Image */
aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden rounded-t-xl
bg-bg-warm p-5 sm:p-4    /* images detourees */

/* Contenu */
p-4
  h3: font-display text-lg text-text leading-snug
  meta: mt-1 text-sm font-medium text-text-light
  tags: mt-3 flex flex-wrap gap-1.5
```

### Carte recette compacte (liste)

```
group flex items-center gap-4 py-3 rounded-xl
hover:bg-black/[0.03] transition-colors -mx-1 px-1

/* Thumbnail */
w-16 h-16 rounded-lg overflow-hidden flex-shrink-0
```

### Carte blog (grille)

```
group rounded-2xl overflow-hidden border border-border bg-white
shadow-sm hover:shadow-md hover:border-primary/20
transition-all duration-300 flex flex-col

/* Image */
aspect-[3/2] overflow-hidden bg-bg-warm relative

/* Contenu */
p-5 flex flex-col flex-1
  date: text-xs text-text-light mb-2
  h3: text-[15px] font-medium text-text leading-snug line-clamp-2
  excerpt: mt-2 text-xs text-text-light leading-relaxed line-clamp-2
  footer: mt-4 pt-4 border-t border-border
```

### Carte blog featured

```
rounded-2xl overflow-hidden border border-border bg-white
shadow-sm hover:shadow-md hover:border-primary/20
transition-all duration-300

/* Layout */
grid grid-cols-1 lg:grid-cols-2
  image: aspect-[3/2] lg:aspect-auto lg:max-h-[360px]
  contenu: p-6 lg:p-10 flex flex-col justify-center
```

### Carte hero recette (carrousel)

```
flex-shrink-0 w-[220px] snap-start rounded-2xl overflow-hidden
shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5

/* Image */
aspect-[3/4] overflow-hidden

/* Overlay gradient */
absolute inset-x-0 bottom-0
bg-gradient-to-t from-black/70 via-black/30 to-transparent
p-4 pt-12
```

### recipe-card-frame (CSS custom)

```css
.recipe-card-frame {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.recipe-card-frame:hover {
  border-color: rgb(0 0 0 / 0.12);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.06);
}
```

---

## 5. Formulaires & Inputs

### Champ de recherche

```
w-full pl-9 pr-3 py-2.5
bg-black/[0.04] border border-transparent rounded-[10px]
text-sm text-text placeholder:text-text-light/60
focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white
```

### Icone dans input

```
absolute left-3 top-1/2 -translate-y-1/2 text-text-light
```

### Groupe de filtres sidebar

```
/* Conteneur */
p-1 rounded-[10px] bg-black/[0.04]

/* Label */
text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1

/* Option (bouton list-item) : voir section Boutons */
```

### Planning filter label (CSS custom)

```css
.planning-filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-light);
  margin-bottom: 0.375rem;
}
.planning-filter-input {
  font-size: 0.875rem;
}
```

---

## 6. Tags & Badges

### Tag recette (sur carte)

```
text-[15px] font-medium px-2.5 py-1
rounded-lg bg-[rgb(0,0,0,0.05)] border border-black/8 text-text
```

### Tag filtre (sidebar)

```
text-[15px] px-2.5 py-1.5 rounded-lg border transition-colors

/* Actif */
bg-white border-black/10 text-text font-medium shadow-sm

/* Inactif */
bg-black/[0.04] border-transparent text-text-light
hover:text-text hover:bg-black/[0.06]
```

### Badge categorie overlay (sur image blog)

```
text-[11px] font-medium px-2.5 py-0.5 rounded-full
bg-white/90 backdrop-blur-sm text-primary
```

### Badge categorie featured

```
text-xs font-medium px-3 py-1 rounded-full
bg-white/90 backdrop-blur-sm text-primary shadow-sm
```

### Pill hero inline

```
inline-flex items-center gap-2
px-4 py-1.5 rounded-full
border border-white/20
text-[11px] font-accent tracking-widest uppercase text-white/50
```

### Badge user connecte (navbar)

```
flex items-center gap-2 text-sm rounded-lg px-3 py-2
bg-secondary/10 text-secondary font-medium
hover:bg-secondary/15 border border-secondary/20
```

### Recipe stamp (CSS custom)

```css
.recipe-stamp {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  color: var(--color-text-light);
  transform: rotate(-1.5deg);
}
```

---

## 7. Layout & Espacement

### Container principal

```
max-w-7xl mx-auto px-6 lg:px-8
```

### Espacement sections

```
/* Page content */
px-6 lg:px-8 py-12

/* Sections homepage */
px-6 lg:px-8 py-20

/* Hero */
pt-24 pb-16 lg:pt-32 lg:pb-24

/* Footer */
mt-20 (border-t), py-12 interieur
```

### Grilles

```
/* Recettes / Blog — 3 colonnes */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8

/* Blog grid (variante) */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7

/* Footer */
grid grid-cols-1 md:grid-cols-4 gap-8

/* Sidebar + content (Recipes) */
flex flex-col lg:flex-row gap-12
  aside: hidden lg:block lg:w-56 flex-shrink-0
  main: flex-1
```

### Carousel horizontal

```
flex gap-5 overflow-x-auto pb-4
-mx-6 px-6 lg:mx-0 lg:px-0
snap-x snap-mandatory
scrollbar-width: none
```

### Sticky sidebar

```
lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1
```

---

## 8. Bordures & Ombres

### Border radius

| Token         | Valeur | Usage                                    |
| ------------- | ------ | ---------------------------------------- |
| `rounded-sm`  | 4px    | Images blog homepage                     |
| `rounded-lg`  | 8px    | Boutons, thumbnails, items sidebar       |
| `rounded-xl`  | 12px   | Cartes recettes, bottom-sheet boutons    |
| `rounded-2xl` | 16px   | Cartes blog, hero cards, modals          |
| `rounded-full`| 9999px | Boutons CTA, pills, badges, avatars      |
| `rounded-[10px]`| 10px | Inputs, conteneurs filtres sidebar       |

### Shadows

| Classe                     | Usage                                      |
| -------------------------- | ------------------------------------------ |
| `shadow-sm`                | Cartes repos, boutons actifs sidebar       |
| `shadow-md`                | Cartes hover                               |
| `shadow-lg`                | CTA primaire, toast, modals               |
| `shadow-xl`                | Hero cards hover                           |
| `shadow-2xl`               | Bottom-sheet mobile                        |
| `shadow-lg shadow-primary/20` | CTA primaire avec teinte orange         |
| `0 1px 3px rgb(0 0 0 / 0.04)` | recipe-card-frame (CSS)               |
| `0 4px 12px rgb(0 0 0 / 0.06)`| recipe-card-frame hover (CSS)         |

### Bordures

| Pattern                        | Usage                           |
| ------------------------------ | ------------------------------- |
| `border border-border`         | Cartes, separateurs             |
| `border-t border-border`       | Navbar bottom, footer top       |
| `border-b border-border`       | Navbar                          |
| `border border-white/10`       | Screenshot planning (fond noir) |
| `border border-white/20`       | Boutons sur fond sombre         |
| `border-2 border-dashed border-border` | Carte "voir tout" CTA  |

---

## 9. Navbar

```
sticky top-0 z-50
bg-bg/80 backdrop-blur-md
border-b border-border

/* Container interieur */
max-w-7xl mx-auto px-6 lg:px-8
flex items-center justify-between h-16

/* Lien actif */
text-sm tracking-wide text-primary font-medium

/* Lien inactif */
text-sm tracking-wide text-text-light hover:text-text transition-colors

/* Menu mobile */
md:hidden border-t border-border bg-bg
px-6 py-4 space-y-3
```

---

## 10. Footer

```
border-t border-border mt-20

/* Container */
max-w-7xl mx-auto px-6 lg:px-8 py-12

/* Titre colonne */
text-xs font-medium uppercase tracking-wider text-text-light mb-4

/* Lien */
block text-sm text-text-light hover:text-text transition-colors

/* Copyright */
text-xs text-text-light

/* Annotation decorative */
recipe-annotation text-text-light/80 text-lg
```

---

## 11. Bottom sheet mobile (filtres)

```
/* Overlay */
fixed inset-0 z-50
bg-black/40 backdrop-blur-sm

/* Panel */
absolute bottom-0 left-0 right-0
max-h-[85vh] rounded-t-2xl bg-white shadow-2xl
overflow-y-auto animate-slide-up

/* Handle bar */
w-10 h-1 rounded-full bg-black/15 mx-auto

/* Header sticky */
sticky top-0 bg-white z-10 pt-3 pb-2 px-6 border-b border-black/5

/* Contenu */
p-6 space-y-6

/* Footer sticky */
sticky bottom-0 bg-white border-t border-black/5 p-4 flex gap-3
```

---

## 12. Toast

```
/* Conteneur fixe */
fixed left-0 right-0 top-20 z-[60] px-4
flex justify-center pointer-events-none

/* Toast card */
w-full max-w-md rounded-xl shadow-lg overflow-hidden
animate-action-success backdrop-blur-md pointer-events-auto

/* Variante success */
bg-secondary/10 border border-secondary/20 text-text

/* Variante info */
bg-white/95 border border-border text-text

/* Icone */
flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
animate-action-check
bg-secondary/20     /* success */
bg-black/5          /* info */

/* Barre de progression */
h-1 bg-secondary/30 overflow-hidden rounded-b-xl
  > div: h-full bg-secondary rounded-b-xl origin-left toast-progress
```

---

## 13. Segmented controls (CSS custom)

```css
.segment-group {
  display: flex;
  padding: 3px;
  background-color: rgb(0 0 0 / 0.06);
  border-radius: 10px;
}
.segment-item {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.segment-item:hover {
  color: var(--color-text);
}
.segment-item.is-selected {
  background: white;
  color: var(--color-text);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
}
```

---

## 14. Images

### Recette carte (grille)

```
max-w-full max-h-full object-contain rounded-lg
group-hover:scale-105 transition-transform duration-500
/* Container : bg-bg-warm p-5 sm:p-4 */
```

### Recette carte compacte

```
w-full h-full object-cover
transition-transform duration-500
/* Container : w-16 h-16 rounded-lg */
```

### Blog carte

```
w-full h-full object-cover
group-hover:scale-105 transition-transform duration-700
loading="lazy" decoding="async"
```

### Hero carousel

```
w-full h-full object-cover
group-hover:scale-105 transition-transform duration-700
```

### Placeholder (sans photo)

```
w-full h-full object-contain scale-[0.42] recipe-image-placeholder
/* Container : bg-bg-warm */
```

### Optimisation

- Utiliser `getOptimizedImageUrl(src, maxWidth)` pour toutes les images
- Toujours fournir `srcSet` avec 2 tailles et `sizes` responsive
- `loading="lazy"` sur toutes les images sauf hero above-the-fold
- `decoding="async"` sur toutes les images
- Toujours renseigner `width` et `height` pour eviter CLS

---

## 15. Transitions & Animations

### Transitions standard

| Classe                           | Usage                              |
| -------------------------------- | ---------------------------------- |
| `transition-colors`              | Boutons, liens, textes             |
| `transition-all duration-200`    | Pills blog                         |
| `transition-all duration-300`    | Cartes blog, carte dashed          |
| `transition-all duration-500`    | Hero cards                         |
| `transition-transform duration-500` | Images recettes hover           |
| `transition-transform duration-700` | Images blog hover               |

### Keyframes custom

```css
/* Entree bottom-sheet */
@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Float hero background */
@keyframes hero-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(4px, -6px) scale(1.02); }
  66%      { transform: translate(-3px, 4px) scale(0.98); }
}

/* Entree texte hero (staggered) */
@keyframes hero-text-in {
  0%   { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Planning drag & drop */
@keyframes planning-card-land {
  0%   { transform: scale(1.08); box-shadow: 0 12px 24px -8px rgb(0 0 0 / 0.2); }
  60%  { transform: scale(1.02); }
  100% { transform: scale(1); box-shadow: none; }
}

/* Toast entree */
@keyframes action-success-in {
  0%   { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Toast check icon pop */
@keyframes action-check-pop {
  0%   { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

/* Toast progress bar */
@keyframes toast-progress-shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
```

### Hero text stagger pattern

```jsx
animate-[hero-text-in_0.6s_ease-out]                  /* label */
animate-[hero-text-in_0.6s_ease-out_0.1s_both]        /* h1 */
animate-[hero-text-in_0.6s_ease-out_0.2s_both]        /* paragraphe */
animate-[hero-text-in_0.6s_ease-out_0.3s_both]        /* boutons */
animate-[hero-text-in_0.6s_ease-out_0.4s_both]        /* carousel */
```

### Hover transforms

| Pattern                              | Usage                |
| ------------------------------------ | -------------------- |
| `hover:scale-105`                    | Images dans cartes   |
| `hover:-translate-y-1.5`            | Hero recipe cards    |
| `hover:translate-x-0.5`             | Icone fleche         |
| `group-hover:scale-105`             | Images (via parent)  |
| `opacity-0 group-hover:opacity-100` | Label "Lire" blog    |

---

## 16. Elements decoratifs

### Texture papier (fond global)

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  /* SVG fractalNoise */
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}
```

### Ligne ondulee separatrice

```css
.deco-wave {
  width: 48px;
  height: 6px;
  /* SVG wave stroke primary */
  margin-top: 0.25rem;
}
```

### Hero background blobs

```jsx
/* Primary blob */
absolute top-0 right-0 w-[600px] h-[600px]
bg-primary/[0.06] rounded-full blur-[100px]
animate-[hero-float_6s_ease-in-out_infinite]

/* Secondary blob */
absolute bottom-0 left-1/4 w-[400px] h-[400px]
bg-secondary/[0.06] rounded-full blur-[80px]
animate-[hero-float_7s_ease-in-out_infinite_0.5s]
```

---

## 17. Breakpoints & Responsive

| Prefix | Min-width | Usage principal                          |
| ------ | --------- | ---------------------------------------- |
| (base) | 0px       | Mobile first, 1 colonne                  |
| `sm`   | 640px     | 2 colonnes, tailles texte intermediaires |
| `md`   | 768px     | Navbar desktop, footer 4 cols            |
| `lg`   | 1024px    | 3 colonnes, sidebar, hero full           |
| `xl`   | 1280px    | Hero h1 text-7xl                         |

### Patterns responsive recurrents

```
/* Grille adaptive */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

/* Container edges */
px-6 lg:px-8

/* Sidebar visible desktop only */
hidden lg:block

/* Filtres: sidebar desktop, bottom-sheet mobile */
lg:hidden (bouton filtres)
hidden lg:block (sidebar)

/* Texte adaptatif */
text-3xl sm:text-4xl           /* h1 page */
text-4xl sm:text-5xl lg:text-6xl  /* h1 hero */
```

---

## 18. Z-index

| Valeur | Usage                    |
| ------ | ------------------------ |
| `0`    | Texture papier body      |
| `50`   | Navbar sticky, bottom-sheet overlay |
| `60`   | Toast                    |

---

## 19. Section type — pattern de construction

### Section homepage

```jsx
<section className="px-6 lg:px-8 py-20">
  <div className="max-w-7xl mx-auto">
    <div className="flex items-end justify-between mb-10">
      <div>
        <p className="recipe-section-title">Label</p>
        <div className="deco-wave mb-2" />
        <h2 className="font-display text-3xl sm:text-4xl text-text">Titre</h2>
        <p className="recipe-annotation mt-1">Sous-titre manuscrit</p>
      </div>
      <Link className="hidden sm:flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors">
        Voir tout <ArrowRight size={14} />
      </Link>
    </div>
    {/* Grid content */}
  </div>
</section>
```

### Page standard (header)

```jsx
<div className="px-6 lg:px-8 py-12">
  <div className="max-w-7xl mx-auto">
    <div className="mb-10 max-w-2xl">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={16} className="text-primary" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Label</p>
      </div>
      <h1 className="font-display text-3xl sm:text-4xl text-text leading-tight">Titre page</h1>
      <p className="mt-3 text-sm text-text-light leading-relaxed">Description</p>
    </div>
  </div>
</div>
```

---

## 20. Planning — drag & drop

```css
.planning-cell {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.planning-cell.is-drag-source {
  opacity: 0.4;
  transform: scale(0.97);
}
.planning-cell.is-drop-target {
  transform: scale(1.03);
  background-color: rgb(0 0 0 / 0.04);
  box-shadow: 0 0 0 2px var(--color-text);
}
.planning-cell.just-landed {
  animation: planning-card-land 0.4s ease-out;
}
```

---

## 21. Etats & Feedback

### Loading

```
min-h-screen flex items-center justify-center
<p className="text-text-light">Chargement...</p>
```

### Erreur

```
min-h-screen flex items-center justify-center px-6
<p className="text-red-600">Erreur : {error}</p>
```

### Vide (aucun resultat)

```
text-center py-16 (ou py-20)
  <Icon size={32} className="text-text-light/30 mx-auto mb-3" />
  <p className="text-sm text-text-light">Message vide</p>
  <button className="mt-3 text-sm text-primary hover:underline">Action</button>
```

### Indicateur filtre actif (mobile)

```
w-1.5 h-1.5 rounded-full bg-primary
```

---

## 22. Safe area & Utilitaires

```css
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.text-balance {
  text-wrap: balance;
}

.scrollbar-none {
  scrollbar-width: none;
}
```
