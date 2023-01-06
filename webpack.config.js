let path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: "production", // 告诉webpack使用production模式的内置优化,
	devServer: {
    // 启动gzip压缩
    compress:true,
		open: true,
		proxy: {
			"/file": {
				target: "http://localhost:8011/",
				changeOrigin: true,
				pathRewrite: {
					'^/file': '/'
				}
			},

		}
	},
  target: 'web',
  entry: {
    index: './src/index.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }, 
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/, 
        use: [{ loader: 'file-loader',options: {
					// limit:设定大小阀值
					// a. 被处理图片大小 大于该阀值，就通过物理文件重新生成该图片
					// b. 被处理图片大小 小于等于该阀值，就把图片变为字符串(嵌入到应用文档中，好处是节省一个http资 源)
					  limit: 8196,
					  // 做配置，使得生成的物理图片被存储在dist/image里边
					  outputPath: "image",
					  //通过在url-loader的options中增加esModule:false
					  esModule: false,
					},
        }]
      },
      { 
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      { 
        test: /\.scss$/, 
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      },
      {
        test: /\.svg$/,
        use: ['svg-sprite-loader']
      },
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: '[name].js', //打包之后生成的文件名，可以随意写。
    filename: 'BIMEngine.js', //打包之后生成的文件名，可以随意写。
    library: 'BIMEngine', // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
    libraryExport: "default", // 对外暴露default属性，就可以直接调用default里的属性
    globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
    libraryTarget: 'umd', // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    publicPath:"./dist/"
  },
  plugins: [
    new CleanWebpackPlugin(),
    new UglifyJsPlugin(),
    new ExtractTextPlugin("css/bundle.css"),
    new CompressionPlugin({ 
      filename: '[path].gz[query]',//使得多个.gz文件合并成一个文件，这种方式压缩后的文件少，建议使用
      algorithm: 'gzip',//算法
      test:  /\.js$|\.css$|\.html$/,
      threshold: 10240,//只处理比这个值大的资源。按字节计算
      minRatio: 0.8,//只有压缩率比这个值小的资源才会被处理
      //是否删除原有静态资源文件，即只保留压缩后的.gz文件，建议这个置为false，还保留源文件。以防：
      // 假如出现访问.gz文件访问不到的时候，还可以访问源文件双重保障
      deleteOriginalAssets: false
    })
  ],
  resolve: {
    alias: {
      "@": path.join(__dirname, "./src")
    }
  }
}