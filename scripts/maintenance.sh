#!/bin/bash

# Tese Marketplace Maintenance Script
# Consolidated script that replaces multiple individual scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Function to show help
show_help() {
    echo "Tese Marketplace Maintenance Script"
    echo "=================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup           Complete setup (install + deploy)"
    echo "  install         Install source code only"
    echo "  deploy          Deploy to Kubernetes"
    echo "  admin-access    Setup admin panel port forwarding"
    echo "  fix-auth        Fix admin authentication issues"
    echo "  status          Show deployment status"
    echo "  logs            Show backend logs"
    echo "  restart         Restart all deployments"
    echo "  restart-backend Restart backend only"
    echo "  cleanup         Remove all deployments"
    echo "  test            Test CLI functionality"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup         # Complete marketplace setup"
    echo "  $0 admin-access  # Access admin panel locally"
    echo "  $0 status        # Check deployment status"
}

# Function for complete setup
setup_complete() {
    print_status "🏗️  Tese Marketplace - Complete Setup"
    print_status "======================================="
    
    cd "$(dirname "$0")"
    node tese-cli.js setup
}

# Function to install source code
install_source() {
    print_status "📦 Installing Tese Marketplace source code..."
    
    cd "$(dirname "$0")"
    node tese-cli.js install
}

# Function to deploy to Kubernetes
deploy_k8s() {
    print_status "🚀 Deploying Tese Marketplace to Kubernetes..."
    
    cd "$(dirname "$0")"
    node tese-cli.js deploy
}

# Function to setup admin access
setup_admin_access() {
    print_status "🚀 Setting up Admin Panel Access..."
    
    cd "$(dirname "$0")"
    node tese-cli.js admin-access &
    
    print_status "🔧 Port forwarding started in background"
    print_success "✅ Admin panel will be accessible at http://localhost:8080/app"
    print_status "🔑 Login: admin@example.com / password123"
}

# Function to fix admin authentication
fix_admin_auth() {
    print_status "🔧 Fixing Admin Panel Authentication..."
    
    cd "$(dirname "$0")"
    node tese-cli.js fix-auth
}

# Function to show status
show_status() {
    print_status "📊 Tese Marketplace Status"
    print_status "=========================="
    
    echo ""
    print_status "🏗️  Namespace:"
    kubectl get namespace tese-marketplace 2>/dev/null || print_warning "❌ Namespace not found"
    
    echo ""
    print_status "🚀 Deployments:"
    kubectl get deployments -n tese-marketplace 2>/dev/null || print_warning "❌ No deployments found"
    
    echo ""
    print_status "📦 Pods:"
    kubectl get pods -n tese-marketplace 2>/dev/null || print_warning "❌ No pods found"
    
    echo ""
    print_status "🌐 Services:"
    kubectl get services -n tese-marketplace 2>/dev/null || print_warning "❌ No services found"
    
    echo ""
    print_status "🔗 Access URLs:"
    echo "   Admin Panel:  http://65.109.113.80:30900/app"
    echo "   Storefront:   http://65.109.113.80:30800"
    echo "   Vendor Panel: http://65.109.113.80:30701"
}

# Function to show logs
show_logs() {
    print_status "📋 Backend Logs (last 100 lines)"
    print_status "================================"
    
    kubectl logs -n tese-marketplace deployment/tese-backend --tail=100 2>/dev/null || {
        print_error "❌ Failed to get logs. Check if deployment exists."
        return 1
    }
}

# Function to restart all deployments
restart_all() {
    print_status "🔄 Restarting all deployments..."
    
    kubectl rollout restart deployment --all -n tese-marketplace 2>/dev/null || {
        print_error "❌ Failed to restart deployments. Check if namespace exists."
        return 1
    }
    
    print_status "⏳ Waiting for deployments to be ready..."
    kubectl rollout status deployment --all -n tese-marketplace --timeout=300s
    
    print_success "✅ All deployments restarted successfully"
}

# Function to restart backend only
restart_backend() {
    print_status "🔄 Restarting backend deployment..."
    
    kubectl rollout restart deployment/tese-backend -n tese-marketplace 2>/dev/null || {
        print_error "❌ Failed to restart backend. Check if deployment exists."
        return 1
    }
    
    print_status "⏳ Waiting for backend to be ready..."
    kubectl rollout status deployment/tese-backend -n tese-marketplace --timeout=60s
    
    print_success "✅ Backend restarted successfully"
}

# Function to cleanup all resources
cleanup_all() {
    print_warning "⚠️  This will delete the entire tese-marketplace namespace!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "🗑️  Cleaning up Tese Marketplace..."
        kubectl delete namespace tese-marketplace 2>/dev/null || print_warning "❌ Namespace may not exist"
        print_success "✅ Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to test CLI
test_cli() {
    print_status "🧪 Testing Tese CLI..."
    
    cd "$(dirname "$0")"
    node tese-cli.js test
}

# Main script logic
case "${1:-help}" in
    setup)
        setup_complete
        ;;
    install)
        install_source
        ;;
    deploy)
        deploy_k8s
        ;;
    admin-access)
        setup_admin_access
        ;;
    fix-auth)
        fix_admin_auth
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_all
        ;;
    restart-backend)
        restart_backend
        ;;
    cleanup)
        cleanup_all
        ;;
    test)
        test_cli
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
