# 🎯 n8n SEMHYS - Importar Workflow

## ✅ n8n está corriendo en: http://localhost:5678

### 📋 Pasos para importar el workflow:

#### 1. **Configurar cuenta inicial** (si es primera vez)
   - Abrir: http://localhost:5678
   - Crear usuario y contraseña
   - Completar setup inicial

#### 2. **Importar workflow SEMHYS**
   - Click en **"+ New workflow"**
   - Click en **"..."** (tres puntos) → **"Import from JSON"**
   - Copiar TODO el contenido del archivo: `n8n-workflows/semhys-contact-automation.json`
   - Pegar y click **"Import"**

#### 3. **Configurar webhook URL**
   - Click en el nodo **"SEMHYS Contact Webhook"**
   - Copiar la URL del webhook (algo como: `http://localhost:5678/webhook/semhys-contact`)
   - Verificar que el path sea: `semhys-contact`

#### 4. **Guardar workflow**
   - Click **"Save"** (Ctrl+S)
   - Nombre: **"SEMHYS Contact Automation"**
   - Descripción: **"Automatización completa de formularios de contacto SEMHYS"**

#### 5. **Activar workflow**
   - Toggle **"Active"** en la esquina superior derecha
   - Debe mostrarse en verde ✅

---

## 🧪 Probar configuración

### Test 1: Verificar webhook
```bash
# En terminal (nueva pestaña):
curl -X POST http://localhost:5678/webhook/semhys-contact \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact_form",
    "data": {
      "name": "Test SEMHYS",
      "email": "test@example.com",
      "message": "Prueba de conexión n8n",
      "services": ["Industrial Automation"],
      "language": "es",
      "timestamp": "2024-10-18T10:00:00Z"
    }
  }'
```

### Test 2: Desde formulario web
1. Abrir: http://localhost:3000/contact
2. Llenar formulario completo
3. Enviar
4. Verificar en n8n → **"Executions"** que aparece nueva ejecución

---

## 🔧 Si hay problemas

### Webhook no funciona:
1. Verificar que n8n esté **"Active"** 
2. Check URL del webhook en el nodo
3. Reiniciar workflow (Save → Activate)

### Formulario no conecta:
1. Verificar `.env.local` tiene: `N8N_WEBHOOK_URL=http://localhost:5678/webhook/semhys-contact`
2. Reiniciar servidor Next.js: `npm run dev`

---

## 📊 Siguiente paso

Una vez que el workflow esté importado y funcionando, configuraremos las integraciones:
- 📧 Gmail (notificaciones)
- 📱 WhatsApp (confirmaciones)  
- 💬 Slack (equipo)
- 🗃️ Airtable (CRM)

**¿Ya tienes n8n abierto en el navegador?** 🎯