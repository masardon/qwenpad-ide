#!/bin/bash
# Dependency installation script for QwenPad IDE

echo "Installing QwenPad IDE dependencies..."

# Install core Cordova dependencies
npm install cordova@12.0.0 --no-bin-links
npm install cordova-android@^14.0.1 --no-bin-links
npm install cordova-clipboard@^1.3.0 --no-bin-links
npm install cordova-plugin-device@^2.0.3 --no-bin-links
npm install cordova-plugin-file@^8.0.1 --no-bin-links
npm install cordova-plugin-advanced-http@^3.3.1 --no-bin-links

# Install development dependencies
npm install @babel/core@^7.28.0 --no-bin-links
npm install @babel/plugin-transform-runtime@^7.28.0 --no-bin-links
npm install @babel/preset-env@^7.28.0 --no-bin-links
npm install @babel/runtime@^7.28.2 --no-bin-links
npm install @babel/runtime-corejs3@^7.28.2 --no-bin-links
npm install @biomejs/biome@2.1.4 --no-bin-links
npm install autoprefixer@^10.4.21 --no-bin-links
npm install babel-loader@^10.0.0 --no-bin-links
npm install css-loader@^7.1.2 --no-bin-links
npm install mini-css-extract-plugin@^2.9.3 --no-bin-links
npm install path-browserify@^1.0.1 --no-bin-links
npm install postcss-loader@^8.1.1 --no-bin-links
npm install prettier@^3.6.2 --no-bin-links
npm install prettier-plugin-java@^2.7.4 --no-bin-links
npm install raw-loader@^4.0.2 --no-bin-links
npm install sass@^1.90.0 --no-bin-links
npm install sass-loader@^16.0.5 --no-bin-links
npm install style-loader@^4.0.0 --no-bin-links
npm install terminal@^0.1.4 --no-bin-links
npm install webpack@^5.101.0 --no-bin-links
npm install webpack-cli@^6.0.1 --no-bin-links

# Install runtime dependencies
npm install @deadlyjack/ajax@^1.2.6 --no-bin-links
npm install @ungap/custom-elements@^1.3.0 --no-bin-links
npm install @xterm/addon-attach@^0.11.0 --no-bin-links
npm install @xterm/addon-fit@^0.10.0 --no-bin-links
npm install @xterm/addon-image@^0.8.0 --no-bin-links
npm install @xterm/addon-search@^0.15.0 --no-bin-links
npm install @xterm/addon-unicode11@^0.8.0 --no-bin-links
npm install @xterm/addon-web-links@^0.11.0 --no-bin-links
npm install @xterm/addon-webgl@^0.18.0 --no-bin-links
npm install @xterm/xterm@^5.5.0 --no-bin-links
npm install autosize@^6.0.1 --no-bin-links
npm install core-js@^3.45.0 --no-bin-links
npm install crypto-js@^4.2.0 --no-bin-links
npm install dompurify@^3.2.6 --no-bin-links
npm install escape-string-regexp@^5.0.0 --no-bin-links
npm install esprima@^4.0.1 --no-bin-links
npm install filesize@^11.0.2 --no-bin-links
npm install html-tag-js@^2.4.15 --no-bin-links
npm install js-base64@^3.7.7 --no-bin-links
npm install jszip@^3.10.1 --no-bin-links
npm install markdown-it@^14.1.0 --no-bin-links
npm install markdown-it-anchor@^9.2.0 --no-bin-links
npm install markdown-it-footnote@^4.0.0 --no-bin-links
npm install markdown-it-github-alerts@^1.0.0 --no-bin-links
npm install markdown-it-task-lists@^2.1.1 --no-bin-links
npm install mime-types@^3.0.1 --no-bin-links
npm install minimatch@^10.0.3 --no-bin-links
npm install moment@^2.30.1 --no-bin-links
npm install mustache@^4.2.0 --no-bin-links
npm install url-parse@^1.5.10 --no-bin-links
npm install vanilla-picker@^2.12.3 --no-bin-links
npm install yargs@^18.0.0 --no-bin-links

echo "Core dependencies installed successfully!"

# Install local plugins without symlinks
echo "Installing local plugins..."
cd /storage/7E14-7B29/Documents/Project/QwenPad/qwenpad-ide

# Create a symbolic links alternative using file copying
mkdir -p node_modules_temp

# Copy local plugins to temporary directory and install from there
echo "Copying local plugins..."

# Create install script for local plugins
cat > install-local-plugins.sh << 'EOF'
#!/bin/bash

PLUGINS=(
  "src/plugins/browser"
  "src/plugins/ftp"
  "src/plugins/iap"
  "src/plugins/sdcard"
  "src/plugins/server"
  "src/plugins/sftp"
  "src/plugins/system"
  "src/plugins/websocket"
  "src/plugins/terminal"
  "src/plugins/proot"
  "src/plugins/scaffolding"
  "src/plugins/ssh-manager"
  "src/plugins/k8s-manager"
  "src/plugins/git"
  "src/plugins/dependency-manager"
  "src/plugins/iac-tools-manager"
  "src/plugins/cloud-provider-manager"
  "src/plugins/remote-file-manager"
  "src/plugins/ssh-key-manager"
  "src/plugins/k8s-dashboard"
  "src/plugins/infrastructure-tools"
  "src/plugins/remote-development-framework"
)

for PLUGIN in "${PLUGINS[@]}"; do
  if [ -d "$PLUGIN" ]; then
    PLUGIN_NAME=$(basename "$PLUGIN")
    echo "Installing $PLUGIN_NAME..."
    # Copy plugin to temporary location
    TEMP_DIR="node_modules_temp/$PLUGIN_NAME"
    mkdir -p "$TEMP_DIR"
    cp -r "$PLUGIN"/* "$TEMP_DIR/"
    # Install as local package
    npm install "$TEMP_DIR" --no-bin-links
  else
    echo "Plugin directory $PLUGIN not found"
  fi
done

# Clean up temporary directory
rm -rf node_modules_temp

echo "All local plugins installed!"
EOF

chmod +x install-local-plugins.sh
./install-local-plugins.sh

echo "QwenPad IDE dependencies installed successfully!"