.ONESHELL:
.PHONY: help build test package release

SHELL := /bin/bash
UPDATE_TYPE ?= patch# can be "patch", "minor" or "major"

help:
	@echo "ZedScripts"
	@echo "Available targets:"
	@echo "  build:   Build the extension"
	@echo "  test:    Run tests"
	@echo "  package: Package the extension"
	@echo "  release: Publish to VS Code Marketplace"
	@echo "      UPDATE_TYPE=<patch|minor|major> (default patch)"
	@echo "  release_github: Publish to GitHub releases"

build:
	npm run build

package:
	vsce package

pat:
	vsce verify-pat simkdt

# test:
# 	npx @vscode/test-cli
# 	npm run test:jest

release: pat #test
	set -euo pipefail

# publish to registries on VS Code Marketplace
	vsce publish "$(UPDATE_TYPE)"

release_github:
	set -euo pipefail

# get version from package.json
# 	VERSION=$$(node -e "console.log(require('./package.json').version)")

# release to GitHub
	git push --tags
	vsce package
	gh release create "v$$VERSION" "ZedScripts-$$VERSION.vsix" \
		--notes "See [CHANGELOG](https://github.com/PZ-Wiki-Modding/ZedScripts-VSCode/blob/main/CHANGELOG.md) for details"
	git push