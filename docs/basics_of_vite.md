# Vite Documentation - Complete Reference Guide

## Table of Contents
- [What is Vite?](#what-is-vite)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Development vs Production](#development-vs-production)
- [Commands & CLI](#commands--cli)
- [Environment Variables](#environment-variables)
- [Configuration](#configuration)
- [Plugins](#plugins)
- [Build Options](#build-options)
- [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
- [Asset Handling](#asset-handling)
- [Tree Shaking](#tree-shaking)
- [Advanced Features](#advanced-features)

---

## What is Vite?

**Vite** (French word for "quick", pronounced `/vit/`, like "veet") is a modern build tool that provides a faster and leaner development experience for modern web projects.

### Key Features:
- **Lightning Fast**: Uses native ES modules during development
- **Framework Agnostic**: Works with React, Vue, Svelte, Vanilla JS, and more
- **Not a Module Bundler**: Uses esbuild for development and Rollup for production
- **Powerful Scaffolding**: Creates boilerplate code for popular frameworks
- **Rich Plugin Ecosystem**: Highly extensible via plugins

### Two Major Parts:
1. **Dev Server**: Provides rich feature enhancements over native ES modules with extremely fast Hot Module Replacement (HMR)
2. **Build Command**: Bundles code with Rollup, pre-configured to output highly optimized static assets for production

---

## Installation & Setup

### Creating a New Vite Project

```bash
# Latest version
npm create vite@latest

# With specific template
npm create vite@latest my-project -- --template react
npm create vite@latest my-project -- --template vue
npm create vite@latest my-project -- --template vanilla-ts
```

### Available Templates:
| Framework | JavaScript | TypeScript |
|-----------|------------|------------|
| Vanilla | `vanilla` | `vanilla-ts` |
| Vue | `vue` | `vue-ts` |
| React | `react` | `react-ts` |
| Preact | `preact` | `preact-ts` |
| Lit | `lit` | `lit-ts` |
| Svelte | `svelte` | `svelte-ts` |
| Solid | `solid` | `solid-ts` |
| Qwik | `qwik` | `qwik-ts` |

### Manual Installation

```bash
# Install Vite as dev dependency
npm install -D vite

# Create index.html
echo '<p>Hello Vite!</p>' > index.html

# Start dev server
npx vite
```

### Node.js Requirements
- **Minimum**: Node.js version 20.19+, 22.12+
- Some templates may require higher versions

---

## Project Structure

### index.html as Entry Point
Unlike traditional bundlers, Vite treats `index.html` as the entry point:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Vite App</title>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Typical Project Structure:
```
my-vite-project/
├── index.html          # Entry point
├── package.json
├── vite.config.js      # Configuration file
├── public/             # Static assets
│   └── favicon.ico
└── src/
    ├── main.js         # Main JavaScript file
    ├── style.css
    └── components/
```

---

## Development vs Production

### Development (esbuild)
- **Tool**: esbuild
- **Speed**: Extremely fast
- **Features**: Hot Module Replacement, instant server start
- **Target**: Modern browsers with latest features

### Production (Rollup)
- **Tool**: Rollup
- **Optimization**: Highly optimized bundles
- **Features**: Tree shaking, code splitting, minification
- **Target**: Wider browser compatibility

---

## Commands & CLI

### Basic Commands

```bash
# Development server
npm run dev
# or
npx vite
npx vite dev
npx vite serve

# Production build
npm run build
# or
npx vite build

# Preview production build locally
npm run preview
# or
npx vite preview
```

### CLI Options

```bash
# Specify port
vite --port 3000

# Open browser automatically
vite --open

# Expose to network
vite --host

# Specify alternative root
vite serve some/sub/dir

# Help
npx vite --help
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:host": "vite --host",
    "dev:open": "vite --open",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Environment Variables

### How Vite Handles Environment Variables

Vite stores environment variables in the **`import.meta.env`** object.

### Default Variables:
```javascript
import.meta.env.MODE          // 'development' or 'production'
import.meta.env.BASE_URL      // Base URL of the app
import.meta.env.PROD          // Boolean, true in production
import.meta.env.DEV           // Boolean, true in development
import.meta.env.SSR           // Boolean, true if server-side rendering
```

### Custom Environment Variables

#### File Naming:
```
.env                # Loaded in all cases
.env.local          # Loaded in all cases, ignored by git
.env.[mode]         # Only loaded in specified mode
.env.[mode].local   # Only loaded in specified mode, ignored by git
```

#### Variable Prefix:
By default, only variables prefixed with `VITE_` are exposed:

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
SECRET_KEY=hidden-secret  # Not exposed to client
```

```javascript
// Usage in code
console.log(import.meta.env.VITE_API_URL)     // "https://api.example.com"
console.log(import.meta.env.VITE_APP_TITLE)   // "My App"
console.log(import.meta.env.SECRET_KEY)       // undefined
```

#### Custom Prefix Configuration:
```javascript
// vite.config.js
export default {
  envPrefix: 'APP_'  // Now APP_ prefixed variables are exposed
}
```

### Environment Files Priority:
1. `.env.[mode].local`
2. `.env.local`
3. `.env.[mode]`
4. `.env`

---

## Configuration

### Basic Configuration (vite.config.js)

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  // Server configuration
  server: {
    port: 3000,
    host: true,           // Expose to network
    open: true,           // Open browser on start
    cors: true,           // Enable CORS
    proxy: {              // Proxy API requests
      '/api': 'http://localhost:8080'
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015'
  },
  
  // Base URL
  base: '/my-app/',
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  }
})
```

### Framework-Specific Configuration

#### React Configuration:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

#### Vue Configuration:
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
```

---

## Plugins

### What are Vite Plugins?
Plugins extend Vite's functionality. They're based on Rollup's plugin architecture.

### Official Plugins

#### React Plugins:
```bash
npm install @vitejs/plugin-react -D
```

```javascript
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

#### Vue Plugins:
```bash
npm install @vitejs/plugin-vue -D
```

```javascript
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

### Popular Community Plugins

#### 1. ESLint Plugin:
```bash
npm install vite-plugin-eslint -D
```

```javascript
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [eslint()]
})
```

#### 2. PWA Plugin:
```bash
npm install vite-plugin-pwa -D
```

```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

#### 3. Bundle Analyzer:
```bash
npm install rollup-plugin-visualizer -D
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
})
```

### Creating Custom Plugins

#### Simple Custom Plugin Example:
```javascript
// plugins/image-watermark.js
export default function imageWatermark(options = {}) {
  return {
    name: 'image-watermark',
    generateBundle(options, bundle) {
      // Plugin logic here
      console.log('Adding watermark to images...')
    }
  }
}

// vite.config.js
import imageWatermark from './plugins/image-watermark.js'

export default defineConfig({
  plugins: [imageWatermark()]
})
```

#### Advanced Custom Plugin:
```javascript
export default function customPlugin() {
  return {
    name: 'custom-plugin',
    configResolved(config) {
      // Access final config
    },
    buildStart(options) {
      // Build started
    },
    load(id) {
      // Load modules
    },
    transform(code, id) {
      // Transform code
      if (id.endsWith('.special')) {
        return `export default ${JSON.stringify(code)}`
      }
    },
    generateBundle(options, bundle) {
      // Generate bundle
    }
  }
}
```

---

## Build Options

### Production Build Configuration

```javascript
export default defineConfig({
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps
    sourcemap: true,
    
    // Minification
    minify: 'terser', // or 'esbuild'
    
    // Browser compatibility target
    target: 'es2015',
    
    // Rollup options
    rollupOptions: {
      // External dependencies
      external: ['vue'],
      
      // Output configuration
      output: {
        // Manual chunk splitting
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'axios']
        },
        
        // Asset file names
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Library mode
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`
    }
  }
})
```

### Code Splitting Strategies

#### 1. Automatic Splitting:
```javascript
// Vite automatically splits code based on imports
const LazyComponent = lazy(() => import('./LazyComponent'))
```

#### 2. Manual Chunk Splitting:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries
          vendor: ['react', 'react-dom'],
          
          // Group utilities
          utils: ['lodash', 'moment'],
          
          // Group by feature
          admin: ['./src/admin/index.js'],
          user: ['./src/user/index.js']
        }
      }
    }
  }
})
```

#### 3. Dynamic Chunk Splitting:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          
          // Split by directory
          if (id.includes('/src/admin/')) {
            return 'admin'
          }
          
          if (id.includes('/src/user/')) {
            return 'user'
          }
        }
      }
    }
  }
})
```

---

## Hot Module Replacement (HMR)

### What is HMR?
Hot Module Replacement allows modules to be updated in the browser without refreshing the page, preserving application state.

### HMR API Usage

#### Basic HMR:
```javascript
// main.js
if (import.meta.hot) {
  import.meta.hot.accept('./app.js', (newModule) => {
    // Handle hot update
    console.log('App module updated')
  })
}
```

#### HMR with State Preservation:
```javascript
// Counter component with HMR
let count = 0

function render() {
  document.getElementById('counter').innerHTML = `Count: ${count}`
}

export function increment() {
  count++
  render()
}

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
  
  // Preserve state
  if (import.meta.hot.data.count) {
    count = import.meta.hot.data.count
  }
  
  import.meta.hot.dispose((data) => {
    data.count = count
  })
}
```

#### Framework-Specific HMR:

**React Fast Refresh:**
```javascript
// Automatic with @vitejs/plugin-react
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

**Vue HMR:**
```javascript
// Automatic with @vitejs/plugin-vue
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

---

## Asset Handling

### Static Assets

#### Public Directory:
```
public/
├── favicon.ico      # Available at /favicon.ico
├── logo.png         # Available at /logo.png
└── data/
    └── config.json  # Available at /data/config.json
```

#### Importing Assets:
```javascript
// ES modules
import logoUrl from './logo.png'
import workerScript from './worker.js?worker'
import styles from './styles.css'

// URL imports
import assetUrl from './asset.png?url'

// Raw imports
import shaderCode from './shader.glsl?raw'

// Inline imports
import inlineCSS from './styles.css?inline'
```

### Asset Processing

#### Images:
```javascript
// Dynamic imports
const getImageUrl = (name) => {
  return new URL(`./assets/${name}.png`, import.meta.url).href
}

// Responsive images
import imgUrl from './image.png?w=400&h=300&format=webp'
```

#### Fonts:
```css
/* CSS */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/myfont.woff2') format('woff2');
}
```

#### JSON:
```javascript
// JSON files are automatically parsed
import config from './config.json'
console.log(config.apiUrl)
```

### Asset Optimization

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          }
          
          return `assets/[name]-[hash][extname]`
        }
      }
    }
  }
})
```

---

## Tree Shaking

### What is Tree Shaking?
Tree shaking is the removal of dead code (unused exports) from the final bundle.

### How Vite Enables Tree Shaking:

#### 1. ES Modules:
```javascript
// Good: Named imports enable tree shaking
import { debounce } from 'lodash-es'

// Bad: Default import brings entire library
import _ from 'lodash'
```

#### 2. Side Effect Free Modules:
```json
// package.json
{
  "sideEffects": false
}

// Or specify files with side effects
{
  "sideEffects": ["./src/polyfills.js", "*.css"]
}
```

#### 3. Conditional Exports:
```javascript
// Conditionally include code
if (process.env.NODE_ENV === 'development') {
  // This code will be removed in production
  console.log('Development mode')
}
```

### Optimizing for Tree Shaking:

#### Library Development:
```javascript
// Export individual functions
export function add(a, b) { return a + b }
export function subtract(a, b) { return a - b }

// Instead of default export with all functions
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
}
```

#### Import Optimization:
```javascript
// Good: Import only what you need
import { format } from 'date-fns'

// Bad: Import everything
import * as dateFns from 'date-fns'
```

---

## Advanced Features

### Multi-Page Applications

```javascript
// vite.config.js
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  }
})
```

### Library Mode

```javascript
// vite.config.js for library
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      fileName: (format) => `mylib.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'react'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React'
        }
      }
    }
  }
})
```

### Worker Support

```javascript
// Web Workers
import MyWorker from './worker.js?worker'

const worker = new MyWorker()
worker.postMessage({ command: 'start' })

// Shared Workers
import MySharedWorker from './shared-worker.js?sharedworker'

const worker = new MySharedWorker()

// Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### WebAssembly Support

```javascript
// Import .wasm files
import init, { greet } from './hello_wasm.js'

async function run() {
  await init()
  greet('World')
}
```

### Proxy Configuration

```javascript
export default defineConfig({
  server: {
    proxy: {
      // Simple proxy
      '/api': 'http://localhost:3001',
      
      // Proxy with options
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      
      // WebSocket proxy
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  }
})
```

### CSS Features

#### CSS Modules:
```javascript
// Component.module.css
.button {
  background: blue;
}

// Component.jsx
import styles from './Component.module.css'

function Component() {
  return <button className={styles.button}>Click me</button>
}
```

#### PostCSS:
```javascript
// vite.config.js
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('tailwindcss')
      ]
    }
  }
})
```

#### CSS Preprocessors:
```bash
# Install preprocessors
npm install -D sass
npm install -D less
npm install -D stylus
```

```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      },
      less: {
        math: 'parens-division'
      }
    }
  }
})
```

---

## Performance Optimization

### Development Performance

```javascript
export default defineConfig({
  server: {
    // Faster dependency pre-bundling
    force: true
  },
  
  optimizeDeps: {
    // Include dependencies for pre-bundling
    include: ['lodash-es', 'axios'],
    
    // Exclude dependencies from pre-bundling
    exclude: ['@vueuse/core']
  }
})
```

### Build Performance

```javascript
export default defineConfig({
  build: {
    // Use esbuild for faster builds
    minify: 'esbuild',
    
    // Reduce bundle size warnings
    chunkSizeWarningLimit: 1600,
    
    // Optimize for modern browsers
    target: 'esnext',
    
    rollupOptions: {
      output: {
        // Efficient chunking strategy
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
```

### Browser Compatibility

```javascript
export default defineConfig({
  build: {
    // Target older browsers
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13.1']
  }
})
```

```bash
# Legacy browser support
npm install @vitejs/plugin-legacy -D
```

```javascript
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

---

## Troubleshooting

### Common Issues

#### 1. Dependency Pre-bundling Issues:
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

#### 2. Module Resolution Issues:
```javascript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components')
    }
  }
})
```

#### 3. Environment Variable Issues:
```javascript
// Check environment variables
console.log(import.meta.env)

// Make sure variables are prefixed correctly
VITE_API_URL=http://localhost:3001
```

#### 4. Build Size Issues:
```bash
# Analyze bundle
npm install rollup-plugin-visualizer -D
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
})
```

### Performance Debugging

```javascript
export default defineConfig({
  build: {
    // Enable detailed build info
    reportCompressedSize: true,
    
    rollupOptions: {
      output: {
        // Analyze chunk sizes
        manualChunks: (id) => {
          console.log('Processing:', id)
          // Your chunking logic
        }
      }
    }
  }
})
```

---

## Best Practices

### 1. Project Organization
```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── pages/          # Page components
├── hooks/          # Custom hooks (React)
├── utils/          # Utility functions
├── stores/         # State management
├── styles/         # Global styles
└── types/          # TypeScript definitions
```

### 2. Configuration Management
- Keep `vite.config.js` clean and modular
- Use environment-specific configurations
- Extract complex plugin configurations

### 3. Performance
- Use dynamic imports for code splitting
- Optimize asset loading
- Configure proper caching headers
- Monitor bundle sizes

### 4. Development Workflow
- Use TypeScript for better development experience
- Configure ESLint and Prettier
- Set up proper debugging tools
- Use environment variables properly

---

## Migration Guide

### From Webpack

#### Key Differences:
1. **Entry Point**: `index.html` instead of JavaScript entry
2. **Development**: No bundling, uses native ES modules
3. **Configuration**: Simpler, convention over configuration
4. **Performance**: Much faster development server

#### Common Webpack to Vite Migrations:

```javascript
// Webpack
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}

// Vite equivalent (often no config needed)
export default defineConfig({
  // Minimal or no configuration
})
```

### From Create React App

```bash
# Remove CRA
npm uninstall react-scripts

# Install Vite
npm install -D vite @vitejs/plugin-react

# Update package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

# Move index.html to root
# Update imports in index.html
```

---

## Conclusion

Vite revolutionizes the development experience with its fast, modern approach to building web applications. Its combination of esbuild for development and Rollup for production provides the best of both worlds: speed during development and optimization for production.

Key takeaways:
- **Fast Development**: Native ES modules and esbuild make development lightning fast
- **Flexible**: Works with any framework and is highly configurable
- **Modern**: Built for modern web development practices
- **Extensible**: Rich plugin ecosystem for any need
- **Production Ready**: Optimized builds with Rollup and advanced features

Whether you're building a simple static site or a complex application, Vite provides the tools and performance you need for modern web development.