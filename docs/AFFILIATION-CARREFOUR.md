# Affiliation Carrefour Drive — ce que tu dois faire

L’app affiche déjà deux boutons en bas de la liste de courses : **Carrefour Drive** et **Courses U (Super U)**. Le lien Carrefour peut être un **lien affilié** pour toucher une commission quand un utilisateur passe commande. Voici comment l’activer.

---

## 1. S’inscrire au programme Carrefour via Kwanko

- Le programme d’affiliation **Carrefour** est géré en exclusivité par **Kwanko**.
- Va sur **https://www.kwanko.com** → section Affiliation / Liste des campagnes (ou cherche “Carrefour”).
- **Inscris-toi en tant que publisher** (éditeur / site / app).
- Une fois accepté, tu accèdes au tableau de bord Kwanko où tu récupères tes **liens affiliés** pour Carrefour (et éventuellement Carrefour Drive spécifiquement).
- Les rémunérations sont en général au **CPS** (commission sur vente) ou au clic, selon le contrat. Kwanko te donnera l’URL à utiliser (elle contient un paramètre de tracking pour qu’ils sachent que la commande vient de toi).

---

## 2. Récupérer l’URL affiliée

- Dans l’espace Kwanko, ouvre la campagne **Carrefour**.
- Récupère l’URL de promotion pour **Carrefour Drive** (ou la page d’accueil drive Carrefour).  
  Exemple type : `https://www.carrefour.fr/drive?...` avec des paramètres d’affiliation.  
  **Ne partage jamais ton lien Kwanko en public** : c’est ton lien perso pour les commissions.

---

## 3. Configurer l’URL dans le projet

- À la racine du projet, crée un fichier **`.env`** (s’il n’existe pas déjà). Il est ignoré par Git, donc ton lien ne sera pas commité.
- Ajoute une ligne de ce type (en remplaçant par **ton** lien Kwanko / Carrefour) :

```env
VITE_CARREFOUR_DRIVE_URL=https://www.carrefour.fr/drive?ton-parametre-kwanko=xxx
```

- Redémarre le serveur de dev (`npm run dev` ou `pnpm dev`) pour que Vite prenne en compte la nouvelle variable.
- En production (Vercel, Netlify, etc.), ajoute la **même variable** dans les paramètres d’environnement du projet :  
  **Nom** : `VITE_CARREFOUR_DRIVE_URL`  
  **Valeur** : ton URL affiliée complète.

Dès que cette variable est définie, le bouton **Carrefour Drive** dans l’app utilisera ton lien affilié, et la mention “lien partenaire” s’affichera en dessous des boutons.

---

## 4. Si tu n’as pas encore de lien affilié

- Tu peux laisser **sans** définir `VITE_CARREFOUR_DRIVE_URL`.
- Dans ce cas, le bouton Carrefour ouvre simplement la page officielle Carrefour Drive (sans tracking). Aucune commission, mais l’usage reste possible.
- Dès que tu as ton URL Kwanko, ajoute-la en `.env` et en production comme ci-dessus.

---

## 5. Rappel technique

- Le code qui utilise cette URL est dans **`src/lib/driveLinks.js`**.
- Les boutons “Passer commande” sont dans **`src/pages/Planning.jsx`** (section liste de courses, étape “À acheter”).
- “Copier la liste” met la liste au format texte dans le presse-papier pour que l’utilisateur la colle dans le drive de son choix.
