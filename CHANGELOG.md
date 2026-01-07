# Changelog

All notable changes to this project are documented here.

## 2.2.1a0 (2026-01-07)

### Fix

- **funcnodes-react-flow**: clean up queued fnw_url import callback
- enhance worker lifecycle management by refining conditions for worker creation

## 2.2.0 (2026-01-07)

### Feat

- add deep_merge and deep_update utility functions, along with object_factory_maker for enhanced object manipulation

## 2.1.2 (2026-01-06)

### Fix

- **build**: make sure __FN_VERSION__ is baked in on build

## 2.1.1 (2026-01-05)

### Fix

- correct spelling errors and improve variable naming in WorkerCommunicationManager

## 2.1.0 (2026-01-05)

### Feat

- **funcnodes-react-flow**: expose app and worker exports

## 2.0.0 (2026-01-05)

### BREAKING CHANGE

- @/nodes no longer re-exports hooks/components; use
 @/nodes-hooks, @/nodes-io-hooks, or @/nodes-components.

### Feat

- add GitHub Actions workflow for running React tests
- **funcnodes-react-flow**: add JsonSchemaInput component and related tests
- **funcnodes-react-flow**: add worker stop test and improve context usage in Library component
- **funcnodes-react-flow**: enhance debugging capabilities and add parseBool function

### Fix

- **dialog**: satisfy Radix Dialog a11y requirements
- **funcnodes-react-flow**: handle TS 5.9 ArrayBuffer typing changes
- **theme**: provide CSS channel vars for MUI palette tokens
- **funcnodes-react-flow**: improve JsonSchemaInput tests and component logic

### Refactor

- **tests**: ♻️ improve type safety for command and action handlers
- **nodes**: split nodes entrypoints to avoid circular imports
- **io**: ♻️ move `pick_best_io_type` to its own module

## v1.1.0 - (2025-12-17)
### Feat
- funcnodes-react-flow: support worker URL params and fallback discovery
- implement active worker cleanup on stop
- implement repos_update event handling and add corresponding tests
- add GitHub Actions workflow for npm package publishing
### Fix
- update npm publish workflow to include all workspaces in build step
### Refactor
- update npm publish workflow for React packages
### Test
- update test configurations and styles for better compatibility
- improve tests for ColorPicker, CustomSelect, SortableTable, and SizeContextContainer
### Chore
- update build files [skip ci]
- bump version to 1.1.0
- update build files [skip ci]
- update build files [skip ci]

## v1.0.4 - (2025-12-09)
### Feat
- enhance IO tooltip styling and display node name
### Fix
- correct spacing in description for ExternalWorkerInstanceSettings component
### Refactor
- worker-manager: streamline active worker retrieval logic
### Chore
- update build files [skip ci]
- bump version to 1.0.4 and update package metadata
- build
- update dependencies and enhance JsonSchemaForm component
- update dependencies and improve external worker configuration

## v1.0.3 - (2025-10-17)
### Feat
- implement node synchronization between nodespace and react zustand
### Chore
- update build files [skip ci]
- bump version to 1.0.3 and update package metadata

## v1.0.2 - (2025-09-12)
### Fix
- correct transform property in node.scss for proper centering
### Chore
- update build files [skip ci]
- update package versions and pre-commit configuration
- update pre-commit hooks and remove debug logging
### Other
- refactor(funcnodes-react-flow)!: enhance logging and clean up code structure

## v1.0.1 - (2025-09-03)
### Chore
- update build files [skip ci]
- bump version to 1.0.1 and update index.html for consistency
- remove console.log statements for cleaner code
### Style
- improve node.scss and images.tsx for better layout and readability

## v1.0.0 - (2025-08-29)
### Chore
- update build files [skip ci]
- bump version to 1.0.1 and update exports in funcnodes-react-flow-plugin
- update build files [skip ci]
- update version and dependencies in pyproject.toml
- refactor funcnodes-react-flow and update index.html
- bump version to 1.0.0 for funcnodes-react-flow and funcnodes-react-flow-plugin
- add new renderer exports to funcnodes-react-flow and funcnodes-react-flow-plugin
- remove console log from update_edges function in rf-store.ts
- update sync timing and install command

## v1.0.0a0 - (2025-08-28)
### Feat
- add FA_VERSION environment variable to Vite configuration
- manage worker lifecycle and state updates in FuncNodes component
- update Vite configuration for environment variables and output paths
- expand funcnodes-react-flow-plugin with new types and hooks
- enhance funcnodes-react-flow with new hooks and plugin management
- initialize funcnodes-react-flow-monorepo with essential configurations
- add funcnodes-react-flow-plugin package with TypeScript support
- add toast dispatcher to state manager for enhanced notifications
- enhance FuncNodesReactPlugin with generic versioning
- integrate toast notifications and theme provider into FuncNodes app
- add new icons for checkmark and error states
- implement toast notification system
- add zustand helpers for optimized store updates
- add neon color theme and grouping styles
- introduce theming support and background pattern customization
- add zIndex to edge configuration for improved layering
- enhance edges and nodes integration with improved structure and styling
- introduce edges and nodes components with styling and hooks
- select: introduce CustomSelect component with tests and style updates
- color-picker: introduce CustomColorPicker component with HSL and RGB support
- tests: add fast test configuration and update dependencies
- sortable-table: enhance SortableTable with performance optimizations and new features
- keypress: enhance KeyPressProvider with new keyboard shortcuts and accessibility tests
- keypress: implement KeyPressProvider and related hooks for keyboard state management
- node-settings: introduce NodeSettings feature with comprehensive input/output management
- library: integrate new Library feature with path alias and component updates
- library: introduce Library component and related features for enhanced module management
- nodesettings: enhance NodeSettings with custom icons for expand/collapse functionality
- dialog: export CustomDialog and its props for improved accessibility
- debugger: add utility functions for debugging object sizes and logging
- dependencies: update package.json and tsconfig for improved development
- barrel_imports: add CustomDialog export and reorganize imports
- header: implement header components for enhanced UI
- auto-layouts: introduce responsive layout components with enhanced functionality
- expanding-container: enhance ExpandingContainer with custom icons and keyboard accessibility
- layout: introduce responsive layout components with optimized performance
- refactor: restructure React components
- smooth-expand: implement SmoothExpandComponent with expand/collapse functionality
- data-helper: add comprehensive tests for data-helper utility functions
- websocket-worker: implement WebSocketWorker class for managing WebSocket connections
- data-helper: add utility functions for base64 and Blob conversions with comprehensive tests
- tsconfig: add path aliases for app and providers
- logger: add logger module with comprehensive tests and path alias
- error-components: add ErrorDiv component with comprehensive tests
- tsconfig: add path alias for shared components
- object-helpers: add utility functions for deep object manipulation
- vite: enhance tsconfig loading by stripping comments and trailing commas
- logger: implement enhanced logging functionality with multiple loggers
- dev: enhance dev script with port options and debug logging
- Implement grouping functionality for nodes
- update edge styles to use new CSS variables for color management
- add in_venv parameter to WorkerManager for enhanced worker configuration
- enhance theming and UI components with new settings and menus
- update worker URL configuration to use dynamic port
- add testing and e2e configuration for Playwright
- enhance styling and theming across the application
- renderer: add HTML download functionality and update renderers
- update color variables and styles for improved theming consistency across components
- enhance node settings with keyboard shortcuts and implement KeyContextProvider
- add GearIcon to FontAwesome wrapper and update node header button class names
### Fix
- enhance error handling in FuncNodes and related components
- enhance error handling in sync-manager
- improve error handling in FuncNodes and NodeSpaceManager
- enhance error handling in PluginManager
- handle plugin upgrade errors with toast notifications
- update node border color variables for consistent styling
- adjust root div dimensions for full viewport coverage
- relocate react-json-view-lite CSS import to JSONDisplay component
- styles: correct SCSS formatting and update zIndex values for improved layout
- workspace: update NodeSettings import path for consistency
- tests: update test case variable for clarity in SizeContextContainer tests
- vite.config: enable polling for file watching in development server
- tests: update ErrorDiv test to use flexible matcher for error message
- tsconfig: rename path alias from "@/logger" to "@/logging" for consistency
- package: rename typecheck script and add typewatch for improved TypeScript monitoring
- update selected edge color to use HSL for consistency
- add inline styles to body for consistent layout and padding
### Refactor
- improve error logging interface and handling
- improve error logging interface and handling
- streamline IO handling and enhance type safety
- enhance node serialization and plugin structure
- simplify renderer props by removing IOStore dependency
- update appearance settings layout for better responsiveness
- remove unused force graph function from ReactFlowManager
- update node normalization and serialization handling
- enhance worker functionality with library management and node state retrieval
- integrate library management into worker API
- enhance worker architecture and streamline API access
- reorganize data rendering types and components
- migrate data structures to core architecture
- consolidate styling architecture and eliminate legacy frontend structure - Move htmlelements.scss from frontend/layout to shared/styles for better reusability - Remove deprecated frontend/index.scss and frontend/layout/index.scss barrel files - Update features/index.scss to directly import all feature styles - Replace centralized auto-layouts.scss with individual component imports - Update import paths in header.scss and root index.scss to reflect new structure - Add missing stylesheet imports to auto-layout and dialog components
- migrate groups and header components to features architecture
- optimize NodeSettingsOverlay component with React.memo for performance
- reorganize barrel imports and enhance component structure
- update test utilities and improve integration tests for KeyPressProvider
- organize expander components into dedicated directories with improved tests
- organize error-components test file into dedicated directory
- move ProgressBar to shared components with tests and styling
- move JSONDisplay to shared components and add comprehensive tests
- dialog: migrate CustomDialog to shared components and update imports
- table: migrate SortableTable to shared components and remove obsolete styles
- workspace: update imports for improved modularity and clarity
- keypress: replace KeyContext with KeyPressProvider for improved keyboard state management
- keypress: remove deprecated KeyContext and related exports for cleaner code
- barrel_imports: remove Library exports to streamline module imports
- reactflow: improve code readability and organization
- app-properties: export DEFAULT_FN_PROPS and define factory function
- funcnodescontext: simplify context initialization and error handling
- smooth-expand: simplify test imports and remove unused variables
- group: reorganize component structure for clarity
- react_flow_layer: optimize selection logic for nodes and edges
- remove unused theme import from SettingsMenu component
### Chore
- update build files [skip ci]
- update package manager version in package.json
- streamline npm build workflow by removing redundant corepack step
- specify package manager version in package.json
- enhance npm build workflow and update package dependency
- update npm build workflow and package dependency path
- update project configuration and dependencies for release
- update .gitignore to include .yarn and test-results directories
- add @radix-ui/react-toast dependency to package.json for toast notifications
- resturucture of datarenderers
- update tsconfig paths for shared styles and data structures
- remove deprecated configuration files and update package manager
- remove unused index.scss file from frontend/utils
- deps: update @radix-ui/react-tabs to version ^1.1.12
- gitignore: update entry for development workers
- styles: add group styles to main stylesheet
- update .gitignore to include development_workers directory
### Other
- towards monorepo
- towards monorepo
- deleted unused old definitions
- restructiure done, next debug
- chore(moved) renamed custom color picker tests
- add TODO
- Implement code changes to enhance functionality and improve performance

## v0.4.11 - (2025-05-16)
### Feat
- implement paste functionality in KeyHandler and enhance clipboard data handling
### Other
- vrsion bumbp

## v0.4.10 - (2025-05-16)
### Feat
- implement copy and paste functionality in KeyHandler for nodes and edges
- enhance node and edge serialization in state management
### Other
- version bump
- serialize dummy data befor using to prevent setting values (eg.g. position)

## v0.4.9 - (2025-04-19)
### Fix
- bump version to 0.4.9 in pyproject.toml
- update input handling and adjust styles for improved layout and responsiveness
### Chore
- update build files [skip ci]

## v0.4.8 - (2025-04-18)
### Feat
- update StringInput component to use textarea for better text handling and adjust styles for iovaluefield
- enhance layout of NodeInput and NodeOutput components with inner_nodeio wrapper
### Fix
- adjust min-height for styled elements and ensure textarea height is important for consistent layout
- adjust styles in node settings for better layout and responsiveness
- add 'nowheel' class to NodeBody component to prevent scrolling
- prevent unnecessary updates in NumberInput and StringInput components
### Chore
- update build files [skip ci]
### Other
- vb

## v0.4.7 - (2025-04-11)
### Fix
- add permissions for pull requests in npm_build workflow
- update create-pull-request action to version 7 in npm_build workflow
- update job name and add permissions for write access in npm_build workflow
- enhance build workflow to commit generated files and create pull requests
- correct image source handling in DefaultImageRenderer
- update Node.js version to 22 in build workflow
- streamline build process by removing redundant directory change command
- enhance image rendering logic to handle raw base64 strings
### Refactor
- simplify workflow by removing unnecessary directory change step
### Chore
- update build files [skip ci]
- update dependencies and version to 0.4.7
### Other
- Implement code changes to enhance functionality and improve performance

## v0.4.6 - (2025-04-11)
### Other
- added es browser build
- styling updates

## v0.4.5 - (2025-04-11)
### Fix
- increase max-height of node to improve layout flexibility

## v0.4.4 - (2025-04-10)
### Feat
- add worker management scripts and update HTML references for improved functionality
- enhance worker management and initialization in FuncNodesReactFlow
### Fix
- update timer reference type and improve logger configuration for development mode
### Refactor
- update imports and improve error handling in color converter
- migrate from reactflow to @xyflow/react
### Other
- bump version to 0.4.4
- Refactor code structure for improved readability and maintainability
- stop sider key prop
- style update

## v0.4.3 - (2025-04-08)
### Other
- bump version to 0.4.3 in pyproject.toml and package.json
- add rollup-plugin-copy to handle asset copying in production builds; configure targets for style and script files
- refactor FuncNodesWorker and WebSocketWorker to improve chunk handling and cleanup; adjust ping/pong intervals for better responsiveness
- refactor NumberInput component to improve value rounding and input handling; adjust styles for better layout
- refactor FuncNodesWorker and WebSocketWorker to change return type of upload_file method from Promise<string[]> to Promise<string>

## v0.4.2 - (2025-03-27)
### Other
- bump version to 0.4.2 and update funcnodes dependency to 0.5.36;
- update yarn.lock to add @rollup/plugin-replace and @types/react-dom dependencies
- update package.json and rollup.config.mjs to add new plugins and adjust output configuration
- refactor Library component to improve key handling and filter external worker shelves
- update value type in Base64ImageRenderer to use ArrayBufferDataStructure without generics
- remove debug log statement from WebSocketWorker
- refactor ArrayBufferDataStructure and ctypeunpacker to improve type handling and add support for little-endian parsing

## v0.4.1 - (2025-03-26)
### Other
- bump version to 0.4.1 in pyproject.toml
- remove unnecessary module and shelf entries from pyproject.toml

## v0.4.0 - (2025-03-26)
### Other
- update structure
- refactor datarenderer to use interfaces for renderer props and update exports
- add error handling for undefined nodestore in createIOStore and refactor createNodeStore
- better state handling
- add NodeHooks support to RenderMapping and update related contexts
- add NodeContext and RenderMappingContext imports to index.tsx
- remove commented-out code from NodeSettings, ColorPicker, and NodeSpace modules
- add node_id to NodeType and update related contexts and renderers

## v0.3.19 - (2025-03-03)
### Feat
- implement ping-pong mechanism for worker responsiveness and add unique command handling
### Refactor
- enhance version restriction handling in _VersionSelector component
### Chore
- bump version to 0.3.18
### Other
- bump version in pyproject.toml to 0.3.19
- bump version in package.json to 0.3.22
- proper hooks order
- improve update_from_export method to autofit
- bump npm version to 0.3.21

## v0.3.17 - (2025-02-28)
### Refactor
- read module content directly from file in get_react_plugin_content

## v0.3.16 - (2025-02-28)
### Other
- module is the code that is injected, not the module name

## v0.3.15 - (2025-02-28)
### Refactor
- update React plugin handling to store module file path directly
- enhance layout styling in SizeContextContainer for better responsiveness
### Chore
- bump version to 0.3.19 in package.json

## v0.3.14 - (2025-02-28)
### Feat
- add new SCSS files for layout and utility styles, refactor existing styles, and update component imports
- add utility functions to check for empty objects and update JSON data display logic
- enhance color picker functionality with improved input handling and debounced onChange
### Refactor
- comment out unused imports in mui.tsx
### Chore
- update package versions in package.json, pyproject.toml, and uv.lock
### Other
- removed old packages
- add .funcnodes to .gitignore

## v0.3.13 - (2025-02-27)
### Feat
- refactor React plugin management and add plugin setup functionality
### Test
- update import tests for funcnodes_react_flow and verify plugin setup functionality

## v0.3.12 - (2025-02-25)
### Feat
- add event interception and centering functionality in FuncNodesWorker and Zustand state management
- implement useDefaultNodeInjection hook for managing node visual state and lifecycle
- implement hook system for FuncNodesWorker to manage asynchronous callbacks
### Fix
- update step value handling in NumberInput to use value_options
### Refactor
- update layout styles to use min-height and adjust z-index for better responsiveness
### Chore
- update package version to 0.3.17 and modify build scripts for webpack and rollup
### Other
- updated js

## v0.3.11 - (2025-02-21)
### Feat
- add data-type attribute to node input/output components for improved type identification
- enable showNodeSettings in DEFAULT_FLOW_PROPS
- reduce default recursion depth in LimitedDeepPartial type from 99 to 10
- add showNodeSettings prop to ReactFlowLayerProps and conditionally render NodeSettings
- update FuncNodes component to use LimitedDeepPartial for improved type safety
- extend recursion depth in DeepPartial and LimitedDeepPartial types
### Fix
- update import statements for React and styles in node builder
### Refactor
- reorganize and clean up CSS styles for node settings and edge paths
### Chore
- bump version to 0.3.11 in pyproject.toml
- bump version to 0.3.16 in package.json
### Other
- ensure ioid is set for undefined ids

## v0.3.10 - (2025-02-20)
### Feat
- reorder dtsConfig in rollup config and enhance dialog styles in CSS
- add parentkey prop to LibraryShelf and ExternalWorkerInstanceEntry components for improved key management
- add margin to funcnodes component for improved layout
- refactor SmoothExpandComponent to support asChild prop and integrate FullScreenComponent
- add fullscreen and expand options to React Flow component
- add fullscreen toggle functionality and related icons to funcnodes component
- implement smooth expand/collapse component with context API
- add logging for node and edge operations in React Flow Zustand
- enhance styling for dialog components and add new node settings styles
- export FuncnodesReactFlow from index.tsx
### Fix
- update module file extensions and improve rollup configuration
- update React import statements to use namespace import syntax
- update class name for dropdown menu content in header component
- uncomment moduleConfig and dtsConfig in rollup configuration
### Refactor
- update imports and enhance dialog component; add LimitedDeepPartial type
### Chore
- bump version to 0.3.13 in package.json
### Other
- bump version to 0.3.15 in package json
- bump version to 0.3.10
- bump version to 0.3.9
- updated public js
- added public

## v0.3.8 - (2025-02-14)
### Feat
- refactor FuncNodesApp to support worker management options and enhance flexibility
- add title attribute to NodeHeader for improved accessibility
- add initial assets and configuration for Node Builder module
- enhance ReactFlowLayer with customizable props for improved flexibility
### Fix
- update funcnodes dependency to exclude emscripten platform and add funcnodes-worker requirement
- handle optional imports for run_server and BaseServer to improve compatibility
- extend timeout duration in FuncNodesWorker and improve error messages for unimplemented methods
- ensure value comparison in SelectionInput uses string conversion for consistency
- correct spelling errors in variable names and improve consistency
- add optional chaining for safer access to worker properties
### Refactor
- update NewWorkerDialog to simplify state management and improve description clarity
### Chore
- bump version to 0.3.9 in pyproject.toml
- bump version to 0.3.10 in package.json
### Other
- Revert "chore: bump version to 0.3.9 in pyproject.toml"
- packed via rollup
- package update
- bump: update version to 0.3.8
- updated main

## v0.3.7 - (2025-02-04)
### Refactor
- simplify URL construction for large message handling

## v0.3.6 - (2025-01-31)
### Other
- vb
- export dialog

## v0.3.5 - (2025-01-30)
### Other
- header update

## v0.3.4 - (2025-01-21)
### Other
- lib version select

## v0.3.3 - (2025-01-12)
### Other
- upload files args as object
- file upload contains root
- file upload contains root

## v0.3.1 - (2025-01-09)
### Other
- file upload
- large data send

## v0.3.0 - (2024-12-13)
### Other
- vb
- vb
- node progress
- vp
- on sync and large messages
- clean
- header and worker

## v0.2.2 - (2024-11-07)
### Other
- update and export worker

## v0.2.1 - (2024-11-04)
### Other
- static build

## v0.2.0 - (2024-10-28)
### Other
- removed cache
- start_worker_manager arg

## v0.1.15 - (2024-10-24)
### Other
- output renderer

## v0.1.14 - (2024-10-19)
### Other
- input forward

## v0.1.13 - (2024-10-09)
### Other
- vb
- ignore
- app id
- position
- events and lib
- parse float
- wndow instance mapper

## v0.1.12 - (2024-09-27)
### Other
- vb
- lib manager update

## v0.1.11 - (2024-09-26)
### Other
- vb
- pre commits
- urls
- app package
- gitignore
- rem app copy
- vb
- rem logs
- simple run
- licence plugin
- licence
- sort workers in dropdown
- hidden outputs
- nodesettings

## v0.1.9 - (2024-09-04)
### Other
- vb
- restruc

## v0.1.8 - (2024-08-30)
### Other
- vb
- missing s

## v0.1.7 - (2024-08-30)
### Other
- wm ssl

## v0.1.6 - (2024-08-30)
### Other
- vb
- vb
- new args

## v0.1.5 - (2024-08-28)
### Other
- version bump
- package
- v0.1.6
- all the stuff
- v0.1.5
- restructure
- split packages
- simplified inputs
- logging
- typing
- typing
- log rem
- styyling
- log rem
- undefined handling
- io rendering
- frontent update
- worker in frontend
- key controller
- removed too mucuh logging
- color debug
- no value color bug
- styling
- plotting nodes
- plotting nodes
- edgfes, save and load
- value representation
- working edges
- trigger and error
- basic nodes working
- Initialize project using Create React App
