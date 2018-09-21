const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const package = require("./package");
const widgetName = package.widgetName;
const name = package.widgetName.toLowerCase();

const widgetConfig = {
    entry: `./src/components/${widgetName}Container.ts`,
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `src/com/mendix/widget/custom/${name}/${widgetName}.js`,
        libraryTarget: "umd"
    },
    devServer: {
        port: 3000,
        proxy: [ {
            context: [ "**", "!/com/mendix/widget/custom/badge/Badge.js" ],
            target: "http://localhost:8080"
        } ]
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            { test: /\.(css|scss)$/,use: [
                "raw-loader", "css-loader", "sass-loader"
            ] },
            { test: /\.png$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader" },
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml" }
        ]
    },
    devtool: "source-map",
    mode: "development",
    externals: [ "react", "react-dom" ],
    plugins: [
        new CopyWebpackPlugin([ {
            from: "src/**/*.xml"
        } ], {
            copyUnmodified: true
        }),
        new ExtractTextPlugin({
            filename: `./src/com/mendix/widget/custom/${name}/ui/${widgetName}.css`
        }),
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ]
};

const previewConfig = {
    entry: `./src/${widgetName}.webmodeler.ts`,
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `src/${widgetName}.webmodeler.js`,
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    module: {
        rules: [ {
                test: /\.(ts|tsx)?$/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }, {
                test: /\.css$/,
                use: "raw-loader"
            },
            {
                test: /\.scss$/,
                use: [ "raw-loader", "sass-loader" ]
            }
        ]
    },
    mode: "development",
    devtool: "inline-source-map",
    externals: [ "react", "react-dom" ],
    plugins: [
      new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};

module.exports = [ widgetConfig, previewConfig ];
