# Deploy

Live site: https://baditaflorin.github.io/forensics-in-tab/

Repository: https://github.com/baditaflorin/forensics-in-tab

## Publishing Strategy

GitHub Pages serves the `main` branch from `/docs`.

Build output is committed because GitHub Pages reads static files directly from the repository. `dist/` is ignored; `docs/` is intentionally not ignored.

## Publish Manually

```sh
npm install
make build
git add docs public/build-info.json
git commit -m "chore: publish pages build"
git push
```

## Preview Locally

```sh
make build
make pages-preview
```

Open: http://127.0.0.1:4173/forensics-in-tab/

## Roll Back

Revert the commit that changed the published `docs/` output:

```sh
git revert <commit>
git push
```

GitHub Pages will republish from the reverted `/docs` tree.

## Custom Domain

No custom domain is configured in v1. If a domain is added later, add `docs/CNAME` with the hostname, configure the domain's DNS to point at GitHub Pages, then verify HTTPS in the repository Pages settings.

GitHub Pages docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
