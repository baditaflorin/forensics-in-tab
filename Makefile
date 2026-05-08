.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview docker-build docker-push release compose-up compose-down clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks.
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server.
	npm run dev

build: ## Build the GitHub Pages site into docs/.
	npm run build

data: ## Mode A has no static data pipeline.
	@echo "No data pipeline in Mode A; evidence is processed locally in the browser."

test: ## Run unit tests.
	npm run test

test-integration: ## Run integration tests.
	npm run test:integration

smoke: ## Build, serve docs/, and run Playwright smoke tests.
	npm run smoke

lint: ## Run linters and format checks.
	npm run lint

fmt: ## Autoformat source files.
	npm run fmt

pages-preview: ## Serve docs/ exactly as GitHub Pages would.
	npm run pages-preview

docker-build: ## Not applicable in Mode A.
	@echo "Mode A has no Docker backend."

docker-push: ## Not applicable in Mode A.
	@echo "Mode A has no Docker backend."

release: ## Tag a semver release after checks pass.
	@if [ -z "$(VERSION)" ]; then echo "Set VERSION=vX.Y.Z"; exit 1; fi
	$(MAKE) lint test build smoke
	git tag "$(VERSION)"

compose-up: ## Not applicable in Mode A.
	@echo "Mode A has no Docker Compose stack."

compose-down: ## Not applicable in Mode A.
	@echo "Mode A has no Docker Compose stack."

clean: ## Remove generated caches and build assets.
	rm -rf node_modules/.tmp coverage playwright-report test-results docs/assets docs/index.html docs/404.html docs/manifest.webmanifest docs/build-info.json docs/sw.js

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push
