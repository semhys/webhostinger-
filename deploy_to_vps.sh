#!/bin/bash
# Script de Deployment para VPS con n8n
# SEMHYS Multi-Agent Ecosystem

set -e  # Exit on error

echo "=========================================="
echo "SEMHYS Agents - VPS Deployment"
echo "=========================================="

# Variables
PROJECT_DIR="/opt/semhys-agents"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_NAME="semhys-api"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Creando directorio del proyecto...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

echo -e "${YELLOW}2. Instalando dependencias del sistema...${NC}"
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv

echo -e "${YELLOW}3. Creando entorno virtual...${NC}"
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate

echo -e "${YELLOW}4. Instalando dependencias de Python...${NC}"
pip install --upgrade pip
pip install vertexai google-cloud-discoveryengine google-cloud-storage \
    google-auth google-api-python-client flask flask-cors gunicorn

echo -e "${YELLOW}5. Copiando archivos del proyecto...${NC}"
# Los archivos ya deben estar en el directorio (subidos vía SCP o Git)
if [ ! -f "$PROJECT_DIR/api_wrapper.py" ]; then
    echo -e "${RED}ERROR: Archivos no encontrados en $PROJECT_DIR${NC}"
    echo "Por favor, sube los archivos primero usando:"
    echo "scp -r agents/ api_wrapper.py .env.agents root@76.13.116.120:$PROJECT_DIR/"
    exit 1
fi

echo -e "${YELLOW}6. Configurando variables de entorno...${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp $PROJECT_DIR/.env.agents $PROJECT_DIR/.env
    echo -e "${YELLOW}IMPORTANTE: Edita $PROJECT_DIR/.env con tus credenciales${NC}"
fi

echo -e "${YELLOW}7. Creando servicio systemd...${NC}"
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=SEMHYS Agents API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_DIR/bin"
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=$VENV_DIR/bin/gunicorn --bind 0.0.0.0:8080 --workers 2 --timeout 300 api_wrapper:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${YELLOW}8. Habilitando e iniciando servicio...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

echo -e "${YELLOW}9. Verificando estado del servicio...${NC}"
sudo systemctl status $SERVICE_NAME --no-pager

echo -e "${YELLOW}10. Configurando firewall (si está activo)...${NC}"
if sudo ufw status | grep -q "Status: active"; then
    sudo ufw allow 8080/tcp
    echo -e "${GREEN}✓ Puerto 8080 abierto${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Deployment completado!"
echo "==========================================${NC}"
echo ""
echo "API URL: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "Comandos útiles:"
echo "  - Ver logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  - Reiniciar: sudo systemctl restart $SERVICE_NAME"
echo "  - Detener: sudo systemctl stop $SERVICE_NAME"
echo "  - Estado: sudo systemctl status $SERVICE_NAME"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo "1. Edita las credenciales en: $PROJECT_DIR/.env"
echo "2. Sube tu service-account-key.json a: $PROJECT_DIR/"
echo "3. Reinicia el servicio: sudo systemctl restart $SERVICE_NAME"
echo "4. Importa el workflow n8n desde: n8n_workflows/orchestrator_master.json"
echo "5. Configura la URL de la API en n8n: http://localhost:8080"
