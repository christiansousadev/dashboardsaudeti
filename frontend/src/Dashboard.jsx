// frontend/src/Dashboard.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Activity,
  DollarSign,
  Users,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from "lucide-react";

const COLORS = ["#6366f1", "#f43f5e", "#eab308", "#22c55e"];

// COMPONENTE PARA CARDS DE KPI RAPIDOS
// eslint-disable-next-line no-unused-vars
const KpiCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

// FUNCAO PRINCIPAL QUE RENDERIZA O DASHBOARD DE SAUDE DE TI
export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [priorityData, setPriorityData] = useState([]);
  const [costData, setCostData] = useState([]);
  const [criticalIncidents, setCriticalIncidents] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // BUSCA DADOS DA API FASTAPI
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const baseUrl = "http://localhost:8000/api/v1/dashboard";

      // Verificar se os endpoints existem
      const endpoints = [
        `${baseUrl}/metrics`,
        `${baseUrl}/tickets-prioridade`,
        `${baseUrl}/custo-categoria`,
        `${baseUrl}/incidentes-criticos`
      ];

      const responses = await Promise.all(
        endpoints.map(async url => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `HTTP error! status: ${response.status} para ${url}`
            );
          }
          return response.json();
        })
      );

      const [dataMetrics, dataPriority, dataCost, dataIncidents] = responses;

      console.log("Dados recebidos da API:", dataMetrics);

      setMetrics(dataMetrics);
      setPriorityData(Array.isArray(dataPriority) ? dataPriority : []);
      setCostData(Array.isArray(dataCost) ? dataCost : []);
      setCriticalIncidents(Array.isArray(dataIncidents) ? dataIncidents : []);
    } catch (error) {
      console.error("Erro de sincronização:", error);
      setError("Falha ao carregar dados. Tentando novamente...");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  // SINCRONIZA OS DADOS E CONFIGURA O POLLING DE 30S
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) await fetchData();
    };

    loadData();

    const interval = setInterval(() => {
      if (isMounted) fetchData();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  if (!metrics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            Carregando indicadores de governança...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Saúde de TI</h1>
          <p className="text-slate-400">
            Visibilidade de Incidentes e ROI de Operações
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg border border-slate-700 transition-all"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </button>
          <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
            <Activity size={16} /> Sistema Online
          </span>
        </div>
      </header>

      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 text-rose-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="ROI (Prejuízo)"
          value={`R$ ${metrics.prejuizo_total?.toLocaleString() || "0"}`}
          icon={DollarSign}
          color="bg-rose-500"
        />
        <KpiCard
          title="Conformidade SLA"
          value={`${metrics.sla_cumprido_percent || 0}%`}
          icon={ShieldCheck}
          color="bg-indigo-500"
        />
        <KpiCard
          title="NPS Médio"
          value={metrics.nps_medio || 0}
          icon={Users}
          color="bg-emerald-500"
        />
        <KpiCard
          title="Downtime Total"
          value={`${metrics.downtime_total_min || 0}m`}
          icon={AlertCircle}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-6">
            Incidentes por Prioridade
          </h2>
          <div className="h-80 w-full" style={{ minHeight: "320px" }}>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="prioridade" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-6">
            Impacto Financeiro por Categoria
          </h2>
          <div
            className="h-80 w-full flex items-center justify-center"
            style={{ minHeight: "320px" }}
          >
            {costData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costData}
                    dataKey="total_prejuizo"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {costData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                    formatter={value => `R$ ${Number(value).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABELA DE INCIDENTES CRITICOS FORA DO SLA */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="text-rose-500" size={20} />
          <h2 className="text-xl font-semibold">
            Top 5 Incidentes Fora do SLA (Ação Necessária)
          </h2>
        </div>
        <div className="overflow-x-auto">
          {criticalIncidents.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Título</th>
                  <th className="pb-3">Técnico</th>
                  <th className="pb-3 text-right">Tempo (H)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {criticalIncidents.map(inc => (
                  <tr key={inc.id} className="text-sm">
                    <td className="py-4 font-mono text-indigo-400">
                      #{inc.id}
                    </td>
                    <td className="py-4">{inc.titulo}</td>
                    <td className="py-4 text-slate-300">
                      {inc.tecnico_responsavel}
                    </td>
                    <td className="py-4 text-right font-bold text-rose-400">
                      {Number(inc.tempo_resolucao_horas || 0).toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Nenhum incidente crítico encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
