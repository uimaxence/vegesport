# Feature : Prix et passage commande drive (Super U et enseignes)

Document de cadrage — à ne pas implémenter tel quel, objectif : savoir **comment** s’y prendre plus tard.

---

## 1. Objectif visé

- Donner une **idée des prix** sur la liste de courses (issue du planning).
- Permettre de **passer commande en drive** (idéalement Super U).
- À terme, envisager une **mini commission** ou un revenu lié (affiliation, etc.).

---

## 2. Ce qu’on a trouvé (état des lieux)

### 2.1 Super U / Courses U

- **Drive** : Courses U (coursesu.com + app “Courses U”) — drive voiture, drive piéton, retrait, livraison (Uber Eats sur certains secteurs).
- **API / partenariat technique** : Aucune API publique ni programme partenaire documenté pour des tiers (apps, sites) pour :
  - récupérer le catalogue ou les prix,
  - créer un panier / une commande drive côté Super U.
- **Affiliation / commission** : Pas de programme d’affiliation classique (type “tu envoies du trafic, on te reverse X %”). Il existe du **cashback** pour les clients (ex. 6 € première commande, 0,30 € suivantes) via des plateformes type abc-cash.org, mais c’est pour le consommateur, pas pour un partenaire comme ton app.
- **Structure** : Coopérative U (ex-Système U) ; les APIs dont on parle dans la presse sont **internes** (sécurité, fournisseurs, data), pas ouvertes aux apps externes.

**Conclusion** : aujourd’hui, une intégration directe “liste Vegeprot → panier Super U avec prix et commande” n’est **pas possible** sans accord commercial et technique avec le groupe U (contact direct, négociation).

---

### 2.2 Données de prix en France (ouvertes)

- **Open Prices** (Open Food Facts)  
  - API REST (data.gouv.fr, prices.openfoodfacts.org).  
  - Données : prix par produit (code-barres), lieu (OSM), date, preuve (ticket, étiquette).  
  - Mise à jour : jeu Parquet mis à jour quotidiennement.  
  - **Limite** : base **participative** (contributeurs, tickets), pas un flux officiel Super U. Donc on peut avoir des **prix indicatifs / référence** par produit, pas “le” prix exact du drive Super U.

- **Open Food Facts**  
  - Recherche produits (nom, ingrédients, catégories).  
  - Permet de faire le lien “nom d’ingrédient recette” → “produits avec code-barres” → puis interroger Open Prices pour des prix.  
  - Limite débit : ~10 req/min sur la recherche.

**Conclusion** : on peut construire une **estimation de prix** sur la liste (ordre de grandeur, comparaison), pas un prix officiel Super U.

---

### 2.3 Affiliation / commission sur le drive

- **Super U** : pas de programme d’affiliation public.
- **Carrefour** : programme d’affiliation (ex. Kwanko) — trafic vers Carrefour Drive, rémunération au clic ou à la conversion selon contrat.
- **Leclerc** : parrainage (bons d’achat parrain/filleul), pas une API d’affiliation pour app tierce documentée.

**Conclusion** : pour une **mini commission** liée au drive, les options réalistes aujourd’hui sont plutôt **Carrefour (affiliation)** ou d’autres enseignes avec programmes partenaires, pas Super U en l’état.

---

## 3. Options réalistes (par phase)

### Option A — Estimation de prix (sans Super U)

- **Données** : Open Food Facts + Open Prices.
- **Idée** :  
  - À partir de la liste d’ingrédients (déjà construite dans l’app : `groceryList` / `toBuyByCategory`), envoyer des requêtes type “recherche produit” (OFF) puis “prix” (Open Prices).  
  - Afficher une **fourchette ou un total indicatif** (“environ X €”) et éventuellement “basé sur des prix observés en magasin”.
- **Avantages** : pas de partenariat, données ouvertes, réalisable techniquement.  
- **Inconvénients** : pas les vrais prix Super U, pas de passage de commande.

### Option B — Lien vers le drive (sans commission pour l’instant)

- **Idée** : bouton du type “Faire mes courses en drive” qui ouvre **coursesu.com** (ou l’app Courses U) dans un nouvel onglet, avec la liste en copier-coller ou export (texte/PDF) pour que l’utilisateur la reporte dans son panier.
- **Avantages** : simple, pas d’API, utilisateur va bien sur Super U.  
- **Inconvénients** : pas de pré-remissage du panier, pas de commission.

### Option C — Partenariat Super U (ambitieux)

- **Idée** : contacter la Coopérative U / direction digitale (Courses U) pour :  
  - accès à un flux de prix (ou à défaut autorisation d’utiliser des prix agrégés),  
  - et/ou mécanisme “deep link” ou API pour pré-remplir le panier / rediriger vers une commande drive.
- **Revenir à la charge** : “mini commission” ou modèle revenu (affiliation, co-branding) à discuter dans ce cadre.
- **Prérequis** : pitch clair (audience, volume, valeur pour eux), proposition technique simple (ex. “on envoie des utilisateurs vers votre drive avec une liste prête”).

### Option D — Enseigne avec affiliation (ex. Carrefour)

- **Idée** : en plus (ou à la place) de Super U, proposer “Passer par Carrefour Drive” avec **lien affilié** (ex. Kwanko).  
- Tu gagnes une commission sur les commandes générées ; l’utilisateur garde sa liste (export) et la reporte sur Carrefour.
- **Avantages** : modèle commission possible tout de suite.  
- **Inconvénients** : pas Super U, pas de pré-remissage panier sans API Carrefour (à vérifier selon contrat Kwanko).

---

## 4. Recommandation “comment mettre en place”

1. **Court terme (sans accord Super U)**  
   - Implémenter **Option A** (estimation de prix via Open Food Facts + Open Prices) sur la liste existante.  
   - Ajouter **Option B** (bouton “Faire mes courses” → coursesu.com + export liste) pour orienter vers Super U sans engagement.

2. **Moyen terme**  
   - Tester **Option D** (lien affilié Carrefour ou autre) pour valider l’intérêt utilisateur et un premier flux de commission.  
   - Préparer un **one-pager** pour la Coopérative U : valeur pour eux (trafic qualifié, liste déjà prête), besoin technique minimal (lien + éventuellement prix ou panier plus tard).

3. **Si tu veux vraiment Super U (prix + commande + commission)**  
   - Pas de solution technique publique : il faut **contacter directement** la direction digitale / partenariats de la Coopérative U (ou Courses U) et proposer un partenariat.  
   - Le document ci-dessus peut servir de base pour expliquer ce que tu as déjà (liste, UX) et ce que tu vises (estimation de prix, passage commande, modèle partenaire).

---

## 5. Points techniques à garder en tête

- **Liste côté app** : déjà disponible (`groceryList`, `toBuyByCategory`, `restList` / “à acheter”). Format : catégories + libellés texte (ex. “Lait d’avoine”, “Farine de sarrasin”).  
- **Open Food Facts** : recherche par texte (ingrédient / nom) → produits avec `code_barres` → appeler Open Prices avec code-barres + (optionnel) géoloc pour prix “proches”.  
- **Rate limiting** : prévoir cache + pas trop d’appels (ex. 10 req/min OFF), ou utiliser les exports Parquet Open Prices pour des calculs en batch côté back-end si tu en as un.

---

## 6. Résumé

| Objectif              | Super U direct | Sans accord Super U        |
|-----------------------|----------------|----------------------------|
| Idée des prix         | Non (pas d’API)| Oui (Open Prices, indicatif)|
| Passer commande drive | Non (pas d’API)| Lien + export liste (manuel)|
| Commission            | À négocier    | Possible via Carrefour (affiliation) |

**En résumé** : la feature “connecté à Super U” (prix réels + commande + commission) est ambitieuse et **dépend d’un partenariat** avec le groupe U. En attendant, tu peux mettre en place une **estimation de prix** (Open Prices) et des **liens utiles** (Super U en manuel, Carrefour en affilié) pour rendre la liste plus utile et, si tu veux, tester un premier modèle de commission.
