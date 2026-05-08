# Contributing

Thanks for helping improve Forensics in Tab.

## Local Setup

```sh
npm install
make install-hooks
make dev
```

## Commit Style

Use Conventional Commits:

```text
feat: add memory IOC extraction
fix: handle empty YARA condition
docs: document Pages rollback
```

## Checks

Run these before pushing:

```sh
make lint
make test
make build
make smoke
```

Do not commit evidence samples, secrets, private keys, or real case data.
