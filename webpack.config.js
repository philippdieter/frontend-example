const {getIfUtils, removeEmpty}     = require('webpack-config-utils');
const globImporter                  = require('node-sass-glob-importer');
const HtmlWebpackHarddiskPlugin     = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin             = require('html-webpack-plugin');
const MiniCssExtractPlugin          = require("mini-css-extract-plugin");
const path                          = require('path');
const PugPluginCSSModules           = require('pug-plugin-css-modules').default;
const TerserPlugin                  = require('terser-webpack-plugin');
const webpack                       = require('webpack');

module.exports = env => {

  const { ifProd, ifNotProd } = getIfUtils(env);
  var srcFiles = {};
  var statsConfig = {
    assets: true,
    builtAt: true,
    cached: false,
    children: false,
    chunks: false,
    env: true,
    modules: false,
  };

  htmlPlugins = [];
  htmlPlugins.push(
    new HtmlWebpackPlugin({
      //alwaysWriteToDisk: true,
      chunksSortMode: 'dependency',
      filename: path.resolve(__dirname, 'webroot/index.html'),
      filetype: 'pug',
      template: path.resolve(__dirname, 'page.pug'),
      minify: false,
    }),
  )

  return {
    mode: ifProd('production', 'development'),
    module: {
      rules: [
        {
          test: /\.pug$/,
          oneOf: [
            {
              use: [
                {
                  loader: 'html-loader',
                  options: {
                    interpolate: true,
                    attrs: [
                      'img:src',
                    ],
                    removeAttributeQuotes: false,
                    minimize: false,
                    root: path.resolve(__dirname),
                  }
                },
                {
                  loader: 'pug-plain-loader',
                  options: {
                    doctype: 'html5',
                  },
                },
              ]
            },
          ]
        },
        {
          test: /\.(sass|scss|css)$/,
          use: [
            ifNotProd('style-loader', MiniCssExtractPlugin.loader),
            {
              loader: 'css-loader',
            },
            {
              loader: 'sass-loader',
              options: {
                importer: globImporter()
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'assets/[hash].[ext]',
                publicPath: '/',
              }
            },
          ]
        },
      ]
    },
    plugins: htmlPlugins.concat(removeEmpty([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"')
        }
      }),
      ifProd(
        new MiniCssExtractPlugin({
          filename: "assets/[name].[contenthash].css",
          chunkFilename: "[id].css"
        })
      ),
      //new SVGSpritemapPlugin({
      //  filename: 'assets/spritemap.[contenthash].svg',
      //  styles: '~spritemap.scss',
      //  src: 'src/icons/*.svg',
      //  svg4everybody: true,
      //}),
      new HtmlWebpackHarddiskPlugin({
        outputPath: path.resolve(__dirname, 'webroot')
      }),
      new webpack.WatchIgnorePlugin([
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, '.*'),
      ]),
    ])),
    entry: {
      site: [
        'src/main.js',
      ],
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        src: path.resolve(__dirname, 'src'),
      },
    },
    output: {
      filename: 'assets/[name].[chunkhash].js',
      path: path.resolve(__dirname, 'webroot')
    },
    stats: statsConfig,
    devtool: ifProd(false, 'source-map'),
    devServer: {
      contentBase: path.resolve(__dirname),
      disableHostCheck: true,
      host: '0.0.0.0',
      port: 3100,
      stats: statsConfig,
      watchContentBase: false,
      watchOptions: {
        poll: true,
        ignored: [
          path.resolve(__dirname, '.session.vim'),
          path.resolve(__dirname, 'node_modules'),
        ],
      },
      writeToDisk: true,
    }
  }
};
