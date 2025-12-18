import streamlit as st
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# --- 1. CONFIGURACIÓN VISUAL (ESTÉTICA PRO) ---
# Layout "wide" para ocupar todo el ancho y sidebar colapsado
st.set_page_config(page_title="Semhys AI", layout="wide", initial_sidebar_state="collapsed")

# Truco CSS para limpiar toda la basura visual de Streamlit
st.markdown("""
    <style>
    /* Ocultar menú de hamburguesa, header y footer */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Quitar espacios blancos gigantes (padding) del contenedor principal */
    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 0rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    
    /* Estilo del chat para que se vea más limpio */
    .stChatMessage {
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 0.5rem;
    }
    </style>
    """, unsafe_allow_html=True)

# --- 2. GESTIÓN DE SESIÓN ---
if "user_role" not in st.session_state:
    st.session_state["user_role"] = "guest"
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- 3. LÓGICA DE CHAT ---
# Título simple y limpio (sin imágenes que se rompan)
st.markdown("### 🤖 Asistente Técnico Semhys")

# Mostrar mensajes anteriores
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Captura de entrada del usuario
if prompt := st.chat_input("Escribe tu consulta técnica aquí..."):
    # Guardar y mostrar mensaje usuario
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Respuesta del Asistente
    with st.chat_message("assistant"):
        with st.spinner("Analizando base de datos de ingeniería..."):
            try:
                # CONEXIÓN DB (Solo se activa si hay secretos, sino usa modo demo seguro)
                if "SUPABASE_URL" in st.secrets:
                    supabase = create_client(st.secrets["SUPABASE_URL"], st.secrets["SUPABASE_KEY"])
                    embeddings = OpenAIEmbeddings(openai_api_key=st.secrets["OPENAI_API_KEY"])
                    vector_store = SupabaseVectorStore(client=supabase, embedding=embeddings, table_name="documents", query_name="match_documents")
                    
                    # Búsqueda RAG (Retrieval Augmented Generation)
                    docs = vector_store.similarity_search(prompt, k=3)
                    contexto = "\n".join([d.page_content for d in docs])
                    
                    sys_prompt = f"Eres un Ingeniero Experto de Semhys. Responde usando este contexto técnico:\n{contexto}"
                    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3, openai_api_key=st.secrets["OPENAI_API_KEY"])
                    
                    response = llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=prompt)])
                    full_response = response.content
                else:
                    # Modo seguro si fallan las llaves o conexión
                    full_response = "Modo Demo: No puedo acceder a la base de datos completa ahora mismo, pero soy el Asistente virtual de Semhys. ¿En qué puedo ayudarte?"
                
                st.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            except Exception as e:
                err_msg = "Lo siento, hubo un error temporal de conexión con el servidor de IA. Por favor intenta de nuevo."
                st.error(err_msg)
                st.session_state.messages.append({"role": "assistant", "content": err_msg})
