import streamlit as st
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# --- 1. CONFIGURACIÓN VISUAL (ESTÉTICA PRO) ---
# CAMBIO CLAVE: layout="wide" usa toda la pantalla
st.set_page_config(page_title="Semhys AI", layout="wide", initial_sidebar_state="collapsed")

# CAMBIO CLAVE: CSS para eliminar márgenes blancos gigantes
st.markdown("""
    <style>
    /* Ocultar menú de hamburguesa y marca de agua */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* ELIMINAR ESPACIOS BLANCOS SOBRANTES */
    .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
    }
    
    /* Estilo del chat más limpio */
    .stChatMessage {
        padding: 1rem;
        background-color: #ffffff;
        border-bottom: 1px solid #f0f0f0;
    }
    </style>
    """, unsafe_allow_html=True)

# --- 2. GESTIÓN DE SESIÓN ---
if "user_role" not in st.session_state:
    st.session_state["user_role"] = "guest"
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- 3. LÓGICA DE CHAT ---
st.markdown("### 🤖 Asistente Técnico Semhys")

# Mostrar mensajes
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Captura de entrada
if prompt := st.chat_input("Escribe tu consulta técnica aquí..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Procesando..."):
            try:
                # INTENTO DE CONEXIÓN A BASE DE DATOS
                if "SUPABASE_URL" in st.secrets:
                    supabase = create_client(st.secrets["SUPABASE_URL"], st.secrets["SUPABASE_KEY"])
                    embeddings = OpenAIEmbeddings(openai_api_key=st.secrets["OPENAI_API_KEY"])
                    vector_store = SupabaseVectorStore(client=supabase, embedding=embeddings, table_name="documents", query_name="match_documents")
                    
                    docs = vector_store.similarity_search(prompt, k=3)
                    contexto = "\n".join([d.page_content for d in docs])
                    
                    sys_prompt = f"Eres un Ingeniero Experto de Semhys. Responde técnicamente usando:\n{contexto}"
                    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3, openai_api_key=st.secrets["OPENAI_API_KEY"])
                    
                    response = llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=prompt)])
                    full_response = response.content
                else:
                    full_response = "Modo Demo: Configura las claves API en Streamlit para conectar la inteligencia real."
                
                st.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            except:
                st.error("Error de conexión con el servidor IA.")
