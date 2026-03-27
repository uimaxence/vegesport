# Personnaliser les emails Supabase (branding mamie-vege)

Objectif: remplacer l'email generique "Supabase Auth" par un email coherent avec la marque "Et si mamie etait vege ?".

## 1) Nom expediteur et adresse d'envoi

Dans Supabase Dashboard:

- `Authentication` -> `Settings` -> `SMTP Settings`
- Configure un SMTP (Resend, Mailgun, Brevo, etc.) pour ne plus envoyer via le sender par defaut Supabase.
- Renseigne:
  - `Sender name`: `Et si mamie etait vege ?`
  - `Sender email`: une adresse du domaine (ex: `hello@mamie-vege.fr`)

Sans SMTP custom, l'expediteur peut continuer a afficher Supabase selon le contexte.

## 2) Template de confirmation d'inscription

Dans Supabase Dashboard:

- `Authentication` -> `Email Templates` -> `Confirm signup`
- Sujet recommande:
  - `Confirme ton inscription - Et si mamie etait vege ?`
- Colle le contenu du fichier:
  - `supabase/auth/email-templates/confirm-signup.html`

## 3) Variables Supabase utiles

- Lien de confirmation: `{{ .ConfirmationURL }}`
- Email utilisateur: `{{ .Email }}`
- URL du site: `{{ .SiteURL }}`

## 4) Test rapide (obligatoire)

- Cree un nouveau compte de test depuis l'app.
- Verifie:
  - expediteur = `Et si mamie etait vege ?`
  - design = logo + couleurs marque
  - ton = tutoiement
  - bouton = "Confirmer mon inscription"
  - liens de retour vers le bon domaine (prod).

