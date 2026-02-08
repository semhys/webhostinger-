"""
API Wrapper: Flask API para exponer los agentes a n8n
"""

import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import sys

# Agregar path para imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'agents', 'v3'))

from agents.v3.agent_1_market_intelligence import MarketIntelligenceAgent
from agents.v3.agent_2_privacy_guardian import PrivacyGuardianAgent
from agents.v3.agent_3_notebook_synthesizer import NotebookSynthesizerAgent
from agents.v3.agent_4_auditor import AuditorAgent
from agents.v3.orchestrator_v4 import AgentOrchestrator

# Configuración
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent_api")

app = Flask(__name__)
CORS(app)

# Variables de entorno
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gen-lang-client-0585991170")
LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
API_KEY = os.getenv("AGENT_API_KEY", "your-secret-api-key")

# Middleware de autenticación
@app.before_request
def authenticate():
    """Valida API key en headers"""
    if request.endpoint == 'health':
        return None
    
    auth_header = request.headers.get('X-API-Key')
    if auth_header != API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "project_id": PROJECT_ID,
        "location": LOCATION
    })

@app.route('/agent1/run', methods=['POST'])
def run_agent_1():
    """
    Ejecuta Agent 1: Market Intelligence
    
    Body:
    {
        "manual_topic": "optional topic override"
    }
    """
    try:
        data = request.get_json()
        manual_topic = data.get('manual_topic')
        
        logger.info(f"🔍 Ejecutando Agent 1 (manual_topic={manual_topic})")
        
        agent = MarketIntelligenceAgent(project_id=PROJECT_ID, location=LOCATION)
        result = agent.run(override_topic=manual_topic)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error en Agent 1: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent2/run', methods=['POST'])
def run_agent_2():
    """
    Ejecuta Agent 2: Privacy Guardian
    
    Body:
    {
        "topic": "topic to search"
    }
    """
    try:
        data = request.get_json()
        topic = data.get('topic')
        
        if not topic:
            return jsonify({"error": "topic is required"}), 400
        
        logger.info(f"🛡️ Ejecutando Agent 2 (topic={topic})")
        
        agent = PrivacyGuardianAgent(project_id=PROJECT_ID, location="global")
        result = agent.run(topic)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error en Agent 2: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent3/run', methods=['POST'])
def run_agent_3():
    """
    Ejecuta Agent 3: Notebook Synthesizer
    
    Body:
    {
        "topic": "article topic",
        "dossier": {...}
    }
    """
    try:
        data = request.get_json()
        topic = data.get('topic')
        dossier = data.get('dossier')
        
        if not topic or not dossier:
            return jsonify({"error": "topic and dossier are required"}), 400
        
        logger.info(f"📝 Ejecutando Agent 3 (topic={topic})")
        
        agent = NotebookSynthesizerAgent(project_id=PROJECT_ID, location=LOCATION)
        result = agent.run(topic, dossier)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error en Agent 3: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent4/run', methods=['POST'])
def run_agent_4():
    """
    Ejecuta Agent 4: Auditor
    
    Body:
    {
        "article": {...},
        "dossier": {...}
    }
    """
    try:
        data = request.get_json()
        article = data.get('article')
        dossier = data.get('dossier')
        
        if not article or not dossier:
            return jsonify({"error": "article and dossier are required"}), 400
        
        logger.info(f"🔍 Ejecutando Agent 4")
        
        agent = AuditorAgent(project_id=PROJECT_ID, location=LOCATION)
        result = agent.run(article, dossier)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error en Agent 4: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/pipeline/run', methods=['POST'])
def run_full_pipeline():
    """
    Ejecuta el pipeline completo
    
    Body:
    {
        "manual_topic": "optional topic override",
        "save_output": true/false
    }
    """
    try:
        data = request.get_json()
        manual_topic = data.get('manual_topic')
        save_output = data.get('save_output', True)
        
        logger.info(f"🚀 Ejecutando pipeline completo (manual_topic={manual_topic})")
        
        orchestrator = AgentOrchestrator(project_id=PROJECT_ID, location=LOCATION)
        result = orchestrator.run_pipeline(
            manual_topic=manual_topic,
            save_output=save_output
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error en pipeline: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
