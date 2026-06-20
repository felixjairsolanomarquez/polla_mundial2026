# Guía de Ejecución - Polla FIFA 2026

Este proyecto consta de un backend en **FastAPI** y un frontend en **React (Vite)**.

## 1. Requisitos Previos
- Python 3.10+
- Node.js 18+
- MySQL Server (Corriendo localmente o en un contenedor)

## 2. Configuración del Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea un entorno virtual y actívalo:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configura tu base de datos MySQL en un archivo `.env` (o directamente en `database.py` para pruebas):
   ```
   DATABASE_URL=mysql+mysqlconnector://usuario:password@localhost/polla_db
   ```
5. Inicia el servidor:
   ```bash
   uvicorn main:app --reload
   ```
   *El API estará disponible en: http://127.0.0.1:8000*

## 3. Configuración del Frontend
1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *La app estará disponible en: http://localhost:5173*

## 4. Notas Adicionales
- **Base de Datos**: Asegúrate de que la base de datos `polla_db` exista en tu MySQL antes de correr el backend.
- **AI Integration**: Para que la sección de "Datos Curiosos" funcione, deberás configurar tu API Key de Google Gemini en las variables de entorno.
