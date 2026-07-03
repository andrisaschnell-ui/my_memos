import { useState, useEffect } from 'react';

export type Language = 'EN' | 'PT';

export const translations = {
  EN: {
    // Nav
    home: "Lodge Dashboard",
    memos: "Voice Memos",
    shopping: "Shopping Lists",
    reservations: "Guests & Reservations",
    tasks: "Staff Tasks",
    incidents: "Incident Log",
    dailyLog: "Daily Log",
    superAdmin: "Super Admin Settings",
    language: "PT-MZ",

    // Dashboard
    todayPanel: "Today's Lodge Operations",
    checkinsToday: "Check-ins Today",
    checkoutsToday: "Check-outs Today",
    inhouseTonight: "In-House Tonight",
    tasksDueToday: "Staff Tasks Due Today",
    viewAllTasks: "View All Tasks →",
    openIncidents: "Open Incidents & Maintenance",
    viewAllIncidents: "View Incident Log →",
    recentMemos: "Recent Priority Notes",
    viewAllMemos: "View Voice Memos →",
    refresh: "Refresh Data",
    noCheckins: "No check-ins scheduled for today.",
    noCheckouts: "No check-outs scheduled for today.",
    noInhouse: "No guests currently in-house.",
    noTasks: "All tasks due today are completed!",
    noIncidents: "No unresolved incidents reported.",
    guestsTotal: "guests total",

    // Guests & Reservations
    guestsTitle: "Guest Directory & Reservations",
    newReservation: "+ New Reservation",
    newGuest: "+ New Guest Profile",
    guestName: "Full Name",
    email: "Email",
    phone: "Phone",
    nationality: "Nationality",
    idNumber: "ID / Passport #",
    room: "Room / Chalet",
    checkIn: "Check-In Date",
    checkOut: "Check-Out Date",
    adults: "Adults",
    children: "Children",
    rateUsd: "Rate/Night ($)",
    totalUsd: "Total ($)",
    depositPaid: "Deposit Paid",
    status: "Status",
    source: "Source",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    enquiry: "Enquiry",
    confirmed: "Confirmed",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    cancelled: "Cancelled",

    // Tasks
    tasksTitle: "Staff Task Board",
    newTask: "+ Assign New Task",
    taskTitle: "Task Description",
    assignedTo: "Assigned Staff Member",
    area: "Area",
    dueDate: "Due Date",
    recurrence: "Recurrence",
    complete: "Mark Complete",
    completed: "Completed",
    none: "None",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    kitchen: "Kitchen",
    bar: "Bar",
    reception: "Reception",
    garden: "Garden",
    boat: "Boat",
    other: "Other",

    // Incidents
    incidentsTitle: "Incident & Maintenance Log",
    reportIncident: "+ Report Issue",
    issueTitle: "Issue Title",
    description: "Detailed Description",
    severity: "Severity",
    reportedBy: "Reported By",
    resolve: "Mark Resolved",
    resolved: "Resolved",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "CRITICAL ALERT",

    // Daily Log
    dailyLogTitle: "Daily Log & Occupancy Tracker",
    newLogEntry: "+ Record Today's Log",
    logDate: "Date",
    occupancyCount: "Occupancy Count",
    revenueUsd: "Revenue Collected ($)",
    weather: "Weather & Sea Conditions",
    summaryStats: "Monthly Performance Summary",
    totalRevenue: "Total Revenue Logged",
    avgOccupancy: "Avg Daily Occupancy"
  },
  PT: {
    // Nav
    home: "Painel do Lodge",
    memos: "Notas de Voz",
    shopping: "Listas de Compras",
    reservations: "Hóspedes e Reservas",
    tasks: "Tarefas do Pessoal",
    incidents: "Registo de Incidentes",
    dailyLog: "Registo Diário",
    superAdmin: "Definições de Admin",
    language: "EN",

    // Dashboard
    todayPanel: "Operações do Lodge de Hoje",
    checkinsToday: "Entradas Hoje (Check-ins)",
    checkoutsToday: "Saídas Hoje (Check-outs)",
    inhouseTonight: "Hóspedes Alojados Esta Noite",
    tasksDueToday: "Tarefas Pendentes Para Hoje",
    viewAllTasks: "Ver Todas as Tarefas →",
    openIncidents: "Incidentes e Manutenção Abertos",
    viewAllIncidents: "Ver Registo de Incidentes →",
    recentMemos: "Notas de Prioridade Recentes",
    viewAllMemos: "Ver Notas de Voz →",
    refresh: "Atualizar Dados",
    noCheckins: "Nenhuma entrada agendada para hoje.",
    noCheckouts: "Nenhuma saída agendada para hoje.",
    noInhouse: "Nenhum hóspede alojado de momento.",
    noTasks: "Todas as tarefas de hoje estão concluídas!",
    noIncidents: "Nenhum incidente pendente.",
    guestsTotal: "hóspedes no total",

    // Guests & Reservations
    guestsTitle: "Diretório de Hóspedes e Reservas",
    newReservation: "+ Nova Reserva",
    newGuest: "+ Novo Hóspede",
    guestName: "Nome Completo",
    email: "Email",
    phone: "Telefone",
    nationality: "Nacionalidade",
    idNumber: "Nº BI / Passaporte",
    room: "Quarto / Chalé",
    checkIn: "Data de Entrada",
    checkOut: "Data de Saída",
    adults: "Adultos",
    children: "Crianças",
    rateUsd: "Tarifa/Noite ($)",
    totalUsd: "Total ($)",
    depositPaid: "Depósito Pago",
    status: "Estado",
    source: "Origem",
    notes: "Notas",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    enquiry: "Consulta",
    confirmed: "Confirmado",
    checked_in: "Alojado (Check-in)",
    checked_out: "Saída (Check-out)",
    cancelled: "Cancelado",

    // Tasks
    tasksTitle: "Quadro de Tarefas do Pessoal",
    newTask: "+ Atribuir Nova Tarefa",
    taskTitle: "Descrição da Tarefa",
    assignedTo: "Membro do Pessoal Atribuído",
    area: "Área",
    dueDate: "Data Limite",
    recurrence: "Recorrência",
    complete: "Concluir Tarefa",
    completed: "Concluído",
    none: "Nenhuma",
    daily: "Diária",
    weekly: "Semanal",
    monthly: "Mensal",
    housekeeping: "Limpeza",
    maintenance: "Manutenção",
    kitchen: "Cozinha",
    bar: "Bar",
    reception: "Recepção",
    garden: "Jardim",
    boat: "Barco",
    other: "Outro",

    // Incidents
    incidentsTitle: "Registo de Incidentes e Manutenção",
    reportIncident: "+ Registar Problema",
    issueTitle: "Título do Problema",
    description: "Descrição Detalhada",
    severity: "Severidade",
    reportedBy: "Reportado Por",
    resolve: "Marcar Como Resolvido",
    resolved: "Resolvido",
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "ALERTA CRÍTICO",

    // Daily Log
    dailyLogTitle: "Registo Diário e Ocupação",
    newLogEntry: "+ Registar Dia de Hoje",
    logDate: "Data",
    occupancyCount: "Ocupação (Nº Hóspedes)",
    revenueUsd: "Receita Cobrada ($)",
    weather: "Clima e Condições do Mar",
    summaryStats: "Resumo de Desempenho Mensal",
    totalRevenue: "Receita Total Registada",
    avgOccupancy: "Ocupação Média Diária"
  }
};

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lodge_lang');
    return (saved === 'PT' || saved === 'EN') ? saved : 'EN';
  });

  useEffect(() => {
    localStorage.setItem('lodge_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'EN' ? 'PT' : 'EN'));
  };

  const t = translations[lang];

  return { lang, toggleLanguage, t };
}
