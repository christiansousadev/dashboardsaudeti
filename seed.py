# seed.py

import os
import logging
from datetime import timedelta
import psycopg2
from psycopg2.extras import execute_values
from faker import Faker
from dotenv import load_dotenv

# CONFIGURA LOGS E VARIAVEIS DE AMBIENTE
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
fake = Faker('pt_BR')

# OBTEM CONEXAO COM O BANCO DE DADOS POSTGRESQL
def get_db_connection():
    try:
        # conecta usando a porta 5433 conforme configurado no seu .env
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "itsm_dashboard"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "1234"),
            port=os.getenv("DB_PORT", "5433")
        )
        return conn
    except Exception as e:
        logging.error(f"falha ao conectar no banco: {e}")
        raise

# POPULA O BANCO COM TICKETS, CATEGORIAS E INCIDENTES FINANCEIROS
def seed_database(num_records=1000):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # busca os ids das dimensoes para vincular os tickets corretamente
        cursor.execute("SELECT id FROM dim_categorias")
        cat_ids = [r[0] for r in cursor.fetchall()]
        
        cursor.execute("SELECT id FROM dim_tecnicos")
        tec_ids = [r[0] for r in cursor.fetchall()]

        if not cat_ids or not tec_ids:
            logging.error("as tabelas dim_categorias ou dim_tecnicos estao vazias. rode o ddl primeiro.")
            return

        tickets = []
        incidentes = []
        
        logging.info(f"gerando {num_records} registros complexos de ITSM...")
        
        for _ in range(num_records):
            abertura = fake.date_time_between(start_date='-6m', end_date='now')
            
            # logica de resposta (90% de chance de ter ocorrido)
            tem_resposta = fake.boolean(chance_of_getting_true=90)
            primeira_resposta = abertura + timedelta(minutes=fake.random_int(min=5, max=120)) if tem_resposta else None
            
            # logica de fechamento (85% de chance de estar resolvido)
            esta_fechado = fake.boolean(chance_of_getting_true=85)
            fechamento = primeira_resposta + timedelta(hours=fake.random_int(min=1, max=72)) if (esta_fechado and primeira_resposta) else None
            
            status = 'fechado' if esta_fechado else 'em_andamento'
            if not tem_resposta:
                status = 'aberto'
            
            tickets.append((
                fake.sentence(nb_words=4),
                fake.text(),
                status,
                fake.random_element(elements=('baixa', 'media', 'alta', 'critica')),
                abertura,
                primeira_resposta,
                fechamento,
                fake.random_int(min=0, max=10) if esta_fechado else None,
                fake.random_element(elements=cat_ids),
                fake.random_element(elements=tec_ids)
            ))
        
        # insere tickets e recupera os ids para os incidentes financeiros
        insert_tickets_query = """
            INSERT INTO tickets_suporte 
            (titulo, descricao, status, prioridade, data_abertura, data_primeira_resposta, data_fechamento, nps, categoria_id, tecnico_id)
            VALUES %s RETURNING id;
        """
        
        cursor.execute("BEGIN;")
        returned_rows = execute_values(cursor, insert_tickets_query, tickets, fetch=True)
        ticket_ids = [row[0] for row in returned_rows]
        
        logging.info("correlacionando incidentes financeiros aos tickets criticos...")
        
        for ticket_id in ticket_ids:
            # apenas 15% dos tickets geram impacto financeiro direto (fintech style)
            if fake.boolean(chance_of_getting_true=15):
                incidentes.append((
                    ticket_id,
                    fake.pydecimal(left_digits=5, right_digits=2, positive=True),
                    fake.random_int(min=10, max=480),
                    fake.date_time_between(start_date='-6m', end_date='now')
                ))
        
        if incidentes:
            insert_incidentes_query = """
                INSERT INTO incidentes_financeiros (ticket_id, custo_estimado, tempo_downtime_minutos, data_incidente)
                VALUES %s;
            """
            execute_values(cursor, insert_incidentes_query, incidentes)
        
        cursor.execute("COMMIT;")
        logging.info(f"sucesso: {len(tickets)} tickets e {len(incidentes)} incidentes financeiros inseridos.")
        
    except Exception as e:
        cursor.execute("ROLLBACK;")
        logging.error(f"falha na transacao de seed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_database(1000)