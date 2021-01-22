const path = require("path");
const { DefinePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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
      cache: false,
      minify: env.prod ? {
        keepClosingSlash: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true
      } : undefined
    }),
    new CopyPlugin({ patterns: [
      { from: "./src/libs", to: "./libs" },
      { from: "./src/assets", to: "./assets" },
      { from: "./public" }
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
    mode,
    target: "browserslist",
    entry: {
      main: "./src/js/index.js"
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
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
          ecma: 2019,
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
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: "css-loader",
              options: {
                sourceMap: !env.prod,
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: !env.prod,
                postcssOptions: {
                  plugins: [
                    require("autoprefixer")()
                  ]
                }
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: !env.prod
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
