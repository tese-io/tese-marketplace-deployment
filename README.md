# Tese Marketplace - Deployment Repository

This repository contains Kubernetes deployment configurations, documentation, and scripts for the Tese Marketplace.

## Structure

```
├── k8s/          # Kubernetes deployment files
├── docs/         # Documentation and guides
├── scripts/      # Deployment and utility scripts
└── README.md     # This file
```

## Quick Setup (Everything)

```bash
./scripts/setup-all.sh
```

## Individual Scripts

```bash
# Setup source code only
./scripts/setup-source.sh

# Deploy to Kubernetes only  
./scripts/deploy.sh
```

## Components

- **K8s**: Contains all Kubernetes YAML files
- **Docs**: Complete documentation for setup and troubleshooting
- **Scripts**: Automated deployment and management scripts

## Source Code

The source code is automatically cloned from your forked repositories:
- **Backend**: `tese-io/mercur` (your MercurJS fork)
- **Storefront**: `tese-io/b2c-marketplace-storefront` (your storefront fork)  
- **Vendor Panel**: `tese-io/vendor-panel` (your vendor panel fork)

Source will be installed to: `/root/mercur/tese-marketplace-source`
