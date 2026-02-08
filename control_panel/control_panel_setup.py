"""
Panel de Control: Integración con Google Sheets para control de agentes
"""

import os
import json
import logging
from typing import Dict, Optional, List
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger("control_panel")

class ControlPanel:
    """
    Panel de control basado en Google Sheets para configurar y monitorear
    el ecosistema de agentes autónomos.
    """
    
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    
    def __init__(self, spreadsheet_id: str, credentials_path: str):
        """
        Args:
            spreadsheet_id: ID del Google Sheet
            credentials_path: Ruta al archivo JSON de credenciales de Service Account
        """
        self.spreadsheet_id = spreadsheet_id
        
        # Autenticación
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=self.SCOPES
        )
        
        self.service = build('sheets', 'v4', credentials=credentials)
        self.sheet = self.service.spreadsheets()
        
        logger.info(f"✅ Control Panel conectado a Sheet: {spreadsheet_id}")
    
    def initialize_sheets(self):
        """
        Crea las hojas necesarias en el spreadsheet si no existen.
        """
        try:
            # Obtener hojas existentes
            spreadsheet = self.sheet.get(spreadsheetId=self.spreadsheet_id).execute()
            existing_sheets = [s['properties']['title'] for s in spreadsheet['sheets']]
            
            # Hojas requeridas
            required_sheets = {
                'Control': {
                    'headers': ['Frecuencia (diaria)', 'Tema Prioritario', 'Estado'],
                    'default_values': [['1', '', 'Activo']]
                },
                'Log': {
                    'headers': ['Timestamp', 'Status', 'Tema', 'Detalles'],
                    'default_values': []
                },
                'Configuración': {
                    'headers': ['Parámetro', 'Valor', 'Descripción'],
                    'default_values': [
                        ['MIN_VERIFICATION_RATE', '80', 'Tasa mínima de verificación (%)'],
                        ['MAX_DOCS_PER_QUERY', '15', 'Documentos máximos por consulta'],
                        ['AGENT_LOCATION', 'us-central1', 'Región de Vertex AI']
                    ]
                }
            }
            
            # Crear hojas faltantes
            requests = []
            for sheet_name, config in required_sheets.items():
                if sheet_name not in existing_sheets:
                    requests.append({
                        'addSheet': {
                            'properties': {
                                'title': sheet_name
                            }
                        }
                    })
            
            if requests:
                body = {'requests': requests}
                self.sheet.batchUpdate(
                    spreadsheetId=self.spreadsheet_id,
                    body=body
                ).execute()
                logger.info(f"✅ Hojas creadas: {[r['addSheet']['properties']['title'] for r in requests]}")
            
            # Poblar con headers y valores por defecto
            for sheet_name, config in required_sheets.items():
                # Escribir headers
                self._write_range(
                    f"{sheet_name}!A1:{chr(65 + len(config['headers']) - 1)}1",
                    [config['headers']]
                )
                
                # Escribir valores por defecto
                if config['default_values']:
                    self._write_range(
                        f"{sheet_name}!A2",
                        config['default_values']
                    )
            
            logger.info("✅ Control Panel inicializado correctamente")
            
        except HttpError as e:
            logger.error(f"Error inicializando sheets: {e}")
            raise
    
    def _write_range(self, range_name: str, values: List[List]):
        """
        Escribe valores en un rango del sheet.
        """
        body = {'values': values}
        self.sheet.values().update(
            spreadsheetId=self.spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
    
    def _read_range(self, range_name: str) -> List[List]:
        """
        Lee valores de un rango del sheet.
        """
        result = self.sheet.values().get(
            spreadsheetId=self.spreadsheet_id,
            range=range_name
        ).execute()
        return result.get('values', [])
    
    def get_configuration(self) -> Dict:
        """
        Lee la configuración actual del panel de control.
        
        Returns:
            Dict con configuración
        """
        try:
            # Leer hoja de Control
            control_values = self._read_range('Control!A2:C2')
            
            # Leer hoja de Configuración
            config_values = self._read_range('Configuración!A2:B100')
            
            config = {
                'frequency': int(control_values[0][0]) if control_values and control_values[0] else 1,
                'manual_topic': control_values[0][1] if control_values and len(control_values[0]) > 1 else None,
                'status': control_values[0][2] if control_values and len(control_values[0]) > 2 else 'Activo',
                'parameters': {}
            }
            
            # Parsear parámetros
            for row in config_values:
                if len(row) >= 2:
                    param_name = row[0]
                    param_value = row[1]
                    config['parameters'][param_name] = param_value
            
            logger.info(f"📋 Configuración leída: Frecuencia={config['frequency']}, Tema={config['manual_topic']}")
            
            return config
            
        except HttpError as e:
            logger.error(f"Error leyendo configuración: {e}")
            return {
                'frequency': 1,
                'manual_topic': None,
                'status': 'Activo',
                'parameters': {}
            }
    
    def log_execution(
        self,
        status: str,
        topic: str,
        details: Dict
    ):
        """
        Registra una ejecución del pipeline en el log.
        
        Args:
            status: Estado de la ejecución (success, failed, error)
            topic: Tema procesado
            details: Detalles adicionales
        """
        try:
            timestamp = datetime.now().isoformat()
            details_json = json.dumps(details, ensure_ascii=False)
            
            # Agregar fila al log
            values = [[timestamp, status, topic, details_json]]
            
            self.sheet.values().append(
                spreadsheetId=self.spreadsheet_id,
                range='Log!A:D',
                valueInputOption='RAW',
                body={'values': values}
            ).execute()
            
            logger.info(f"📝 Ejecución registrada: {status} - {topic}")
            
        except HttpError as e:
            logger.error(f"Error escribiendo log: {e}")
    
    def update_status(self, new_status: str):
        """
        Actualiza el estado en la hoja de Control.
        """
        try:
            self._write_range('Control!C2', [[new_status]])
            logger.info(f"✅ Estado actualizado: {new_status}")
        except HttpError as e:
            logger.error(f"Error actualizando estado: {e}")
    
    def clear_manual_topic(self):
        """
        Limpia el tema manual después de procesarlo.
        """
        try:
            self._write_range('Control!B2', [['']])
            logger.info("🧹 Tema manual limpiado")
        except HttpError as e:
            logger.error(f"Error limpiando tema manual: {e}")


def setup_control_panel(spreadsheet_id: str, credentials_path: str) -> ControlPanel:
    """
    Configura e inicializa el panel de control.
    
    Args:
        spreadsheet_id: ID del Google Sheet
        credentials_path: Ruta a credenciales de Service Account
    
    Returns:
        Instancia de ControlPanel configurada
    """
    panel = ControlPanel(spreadsheet_id, credentials_path)
    panel.initialize_sheets()
    return panel


if __name__ == "__main__":
    # Test del panel de control
    logging.basicConfig(level=logging.INFO)
    
    SPREADSHEET_ID = os.getenv("CONTROL_PANEL_SHEET_ID", "YOUR_SHEET_ID_HERE")
    CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH", "service-account-key.json")
    
    # Configurar panel
    panel = setup_control_panel(SPREADSHEET_ID, CREDENTIALS_PATH)
    
    # Leer configuración
    config = panel.get_configuration()
    print("\n" + "="*80)
    print("CONFIGURACIÓN DEL PANEL DE CONTROL")
    print("="*80)
    print(json.dumps(config, indent=2, ensure_ascii=False))
    
    # Test de logging
    panel.log_execution(
        status="success",
        topic="Test Topic",
        details={"test": True, "timestamp": datetime.now().isoformat()}
    )
