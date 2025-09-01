#!/bin/bash

echo "🚀 Deploying Tese Marketplace to Kubernetes..."

# Apply namespace
kubectl apply -f namespace.yaml

# Apply deployments and services
kubectl apply -f backend-deployment.yaml
kubectl apply -f storefront-deployment.yaml  
kubectl apply -f vendor-panel-deployment.yaml

# Apply ingress routes
kubectl apply -f ingress.yaml

echo "✅ Deployment complete!"
echo ""
echo "📝 External Access URLs:"
echo "🔗 Backend API: http://65.109.113.80:30900"
echo "🔗 Storefront: http://65.109.113.80:30800" 
echo "🔗 Vendor Panel: http://65.109.113.80:30701"
echo ""
echo "🌐 Domain Access (if DNS configured):"
echo "🔗 API: http://api.stage-marketplace.tese.io"
echo "🔗 Storefront: http://stage-marketplace.tese.io"
echo "🔗 Vendor Panel: http://vendor.stage-marketplace.tese.io"
echo ""
echo "📊 Check deployment status:"
echo "kubectl get pods -n tese-marketplace"
echo "kubectl get svc -n tese-marketplace"
