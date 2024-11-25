set dotenv-load := true

watch := "false"
ci := "false"
git_commit_cmd := "git rev-parse HEAD"
git_branch_cmd := "git rev-parse --abbrev-ref HEAD"

default:
    @just --choose

# === Setup ===

[group('Setup')]
install:
    pnpm install

[group('Setup')]
audit *args:
    pnpm audit {{ args }}

[group('Setup')]
clean:
    rm -rf ./node_modules/
    rm -rf ./package-lock.json
    rm -rf ./yarn.lock
    rm -rf ./pnpm-lock.yaml
    rm -rf ./yarn-error.log
    rm -rf ./*.tsbuildinfo
    rm -rf ./dist
    rm -rf ./coverage
    rm -rf ./reports

[group('Setup')]
build *args:
    npx tsup {{ args }}

prepack:
    just build --dts

# === Ops ===
[group('Ops')]
update-deps-commit: update-deps
    git add .
    git commit -m 'deps: update deps'

[group('Ops')]
update-branch branch:
    git switch {{ branch }}
    git town sync
    git switch main

[group('Ops')]
update-docs:
    npx typedoc

# === Maintenance ===

[group('Maintenance')]
full-check:
    -@just format-check
    -@just lint
    -@just typecheck
    -@just test
    -@just stryker

[group('Maintenance')]
full-check-strict:
    @just format-check
    @just lint
    @just typecheck
    @just test

[group('Maintenance')]
test *args:
    npx c8 tsx tests/japa.ts {{ args }}

[group('Maintenance')]
coverage *args:
    npx c8 report {{ args }}

[group('Maintenance')]
typecheck:
    npx tsc --project tsconfig.check.json

[group('Maintenance')]
lint *args:
    npx biome lint . {{ args }}

[group('Maintenance')]
stryker *args:
    npx stryker run {{ args }}

[group('Maintenance')]
format-check:
    npx prettier --check .

[group('Maintenance')]
format:
    npx prettier --write .

[group('Maintenance')]
format-all: format format-justfile

[group('Maintenance')]
format-justfile:
    @just --unstable --fmt

[group('Maintenance')]
format-utils: format-justfile

[group('Maintenance')]
update-deps:
    npx ncu
    just install

# === Dev ===

[group('Dev')]
node-watch filename:
    node --enable-source-maps --watch {{ filename }}

[group('Dev')]
tsx-watch filename:
    npx tsx --enable-source-maps --watch {{ filename }}
