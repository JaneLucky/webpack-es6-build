let path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] 
      },
      { 
        test: /\.scss$/, 
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }] 
      }
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
    new UglifyJsPlugin()
  ],
  resolve: {
    alias: {
      "@": path.join(__dirname, "./src")
    }
  }
}