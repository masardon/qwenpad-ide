const Executor = require("../terminal/www/Executor");

const Scaffolding = {
  /**
   * Creates a new project based on the specified template
   * @param {string} projectType - Type of project (flutter, compose, react, etc.)
   * @param {string} projectName - Name of the project
   * @param {string} projectPath - Path where project should be created
   * @param {object} options - Additional options for project creation
   * @returns {Promise<boolean>} - Returns true if project creation succeeds
   */
  async createProject(projectType, projectName, projectPath, options = {}) {
    try {
      // Verify if the required tools are installed
      const isToolAvailable = await this.checkToolAvailability(projectType);
      if (!isToolAvailable) {
        throw new Error(`Required tools for ${projectType} are not available`);
      }

      // Create the project using the appropriate command
      let command = '';
      switch (projectType.toLowerCase()) {
        case 'flutter':
          command = `cd ${projectPath} && flutter create ${projectName}`;
          break;
        case 'compose':
        case 'jetpack_compose':
          // Generate a basic Compose project structure
          return this.createComposeProject(projectPath, projectName, options);
        case 'react':
          command = `cd ${projectPath} && npx create-react-app ${projectName}`;
          break;
        case 'vue':
          command = `cd ${projectPath} && npm create vue@latest ${projectName}`;
          break;
        case 'angular':
          command = `cd ${projectPath} && npx @angular/cli new ${projectName}`;
          break;
        case 'nodejs':
        case 'node':
          return this.createNodeProject(projectPath, projectName, options);
        case 'python':
          return this.createPythonProject(projectPath, projectName, options);
        case 'go':
          return this.createGoProject(projectPath, projectName, options);
        case 'tailwind':
          command = `cd ${projectPath} && npx create-tailwindcss-app ${projectName}`;
          break;
        case 'typescript':
          return this.createTypeScriptProject(projectPath, projectName, options);
        default:
          throw new Error(`Unsupported project type: ${projectType}`);
      }

      if (command) {
        const result = await Executor.execute(command);
        console.log(`Project creation result: ${result}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Checks if the required tools are available for a project type
   * @param {string} projectType - Type of project
   * @returns {Promise<boolean>} - Returns true if tools are available
   */
  async checkToolAvailability(projectType) {
    try {
      let checkCommand = '';
      
      switch (projectType.toLowerCase()) {
        case 'flutter':
          checkCommand = 'flutter --version';
          break;
        case 'react':
        case 'nodejs':
        case 'node':
        case 'angular':
        case 'typescript':
          checkCommand = 'node --version && npm --version';
          break;
        case 'vue':
          checkCommand = 'npm --version';
          break;
        case 'python':
          checkCommand = 'python3 --version || python --version';
          break;
        case 'go':
          checkCommand = 'go version';
          break;
        case 'tailwind':
          checkCommand = 'npx tailwindcss --version';
          break;
        case 'compose':
        case 'jetpack_compose':
          // Check for Java/Android SDK
          checkCommand = 'java -version 2>&1 && echo $ANDROID_HOME';
          break;
        default:
          return false;
      }

      if (checkCommand) {
        await Executor.execute(checkCommand);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Tools not available for ${projectType}:`, error);
      return false;
    }
  },

  /**
   * Creates a basic Jetpack Compose project structure
   * @param {string} projectPath - Path to create project
   * @param {string} projectName - Name of the project
   * @param {object} options - Additional options
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async createComposeProject(projectPath, projectName, options = {}) {
    try {
      const fullProjectPath = `${projectPath}/${projectName}`;
      
      // Create basic directory structure
      await Executor.execute(`mkdir -p ${fullProjectPath}/{app/src/main/{java/com/example,java/res,assets,libs},gradle}`);
      
      // Create basic build.gradle file
      const buildGradleContent = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    compileSdk 34

    defaultConfig {
        applicationId "${projectName.toLowerCase().replace(/\s+/g, '.')}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.1'
    }
    packagingOptions {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation platform('androidx.compose:compose-bom:2023.10.01')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation platform('androidx.compose:compose-bom:2023.10.01')
    androidTestImplementation 'androidx.compose.ui:ui-test-junit4'
    debugImplementation 'androidx.compose.ui:ui-tooling'
    debugImplementation 'androidx.compose.ui:ui-test-manifest'
}`;
      
      await Executor.execute(`echo '${buildGradleContent}' > ${fullProjectPath}/app/build.gradle`);
      
      // Create basic MainActivity.kt
      const mainActivityContent = `package com.example.${projectName.toLowerCase().replace(/\s+/g, '')}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import ${projectName.toLowerCase().replace(/\s+/g, '')}.ui.theme.${projectName.replace(/\s+/g, '')}Theme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ${projectName.replace(/\s+/g, '')}Theme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    Greeting(name = "${projectName}")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello \${name}!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    ${projectName.replace(/\s+/g, '')}Theme {
        Greeting("${projectName}")
    }
}`;
      
      await Executor.execute(`echo '${mainActivityContent}' > ${fullProjectPath}/app/src/main/java/com/example/${projectName.toLowerCase().replace(/\s+/g, '')}/MainActivity.kt`);
      
      return true;
    } catch (error) {
      console.error('Error creating Compose project:', error);
      throw error;
    }
  },

  /**
   * Creates a basic Node.js project structure
   * @param {string} projectPath - Path to create project
   * @param {string} projectName - Name of the project
   * @param {object} options - Additional options
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async createNodeProject(projectPath, projectName, options = {}) {
    try {
      const fullProjectPath = `${projectPath}/${projectName}`;
      
      // Create project directory
      await Executor.execute(`mkdir -p ${fullProjectPath}`);
      
      // Initialize npm project
      await Executor.execute(`cd ${fullProjectPath} && npm init -y`);
      
      // Install common dependencies based on options
      const dependencies = options.dependencies || [];
      if (dependencies.length > 0) {
        await Executor.execute(`cd ${fullProjectPath} && npm install ${dependencies.join(' ')}`);
      }
      
      // Create basic server.js if Express is selected
      if (dependencies.includes('express')) {
        const serverContent = `const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`App listening at http://localhost:\${port}\`);
});`;
        
        await Executor.execute(`echo '${serverContent}' > ${fullProjectPath}/server.js`);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating Node.js project:', error);
      throw error;
    }
  },

  /**
   * Creates a basic Python project structure
   * @param {string} projectPath - Path to create project
   * @param {string} projectName - Name of the project
   * @param {object} options - Additional options
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async createPythonProject(projectPath, projectName, options = {}) {
    try {
      const fullProjectPath = `${projectPath}/${projectName}`;
      
      // Create project directory
      await Executor.execute(`mkdir -p ${fullProjectPath}`);
      
      // Create virtual environment
      await Executor.execute(`cd ${fullProjectPath} && python3 -m venv venv`);
      
      // Create basic requirements.txt
      const requirements = options.dependencies || [];
      if (requirements.length > 0) {
        await Executor.execute(`cd ${fullProjectPath} && echo "${requirements.join('\\n')}" > requirements.txt`);
      } else {
        await Executor.execute(`cd ${fullProjectPath} && echo "# Add your Python dependencies here" > requirements.txt`);
      }
      
      // Create basic main.py if selected
      if (options.includeMain) {
        const mainContent = `def main():
    print("Hello from ${projectName}!")

if __name__ == "__main__":
    main()`;
        
        await Executor.execute(`echo '${mainContent}' > ${fullProjectPath}/main.py`);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating Python project:', error);
      throw error;
    }
  },

  /**
   * Creates a basic Go project structure
   * @param {string} projectPath - Path to create project
   * @param {string} projectName - Name of the project
   * @param {object} options - Additional options
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async createGoProject(projectPath, projectName, options = {}) {
    try {
      const fullProjectPath = `${projectPath}/${projectName}`;
      
      // Create project directory
      await Executor.execute(`mkdir -p ${fullProjectPath}`);
      
      // Initialize Go module
      await Executor.execute(`cd ${fullProjectPath} && go mod init ${projectName.toLowerCase().replace(/\s+/g, '')}`);
      
      // Create basic main.go
      const mainContent = `package main

import "fmt"

func main() {
    fmt.Println("Hello, ${projectName}!")
}`;
      
      await Executor.execute(`echo '${mainContent}' > ${fullProjectPath}/main.go`);
      
      return true;
    } catch (error) {
      console.error('Error creating Go project:', error);
      throw error;
    }
  },

  /**
   * Creates a basic TypeScript project structure
   * @param {string} projectPath - Path to create project
   * @param {string} projectName - Name of the project
   * @param {object} options - Additional options
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async createTypeScriptProject(projectPath, projectName, options = {}) {
    try {
      const fullProjectPath = `${projectPath}/${projectName}`;
      
      // Create project directory
      await Executor.execute(`mkdir -p ${fullProjectPath}`);
      
      // Initialize npm project
      await Executor.execute(`cd ${fullProjectPath} && npm init -y`);
      
      // Install TypeScript and common dependencies
      await Executor.execute(`cd ${fullProjectPath} && npm install --save-dev typescript @types/node`);
      
      // Initialize TypeScript configuration
      await Executor.execute(`cd ${fullProjectPath} && npx tsc --init`);
      
      // Create basic src directory and index.ts
      await Executor.execute(`mkdir -p ${fullProjectPath}/src`);
      
      const indexContent = `console.log("Hello from ${projectName} in TypeScript!");`;
      
      await Executor.execute(`echo '${indexContent}' > ${fullProjectPath}/src/index.ts`);
      
      // Add build script to package.json
      await Executor.execute(`cd ${fullProjectPath} && node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.build = 'tsc';
        pkg.scripts.start = 'node dist/index.js';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
      "`);
      
      return true;
    } catch (error) {
      console.error('Error creating TypeScript project:', error);
      throw error;
    }
  },

  /**
   * Gets available project templates
   * @returns {Array} - Array of available project templates
   */
  getAvailableTemplates() {
    return [
      {
        id: 'flutter',
        name: 'Flutter App',
        description: 'Cross-platform mobile app with Flutter and Dart',
        icon: 'flutter',
        dependencies: ['flutter'],
        category: 'mobile'
      },
      {
        id: 'compose',
        name: 'Jetpack Compose App',
        description: 'Native Android app with Jetpack Compose',
        icon: 'android',
        dependencies: ['java', 'android-sdk'],
        category: 'mobile'
      },
      {
        id: 'react',
        name: 'React App',
        description: 'Frontend web application with React',
        icon: 'react',
        dependencies: ['node', 'npm'],
        category: 'web'
      },
      {
        id: 'vue',
        name: 'Vue App',
        description: 'Frontend web application with Vue',
        icon: 'vue',
        dependencies: ['node', 'npm'],
        category: 'web'
      },
      {
        id: 'angular',
        name: 'Angular App',
        description: 'Frontend web application with Angular',
        icon: 'angular',
        dependencies: ['node', 'npm'],
        category: 'web'
      },
      {
        id: 'nodejs',
        name: 'Node.js App',
        description: 'Backend application with Node.js',
        icon: 'node',
        dependencies: ['node', 'npm'],
        category: 'backend'
      },
      {
        id: 'python',
        name: 'Python Project',
        description: 'General Python project with virtual environment',
        icon: 'python',
        dependencies: ['python3'],
        category: 'general'
      },
      {
        id: 'go',
        name: 'Go Project',
        description: 'Go application project',
        icon: 'go',
        dependencies: ['go'],
        category: 'general'
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS Project',
        description: 'Project with Tailwind CSS framework',
        icon: 'tailwind',
        dependencies: ['node', 'npm'],
        category: 'web'
      },
      {
        id: 'typescript',
        name: 'TypeScript Project',
        description: 'TypeScript project with compilation setup',
        icon: 'typescript',
        dependencies: ['node', 'npm'],
        category: 'general'
      }
    ];
  },

  /**
   * Installs dependencies for a specific project
   * @param {string} projectPath - Path to the project
   * @param {string} projectType - Type of project
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async installDependencies(projectPath, projectType) {
    try {
      let installCommand = '';
      
      switch (projectType.toLowerCase()) {
        case 'flutter':
          installCommand = `cd ${projectPath} && flutter pub get`;
          break;
        case 'react':
        case 'vue':
        case 'angular':
        case 'nodejs':
        case 'tailwind':
        case 'typescript':
          installCommand = `cd ${projectPath} && npm install`;
          break;
        case 'python':
          installCommand = `cd ${projectPath} && source venv/bin/activate && pip install -r requirements.txt`;
          break;
        case 'go':
          installCommand = `cd ${projectPath} && go mod tidy`;
          break;
        default:
          throw new Error(`Dependency installation not supported for ${projectType}`);
      }

      const result = await Executor.execute(installCommand);
      console.log(`Dependency installation result: ${result}`);
      return true;
    } catch (error) {
      console.error(`Error installing dependencies for ${projectType}:`, error);
      throw error;
    }
  },

  /**
   * Updates project dependencies
   * @param {string} projectPath - Path to the project
   * @param {string} projectType - Type of project
   * @returns {Promise<boolean>} - Returns true if successful
   */
  async updateDependencies(projectPath, projectType) {
    try {
      let updateCommand = '';
      
      switch (projectType.toLowerCase()) {
        case 'flutter':
          updateCommand = `cd ${projectPath} && flutter pub upgrade`;
          break;
        case 'react':
        case 'vue':
        case 'angular':
        case 'nodejs':
        case 'tailwind':
        case 'typescript':
          updateCommand = `cd ${projectPath} && npm update`;
          break;
        case 'python':
          updateCommand = `cd ${projectPath} && source venv/bin/activate && pip install --upgrade -r requirements.txt`;
          break;
        case 'go':
          updateCommand = `cd ${projectPath} && go get -u ./...`;
          break;
        default:
          throw new Error(`Dependency update not supported for ${projectType}`);
      }

      const result = await Executor.execute(updateCommand);
      console.log(`Dependency update result: ${result}`);
      return true;
    } catch (error) {
      console.error(`Error updating dependencies for ${projectType}:`, error);
      throw error;
    }
  }
};

module.exports = Scaffolding;