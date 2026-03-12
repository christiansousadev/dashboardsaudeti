# main.py

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# CONFIGURA GOVERNANCA E LOGS
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI(title="ITSM Health Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MODELOS DE DADOS PARA VALIDACAO (KPIs)
class HealthMetrics(BaseModel):
    prejuizo_total: float
    downtime_total_min: int
    sla_cumprido_percent: float
    nps_medio: float

# CONECTA AO POSTGRESQL USANDO AS VARIAVEIS DO .ENV
def get_db_connection():
    try:
        # garante a porta 5433 como padrao se o env falhar
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "itsm_dashboard"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "1234"),
            port=os.getenv("DB_PORT", "5433"),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        logging.error(f"erro critico na conexao com o banco: {e}")
        raise HTTPException(status_code=500, detail="erro de conexao com o banco de dados")

@app.get("/api/v1/health-check")
def read_root():
    return {"status": "online", "service": "itsm-data-engine"}

@app.get("/api/v1/dashboard/metrics", response_model=HealthMetrics)
def get_global_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # ajustado para bater com as colunas da view_saude_ti_pro
        query = """
            SELECT 
                COALESCE(SUM(custo_financeiro), 0) as prejuizo_total,
                COALESCE(SUM(downtime_min), 0) as downtime_total_min,
                AVG(nps) FILTER (WHERE nps IS NOT NULL) as nps_medio,
                (COUNT(*) FILTER (WHERE conformidade_resolucao = 'Dentro do SLA')::float / NULLIF(COUNT(*), 0)::float) * 100 as sla_cumprido_percent
            FROM view_saude_ti_pro;
        """
        cursor.execute(query)
        result = cursor.fetchone()
        return {
            "prejuizo_total": float(result['prejuizo_total']),
            "downtime_total_min": int(result['downtime_total_min']),
            "sla_cumprido_percent": round(result['sla_cumprido_percent'] or 0, 2),
            "nps_medio": round(float(result['nps_medio'] or 0), 1)
        }
    finally:
        cursor.close()
        conn.close()

@app.get("/api/v1/dashboard/tickets-prioridade")
def get_tickets_by_priority():
    # RESTAURA ENDPOINT PARA RESOLVER O ERRO 404 DO FRONTEND
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT prioridade, COUNT(*) as total FROM tickets_suporte GROUP BY prioridade;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@app.get("/api/v1/dashboard/performance-tecnicos")
def get_tecnico_performance():
    # RETORNA RANKING DE TECNICOS POR NPS E VELOCIDADE
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                tecnico_responsavel,
                ROUND(AVG(nps), 1) as nps_medio,
                ROUND(AVG(tempo_resolucao_horas), 1) as tma_horas,
                COUNT(*) as total_chamados
            FROM view_saude_ti_pro
            GROUP BY tecnico_responsavel
            ORDER BY nps_medio DESC;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@app.get("/api/v1/dashboard/custo-categoria")
def get_cost_by_category():
    # RETORNA O PREJUIZO FINANCEIRO AGRUPADO POR CATEGORIA
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                categoria,
                SUM(custo_financeiro) as total_prejuizo,
                SUM(downtime_min) as total_downtime
            FROM view_saude_ti_pro
            GROUP BY categoria
            ORDER BY total_prejuizo DESC;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

#KPI incidentes        
@app.get("/api/v1/dashboard/incidentes-criticos")
def get_critical_incidents():
    # LISTA INCIDENTES QUE VIOLARAM O SLA PARA ACAO IMEDIATA
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, titulo, prioridade, tecnico_responsavel, tempo_resolucao_horas 
            FROM view_saude_ti_pro 
            WHERE conformidade_resolucao = 'SLA Estourado'
            ORDER BY tempo_resolucao_horas DESC
            LIMIT 5;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()