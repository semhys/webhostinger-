import streamlit as st
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# 1. CONFIGURACIÓN VISUAL (MODO ANCHO Y LIMPIO)
st.set_page_config(page_title="Semhys AI", layout="wide", initial_sidebar_state="collapsed")

# 2. TRUCO CSS: Ocultar bordes, menú y marca de agua
st.markdown("""
    <style>
    /* Ocultar menú de hamburguesa, header y footer "Built with Streamlit" */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Eliminar los márgenes gigantes de arriba y los lados */
    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 0rem !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    
    /* Estilo del mensaje para que se vea más moderno */
    .stChatMessage {
        background-color: #f9f9f9;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 5px;
    }
    </style>
    """, unsafe_allow_html=True)

# 3. GESTIÓN DE SESIÓN
if "messages" not in st.session_state:
    st.session_state.messages = []

# 4. INTERFAZ DE CHAT
st.markdown("### 🤖 Asistente Técnico Semhys")

# Mostrar historial
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# 5. LÓGICA DE RESPUESTA
if prompt := st.chat_input("Escribe tu consulta técnica aquí..."):
    # Guardar mensaje usuario
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Respuesta del Asistente
    with st.chat_message("assistant"):
        with st.spinner("Procesando consulta..."):
            try:
                # Verificar si hay conexión a DB (Secretos)
                if "SUPABASE_URL" in st.secrets:
                    supabase = create_client(st.secrets["SUPABASE_URL"], st.secrets["SUPABASE_KEY"])
                    embeddings = OpenAIEmbeddings(openai_api_key=st.secrets["OPENAI_API_KEY"])
                    vector_store = SupabaseVectorStore(client=supabase, embedding=embeddings, table_name="documents", query_name="match_documents")
                    
                    # RAG (Búsqueda Inteligente)
                    docs = vector_store.similarity_search(prompt, k=3)
                    contexto = "\n".join([d.page_content for d in docs])
                    
                    sys_prompt = f"Eres el Ingeniero Senior de Semhys. Responde de forma técnica y breve basándote en esto:\n{contexto}"
                    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3, openai_api_key=st.secrets["OPENAI_API_KEY"])
                    
                    response = llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=prompt)])
                    full_response = response.content
                else:
                    # Respuesta genérica si no hay conexión configurada
                    full_response = "El sistema está en modo demostración. Configure las claves API en Streamlit Cloud para activar la IA completa."
                
                st.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            except Exception as e:
                st.error("Error de conexión. Intente nuevamente.")
