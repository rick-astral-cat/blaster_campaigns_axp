const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src', 'BlasterCampaignComp.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'blaster-campaign-comp.js'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
        { 
            test: /\.tsx?$/, 
            loader: "ts-loader", 
            options: {
                compilerOptions: {
                   "noEmit": false
                }
             },
            exclude: /node_modules/,
            include: path.resolve(__dirname, 'src')
        },
        {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
        }
    ]
  }
}