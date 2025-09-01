# Tese Marketplace Scripts

This directory contains consolidated scripts for managing the Tese Marketplace deployment.

## Main Tools

### 🚀 tese-cli.js - Unified CLI
The main CLI tool that handles all marketplace operations:

```bash
# Install marketplace source code
node tese-cli.js install

# Deploy to Kubernetes  
node tese-cli.js deploy

# Complete setup (install + deploy)
node tese-cli.js setup

# Setup admin panel access
node tese-cli.js admin-access

# Fix admin authentication
node tese-cli.js fix-auth

# Test CLI functionality
node tese-cli.js test

# Show help
node tese-cli.js --help
```

### 🔧 maintenance.sh - Maintenance Operations
Consolidated maintenance script for common operations:

```bash
# Complete setup
./maintenance.sh setup

# Show deployment status
./maintenance.sh status

# View backend logs
./maintenance.sh logs

# Restart all deployments
./maintenance.sh restart

# Restart backend only
./maintenance.sh restart-backend

# Setup admin access
./maintenance.sh admin-access

# Clean up everything
./maintenance.sh cleanup

# Show help
./maintenance.sh help
```

## NPM Scripts

You can also use npm scripts for convenience:

```bash
# Install marketplace
npm run install-marketplace

# Deploy to Kubernetes
npm run deploy

# Setup admin access
npm run admin-access

# Fix authentication
npm run fix-auth

# Complete setup
npm run setup

# Check status
npm run status

# View logs
npm run logs

# Restart backend
npm run restart-backend

# Restart all
npm run restart-all

# Clean up
npm run cleanup
```

## Legacy Scripts (Wrappers)

These scripts are kept for backward compatibility but now use the unified CLI:

- `deploy.sh` - Wrapper for `tese-cli.js deploy`
- `setup-all.sh` - Wrapper for `tese-cli.js setup`

## Migration from Old Scripts

**Removed scripts** (functionality moved to CLI):
- ❌ `admin-access.sh` → Use `tese-cli.js admin-access` or `maintenance.sh admin-access`
- ❌ `fix-admin-auth.sh` → Use `tese-cli.js fix-auth` or `maintenance.sh fix-auth`  
- ❌ `session-fix.sh` → Use `tese-cli.js fix-auth`
- ❌ `setup-source.sh` → Use `tese-cli.js install`
- ❌ `test-cli.sh` → Use `tese-cli.js test`

## Quick Start

1. **Complete setup:**
   ```bash
   ./maintenance.sh setup
   ```

2. **Check status:**
   ```bash
   ./maintenance.sh status
   ```

3. **Access admin panel:**
   ```bash
   ./maintenance.sh admin-access
   ```
   Then open: http://localhost:8080/app

4. **Troubleshoot authentication:**
   ```bash
   ./maintenance.sh fix-auth
   ```

## Access URLs

- **Admin Panel:** http://65.109.113.80:30900/app
- **Storefront:** http://65.109.113.80:30800  
- **Vendor Panel:** http://65.109.113.80:30701

**Login:** admin@example.com / password123


