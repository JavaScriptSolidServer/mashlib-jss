import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

// Resolve symlinks to real paths for aliases
const nodeModules = path.resolve(process.cwd(), 'node_modules')
const solidUiJssPath = fs.realpathSync(path.join(nodeModules, 'solid-ui-jss'))
const solidLogicJssPath = fs.realpathSync(path.join(nodeModules, 'solid-logic-jss'))
const solidPanesJssPath = fs.realpathSync(path.join(nodeModules, 'solid-panes-jss'))
const paneRegistryJssPath = path.resolve('../pane-registry-jss')
const chatPaneJssPath = path.resolve('../chat-pane-jss')

// Use ESM versions for better tree shaking
const solidUiJssEsm = path.join(solidUiJssPath, 'dist/solid-ui.esm.js')
const solidLogicJssEsm = path.join(solidLogicJssPath, 'dist/solid-logic.esm.js')

const externalsBase = {
  'fs': 'null',
  'node-fetch': 'fetch',
  'isomorphic-fetch': 'fetch',
  '@xmldom/xmldom': 'window',
  'text-encoding': 'TextEncoder',
  'whatwg-url': 'window',
  '@trust/webcrypto': 'crypto',
  // Exclude @inrupt OIDC packages - we use solid-logic-jss instead
  '@inrupt/solid-client-authn-browser': 'null',
  '@inrupt/solid-client-authn-core': 'null',
  '@inrupt/oidc-client-ext': 'null'
}

const common = {
    entry: [
      './src/index.ts'
    ],
    target: 'web',
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      publicPath: '/',
      library: {
        name: 'Mashlib',
        type: 'umd'
      },
    },
    resolve: {
      extensions: ['.js', '.ts'],
      // Search mashlib-jss's node_modules first
      modules: [
        path.resolve(process.cwd(), 'node_modules'),
        'node_modules'
      ],
      alias: {
        // Use ESM versions for better tree shaking
        'solid-logic': solidLogicJssEsm,
        'solid-logic-jss': solidLogicJssEsm,
        'solid-ui': solidUiJssEsm,
        'solid-ui-jss': solidUiJssEsm,
        UI: solidUiJssEsm,
        'SolidLogic': solidLogicJssEsm,
        'solid-panes': solidPanesJssPath,
        'solid-panes-jss': solidPanesJssPath,
        // Map pane packages to JSS versions
        'pane-registry': paneRegistryJssPath,
        'pane-registry-jss': paneRegistryJssPath,
        'chat-pane': chatPaneJssPath,
        'chat-pane-jss': chatPaneJssPath,
        // Handle $rdf alias
        '$rdf': 'rdflib'
      },
      fallback: {
        // Disable Node.js polyfills not needed in browser
        buffer: false,
        crypto: false,
        stream: false,
        path: false,
        fs: false
      }
    },
    module: {
      rules: [
        {
          test: /\.ttl$/, // Target text  files
          type: 'asset/source', // Load the file's content as a string
        },
        {
          test: /\.(mjs|js|ts)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
          }
        },
        {
          test: /^.*\/solid-app-set\/.*\.js$/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader'
          ],
        },
        {
          test: /\.(eot|ttf|woff2?)$/i,
          loader: 'file-loader'
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({ 'global.IS_BROWSER': true }),
      new HtmlWebpackPlugin({
        title: 'SolidOS Web App',
        template: './src/databrowser.html',
        filename: 'databrowser.html'
      }),
      new MiniCssExtractPlugin({
        filename: 'mash.css'
      }),
      new CopyPlugin({
        patterns: [
          { from: 'static', to: '.' }
        ]
      })
    ],
    devServer: {
      port: 8080,
      open: '/browse-test.html',
      hot: true,
      historyApiFallback: true,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      },
      static: [
        {
          directory: path.resolve(process.cwd(), 'static'),
          publicPath: '/'
        }
      ]
    },
    devtool: 'source-map',
    performance: { hints: false }
}

export default (env, args) => {
  // Shared optimization configuration
  const sharedOptimization = {
    providedExports: true,
    usedExports: true,
    sideEffects: false,
    // Ensure no externals for core libraries - bundle everything
    removeEmptyChunks: true,
    mergeDuplicateChunks: true
  }

  // For dev server, return only unminified config
  if (process.env.WEBPACK_SERVE || args.mode === 'development') {
    return {
      ...common,
      mode: 'development',
      output: {
        ...common.output,
        filename: 'mashlib.js'
      },
      externals: externalsBase,
      optimization: {
        ...sharedOptimization,
        minimize: false
      }
    }
  }

  // UMD Minified, everything bundled
  const minified = {
    ...common,
    mode: args.mode || 'production',
    output: {
      ...common.output,
      filename: 'mashlib.min.js'
    },
    externals: externalsBase,
    optimization: {
      ...sharedOptimization,
      minimize: true,
      minimizer: [new TerserPlugin({ 
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug']
          }
        }
      })]
    }
  }

  // UMD Unminified, everything bundled  
  const unminified = {
    ...common,
    mode: args.mode || 'production',
    output: {
      ...common.output,
      filename: 'mashlib.js'
    },
    externals: externalsBase,
    optimization: {
      ...sharedOptimization,
      minimize: false
    }
  }

  return [minified, unminified]
}

