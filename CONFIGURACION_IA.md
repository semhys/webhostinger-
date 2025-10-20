# 🤖 CONFIGURACIÓN DE IA CHATGPT PARA SEMHYS

## 🔑 PASO 1: OBTENER API KEY

### 1. Crear cuenta OpenAI:
- Ve a: https://platform.openai.com/
- Crea cuenta o inicia sesión
- Ve a "API Keys": https://platform.openai.com/api-keys

### 2. Generar API Key:
- Click "Create new secret key"
- Nombre: "SEMHYS-Agent"
- Copia la key (empieza con sk-...)
- ⚠️ IMPORTANTE: Guárdala, no se puede ver después

### 3. Configurar método de pago:
- Ve a Billing: https://platform.openai.com/account/billing/
- Agrega tarjeta de crédito
- Establece límite mensual (recomendado: $10)

---

## ⚙️ PASO 2: CONFIGURAR EN SEMHYS

### 1. Editar archivo de configuración:
Abre: `C:\Users\ASUS\semhys\.env.local`

### 2. Reemplazar esta línea:
```bash
OPENAI_API_KEY=tu_api_key_aqui
```

### 3. Por tu API key real:
```bash
OPENAI_API_KEY=sk-tu_api_key_real_aqui
```

### 4. Configuración opcional:
```bash
# Modelo a usar (recomendado: gpt-4o-mini para menor costo)
OPENAI_MODEL=gpt-4o-mini

# Límite de tokens por consulta
OPENAI_MAX_TOKENS=2000

# Creatividad (0.0-1.0, recomendado: 0.3 para análisis técnico)
OPENAI_TEMPERATURE=0.3

# Límite mensual de costo en USD
OPENAI_COST_LIMIT_MONTHLY=10.00
```

---

## 🚀 PASO 3: ACTIVAR IA

### 1. Reiniciar servidor:
- En terminal: Ctrl+C para detener
- Ejecutar: `npm run dev`
- O usar el monitor: `node server-monitor.js`

### 2. Verificar funcionamiento:
- Ve a: http://localhost:3001/research
- Haz una consulta técnica
- Deberías ver la sección "🤖 Análisis con IA ChatGPT"

---

## 💰 CONTROL DE COSTOS

### Costos reales estimados:

#### GPT-4o Mini (RECOMENDADO):
- ✅ Consulta típica: ~$0.0008 (menos de 1 centavo)
- ✅ 100 consultas: ~$0.08 (8 centavos)
- ✅ Uso mensual normal: $1-3 USD

#### GPT-4o (Mayor calidad):
- 🔹 Consulta típica: ~$0.013 (1.3 centavos)
- 🔹 100 consultas: ~$1.30
- 🔹 Uso mensual normal: $10-30 USD

### Configurar límites:
1. En OpenAI Dashboard → Usage limits
2. Establecer límite mensual: $10
3. Alertas al 50%, 80%, 90%
4. Auto-stop al alcanzar límite

---

## 🛡️ SEGURIDAD

### Proteger tu API Key:
- ❌ Nunca compartas tu API key
- ❌ No la subas a GitHub/repositorios públicos
- ✅ Solo en archivo .env.local (ya está en .gitignore)
- ✅ Regenera si se compromete

### Límites recomendados:
```bash
OPENAI_COST_LIMIT_MONTHLY=10.00    # $10 USD máximo
OPENAI_MAX_TOKENS=2000              # Máximo por consulta
OPENAI_TEMPERATURE=0.3              # Respuestas consistentes
```

---

## 🔍 VERIFICAR FUNCIONAMIENTO

### Señales de que funciona:
✅ Aparece sección "🤖 Análisis con IA ChatGPT"
✅ Muestra modelo usado (gpt-4o-mini)
✅ Muestra costo estimado
✅ Análisis más detallado y contextualizado

### Si no funciona:
❌ Aparece "🔑 API Key de OpenAI requerida"
❌ Solo búsqueda básica con Elasticsearch
❌ No aparece sección de IA

---

## 📊 MONITOREO

### En la aplicación:
- Ve estadísticas de costo en cada consulta
- Tokens utilizados por análisis
- Modelo usado y confianza del análisis

### En OpenAI Dashboard:
- Usage: https://platform.openai.com/account/usage
- Historial de costos por día/mes
- Límites y alertas configuradas

---

## 🎯 PRÓXIMOS PASOS

Una vez configurado:
1. ✅ Prueba con consultas técnicas complejas
2. ✅ Compara respuestas IA vs búsqueda básica
3. ✅ Ajusta límites según uso real
4. ✅ Considera upgrade a GPT-4o si necesitas máxima calidad

---

## 🆘 SOPORTE

Si tienes problemas:
1. Verifica que la API key esté correcta
2. Revisa límites en OpenAI Dashboard
3. Consulta logs del servidor para errores
4. Reinicia el servidor después de cambios

¡Tu agente SEMHYS estará potenciado con ChatGPT! 🚀