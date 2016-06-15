'use strict'

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var cssnano = require('cssnano')

var __PRODUCT__ = process.env.NODE_ENV === 'production';

var cdnPrefix = '';
var buildPath = '/dist/';
var publishPath = cdnPrefix;
var devtool = '#source-map';
var htmlWebpackPluginConfig = {
    template: './src/templates/index.tmpl',
    hash: false,
    favicon: path.join(__dirname, 'src/assets/images/favicon.ico'),
    filename: 'index.html',
    inject: 'body'
}

//生产环境
if (__PRODUCT__) {
    cdnPrefix = '';
    publishPath = cdnPrefix;
    devtool = ''
    htmlWebpackPluginConfig.minify = {
        collapseWhitespace: true
    }
}

var webpackConfig = {
    debug: true,
    entry: ['./src/main'],
    output: {
        path: __dirname + buildPath,
        filename: 'build.[chunkhash].js',
        publicPath: publishPath,
        chunkFilename:'[id].[chunkhash].js'
    },
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue',
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(
                'style', 'css?sourceMap!postcss!resolve-url?sourceMap!sass?sourceMap')
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract(
                'style', 'css?sourceMap!postcss')
        }, {
            test: /\.js$/,
            exclude: /node_modules|vue\/dist/,
            loader: 'babel'
        },{
            test: /\.(jpg|png|gif)$/,
            loader: 'file?name=images/[hash].[ext]'
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'url?limit=10000&minetype=application/font-woff'
        }, {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file'
        }, {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.(html|tpl)$/,
            loader: 'html'
        }]
    },
    babel: {
        presets: ['es2015', 'stage-0'],
        plugins: ['transform-runtime']
    },
    resolve: {
        // require时省略的扩展名，如：require('module') 不需要module.js
        extension: ['', '.js'],
        //别名
        alias: {
            filter: path.join(__dirname, 'src/filters')
        }
    },
    plugins: [
        //提公用js到common.js文件中
        new webpack.optimize.CommonsChunkPlugin('common.[chunkhash].js'),
        //将样式统一发布到style.css中
        new ExtractTextPlugin('style.[chunkhash].css', {
            allChunks: true,
            disable: false
        }),
        // 使用 ProvidePlugin 加载使用率高的依赖库
        new webpack.ProvidePlugin({
            $: 'webpack-zepto'
        }),
        new HtmlWebpackPlugin(htmlWebpackPluginConfig)
    ],
    devtool: devtool
};

//生产环境
if (__PRODUCT__) {
    webpackConfig.plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
          compress: {
              unused: true,
              dead_code: true,
              warnings: false
          }
      }));
    webpackConfig.postcss = [
        cssnano({
            sourcemap: true,
            autoprefixer: {
                add: true,
                remove: true,
                browsers: ['last 2 versions']
            },
            safe: true,
            discardComments: {
                removeAll: true
            }
        })
    ]
}

module.exports = webpackConfig