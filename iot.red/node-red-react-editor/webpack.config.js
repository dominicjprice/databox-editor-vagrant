var path = require("path");

module.exports = {
    entry: {
        editor: [
            './js/app.js',
            'webpack-dev-server/client?http://192.168.101.87/das/',
            'webpack/hot/only-dev-server'
        ]
    },

    output: {
        publicPath: 'http://192.168.101.87/',
        filename: '[name].js'
    },

    devServer:{
         proxy: {
            '/github/*': {
                target: 'http://localhost:9000',
            },
             '/nodered/*': {
                target: 'http://localhost:9000',
            },


        }
    },

    module: {
        loaders:[
                { test: /\.js$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
                { test: /\.scss$/, loaders: ['style', 'css', 'sass'] },
                { test: /\.css$/, loaders: ['style', 'css'] },
                { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'},
                { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff/[name].[ext]" },
                { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?limit=8192" },
        ],
    },

};
