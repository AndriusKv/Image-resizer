const path = require("path");
const { DefinePlugin } = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
      template: "./src/index.html",
      minify: env.prod ? {
        keepClosingSlash: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true
      } : undefined
    })
  ];

  return {
    mode,
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
          ecma: 8,
          output: {
            comments: false
          }
        }
      })]
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          loaders: [
            MiniCssExtractPlugin.loader,
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
                plugins() {
                  const plugins = [
                    require("autoprefixer")()
                  ];

                  if (env.prod) {
                    plugins.push(require("cssnano")());
                  }
                  return plugins;
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
          loader: "babel-loader",
          exclude: /node_modules/,
          options: {
            presets: [["@babel/preset-env", {
              modules: false,
              loose: true,
              useBuiltIns: "usage",
              corejs: 3
            }]],
            plugins: ["@babel/plugin-syntax-dynamic-import"]
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
