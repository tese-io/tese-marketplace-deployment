#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { Command } from "commander";
import { config } from "./tese-config.js";

// Helper function to get dynamic paths (kept for backward compatibility)
function getPaths() {
  return {
    scriptDir: config.paths.scriptDir,
    deploymentRoot: config.paths.deploymentRoot,
    projectsRoot: config.paths.projectsRoot
  };
}

// Modified version of MercurJS CLI to use Tese forked repositories
export async function pullAndInstall(options) {
  // Create projects using config paths
  const targetDir = config.paths.getProjectPath(options.directory);

  const spinner = ora("Setting up Tese Marketplace...").start();
  await fs.ensureDir(targetDir);

  spinner.text = "Installing Tese backend (from tese-io/mercur fork)...";
  await execa(
    "git",
    ["clone", config.repositories.backend, "backend"],
    {
      cwd: targetDir,
    }
  );
  await execa("npm", ["install"], { cwd: path.join(targetDir, "backend") });

  if (options.install_storefront) {
    spinner.text = "Installing Tese storefront (from tese-io fork)...";
    await execa(
      "git",
      [
        "clone",
        config.repositories.storefront,
        "storefront",
      ],
      {
        cwd: targetDir,
      }
    );
    await execa("npm", ["install"], {
      cwd: path.join(targetDir, "storefront"),
    });
  }

  if (options.install_vendor) {
    spinner.text = "Installing Tese vendor panel (from tese-io fork)...";
    await execa(
      "git",
      ["clone", config.repositories.vendorPanel, "vendor-panel"],
      {
        cwd: targetDir,
      }
    );
    await execa("npm", ["install"], {
      cwd: path.join(targetDir, "vendor-panel"),
    });
  }

  spinner.succeed("Download complete!");
}

export async function backendSetup(options) {
  const backendDir = config.paths.getBackendPath(options.directory);
  
  const spinner = ora("Configuring backend...").start();
  
  // Create database config from options or use defaults
  const dbConfig = {
    url: options.db_url || config.database.default.url,
    port: options.db_port || config.database.default.port,
    user: options.db_user || config.database.default.user,
    pass: options.db_pass || config.database.default.pass,
    name: options.db_name || config.database.default.name
  };
  
  // Create .env file using config template
  const envContent = config.envTemplates.backend(dbConfig);

  await fs.writeFile(path.join(backendDir, ".env"), envContent);
  
  // Run database setup
  spinner.text = "Setting up database...";
  try {
    await execa("npx", ["medusa", "db:create", "--db", dbConfig.name], {
      cwd: backendDir,
      stdio: 'inherit'
    });
    await execa("npx", ["medusa", "db:migrate"], {
      cwd: backendDir,
      stdio: 'inherit'
    });
    await execa("npx", ["medusa", "user:create", "--email", config.credentials.admin.email, "--password", config.credentials.admin.password], {
      cwd: backendDir,
      stdio: 'inherit'
    });
  } catch (error) {
    spinner.warn("Database setup had issues, but continuing...");
  }
  
  spinner.succeed("Backend configured!");
  return config.secrets.publishableKey;
}

export async function storefrontSetup(options) {
  const storefrontDir = config.paths.getStorefrontPath(options.directory);
  
  const spinner = ora("Configuring storefront...").start();
  
  const envContent = config.envTemplates.storefront(options.publishableKey);

  await fs.writeFile(path.join(storefrontDir, ".env"), envContent);
  spinner.succeed("Storefront configured!");
}

export async function vendorPanelSetup(options) {
  const vendorDir = config.paths.getVendorPanelPath(options.directory);
  
  const spinner = ora("Configuring vendor panel...").start();
  
  const envContent = config.envTemplates.vendorPanel();

  await fs.writeFile(path.join(vendorDir, ".env"), envContent);
  spinner.succeed("Vendor panel configured!");
}

export async function fullInstall() {
  console.log(chalk.blue("🏗️  Tese Marketplace Setup"));
  console.log(chalk.blue("============================"));

  const { project_name } = await inquirer.prompt({
    type: "input",
    name: "project_name",
    message: "What is your project name?",
    default: config.defaults.projectName,
  });

  const { install_storefront } = await inquirer.prompt({
    type: "confirm",
    name: "install_storefront",
    message: "Install storefront?",
    default: config.defaults.installStorefront,
  });

  const { install_vendor } = await inquirer.prompt({
    type: "confirm",
    name: "install_vendor",
    message: "Install vendor panel?",
    default: config.defaults.installVendor,
  });

  const { use_existing_db } = await inquirer.prompt({
    type: "confirm",
    name: "use_existing_db",
    message: "Use existing Neon database configuration?",
    default: config.defaults.useExistingDb,
  });

  let db_config;
  if (use_existing_db) {
    db_config = {
      db_url: config.database.default.url,
      db_port: config.database.default.port, 
      db_user: config.database.default.user,
      db_pass: config.database.default.pass,
      db_name: config.database.default.name
    };
  } else {
    const { db_url } = await inquirer.prompt({
      type: "input",
      name: "db_url",
      message: "Database address:",
      default: "localhost",
    });
    
    const { db_port } = await inquirer.prompt({
      type: "input", 
      name: "db_port",
      message: "Database port:",
      default: "5432",
    });
    
    const { db_user } = await inquirer.prompt({
      type: "input",
      name: "db_user", 
      message: "Database user:",
      default: "postgres",
    });
    
    const { db_pass } = await inquirer.prompt({
      type: "input",
      name: "db_pass",
      message: "Database password:",
      default: "postgres",
    });
    
    const { db_name } = await inquirer.prompt({
      type: "input",
      name: "db_name",
      message: "Database name:",
      default: "mercurjs",
    });
    
    db_config = { db_url, db_port, db_user, db_pass, db_name };
  }

  console.log(chalk.blue("Downloading Tese Marketplace from forked repositories..."));
  
  // Show where project will be created (two folders up from CLI script)
  const { projectsRoot } = getPaths();
  const projectPath = path.resolve(projectsRoot, project_name);
  console.log(chalk.yellow(`📁 Project will be created at: ${projectPath}`));
  
  await pullAndInstall({
    directory: project_name,
    install_storefront,
    install_vendor,
  });

  console.log(chalk.blue("Setting up Tese Marketplace..."));
  const publishableKey = await backendSetup({
    ...db_config,
    directory: project_name,
  });

  if (install_storefront) {
    await storefrontSetup({ directory: project_name, publishableKey });
  }

  if (install_vendor) {
    await vendorPanelSetup({ directory: project_name });
  }

  console.log(chalk.greenBright("🎉 Tese Marketplace ready!"));
  console.log(chalk.blue("Here are your credentials:"));
  console.log(`
    ${chalk.bold("Admin panel:")}
    login: ${chalk.cyanBright(config.credentials.admin.email)}
    password: ${chalk.cyanBright(config.credentials.admin.password)}
    
    ${chalk.bold("Vendor panel:")}
    login: ${chalk.cyanBright(config.credentials.vendor.email)}
    password: ${chalk.cyanBright(config.credentials.vendor.password)}
    `);
}

export async function deployToKubernetes() {
  const spinner = ora("🚀 Deploying Tese Marketplace to Kubernetes...").start();
  
  try {
    // Get the k8s directory path from config
    const k8sDir = config.paths.k8sDir;
    
    // Create namespace
    spinner.text = "Creating namespace...";
    await execa("kubectl", ["apply", "-f", path.join(k8sDir, "namespace.yaml")]);

    // Deploy all components
    spinner.text = "Deploying components...";
    await execa("kubectl", ["apply", "-f", k8sDir]);

    // Wait for deployments
    spinner.text = "⏳ Waiting for deployments...";
    await execa("kubectl", ["wait", "--for=condition=available", "deployment", "--all", "-n", config.kubernetes.namespace, "--timeout=300s"]);

    spinner.succeed("✅ Deployment complete!");
    
    console.log(chalk.blue("\n🌐 Access URLs:"));
    console.log(`   ${chalk.bold("Admin Panel:")}  ${config.deployment.getAdminUrl()}`);
    console.log(`   ${chalk.bold("Storefront:")}   ${config.deployment.getStorefrontUrl()}`);
    console.log(`   ${chalk.bold("Vendor Panel:")} ${config.deployment.getVendorPanelUrl()}`);
    console.log(chalk.blue(`\n🔑 Login: ${config.credentials.admin.email} / ${config.credentials.admin.password}`));
    console.log(chalk.blue(`\n📊 Check status: kubectl get pods -n ${config.kubernetes.namespace}`));
    
  } catch (error) {
    spinner.fail("❌ Deployment failed");
    console.error(error.message);
    throw error;
  }
}

export async function setupAdminAccess() {
  const spinner = ora("🚀 Starting Admin Panel Access...").start();
  
  try {
    spinner.text = "📡 Setting up port forwarding to admin panel...";
    
    // Kill any existing port-forward
    try {
      await execa("pkill", ["-f", "kubectl.*port-forward.*tese-backend"]);
    } catch {
      // Ignore if no processes found
    }

    // Start port-forward in background
    const portForward = execa("kubectl", [
      "port-forward", 
      "-n", "tese-marketplace", 
      "deployment/tese-backend", 
      "8080:9000"
    ]);

    // Give it time to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    spinner.text = "🎯 Testing connectivity...";
    
    // Test the connection
    try {
      await execa("curl", ["-s", "http://localhost:8080/app"]);
      spinner.succeed("✅ Admin panel is accessible!");
    } catch {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        await execa("curl", ["-s", "http://localhost:8080/app"]);
        spinner.succeed("✅ Admin panel is now accessible!");
      } catch {
        spinner.warn("❌ Connection issues. Check kubectl port-forward manually.");
      }
    }

    console.log(chalk.blue("\n✅ Admin panel is now accessible at:"));
    console.log(chalk.bold("🌐 URL: http://localhost:8080/app"));
    console.log(chalk.blue("\n🔑 Login Credentials:"));
    console.log(`   Email: ${chalk.cyanBright("admin@example.com")}`);
    console.log(`   Password: ${chalk.cyanBright("password123")}`);
    console.log(chalk.blue("\n🔧 Alternative credentials:"));
    console.log(`   Email: ${chalk.cyanBright("admin@tese.io")}`);
    console.log(`   Password: ${chalk.cyanBright("admin123")}`);
    console.log(chalk.blue("\n🎉 Ready to use! Open your browser to http://localhost:8080/app"));
    
    return portForward;
    
  } catch (error) {
    spinner.fail("❌ Admin access setup failed");
    console.error(error.message);
    throw error;
  }
}

export async function fixAdminAuth() {
  const spinner = ora("🔧 Fixing Admin Panel Authentication...").start();
  
  try {
    spinner.text = "📝 Adding session configuration to backend deployment...";
    
    const patchConfig = {
      spec: {
        template: {
          spec: {
            containers: [{
              name: "backend",
              env: [
                { name: "SESSION_SECRET", value: "tese-marketplace-session-secret" },
                { name: "COOKIE_SECRET", value: "tese-marketplace-cookie-secret" },
                { name: "MEDUSA_ADMIN_ONBOARDING_TYPE", value: "default" },
                { name: "MEDUSA_ADMIN_ONBOARDING_FLOW", value: "invite_only" },
                { name: "STORE_CORS", value: "http://65.109.113.80:8000,https://stage-marketplace.tese.io" },
                { name: "ADMIN_CORS", value: "http://65.109.113.80:30900,http://65.109.113.80:7000,https://admin.stage-marketplace.tese.io" },
                { name: "AUTH_CORS", value: "http://65.109.113.80:30900,http://65.109.113.80:7000,http://65.109.113.80:7001,http://65.109.113.80:8000" }
              ]
            }]
          }
        }
      }
    };

    await execa("kubectl", [
      "patch", "deployment", "tese-backend", "-n", "tese-marketplace",
      "--type=merge", "-p", JSON.stringify(patchConfig)
    ]);

    spinner.text = "✅ Configuration updated, waiting for rollout...";
    await execa("kubectl", [
      "rollout", "status", "deployment/tese-backend", 
      "-n", "tese-marketplace", "--timeout=60s"
    ]);

    spinner.succeed("🎉 Session fix applied! Try the admin panel now.");
    
  } catch (error) {
    spinner.fail("❌ Admin auth fix failed");
    console.error(error.message);
    throw error;
  }
}

export async function completeSetup() {
  console.log(chalk.blue("🏗️  Tese Marketplace - Complete Setup"));
  console.log(chalk.blue("======================================="));

  try {
    // Get paths once at the start
    const { deploymentRoot, projectsRoot } = getPaths();
    
    // Step 1: Setup source code
    console.log(chalk.blue("📦 Step 1: Setting up MercurJS source code..."));
    console.log(chalk.yellow(`📁 Source code will be created at: ${projectsRoot}/`));
    
    await fullInstall();

    // Step 2: Deploy to Kubernetes
    console.log(chalk.blue("\n🚀 Step 2: Deploying to Kubernetes..."));
    await deployToKubernetes();

    console.log(chalk.greenBright("\n🎉 Complete setup finished!"));
    console.log(chalk.blue("\n📁 Repositories:"));
    console.log(`   Source:     ${projectsRoot}/${config.defaults.projectName}`);
    console.log(`   Deployment: ${deploymentRoot}`);
    console.log(chalk.blue("\n🌐 Access URLs:"));
    console.log(`   Admin Panel:  ${config.deployment.getAdminUrl()}`);
    console.log(`   Storefront:   ${config.deployment.getStorefrontUrl()}`);
    console.log(`   Vendor Panel: ${config.deployment.getVendorPanelUrl()}`);
    console.log(chalk.blue(`\n🔑 Login: ${config.credentials.admin.email} / ${config.credentials.admin.password}`));

  } catch (error) {
    console.error(chalk.red("❌ Complete setup failed:"), error.message);
    process.exit(1);
  }
}

// CLI Commands
const program = new Command();

program
  .name('tese-cli')
  .description('CLI for Tese Marketplace using forked MercurJS repositories')
  .version('1.0.0');

program
  .command('install')
  .description('Install Tese Marketplace source code')
  .action(async () => {
    try {
      await fullInstall();
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('deploy')
  .description('Deploy Tese Marketplace to Kubernetes')
  .action(async () => {
    try {
      await deployToKubernetes();
    } catch (error) {
      console.error(chalk.red('❌ Deployment failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('admin-access')
  .description('Setup admin panel access via port forwarding')
  .action(async () => {
    try {
      await setupAdminAccess();
    } catch (error) {
      console.error(chalk.red('❌ Admin access setup failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('fix-auth')
  .description('Fix admin panel authentication issues')
  .action(async () => {
    try {
      await fixAdminAuth();
    } catch (error) {
      console.error(chalk.red('❌ Auth fix failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Complete setup: install + deploy')
  .action(async () => {
    try {
      await completeSetup();
    } catch (error) {
      console.error(chalk.red('❌ Complete setup failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Test CLI with default settings')
  .action(async () => {
    console.log(chalk.blue("🧪 Testing Tese CLI..."));
    console.log(chalk.blue("====================="));
    
    try {
      // Use default options for testing from config
      const testOptions = {
        directory: config.defaults.projectName,
        install_storefront: config.defaults.installStorefront,
        install_vendor: config.defaults.installVendor,
        db_url: config.database.default.url,
        db_port: config.database.default.port, 
        db_user: config.database.default.user,
        db_pass: config.database.default.pass,
        db_name: config.database.default.name
      };

      console.log(chalk.blue("Downloading Tese Marketplace from forked repositories..."));
      
      // Show where project will be created (two folders up from CLI script)
      const { projectsRoot } = getPaths();
      const projectPath = path.resolve(projectsRoot, testOptions.directory);
      console.log(chalk.yellow(`📁 Project will be created at: ${projectPath}`));
      
      await pullAndInstall(testOptions);

      console.log(chalk.blue("Setting up Tese Marketplace..."));
      const publishableKey = await backendSetup(testOptions);

      if (testOptions.install_storefront) {
        await storefrontSetup({ directory: testOptions.directory, publishableKey });
      }

      if (testOptions.install_vendor) {
        await vendorPanelSetup({ directory: testOptions.directory });
      }

      console.log(chalk.greenBright("✅ CLI test complete!"));
    } catch (error) {
      console.error(chalk.red('❌ CLI test failed:'), error.message);
      process.exit(1);
    }
  });

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
