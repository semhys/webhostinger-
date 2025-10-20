# SEMHYS - Guía de Deploy a Hostinger

## 🎯 Pasos para Subir SEMHYS a semhys.com

### 1. Build para Producción (Sin APIs)
```bash
# Crear build estático sin APIs dinámicas
npm run build:static
```

### 2. Preparar Archivos para Hostinger
Los archivos se generarán en `/out` y necesitas subirlos via:
- **cPanel File Manager** 
- **FTP/SFTP**
- **Git Deploy** (si Hostinger lo soporta)

### 3. Configuración de Hostinger
- Subir contenido de `/out` a `/public_html`
- Configurar Node.js si tiene soporte
- Variables de entorno en cPanel

### 4. Opciones de Deploy

#### Opción A: Solo Frontend (Estático)
- Subir página web SEMHYS sin APIs
- Sin ChatGPT ni Elasticsearch (solo visual)
- Compatible con hosting básico

#### Opción B: Full Stack (Node.js)
- Requiere hosting con Node.js
- APIs funcionales (ChatGPT + Elasticsearch)
- Mayor costo pero funcionalidad completa

## 🔧 Estado Actual
- ✅ Dominio: semhys.com activo en Hostinger
- ⚠️ Contenido: Solo página default
- 🎯 Necesario: Deploy del código SEMHYS

## 📋 Recomendaciones
1. **Deploy Frontend**: Rápido y económico
2. **VPS/Node.js**: Para funcionalidad completa
3. **Vercel/Netlify**: Alternativa moderna para Next.js