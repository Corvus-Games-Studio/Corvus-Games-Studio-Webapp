# Corvus Games Studio — Website

Marketing site for **Corvus Games Studio**, served at
[corvusgamesstudio.com](https://corvusgamesstudio.com).

Built with [Jekyll](https://jekyllrb.com/) and hosted on **GitHub Pages**.
Squarespace acts only as the domain registrar / DNS — the live site is this repo.

---

## Local development

You'll need Ruby (3.1+ recommended) and Bundler.

```bash
# install dependencies
bundle install

# run the dev server with live reload
bundle exec jekyll serve --livereload
```

The site will be available at <http://127.0.0.1:4000>.

## Editing content

Most copy lives directly in the page files at the repo root:

- `index.html` — home
- `corvus-protocol.html` — game page
- `about.html`
- `support.html`
- `contact.html`

Studio-wide values (title, socials, game release URL, navigation order) live in
[`_config.yml`](./_config.yml). Restart `jekyll serve` after editing config.

Drop images and other static assets into [`assets/`](./assets/). Templates already
point at:

- `assets/logo.svg` — header logo
- `assets/favicon.svg` (+ optional `assets/favicon.ico`)
- `assets/corvus-protocol-hero.jpg` — Corvus Protocol key art on home + game page
- `assets/screenshots/01.jpg`, `02.jpg`, `03.jpg` — game gallery

## Deployment

Push to `main`. GitHub Pages builds and publishes automatically — usually within
about a minute.

## DNS

The custom domain is configured in repo Settings → Pages, with the apex domain
(`corvusgamesstudio.com`) pointing to GitHub Pages' IPs and `www` aliased via
CNAME. The `CNAME` file at the repo root tells GitHub Pages which domain to
serve. Don't delete it.
