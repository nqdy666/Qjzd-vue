'use strict'

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
config.entry.unshift('webpack-dev-server/client?http://localhost:8080', "webpack/hot/dev-server");
config.plugins.push(new webpack.HotModuleReplacementPlugin());

// 这里配置：请求http://localhost:9090/api，
// 相当于通过本地node服务代理请求到了http://qjzd.net/api
var proxy = [{
    path: "/api/*",
    target: "https://qjzd.net",
    host: "qjzd.net"
}]

//https://github.com/webpack/webpack-dev-middleware
//启动服务
var app = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot:true,
    historyApiFallback: true,
    proxy:proxy,
    noInfo: false, // display no info to console (only warnings and errors)
    quiet: false, // display nothing to the console
    stats: {
        colors: true // console with color
    }
});
app.listen(8080);