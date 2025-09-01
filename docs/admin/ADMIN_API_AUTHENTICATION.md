x# 🔑 **Admin API Authentication - WORKING SOLUTION**

## ✅ **PROBLEM SOLVED!**

Your `/admin/users/me` request was failing because it was **missing the Authorization header** with the JWT token.

## 🎯 **Working Solution**

### **Step 1: Get Authentication Token**
```bash
curl 'http://65.109.113.80:30900/auth/user/emailpass' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: lng=en; _medusa_cache_id=76af52cc-9b6c-42ef-b750-7bba59f3cb22' \
  -H 'Origin: http://65.109.113.80:30900' \
  -H 'Referer: http://65.109.113.80:30900/app/login' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  --data-raw '{"email":"admin@example.com","password":"password123"}' \
  --insecure
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rvcl9pZCI6..."
}
```

### **Step 2: Use Token in Admin API Calls**
```bash
curl 'http://65.109.113.80:30900/admin/users/me' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Cookie: lng=en; _medusa_cache_id=76af52cc-9b6c-42ef-b750-7bba59f3cb22' \
  -H 'Referer: http://65.109.113.80:30900/app/orders' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  --insecure
```

## 🔧 **What Was Wrong**

### **❌ Your Original Request (Failing)**:
```bash
curl 'http://65.109.113.80:30900/admin/users/me' \
  # Missing: -H 'Authorization: Bearer JWT_TOKEN'
```

### **✅ Fixed Request (Working)**:
```bash
curl 'http://65.109.113.80:30900/admin/users/me' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  # ... other headers
```

## 🎯 **Complete Working Example**

### **Get Token & Use It**:
```bash
# Step 1: Authenticate and get token
TOKEN=$(curl -s 'http://65.109.113.80:30900/auth/user/emailpass' \
  -H 'Origin: http://65.109.113.80:30900' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"admin@example.com","password":"password123"}' | jq -r '.token')

# Step 2: Use token for admin API calls
curl 'http://65.109.113.80:30900/admin/users/me' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'accept: application/json'
```

**Working Response**:
```json
{
  "user": {
    "id": "user_01K3ZZCETPTSVEMGHF3C9BK4AM",
    "first_name": null,
    "last_name": null,
    "email": "admin@example.com",
    "avatar_url": null,
    "metadata": null,
    "created_at": "2025-08-31T11:49:43.894Z",
    "updated_at": "..."
  }
}
```

## 🚀 **Other Admin API Endpoints You Can Now Use**

With your JWT token, you can access:

### **✅ User Management**:
```bash
curl 'http://65.109.113.80:30900/admin/users' -H "Authorization: Bearer $TOKEN"
```

### **✅ API Key Management**:
```bash
curl 'http://65.109.113.80:30900/admin/api-keys' -H "Authorization: Bearer $TOKEN"
```

### **✅ Sales Channels**:
```bash
curl 'http://65.109.113.80:30900/admin/sales-channels' -H "Authorization: Bearer $TOKEN"
```

### **✅ Products**:
```bash
curl 'http://65.109.113.80:30900/admin/products' -H "Authorization: Bearer $TOKEN"
```

### **✅ Orders**:
```bash
curl 'http://65.109.113.80:30900/admin/orders' -H "Authorization: Bearer $TOKEN"
```

## 🎉 **Summary**

**✅ Authentication Working**: `/auth/user/emailpass` endpoint works perfectly
**✅ Admin API Access**: All `/admin/*` endpoints now accessible with JWT token
**✅ Credentials**: `admin@example.com` / `password123`

**The key was adding the `Authorization: Bearer TOKEN` header to your admin API requests!** 🚀

## 🔑 **Quick Reference**

**Admin Credentials**: `admin@example.com` / `password123`
**Auth Endpoint**: `POST /auth/user/emailpass`
**Admin Endpoints**: `GET /admin/*` (requires `Authorization: Bearer TOKEN`)
**Web Interface**: `http://65.109.113.80:30900/app`
