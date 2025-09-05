# AI Coding Agent Instructions

## Project Overview
Frosty Native is a cross-platform JSX framework for building native mobile apps (Android/iOS) and web applications. It provides a unified API layer that compiles to platform-specific implementations.

## Architecture

### Platform-Specific Module Resolution
The build system uses file suffixes for platform targeting:
- `.android.ts/.tsx` - Android-specific implementations
- `.apple.ts/.tsx` - iOS/macOS-specific implementations  
- `.web.ts/.tsx` - Web-specific implementations
- No suffix - Universal/fallback implementation

Example: `src/platform/spec/index.{android,apple,web}.ts` provides platform-specific `_Platform` implementations.

### Core Components
- **AppRegistry** (`src/registry.tsx`) - Application registration and lifecycle management
- **Platform API** (`src/platform/`) - Platform detection and device info access
- **View Components** (`src/view/`) - UI components with native/web implementations
- **NativeRenderer** (`src/renderer.ts`) - Rendering abstraction layer
- **NativeModules** (`src/global.ts`) - Bridge to native platform capabilities

### Cross-Platform Bridge Pattern
Global declarations (`__FROSTY_SPEC__`, `__APPLE_SPEC__`, `__ANDROID_SPEC__`) provide runtime bridges to native implementations. Native code registers these globals during app initialization.

## Development Workflows

### Building the Library
```bash
yarn rollup  # Builds platform-specific bundles (*.android.js, *.apple.js, *.web.js)
```

### Development Server
```bash
yarn start  # Runs frosty dev server with hot reload
```

### Testing
```bash
yarn test  # Jest tests
```

### CLI Tool
```bash
frosty-native <command>  # Entry point routes to scripts/bin/<command>.sh
```

## Project-Specific Conventions

### Import Aliases
- Use `~/` for tests (configured in Jest) but not code under `src/`
- External imports use standard module resolution

### Framework Independence
- **Never mention React or React Native directly** in documentation or code comments
- **Never import from React or React Native** - use Frosty and Frosty Native's own APIs instead
- Present Frosty and Frosty Native as its own independent JSX framework, not relative to other frameworks
- **Verify API validity** when writing documentation - check actual exports and function signatures in the codebase

### Import Patterns
- Import JSX runtime from `'frosty'` (see `tsconfig.json` jsxImportSource)
- Core hooks: `import { useState, useEffect } from 'frosty'`
- UI components: `import { View, Text, Platform } from 'frosty-native'`
- Environment context: Use `useEnvironment()` hook for app-level state

### App Structure
Apps register with `AppRegistry.registerComponent('main', App)` then run via native platforms. See `template/index.ts` for the standard entry point pattern.

### Platform API Usage
```typescript
Platform.select({
  android: androidValue,
  apple: iosValue,
  web: webValue,
  default: fallbackValue
})
```

## Key Files to Reference
- `src/index.ts` - Main exports and API surface
- `src/registry.tsx` - App lifecycle patterns
- `src/platform/` - Platform detection examples
- `template/` - Project template showing standard app structure
- `rollup.config.mjs` - Platform-specific build configuration

## Frosty Framework Specifics
- Import hooks from `'frosty'`, not `'react'`
- Use `ElementNode` type instead of `ReactNode`
- Component props use `PropsWithChildren<T>` pattern
- Always verify Frosty-specific APIs. Do not assume React patterns apply directly.

## Code Conventions
- **Lodash Heavy**: Extensive use of `_.assign`, `_.toPath`, `_.get`, `_.compact` throughout
- **MIT License Headers**: All source files include full MIT license header (see existing files)
- **State Management**: Prefer context + hooks over external state libraries

## Dependencies
- **Build**: Rollup with TypeScript, Babel, SCSS support
- **Platform Detection**: Module suffix resolution for cross-platform components

## Testing & Development
- Test server at `tests/server/app.tsx` - minimal Frosty app for component testing
- **Temporary Files for Testing**: When creating temporary files to test code, place all test scripts under `<project_root>/.temp/` to keep the workspace organized and avoid conflicts with the main codebase.

## **Important:** Task Execution Guidelines
When running any command or task as an AI agent:

### Command Execution Best Practices
- **Always wait** for the task to complete before proceeding with any subsequent actions
- **Never use timeouts** to run commands - it's always failure-prone and unreliable
- **Never repeat or re-run** the same command while a task is already running
- **CRITICAL: Never start a new task before the previous one has completely finished**
  - Wait for explicit confirmation that the previous task has completed successfully or failed
  - Do not assume a task is finished just because you don't see output for a while
  - Multiple concurrent tasks can cause conflicts, resource contention, and unpredictable behavior
- **Monitor task status** carefully and don't make assumptions about completion

### Task Status Verification
- If you cannot see the output or the task appears to be still running, you are **required** to ask the user to confirm the task has completed or is stuck
- If the task is stuck or hanging, ask the user to terminate the task and try again
- **Never assume** a task has completed successfully without explicit confirmation
- Always ask the user to confirm task completion or termination if the status is unclear
- **Sequential execution is mandatory:** Do not queue or pipeline tasks - complete one fully before starting the next

### Test Execution
- **Always use provided tools when available** for running tests instead of terminal commands
- Use the `runTests` tool for unit test execution - it provides better integration and output formatting
- The `runTests` tool supports:
  - Running specific test files by providing absolute file paths
  - Running specific test suites, classes, or cases by name
  - Running all tests when no parameters are provided
- **Prefer tool-based test execution** over manual `yarn test` or `npm test` commands
- Only use terminal commands for test execution when the `runTests` tool is not available or insufficient

### Error Handling
- If a command fails, read the error output completely before suggesting fixes
- Don't retry failed commands without understanding and addressing the root cause
- Ask for user confirmation before attempting alternative approaches
- **Never run alternative commands while a failed task is still running or in an unknown state**
