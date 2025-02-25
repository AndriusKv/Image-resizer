const path = require("path");
const { DefinePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const postcssPresetEnv = require("postcss-preset-env");

module.exports = function(env = {}) {
  const mode = env.prod ? "production" : "development";
  const plugins = [
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(mode)
      }
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      minify: env.prod ? {
        keepClosingSlash: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true
      } : undefined
    }),
    new CopyPlugin({ patterns: [
      { from: "./src/assets", to: "./assets" },
      { from: "./public", globOptions: {
        ignore: ["**/index.html"]
      }}
    ]})
  ];

  if (env.prod) {
    plugins.push(new GenerateSW({
      swDest: "./sw.js",
      skipWaiting: true,
      clientsClaim: true,
      disableDevLogs: true
    }));
  }

  return {
    devServer: {
      static: {
        directory: path.join(__dirname, "public")
      },
      client: {
        logging: "error"
      },
      open: true,
      hot: false,
      compress: true,
      port: 3000
    },
    mode,
    target: "browserslist",
    entry: {
      main: "./src/js/index.js"
    },
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "[name].js"
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            name: "vendor",
            chunks: "initial"
          }
        }
      },
      minimizer: [new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 2022,
          output: {
            comments: false
          }
        }
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            { discardComments: { removeAll: true } }
          ]
        }
      })]
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: true
              }
            },
            {
              loader: "css-loader",
              options: {
                esModule: true,
                importLoaders: 1,
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    "postcss-import",
                    require("postcss-mixins"),
                    postcssPresetEnv({ stage: 0 })
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", {
                modules: false,
                loose: true,
                bugfixes: true,
                useBuiltIns: "usage",
                corejs: 3
              }]]
            }
          }
        }
      ]
    },
    devtool: env.prod ? false : "inline-source-map",
    plugins,
    stats: {
      entrypoints: false,
      children: false
    }
  };
};
