# Contributing to funcnodes-react-flow

This repository contains the **React Flow frontend** for FuncNodes plus a small Python wrapper/entrypoint.

## Python development (wrapper + integration)

Prereqs:

- Python **3.11+**
- `uv` (https://github.com/astral-sh/uv)

Recommended environment variables (keep caches/config local):

- `UV_CACHE_DIR=.cache/uv`
- `FUNCNODES_CONFIG_DIR=.funcnodes`

Install Python dev dependencies:

```bash
cd funcnodes_react_flow
UV_CACHE_DIR=.cache/uv uv sync --group dev
```

Run Python tests:

```bash
cd funcnodes_react_flow
FUNCNODES_CONFIG_DIR=.funcnodes UV_CACHE_DIR=.cache/uv uv run pytest
```

Run the UI via the Python entrypoint:

```bash
cd funcnodes_react_flow
FUNCNODES_CONFIG_DIR=.funcnodes UV_CACHE_DIR=.cache/uv uv run funcnodes_react_flow --no-browser
```

## Frontend development (React workspace)

The React sources live in `funcnodes_react_flow/src/react` with Yarn workspaces under `packages/*`.

Prereqs:

- Node.js (LTS recommended)
- Yarn **4** (this repo uses `yarn@4.9.2`)

Install and run:

```bash
cd src/react
yarn
yarn test
yarn typecheck
yarn build
```

## Code style & hooks

Python formatting/linting is enforced via pre-commit (Ruff + Flake8).

```bash
cd funcnodes_react_flow
UV_CACHE_DIR=.cache/uv uv run pre-commit install
UV_CACHE_DIR=.cache/uv uv run pre-commit run -a
```

Note: this repo also runs a `version-sync` pre-commit hook to keep versions in sync across `pyproject.toml` and workspace `package.json` files.

## TDD expectations

- Python: add pytest tests before changing behavior.
- React: add/update Vitest tests for behavior changes where appropriate.
- Avoid mocks unless simulating external resources.
