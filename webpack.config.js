const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");


class FluoguPlugin {
  constructor (version) {
    if (version === undefined) {
      version = "0.1.0";
      this.isPublic = false;
    } else this.isPublic = true;

    this.header = `
// ==UserScript==
// @name         Floating Luogu
// @namespace    http://tampermonkey.net/
// @icon         https://cdn.luogu.com.cn/upload/usericon/3.png
// @author       yurzhang & tiger2005
// @homepage     https://github.com/Nikaidou-Shinku/Floating-Luogu
// @description  A plugin to decorate Luogu with exquisite user card.
// @updateURL    https://raw.githubusercontent.com/Nikaidou-Shinku/Floating-Luogu/master/dist/Full.meta.js
// @downloadURL  https://raw.githubusercontent.com/Nikaidou-Shinku/Floating-Luogu/master/dist/Full.user.js
// @include      https://www.luogu.com.cn/*
// @version      ${version}
// @grant        none
// @license      MIT
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @require      https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// ==/UserScript==
    `.trim() + "\n";
  }

  apply (compiler) {
    const { webpack } = compiler;
    const { RawSource } = webpack.sources;
    const PluginName = "FluoguPlugin";
    compiler.hooks.thisCompilation.tap(PluginName, (compilation) => {
      compilation.hooks.afterProcessAssets.tap(PluginName, (assets) => {
        for (let file in assets) {
          if (this.isPublic)
            compilation.emitAsset("Full.meta.js", new RawSource(this.header));
          const content = compilation.getAsset(file).source.source();
          const newFile = `${this.header}${content}\n`;
          compilation.updateAsset("Full.user.js", new RawSource(newFile));
          return;
        }
      });
    });
  }
}

const BASE_CONFIG = {
  mode: "production",
  entry: "./src/index.tsx",
  devtool: "inline-cheap-module-source-map",
  output: {
    filename: "Full.user.js",
    path: path.resolve(__dirname, "./dist"),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: { onlyCompileBundledFiles: true }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  externals: {
    "jquery": "jQuery",
    "react": "React",
    "react-dom": "ReactDOM"
  }
};

module.exports = (env) => {
  const config = BASE_CONFIG;
  let defVersion = false;
  let version = "0.1.0";
  if (process.argv.length >= 6) {
    defVersion = true;
    version = process.argv[5];
  }
  switch (env.mode) {
  case "fix":
    config.name = "fix";
    config.module.rules[0].use[0].options.transpileOnly = true;
    break;
  case "dev":
    config.name = "dev";
    config.plugins.push(new ESLintPlugin({
      extensions: ["tsx", "ts"],
      files: "./src",
      threads: true
    }));
    break;
  case "pub":
    if (!defVersion)
      throw new Error("You must set version before publishing!");
    config.name = "pub";
    config.plugins.push(new ESLintPlugin({
      extensions: ["tsx", "ts"],
      files: "./src",
      threads: true,
      overrideConfigFile: "./eslint-publish.json"
    }));
    break;
  default:
    throw new Error(`Unknown mode "${env.mode}"`);
  }
  config.plugins.push(new FluoguPlugin(version));
  console.log(`webpack run ${env.mode}...`);
  return config;
};
