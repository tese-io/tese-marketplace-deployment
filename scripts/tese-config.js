import path from "path";

/**
 * Tese Marketplace Configuration
 * Central configuration file for all paths, URLs, credentials, and deployment settings
 */

// Get dynamic paths based on script location
function getBasePaths() {
  const scriptDir = path.dirname(import.meta.url.replace('file://', ''));
  const deploymentRoot = path.resolve(scriptDir, '..');
  const projectsRoot = path.resolve(scriptDir, '..', '..');
  
  return {
    scriptDir,
    deploymentRoot,
    projectsRoot
  };
}

// Initialize base paths
const basePaths = getBasePaths();

export const config = {
  // === PATHS ===
  paths: {
    // Base paths
    scriptDir: basePaths.scriptDir,
    deploymentRoot: basePaths.deploymentRoot,
    projectsRoot: basePaths.projectsRoot,
    
    // Kubernetes configs
    k8sDir: path.join(basePaths.deploymentRoot, "k8s"),
    
    // Project paths (relative to projectsRoot)
    getProjectPath: (projectName) => path.resolve(basePaths.projectsRoot, projectName),
    getBackendPath: (projectName) => path.join(basePaths.projectsRoot, projectName, "backend", "apps", "backend"),
    getStorefrontPath: (projectName) => path.join(basePaths.projectsRoot, projectName, "storefront"),
    getVendorPanelPath: (projectName) => path.join(basePaths.projectsRoot, projectName, "vendor-panel"),
  },

  // === REPOSITORY URLS ===
  repositories: {
    backend: "https://github.com/tese-io/tese-marketplace.git",
    storefront: "https://github.com/tese-io/tese-marketplace.git", 
    vendorPanel: "https://github.com/tese-io/tese-marketplace.git"
  },

  // === DATABASE CONFIGURATION ===
  database: {
    // Default Neon database configuration
    default: {
      url: "ep-autumn-leaf-ad6kk4uq-pooler.c-2.us-east-1.aws.neon.tech",
      port: "5432",
      user: "neondb_owner",
      pass: "npg_1VGJwSL7KacF",
      name: "neondb"
    },
    
    // Generate database URL
    getDatabaseUrl: (dbConfig = config.database.default) => 
      `postgresql://${dbConfig.user}:${dbConfig.pass}@${dbConfig.url}:${dbConfig.port}/${dbConfig.name}?sslmode=require`
  },

  // === DEPLOYMENT URLS ===
  deployment: {
    server: "65.109.113.80",
    ports: {
      backend: "30900",
      storefront: "30800", 
      vendorPanel: "30701"
    },
    
    // Generate service URLs
    getBackendUrl: () => `http://${config.deployment.server}:${config.deployment.ports.backend}`,
    getStorefrontUrl: () => `http://${config.deployment.server}:${config.deployment.ports.storefront}`,
    getVendorPanelUrl: () => `http://${config.deployment.server}:${config.deployment.ports.vendorPanel}`,
    getAdminUrl: () => `http://${config.deployment.server}:${config.deployment.ports.backend}/app`
  },

  // === CORS CONFIGURATION ===
  cors: {
    admin: [
      "http://65.109.113.80:30900",
      "http://localhost:7000",
      "https://admin.stage-marketplace.tese.io"
    ],
    store: [
      "http://65.109.113.80:30800", 
      "http://localhost:8000",
      "https://stage-marketplace.tese.io"
    ],
    vendor: [
      "http://65.109.113.80:30701",
      "http://localhost:7001"
    ],
    
    // Generate CORS strings
    getAdminCors: () => config.cors.admin.join(","),
    getStoreCors: () => config.cors.store.join(","),
    getVendorCors: () => config.cors.vendor.join(","),
    getAuthCors: () => [...config.cors.admin, ...config.cors.store, ...config.cors.vendor].join(",")
  },

  // === SECRETS ===
  secrets: {
    jwt: "tese-marketplace-jwt-secret",
    cookie: "tese-marketplace-cookie-secret", 
    session: "tese-marketplace-session-secret",
    publishableKey: "pk_9c115fbcbef63283d5798789c01268ca875f59d5b1a009478d925905ef07b28e"
  },

  // === ALGOLIA CONFIGURATION ===
  algolia: {
    applicationId: "RB10HUJV7A",
    writeApiKey: "562a4b2e30ee05141f8627713d1fca0d",
    searchApiKey: "b145a6fd75d9b6a148a7ba0e6a92c993",
    adminApiKey: "fcc282b0e323e896e2f00f5e30ec9903"
  },

  // === DEFAULT CREDENTIALS ===
  credentials: {
    admin: {
      email: "admin@example.com",
      password: "password123"
    },
    adminAlt: {
      email: "admin@tese.io", 
      password: "admin123"
    },
    vendor: {
      email: "seller@mercurjs.com",
      password: "secret"
    }
  },

  // === KUBERNETES CONFIGURATION ===
  kubernetes: {
    namespace: "tese-marketplace",
    deploymentNames: {
      backend: "tese-backend",
      storefront: "tese-storefront", 
      vendorPanel: "tese-vendor-panel"
    },
    
    // Service configurations
    services: {
      backend: {
        name: "tese-backend-service",
        port: 9000,
        nodePort: 30900
      },
      storefront: {
        name: "tese-storefront-service", 
        port: 3000,
        nodePort: 30800
      },
      vendorPanel: {
        name: "tese-vendor-panel-service",
        port: 3000, 
        nodePort: 30701
      }
    }
  },

  // === ENVIRONMENT TEMPLATES ===
  envTemplates: {
    backend: (dbConfig = config.database.default) => `
DATABASE_URL=${config.database.getDatabaseUrl(dbConfig)}
NODE_ENV=production
JWT_SECRET=${config.secrets.jwt}
COOKIE_SECRET=${config.secrets.cookie}
SESSION_SECRET=${config.secrets.session}
ADMIN_CORS=${config.cors.getAdminCors()}
STORE_CORS=${config.cors.getStoreCors()}
VENDOR_CORS=${config.cors.getVendorCors()}
AUTH_CORS=${config.cors.getAuthCors()}
ALGOLIA_APPLICATION_ID=${config.algolia.applicationId}
ALGOLIA_WRITE_API_KEY=${config.algolia.writeApiKey}
ALGOLIA_SEARCH_API_KEY=${config.algolia.searchApiKey}
`.trim(),

    storefront: (publishableKey = config.secrets.publishableKey) => `
MEDUSA_BACKEND_URL=${config.deployment.getBackendUrl()}
NEXT_PUBLIC_MEDUSA_BACKEND_URL=${config.deployment.getBackendUrl()}
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_ALGOLIA_APPLICATION_ID=${config.algolia.applicationId}
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=${config.algolia.searchApiKey}
`.trim(),

    vendorPanel: () => `
VITE_MEDUSA_BACKEND_URL=${config.deployment.getBackendUrl()}
VITE_ALGOLIA_APPLICATION_ID=${config.algolia.applicationId}
VITE_ALGOLIA_SEARCH_API_KEY=${config.algolia.searchApiKey}
VITE_ALGOLIA_ADMIN_API_KEY=${config.algolia.adminApiKey}
`.trim()
  },

  // === DEFAULT PROJECT SETTINGS ===
  defaults: {
    projectName: "tese-marketplace",
    installStorefront: true,
    installVendor: true,
    useExistingDb: true,
    region: "us"
  },

  // === HELPER FUNCTIONS ===
  helpers: {
    // Get full project structure info
    getProjectInfo: (projectName = config.defaults.projectName) => {
      const projectPath = config.paths.getProjectPath(projectName);
      return {
        name: projectName,
        path: projectPath,
        backend: config.paths.getBackendPath(projectName),
        storefront: config.paths.getStorefrontPath(projectName),
        vendorPanel: config.paths.getVendorPanelPath(projectName)
      };
    },

    // Get all service URLs
    getAllUrls: () => ({
      admin: config.deployment.getAdminUrl(),
      storefront: config.deployment.getStorefrontUrl(),
      vendorPanel: config.deployment.getVendorPanelUrl(),
      backend: config.deployment.getBackendUrl()
    }),

    // Get deployment summary
    getDeploymentSummary: () => ({
      paths: {
        source: `${config.paths.projectsRoot}/tese-marketplace`,
        deployment: config.paths.deploymentRoot
      },
      urls: config.helpers.getAllUrls(),
      credentials: config.credentials
    })
  }
};

export default config;
