import streamlit as st
from supabase import create_client, Client
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import os

# --- Configuración de la Página ---
st.set_page_config(page_title="Semhys AI", page_icon="", layout="wide")

# Ocultar menú y footer de Streamlit para apariencia limpia
hide_streamlit_style = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# --- Inicialización ---
# Verificar secretos (para desarrollo local o deploy)
try:
    SUPABASE_URL = st.secrets["SUPABASE_URL"]
    SUPABASE_KEY = st.secrets["SUPABASE_KEY"]
    OPENAI_API_KEY = st.secrets["OPENAI_API_KEY"]
except FileNotFoundError:
    st.error("Error: No se encontraron los secretos. Asegúrate de configurar .streamlit/secrets.toml")
    st.stop()

# Cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Embeddings y Vector Store
embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="documents",
    query_name="match_documents"
)

# Modelo LLM
llm = ChatOpenAI(
    model_name="gpt-4", # O "gpt-3.5-turbo" según presupuesto
    temperature=0.3,
    openai_api_key=OPENAI_API_KEY
)

# Prompt Personalizado
system_template = """
Eres el Ingeniero Senior de Semhys. Tu misión es proporcionar asistencia técnica experta.
Responde consultas sobre hidráulica, electricidad, mantenimiento y servicios de ingeniería basándote SOLO en el contexto proporcionado a continuación.
Si la respuesta no se encuentra en el contexto, responde honestamente que no tienes esa información y ofrece contactar a un especialista humano de Semhys.
Sé profesional, conciso y técnico pero accesible.

Contexto:
{context}

Pregunta:
{question}

Respuesta del Ingeniero:
"""
PROMPT = PromptTemplate(
    template=system_template, input_variables=["context", "question"]
)

# Chain de Retrieval QA
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
    chain_type_kwargs={"prompt": PROMPT}
)

# --- Interfaz de Chat ---
st.title("Asistente Técnico Semhys ")
st.caption("Especialista en Mantenimiento e Ingeniería")

# Inicializar historial
if "messages" not in st.session_state:
    st.session_state.messages = []

# Mostrar mensajes previos
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Entrada de usuario
if prompt := st.chat_input("Escribe tu consulta técnica aquí..."):
    # Guardar y mostrar mensaje usuario
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generar respuesta
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        try:
            with st.spinner("Analizando base de datos técnica..."):
                result = qa_chain.run(prompt)
                full_response = result
                message_placeholder.markdown(full_response)
        except Exception as e:
            full_response = f"Lo siento, hubo un error técnico al procesar tu solicitud: {str(e)}"
            message_placeholder.error(full_response)
            
    # Guardar respuesta asistente
    st.session_state.messages.append({"role": "assistant", "content": full_response})
