# funcnodes_react_flow

FuncNodes browser-based visual editor built with React and React Flow. It provides
the web UI used by `funcnodes runserver` and connects to the Workermanager for
worker discovery plus individual workers for graph manipulation.

## What it provides

- Graph editor (drag-and-drop canvas)
- Library browser for available nodes
- Property panel for inputs and outputs
- Worker selector and status
- Preview renderers (images, plots, tables)

## Run the UI (Python entrypoint)

This package ships a small CLI wrapper around `funcnodes runserver`.

```bash
cd funcnodes_react_flow
uv sync
uv run funcnodes_react_flow
```

Common flags:

- `--port` to override the port
- `--no-browser` to skip auto-opening a browser

You can also run the UI via FuncNodes directly:

```bash
run funcnodes runserver --frontend react_flow (default)
```

## Frontend development (React workspace)

The React sources live in `src/react` with Yarn workspaces under `packages/*`.


Other useful commands:

- `yarn build`
- `yarn test`
- `yarn typecheck`
- `yarn watch`

## React plugin support

FuncNodes modules can expose React plugins to customize input widgets or output
previews. This package registers a FuncNodes plugin that collects `react_plugin`
entry points (or `REACT_PLUGIN` exports) so the UI can load them.
