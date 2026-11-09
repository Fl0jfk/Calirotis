Calirotis.fr

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Espace admin : authentification

`/admin` est protégé par un mot de passe vérifié côté serveur. Après un `POST /api/admin/login` réussi, le serveur pose un cookie `calirotis_admin` :

- `HttpOnly`, `Secure`, `SameSite=Strict`, limité au chemin `/api/admin` ;
- signé en HMAC-SHA256 avec `ADMIN_SESSION_SECRET` ;
- valable 12 heures, puis il faut se reconnecter.

Toutes les routes `/api/admin/*` (quotes, menu, market, reviews, upload-photo, collage) exigent ce cookie. **Si les variables ci-dessous manquent, tout est refusé** (401 sur les routes, 503 sur la connexion). `GET /api/admin/session` indique si la session est valide, `DELETE /api/admin/session` déconnecte.

### Variables d'environnement à définir (AWS Amplify)

Dans la console Amplify : *App settings → Environment variables* (ou *Hosting → Secrets* pour les valeurs sensibles).

| Variable | Rôle |
| --- | --- |
| `ADMIN_PASSWORD` | Mot de passe de l'espace admin. |
| `ADMIN_SESSION_SECRET` | Secret de signature des sessions, **32 caractères minimum**. Générer avec `openssl rand -base64 48`. Le changer déconnecte toutes les sessions. |

À **supprimer** de la configuration Amplify (elles ne sont plus lues, et tout `NEXT_PUBLIC_*` est intégré au JavaScript envoyé au navigateur) :

- `NEXT_PUBLIC_ADMIN_API_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `ADMIN_API_KEY` (remplacée par la session)

Ces anciennes valeurs ont pu être lues par n'importe quel visiteur : ne pas réutiliser l'ancien mot de passe.

**Important sur Amplify (Next.js SSR)** : les variables de la console sont disponibles pendant le build, mais pas forcément pour les routes API à l'exécution. Si la connexion répond « Connexion admin non configurée » (503), les rendre visibles au serveur en les écrivant dans `.env.production` pendant le build, dans `amplify.yml` (ou la *Build specification* de la console), avant `npm run build` :

```yaml
frontend:
  phases:
    build:
      commands:
        - echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" >> .env.production
        - echo "ADMIN_SESSION_SECRET=$ADMIN_SESSION_SECRET" >> .env.production
        - npm run build
```

En local, mettre les deux variables dans `.env.local` (ignoré par git).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
