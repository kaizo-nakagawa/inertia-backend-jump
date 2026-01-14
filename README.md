# Inertia Backend Jump

A VS Code extension that enables **Ctrl+Click navigation** from Vue.js action strings directly to Laravel controller method definitions in Inertia.js projects.

## Features

- **Smart Navigation**: Ctrl+Click on action strings in Vue files to jump to the corresponding Laravel controller method
- **Component Path Matching**: Automatically matches Vue component paths with Laravel controller `$ctx->component` declarations
- **Filtered Search**: Only searches controller methods that use `return $this->responser` pattern
- **Fast Performance**: Efficiently scans your Laravel controllers directory

## Usage

1. Open a Vue file in your Inertia.js project (e.g., `resources/js/pages/picasgn/pages/PICA.vue`)
2. Find an action string in your Vue template or script (e.g., `'myAction'`)
3. Hold **Ctrl** (or **Cmd** on Mac) and **click** on the action string
4. The extension will navigate you to the Laravel controller method where:
   - The method contains `return $this->responser`
   - The `$ctx->component` matches your current Vue file path
   - The method contains `$ctx->myAction`

## Requirements

- VS Code 1.85.0 or higher
- Laravel project with Inertia.js
- Controllers in `app/Http/Controllers` directory
- Vue files in `resources/js/pages` directory

## Extension Settings

This extension works out of the box with standard Laravel + Inertia.js project structure. No additional configuration required.

## How It Works

The extension:
1. Extracts the component path from your current Vue file (e.g., `picasgn/pages/PICA`)
2. Scans PHP files in `app/Http/Controllers`
3. Filters methods containing `return $this->responser`
4. Matches the component path pattern: `$ctx->component = fn () => 'picasgn/pages/PICA'`
5. Locates the line with `$ctx->yourAction`
6. Navigates to that exact line

## License

MIT
