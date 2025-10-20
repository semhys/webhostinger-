# 🎯 Integración SEMHYS con tu cuenta n8n.cloud

## 📋 Pasos rápidos (5 minutos):

### 1️⃣ **Abrir tu workspace n8n**
- Ir a: **https://app.n8n.cloud**
- Login con tu cuenta existente

### 2️⃣ **Crear workflow SEMHYS**
- Click **"New Workflow"**  
- Título: **"SEMHYS Contact Automation"**

### 3️⃣ **Agregar nodo Webhook**
1. **Arrastrar nodo "Webhook"** al canvas
2. **Configurar webhook:**
   - **HTTP Method**: POST
   - **Path**: `semhys-contact`
   - **Response Mode**: "Using 'Respond to Webhook' Node"
3. **Copiar Webhook URL** (será algo como: `https://tu-workspace.app.n8n.cloud/webhook/semhys-contact`)

### 4️⃣ **Agregar nodo Email** (Gmail)
1. **Arrastrar nodo "Gmail"**
2. **Conectar desde Webhook**
3. **Configurar:**
   - **Action**: "Send Email"
   - **To**: `team@semhys.com`
   - **Subject**: `🚀 Nuevo Contacto SEMHYS - {{$json.body.data.name}}`
   - **Message**: 
   ```
   Nuevo contacto desde SEMHYS:
   
   Nombre: {{$json.body.data.name}}
   Email: {{$json.body.data.email}}
   Empresa: {{$json.body.data.company}}
   Teléfono: {{$json.body.data.phone}}
   Mensaje: {{$json.body.data.message}}
   Servicios: {{$json.body.data.services}}
   ```

### 5️⃣ **Agregar nodo Response** 
1. **Arrastrar "Respond to Webhook"**
2. **Conectar desde Gmail**
3. **Response Body**: 
   ```json
   {
     "success": true,
     "message": "Contacto recibido correctamente",
     "timestamp": "{{$now}}"
   }
   ```

### 6️⃣ **Guardar y activar**
- **Save** (Ctrl+S)
- **Activate** (toggle verde)

---

## ⚙️ Configurar SEMHYS para usar tu webhook

### Actualizar .env.local:
```bash
# Cambiar por tu URL real de n8n.cloud
N8N_WEBHOOK_URL=https://tu-workspace.app.n8n.cloud/webhook/semhys-contact
```

### Reiniciar servidor Next.js:
```bash
# Parar servidor actual (Ctrl+C)
npm run dev
```

---

## 🧪 Probar integración

### Test 1: Desde terminal
```bash
curl -X POST https://tu-workspace.app.n8n.cloud/webhook/semhys-contact \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact_form", 
    "data": {
      "name": "Test SEMHYS",
      "email": "test@semhys.com",
      "company": "Test Company",
      "phone": "+1234567890",
      "message": "Mensaje de prueba desde SEMHYS",
      "services": ["Industrial Automation", "PLC Programming"],
      "language": "es",
      "timestamp": "2024-10-18T10:00:00Z"
    }
  }'
```

### Test 2: Desde formulario web
1. **Abrir**: http://localhost:3000/contact
2. **Llenar formulario completo**
3. **Enviar**
4. **Verificar email** llegó a team@semhys.com
5. **Check n8n dashboard** → "Executions"

---

## 🚀 URLs importantes:

- **n8n Dashboard**: https://app.n8n.cloud
- **Tu Webhook**: https://tu-workspace.app.n8n.cloud/webhook/semhys-contact
- **SEMHYS Contact**: http://localhost:3000/contact

---

## 📧 Configurar Gmail (si no está configurado)

### En n8n.cloud:
1. **Credentials** → **Add Credential** → **Gmail OAuth2 API**
2. **Authorizar con Google**
3. **Asignar al nodo Gmail**

### Alternativamente (más fácil):
Usar **nodo "Send Email (SMTP)"** con:
- **Host**: smtp.gmail.com
- **Port**: 587
- **User**: tu-email@gmail.com  
- **Password**: tu-app-password de Gmail

---

## ✅ Resultado esperado:

1. **Usuario llena formulario** → http://localhost:3000/contact
2. **SEMHYS envía datos** → https://tu-workspace.app.n8n.cloud/webhook/semhys-contact  
3. **n8n procesa** → Envía email a team@semhys.com
4. **n8n responde** → "Contacto recibido correctamente"
5. **Usuario ve confirmación** → Mensaje de éxito en formulario

**¿Ya tienes abierto tu workspace de n8n.cloud?** 🎯