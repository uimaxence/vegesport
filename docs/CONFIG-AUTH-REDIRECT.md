# Redirection après connexion (Google + email)

## Problème : redirection vers le sous-domaine Vercel

Après connexion Google (ou clic sur le lien dans l’email), tu es renvoyé vers l’URL Vercel au lieu du domaine de prod (ex. mamie-vege.fr). C’est géré **côté Supabase**, pas dans le code.

## Où changer

### 1. Supabase Dashboard

1. Ouvre ton projet sur [supabase.com](https://supabase.com) → **Authentication** → **URL Configuration**.
2. **Site URL**  
   Mets l’URL de ton site en production, par ex. :
   - `https://www.mamie-vege.fr`
   - ou `https://mamie-vege.fr` si c’est celle que tu utilises.
3. **Redirect URLs**  
   Liste des URLs autorisées pour les retours après auth. Ajoute au minimum :
   - `https://www.mamie-vege.fr/**`
   - `https://www.mamie-vege.fr/auth/callback`
   - Si tu utilises aussi le domaine sans www : `https://mamie-vege.fr/**` et `https://mamie-vege.fr/auth/callback`.

Sans ça, Supabase peut ignorer le `redirectTo` envoyé par l’app et utiliser la **Site URL** (souvent celle du premier déploiement Vercel). Dès que **Site URL** et **Redirect URLs** pointent vers ta prod, les retours après Google et après clic sur le lien email iront sur ton domaine.

### 2. Vérifier comment tu ouvres le site

Dans le code, la redirection après Google est :

`redirectTo: window.location.origin + '/auth/callback'`

Donc si tu ouvres le site via `https://xxx.vercel.app`, le retour ira vers ce sous-domaine. Pour que la redirection soit sur la prod, il faut **ouvrir le site via ton domaine** (ex. `https://www.mamie-vege.fr`), pas via l’URL Vercel.

### 3. Google Cloud Console (OAuth)

Les **Authorized redirect URIs** chez Google doivent contenir l’URL de callback **Supabase** (pas directement ton site), du type :

`https://<TON_PROJECT_REF>.supabase.co/auth/v1/callback`

C’est en général déjà le cas si la connexion Google fonctionne. Tu n’as pas besoin d’y ajouter `mamie-vege.fr`.

---

## Connexion par email (magic link / confirmation)

- Le lien dans l’email est généré par Supabase à partir de la **Site URL** (et des Redirect URLs). Dès que **Site URL** = `https://www.mamie-vege.fr`, le lien de confirmation dans l’email pointera vers ce domaine.
- Pour tester :
  1. Configurer **Site URL** et **Redirect URLs** comme ci-dessus.
  2. Sur le site en prod (mamie-vege.fr), aller sur la page de connexion et demander une connexion par email (magic link ou inscription).
  3. Ouvrir l’email et cliquer sur le lien : tu dois arriver sur `https://www.mamie-vege.fr/...` (ou ton domaine), pas sur Vercel.
- Vérifier aussi dans Supabase : **Authentication** → **Providers** → **Email** : "Confirm email" activé ou non selon ton choix (magic link vs confirmation d’inscription).

---

## Résumé

| Où | Quoi |
|----|------|
| **Supabase** → Authentication → URL Configuration | **Site URL** = `https://www.mamie-vege.fr` (ta prod) |
| **Supabase** → Authentication → URL Configuration | **Redirect URLs** = ajouter `https://www.mamie-vege.fr/**` (et variante sans www si besoin) |
| **Utilisation** | Ouvrir le site en prod via ton domaine, pas via l’URL Vercel |

Après sauvegarde, refaire un test de connexion Google et un test de lien email pour confirmer que la redirection se fait bien vers ton domaine.
