# -*- coding: utf-8 -*-
import streamlit as st
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# 1. Configuración Visual
st.set_page_config(page_title="Semhys AI", page_icon="🏗️", layout="centered")
st.markdown("""
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# 2. GESTIÓN DE SESIÓN
if "user_role" not in st.session_state:
    st.session_state["user_role"] = "guest" # Por defecto entra como invitado (Nivel 3)
if "show_login" not in st.session_state:
    st.session_state["show_login"] = False
if "messages" not in st.session_state:
    st.session_state.messages = []

# 3. FUNCIONES DE ACCESO
def verificar_credenciales():
    user = st.session_state["input_user"]
    pwd = st.session_state["input_pass"]

    # Verificar si es ADMIN (Tu Equipo)
    try:
        admins = st.secrets["admins"]
        if user in admins and admins[user] == pwd:
            st.session_state["user_role"] = "admin"
            st.session_state["show_login"] = False
            st.success("🔓 Bienvenida, Gerencia Técnica.")
            return
    except:
        pass
    # Verificar si es CLIENTE (Usuario Registrado)
    try:
        clients = st.secrets["clients"]
        if user in clients and clients[user] == pwd:
            st.session_state["user_role"] = "client"
            st.session_state["show_login"] = False
            st.success("✅ Bienvenido, Cliente VIP.")
            return
    except:
        pass
    st.error("❌ Credenciales no encontradas.")

def cerrar_sesion():
    st.session_state["user_role"] = "guest"
    st.session_state.messages = []

# 4. BARRA LATERAL (CONTROL DE ACCESO)
with st.sidebar:
    st.image("https://via.placeholder.com/150", caption="Semhys System")

    # Estado actual
    if st.session_state["user_role"] == "admin":
        st.markdown("### 👑 NIVEL: GERENCIA")
        st.info("Permisos Totales:\n- Estrategia\n- Blogs & Dev\n- Datos Internos")
        if st.button("Cerrar Sesión"):
             cerrar_sesion()
             st.rerun()
    
    elif st.session_state["user_role"] == "client":
        st.markdown("### 💎 NIVEL: CLIENTE VIP")
        st.info("Beneficios:\n- Soporte Avanzado\n- Cálculos de Ingeniería\n- Prioridad")
        if st.button("Cerrar Sesión"):
             cerrar_sesion()
             st.rerun()
    
    else: # Guest
        st.markdown("### 👤 MODO: INVITADO")
        st.warning("Acceso limitado a información comercial.")
        if st.button("🔐 Iniciar Sesión"):
            st.session_state["show_login"] = True
            st.rerun()

# 5. PANTALLA DE LOGIN (MODAL)
if st.session_state["show_login"]:
    with st.form("login_form"):
        st.subheader("Acceso a Plataforma Semhys")
        st.text_input("Usuario", key="input_user")
        st.text_input("Contraseña", type="password", key="input_pass")
        if st.form_submit_button("Entrar"):
            verificar_credenciales()
            st.rerun()
    if st.button("Cancelar"):
        st.session_state["show_login"] = False
        st.rerun()
    st.stop()

# 6. CONEXIÓN DB
try:
    supabase = create_client(st.secrets["SUPABASE_URL"], st.secrets["SUPABASE_KEY"])
    embeddings = OpenAIEmbeddings(openai_api_key=st.secrets["OPENAI_API_KEY"], model="text-embedding-3-small")
    vector_store = SupabaseVectorStore(client=supabase, embedding=embeddings, table_name="documents", query_name="match_documents")
except:
    st.error("Conexión interrumpida.")
    st.stop()

# 7. INTERFAZ DE CHAT
titulos = {
    "admin": "Centro de Comando Semhys 🚀",
    "client": "Soporte Técnico Especializado 🛠️",
    "guest": "Asistente Semhys 🤖"
}
st.title(titulos[st.session_state["user_role"]])

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Escribe tu consulta..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Procesando..."):
            # RAG
            docs = vector_store.similarity_search(prompt, k=4)
            contexto = "\n\n".join([d.page_content for d in docs])
            
            # --- CEREBROS SEGÚN EL ROL ---
            if st.session_state["user_role"] == "admin":
                # CEREBRO TOTAL (TU EQUIPO)
                sys_prompt = """Eres el DIRECTOR DE INGENIERÍA.
                Acceso total. Realiza cálculos complejos, redacta blogs SEO, analiza estrategia y código.
                Usa tono de experto a experto."""
                temp = 0.5
                
            elif st.session_state["user_role"] == "client":
                # CEREBRO VIP (CLIENTES) - Potente pero seguro
                sys_prompt = """Eres el INGENIERO CONSULTOR SENIOR de Semhys.
                Tu cliente es un usuario registrado VIP.
                1. Brinda soporte técnico profundo: Si preguntan por bombas, CALCULA potencias y sugiere modelos.
                2. Sé muy técnico y resolutivo.
                3. LÍMITE: NO reveles estrategias de negocio internas, ni actúes como redactor de blogs SEO, ni generes código de software interno. Céntrate en resolver el problema técnico del cliente."""
                temp = 0.4
                
            else:
                # CEREBRO BÁSICO (PÚBLICO)
                sys_prompt = """Eres el ASISTENTE COMERCIAL de Semhys.
                Responde dudas básicas basadas en los manuales.
                Si la pregunta es muy técnica, invítalos a REGISTRARSE para obtener un diagnóstico de ingeniería completo."""
                temp = 0.3
            llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=temp, openai_api_key=st.secrets["OPENAI_API_KEY"])
            msgs = [SystemMessage(content=f"{sys_prompt}\n\nCONTEXTO:\n{contexto}"), HumanMessage(content=prompt)]
            res = llm.invoke(msgs)
            st.markdown(res.content)
            st.session_state.messages.append({"role": "assistant", "content": res.content})