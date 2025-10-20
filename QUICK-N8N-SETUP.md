# 🚀 SEMHYS n8n - Configuración Rápida

## ⚡ Opción 1: n8n.cloud (RECOMENDADO - Instantáneo)

### 🌐 Paso 1: Crear cuenta en n8n.cloud
1. **Ir a**: https://n8n.cloud
2. **Sign up** con tu email
3. **Verificar email** y crear workspace
4. **Plan**: Free tier (1000 execuciones/mes)

### 📥 Paso 2: Importar workflow SEMHYS
1. **New Workflow** → **Import from JSON**
2. **Copiar contenido** de `n8n-workflows/semhys-contact-automation.json`
3. **Paste** y **Import**
4. **Save** workflow como "SEMHYS Contact Automation"

### 🎣 Paso 3: Configurar Webhook
1. **Click en nodo "SEMHYS Contact Webhook"**
2. **Copiar Webhook URL** (ejemplo: `https://tu-workspace.app.n8n.cloud/webhook/semhys-contact`)
3. **Guardar URL** para configurar en SEMHYS

---

## ⚙️ Opción 2: n8n Local (Si prefieres local)

### 🔧 Configuración Rápida Local
```bash
# Terminal 1: n8n
cd c:\Users\ASUS
mkdir n8n-data
set N8N_USER_FOLDER=c:\Users\ASUS\n8n-data
npx n8n start --tunnel

# Esperar mensaje: "Editor is now accessible via:"
```

### 🌐 Acceso Local
- **URL**: http://localhost:5678
- **Tunnel URL**: Se genera automáticamente para webhooks externos

---

## 🏃‍♂️ Configuración Express (5 minutos)

### 1️⃣ Crear cuenta n8n.cloud (2 min)
- https://n8n.cloud → Sign up
- Verificar email

### 2️⃣ Importar workflow SEMHYS (1 min)
```json
// Copiar contenido completo de:
// n8n-workflows/semhys-contact-automation.json
```

### 3️⃣ Configurar webhook en SEMHYS (1 min)
```bash
# Crear .env.local
echo N8N_WEBHOOK_URL=https://tu-workspace.app.n8n.cloud/webhook/semhys-contact > .env.local
```

### 4️⃣ Activar workflow (30 seg)
- **Click "Active"** en n8n
- **Test webhook** con datos de prueba

### 5️⃣ Probar formulario (30 seg)
- **Ir a**: http://localhost:3000/contact
- **Llenar formulario** y enviar
- **Verificar** que llega a n8n

---

## 🎯 URLs Importantes

### SEMHYS Development
- **Website**: http://localhost:3000
- **Contact Form**: http://localhost:3000/contact
- **API Webhook**: http://localhost:3000/api/webhook
- **API Contact**: http://localhost:3000/api/contact

### n8n.cloud
- **Dashboard**: https://app.n8n.cloud
- **Tu workspace**: https://tu-workspace.app.n8n.cloud
- **Webhook URL**: https://tu-workspace.app.n8n.cloud/webhook/semhys-contact

---

## 🔧 Configuración Inmediata

### Archivo .env.local (Crear ahora)
```bash
# n8n Webhook URL (cambiar por tu URL real)
N8N_WEBHOOK_URL=https://tu-workspace.app.n8n.cloud/webhook/semhys-contact

# Configuraciones opcionales
EMAIL_FROM=noreply@semhys.com
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Test rápido del webhook
```bash
# Test desde terminal
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test SEMHYS",
    "email": "test@semhys.com", 
    "message": "Prueba de integración n8n",
    "services": ["Industrial Automation"],
    "language": "es"
  }'
```

---

## 🚀 Resultado Esperado

### ✅ Flujo Completo Funcionando
1. **Formulario web** → Envía datos
2. **API /api/contact** → Recibe y procesa
3. **Webhook n8n** → Ejecuta automatización  
4. **Notificaciones** → Emails, WhatsApp, Slack
5. **CRM Update** → Guarda en Airtable

### 📊 Monitoreo
- **n8n Dashboard**: Ver ejecuciones
- **Browser Console**: Ver requests
- **Terminal**: Ver logs de API

---

## ⚡ Próximos 5 minutos

1. **✅ Crear cuenta n8n.cloud** (más rápido que local)
2. **📥 Importar workflow SEMHYS**
3. **🔗 Copiar webhook URL**  
4. **⚙️ Configurar .env.local**
5. **🧪 Probar formulario de contacto**

**¿Empezamos con n8n.cloud o prefieres esperar a que cargue el local?** 🤔