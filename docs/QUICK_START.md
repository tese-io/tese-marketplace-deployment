# ⚡ Quick Start Guide

## 🚀 Deploy in 5 Minutes

### 1. **Prerequisites**
```bash
# Ensure you have kubectl configured
kubectl version --client
```

### 2. **Deploy Services**
```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Wait for deployment
kubectl get pods -n tese-marketplace --watch
```

### 3. **Access Services**
- **Admin**: `http://65.109.113.80:30900/app`
- **Storefront**: `http://65.109.113.80:30800`  
- **Vendor**: `http://65.109.113.80:30701`

### 4. **Login Credentials**
- **Email**: `admin@example.com`
- **Password**: `password123`

## ✅ **Verify Working**
```bash
# Check all services
kubectl get svc -n tese-marketplace

# Check logs if needed
kubectl logs -n tese-marketplace deployment/tese-backend
```

**Your marketplace is ready! 🎉**
