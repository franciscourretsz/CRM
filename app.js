const SUPABASE_URL = 'https://qymfcrginsxemxmyujvr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iXUK6jm_JshRc_fOixTSpA_gWzlRrRX';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COUNTRIES = ['Francia', 'Bélgica', 'Suiza'];
const CHANNELS = ['Email', 'WhatsApp', 'LinkedIn', 'Formulario web'];

const STATUSES = [
  'Nuevo',
  'Contactado',
  'Respondió',
  'Interesado',
  'Reunión agendada',
  'Reunión hecha',
  'Propuesta enviada',
  'Ganado',
  'Perdido',
  'Relanzar'
];

const KANBAN_COLUMNS = [
  'Nuevo',
  'Contactado',
  'Respondió',
  'Interesado',
  'Reunión agendada',
  'Propuesta enviada',
  'Ganado',
  'Perdido'
];

const INTEREST_LEVELS = [
  'Sin interés',
  'Interés bajo',
  'Interés medio',
  'Interés alto'
];

const MEETING_STATUSES = [
  'Sin reunión',
  'Agendada',
  'Realizada',
  'No asistió',
  'Reprogramar',
  'Ganada',
  'Perdida'
];

const PROPOSAL_STATUSES = [
  'Sin propuesta',
  'Pendiente',
  'Aceptada',
  'Rechazada'
];

const COMPANY_SIZES = [
  'No definido',
  'Solo founder',
  '2-10',
  '11-50',
  '50+'
];

const REJECTION_REASONS = [
  '',
  'Sin presupuesto',
  'No interesado',
  'Ya tiene proveedor',
  'No responde',
  'Timing incorrecto',
  'Otro'
];

let leads = [];
let clients = [];
let goals = [];
let filteredLeads = [];
let currentSection = 'dashboard';
let currentLanguage = localStorage.getItem('crm_language') || 'es';

const $ = id => document.getElementById(id);

const I18N = {
  es: {
    page_dashboard: 'Dashboard',
    page_funnel: 'Embudo',
    page_kanban: 'Pipeline Kanban',
    page_leads: 'Leads activos',
    page_followups: 'Seguimientos sugeridos',
    page_relaunch: 'Relanzamientos',
    page_clients: 'Clientes',
    page_history: 'Histórico',
    page_metrics: 'Métricas',

    brand_subtitle: 'Prospección B2B',
    nav_dashboard: 'Dashboard',
    nav_funnel: 'Embudo',
    nav_kanban: 'Pipeline Kanban',
    nav_active_leads: 'Leads activos',
    nav_followups: 'Seguimientos',
    nav_relaunch: 'Relanzamientos',
    nav_clients: 'Clientes',
    nav_history: 'Histórico',
    nav_metrics: 'Métricas',

    btn_refresh: 'Actualizar',
    btn_export: 'Exportar CSV',
    btn_import: 'Importar CSV',
    btn_new_client: 'Nuevo cliente',
    btn_new_lead: 'Nuevo lead',
    btn_delete: 'Eliminar',
    btn_cancel: 'Cancelar',
    btn_save: 'Guardar',
    btn_save_client: 'Guardar cliente',
    btn_archive_toggle: 'Archivar/Desarchivar',
    btn_convert_client: 'Convertir a cliente',

    export_filtered: 'Exportar filtrados',
    export_active: 'Leads activos',
    export_responded: 'Con respuesta',
    export_no_response: 'Sin respuesta',
    export_meetings: 'Con reunión',
    export_won: 'Ganados',
    export_lost: 'Perdidos',
    export_archived: 'Histórico',
    export_clients: 'Clientes',

    filter_search: 'Buscar',
    filter_search_placeholder: 'Nombre, país, ubicación, notas, estado...',
    filter_from: 'Desde',
    filter_to: 'Hasta',
    filter_date_field: 'Campo fecha',

    field_country: 'País',
    field_location: 'Ubicación',
    field_location_placeholder: 'Ej: Paris, Bruxelles...',
    field_status: 'Estado',
    field_channel: 'Vía',
    field_interest: 'Interés',
    field_view: 'Vista',
    field_contact_date: 'Fecha contacto',
    field_last_activity: 'Última actividad',
    field_name: 'Nombre',
    field_type: 'Tipo',
    field_company_size: 'Tamaño empresa',
    field_emails_sent: 'Emails enviados',
    field_priority: 'Prioridad',
    field_response: 'Respuesta',
    field_response_date: 'Fecha respuesta',
    field_relaunch_date: 'Fecha relanzamiento',
    field_relaunch_done: 'Relanzamiento hecho',
    field_meeting: 'Reunión',
    field_meeting_date: 'Fecha reunión',
    field_meeting_status: 'Estado reunión',
    field_proposal_sent: 'Propuesta enviada',
    field_proposal_date: 'Fecha propuesta',
    field_proposal_amount: 'Monto propuesta',
    field_proposal_status: 'Estado propuesta',
    field_estimated_value: 'Valor potencial',
    field_closed_value: 'Valor cerrado',
    field_won_date: 'Fecha ganado',
    field_lost_date: 'Fecha perdido',
    field_rejection_reason: 'Motivo rechazo',
    field_archived: 'Archivado',
    field_next_action: 'Próxima acción',
    field_notes: 'Notas',
    field_history: 'Historial',
    field_client_name: 'Nombre cliente',
    field_services: 'Servicios',
    field_monthly_fee: 'Fee mensual €',
    field_setup_fee: 'Setup €',
    field_total_value: 'Valor total €',
    field_start_date: 'Inicio',
    field_end_date: 'Fin',

    all: 'Todos',
    all_feminine: 'Todas',
    view_cards: 'Tarjetas',
    view_table: 'Tabla',

    date_contact: 'Contacto',
    date_last_activity: 'Última actividad',
    date_relaunch: 'Relanzamiento',
    date_response: 'Respuesta',
    date_meeting: 'Reunión',
    date_proposal: 'Propuesta',
    date_won: 'Ganado',
    date_lost: 'Perdido',

    kpi_emails: 'Emails enviados',
    kpi_responses: 'Respuestas',
    kpi_meetings: 'Reuniones',
    kpi_proposals: 'Propuestas',
    kpi_clients: 'Clientes',
    kpi_revenue: 'Facturación',

    potential_pipeline: 'Pipeline potencial',
    sent_proposals: 'Propuestas enviadas',
    closed_revenue: 'Cerrado / facturado',
    active_clients: 'Clientes activos',
    monthly_goals: 'Objetivos mensuales',
    save_goals: 'Guardar objetivos',

    goal_emails: 'Emails',
    goal_responses: 'Respuestas',
    goal_meetings: 'Reuniones',
    goal_proposals: 'Propuestas',
    goal_clients: 'Clientes',

    general_funnel: 'Embudo general',
    commercial_alerts: 'Alertas comerciales',
    commercial_funnel: 'Embudo comercial',
    kanban_title: 'Pipeline Kanban',
    active_leads_title: 'Leads activos',
    followups_title: 'Seguimientos sugeridos',
    relaunch_title: 'Relanzamientos prioritarios',
    clients_title: 'Clientes activos',
    history_title: 'Archivo histórico',
    metrics_country: 'Métricas por país',
    metrics_channel: 'Métricas por canal',

    th_date: 'Fecha',
    th_name: 'Nombre',
    th_country: 'País',
    th_location: 'Ubicación',
    th_channel: 'Vía',
    th_emails: 'Emails',
    th_response: 'Respuesta',
    th_interest: 'Interés',
    th_meeting: 'Reunión',
    th_status: 'Estado',
    th_value: 'Valor',
    th_actions: 'Acciones',

    import_title: 'Importar CSV',
    import_text: 'Importá un CSV exportado desde Excel. El sistema intentará reconocer las columnas principales.',

    toast_lead_saved: 'Lead guardado',
    toast_client_saved: 'Cliente guardado',
    toast_goals_saved: 'Objetivos guardados',
    toast_select_csv: 'Seleccioná un CSV',
    toast_imported: 'leads importados',
    toast_lead_archived: 'Lead archivado',
    toast_lead_unarchived: 'Lead desarchivado'
  },

  fr: {
    page_dashboard: 'Tableau de bord',
    page_funnel: 'Entonnoir',
    page_kanban: 'Pipeline Kanban',
    page_leads: 'Leads actifs',
    page_followups: 'Suivis suggérés',
    page_relaunch: 'Relances',
    page_clients: 'Clients',
    page_history: 'Historique',
    page_metrics: 'Métriques',

    brand_subtitle: 'Prospection B2B',
    nav_dashboard: 'Tableau de bord',
    nav_funnel: 'Entonnoir',
    nav_kanban: 'Pipeline Kanban',
    nav_active_leads: 'Leads actifs',
    nav_followups: 'Suivis',
    nav_relaunch: 'Relances',
    nav_clients: 'Clients',
    nav_history: 'Historique',
    nav_metrics: 'Métriques',

    btn_refresh: 'Actualiser',
    btn_export: 'Exporter CSV',
    btn_import: 'Importer CSV',
    btn_new_client: 'Nouveau client',
    btn_new_lead: 'Nouveau lead',
    btn_delete: 'Supprimer',
    btn_cancel: 'Annuler',
    btn_save: 'Enregistrer',
    btn_save_client: 'Enregistrer client',
    btn_archive_toggle: 'Archiver/Désarchiver',
    btn_convert_client: 'Convertir en client',

    export_filtered: 'Exporter filtrés',
    export_active: 'Leads actifs',
    export_responded: 'Avec réponse',
    export_no_response: 'Sans réponse',
    export_meetings: 'Avec réunion',
    export_won: 'Gagnés',
    export_lost: 'Perdus',
    export_archived: 'Historique',
    export_clients: 'Clients',

    filter_search: 'Rechercher',
    filter_search_placeholder: 'Nom, pays, localisation, notes, statut...',
    filter_from: 'Depuis',
    filter_to: 'Jusqu’à',
    filter_date_field: 'Champ date',

    field_country: 'Pays',
    field_location: 'Localisation',
    field_location_placeholder: 'Ex : Paris, Bruxelles...',
    field_status: 'Statut',
    field_channel: 'Canal',
    field_interest: 'Intérêt',
    field_view: 'Vue',
    field_contact_date: 'Date de contact',
    field_last_activity: 'Dernière activité',
    field_name: 'Nom',
    field_type: 'Type',
    field_company_size: 'Taille entreprise',
    field_emails_sent: 'Emails envoyés',
    field_priority: 'Priorité',
    field_response: 'Réponse',
    field_response_date: 'Date réponse',
    field_relaunch_date: 'Date relance',
    field_relaunch_done: 'Relance faite',
    field_meeting: 'Réunion',
    field_meeting_date: 'Date réunion',
    field_meeting_status: 'Statut réunion',
    field_proposal_sent: 'Proposition envoyée',
    field_proposal_date: 'Date proposition',
    field_proposal_amount: 'Montant proposition',
    field_proposal_status: 'Statut proposition',
    field_estimated_value: 'Valeur potentielle',
    field_closed_value: 'Valeur signée',
    field_won_date: 'Date gagné',
    field_lost_date: 'Date perdu',
    field_rejection_reason: 'Motif refus',
    field_archived: 'Archivé',
    field_next_action: 'Prochaine action',
    field_notes: 'Notes',
    field_history: 'Historique',
    field_client_name: 'Nom client',
    field_services: 'Services',
    field_monthly_fee: 'Mensuel €',
    field_setup_fee: 'Setup €',
    field_total_value: 'Valeur totale €',
    field_start_date: 'Début',
    field_end_date: 'Fin',

    all: 'Tous',
    all_feminine: 'Toutes',
    view_cards: 'Cartes',
    view_table: 'Tableau',

    date_contact: 'Contact',
    date_last_activity: 'Dernière activité',
    date_relaunch: 'Relance',
    date_response: 'Réponse',
    date_meeting: 'Réunion',
    date_proposal: 'Proposition',
    date_won: 'Gagné',
    date_lost: 'Perdu',

    kpi_emails: 'Emails envoyés',
    kpi_responses: 'Réponses',
    kpi_meetings: 'Réunions',
    kpi_proposals: 'Propositions',
    kpi_clients: 'Clients',
    kpi_revenue: 'Chiffre d’affaires',

    potential_pipeline: 'Pipeline potentiel',
    sent_proposals: 'Propositions envoyées',
    closed_revenue: 'Signé / facturé',
    active_clients: 'Clients actifs',
    monthly_goals: 'Objectifs mensuels',
    save_goals: 'Enregistrer objectifs',

    goal_emails: 'Emails',
    goal_responses: 'Réponses',
    goal_meetings: 'Réunions',
    goal_proposals: 'Propositions',
    goal_clients: 'Clients',

    general_funnel: 'Entonnoir général',
    commercial_alerts: 'Alertes commerciales',
    commercial_funnel: 'Entonnoir commercial',
    kanban_title: 'Pipeline Kanban',
    active_leads_title: 'Leads actifs',
    followups_title: 'Suivis suggérés',
    relaunch_title: 'Relances prioritaires',
    clients_title: 'Clients actifs',
    history_title: 'Historique',
    metrics_country: 'Métriques par pays',
    metrics_channel: 'Métriques par canal',

    th_date: 'Date',
    th_name: 'Nom',
    th_country: 'Pays',
    th_location: 'Localisation',
    th_channel: 'Canal',
    th_emails: 'Emails',
    th_response: 'Réponse',
    th_interest: 'Intérêt',
    th_meeting: 'Réunion',
    th_status: 'Statut',
    th_value: 'Valeur',
    th_actions: 'Actions',

    import_title: 'Importer CSV',
    import_text: 'Importez un CSV exporté depuis Excel. Le système reconnaîtra les colonnes principales.',

    toast_lead_saved: 'Lead enregistré',
    toast_client_saved: 'Client enregistré',
    toast_goals_saved: 'Objectifs enregistrés',
    toast_select_csv: 'Sélectionnez un CSV',
    toast_imported: 'leads importés',
    toast_lead_archived: 'Lead archivé',
    toast_lead_unarchived: 'Lead désarchivé'
  },

  en: {
    page_dashboard: 'Dashboard',
    page_funnel: 'Funnel',
    page_kanban: 'Kanban Pipeline',
    page_leads: 'Active leads',
    page_followups: 'Suggested follow-ups',
    page_relaunch: 'Relaunches',
    page_clients: 'Clients',
    page_history: 'History',
    page_metrics: 'Metrics',

    brand_subtitle: 'B2B Prospecting',
    nav_dashboard: 'Dashboard',
    nav_funnel: 'Funnel',
    nav_kanban: 'Kanban Pipeline',
    nav_active_leads: 'Active leads',
    nav_followups: 'Follow-ups',
    nav_relaunch: 'Relaunches',
    nav_clients: 'Clients',
    nav_history: 'History',
    nav_metrics: 'Metrics',

    btn_refresh: 'Refresh',
    btn_export: 'Export CSV',
    btn_import: 'Import CSV',
    btn_new_client: 'New client',
    btn_new_lead: 'New lead',
    btn_delete: 'Delete',
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    btn_save_client: 'Save client',
    btn_archive_toggle: 'Archive/Unarchive',
    btn_convert_client: 'Convert to client',

    export_filtered: 'Export filtered',
    export_active: 'Active leads',
    export_responded: 'With response',
    export_no_response: 'No response',
    export_meetings: 'With meeting',
    export_won: 'Won',
    export_lost: 'Lost',
    export_archived: 'History',
    export_clients: 'Clients',

    filter_search: 'Search',
    filter_search_placeholder: 'Name, country, location, notes, status...',
    filter_from: 'From',
    filter_to: 'To',
    filter_date_field: 'Date field',

    field_country: 'Country',
    field_location: 'Location',
    field_location_placeholder: 'Ex: Paris, Brussels...',
    field_status: 'Status',
    field_channel: 'Channel',
    field_interest: 'Interest',
    field_view: 'View',
    field_contact_date: 'Contact date',
    field_last_activity: 'Last activity',
    field_name: 'Name',
    field_type: 'Type',
    field_company_size: 'Company size',
    field_emails_sent: 'Emails sent',
    field_priority: 'Priority',
    field_response: 'Response',
    field_response_date: 'Response date',
    field_relaunch_date: 'Relaunch date',
    field_relaunch_done: 'Relaunch done',
    field_meeting: 'Meeting',
    field_meeting_date: 'Meeting date',
    field_meeting_status: 'Meeting status',
    field_proposal_sent: 'Proposal sent',
    field_proposal_date: 'Proposal date',
    field_proposal_amount: 'Proposal amount',
    field_proposal_status: 'Proposal status',
    field_estimated_value: 'Potential value',
    field_closed_value: 'Closed value',
    field_won_date: 'Won date',
    field_lost_date: 'Lost date',
    field_rejection_reason: 'Rejection reason',
    field_archived: 'Archived',
    field_next_action: 'Next action',
    field_notes: 'Notes',
    field_history: 'History',
    field_client_name: 'Client name',
    field_services: 'Services',
    field_monthly_fee: 'Monthly fee €',
    field_setup_fee: 'Setup €',
    field_total_value: 'Total value €',
    field_start_date: 'Start',
    field_end_date: 'End',

    all: 'All',
    all_feminine: 'All',
    view_cards: 'Cards',
    view_table: 'Table',

    date_contact: 'Contact',
    date_last_activity: 'Last activity',
    date_relaunch: 'Relaunch',
    date_response: 'Response',
    date_meeting: 'Meeting',
    date_proposal: 'Proposal',
    date_won: 'Won',
    date_lost: 'Lost',

    kpi_emails: 'Emails sent',
    kpi_responses: 'Responses',
    kpi_meetings: 'Meetings',
    kpi_proposals: 'Proposals',
    kpi_clients: 'Clients',
    kpi_revenue: 'Revenue',

    potential_pipeline: 'Potential pipeline',
    sent_proposals: 'Sent proposals',
    closed_revenue: 'Closed / billed',
    active_clients: 'Active clients',
    monthly_goals: 'Monthly goals',
    save_goals: 'Save goals',

    goal_emails: 'Emails',
    goal_responses: 'Responses',
    goal_meetings: 'Meetings',
    goal_proposals: 'Proposals',
    goal_clients: 'Clients',

    general_funnel: 'General funnel',
    commercial_alerts: 'Commercial alerts',
    commercial_funnel: 'Commercial funnel',
    kanban_title: 'Kanban Pipeline',
    active_leads_title: 'Active leads',
    followups_title: 'Suggested follow-ups',
    relaunch_title: 'Priority relaunches',
    clients_title: 'Active clients',
    history_title: 'History',
    metrics_country: 'Metrics by country',
    metrics_channel: 'Metrics by channel',

    th_date: 'Date',
    th_name: 'Name',
    th_country: 'Country',
    th_location: 'Location',
    th_channel: 'Channel',
    th_emails: 'Emails',
    th_response: 'Response',
    th_interest: 'Interest',
    th_meeting: 'Meeting',
    th_status: 'Status',
    th_value: 'Value',
    th_actions: 'Actions',

    import_title: 'Import CSV',
    import_text: 'Import a CSV exported from Excel. The system will try to recognize the main columns.',

    toast_lead_saved: 'Lead saved',
    toast_client_saved: 'Client saved',
    toast_goals_saved: 'Goals saved',
    toast_select_csv: 'Select a CSV',
    toast_imported: 'leads imported',
    toast_lead_archived: 'Lead archived',
    toast_lead_unarchived: 'Lead unarchived'
  }
};

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N.es[key] || key;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentGoalMonth() {
  return new Date().toISOString().slice(0, 7);
}

function addDays(dateString, days) {
  const date = new Date(dateString || today());
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromDate, toDate = today()) {
  if (!fromDate) return 0;
  const a = new Date(fromDate);
  const b = new Date(toDate);
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function money(value) {
  return `${Number(value || 0).toLocaleString('es-ES')} €`;
}
function percent(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  setTimeout(() => $('toast').classList.add('hidden'), 2800);
}

function fillSelect(el, options, allLabel = null) {
  el.innerHTML = '';

  if (allLabel) {
    const option = document.createElement('option');
    option.value = 'all';
    option.textContent = allLabel;
    el.appendChild(option);
  }

  options.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value || 'Sin definir';
    el.appendChild(option);
  });
}

function normalizeBool(value) {
  if (typeof value === 'boolean') return value;
  const s = String(value || '').toLowerCase().trim();
  return ['si', 'sí', 'true', '1', 'yes', 'x'].includes(s);
}

function parseDate(value) {
  if (!value) return null;
  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const yyyy = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${yyyy}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  }

  return null;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });

  if ($('languageSelect')) $('languageSelect').value = currentLanguage;

  const titles = {
    dashboard: 'page_dashboard',
    funnel: 'page_funnel',
    kanban: 'page_kanban',
    leads: 'page_leads',
    followups: 'page_followups',
    relaunch: 'page_relaunch',
    clients: 'page_clients',
    history: 'page_history',
    metrics: 'page_metrics'
  };

  if ($('pageTitle')) $('pageTitle').textContent = t(titles[currentSection] || 'page_dashboard');
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('crm_language', lang);
  applyTranslations();
  render();
}

function badge(text, cls = '') {
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function responseBadge(lead) {
  return lead.response ? badge('Respuesta: Sí', 'ok') : badge('Respuesta: No');
}

function interestBadge(lead) {
  const level = lead.interest_level || 'Sin interés';

  if (level === 'Interés alto') return badge(level, 'ok');
  if (level === 'Interés medio') return badge(level, 'orange');
  if (level === 'Interés bajo') return badge(level, 'warn');
  return badge(level, 'danger');
}

function meetingBadge(lead) {
  if (lead.meeting_done) return badge('Reunión: Sí', 'blue');
  if (lead.meeting_status === 'Agendada') return badge('Reunión agendada', 'blue');
  if (lead.meeting_status === 'No asistió') return badge('No asistió', 'danger');
  return badge('Sin reunión');
}

function statusBadge(lead) {
  const status = lead.status || 'Nuevo';

  if (status === 'Ganado') return badge('Ganado', 'gold');
  if (status === 'Perdido') return badge('Perdido', 'danger');
  if (status === 'Propuesta enviada') return badge(status, 'purple');
  if (status === 'Reunión agendada' || status === 'Reunión hecha') return badge(status, 'blue');
  if (status === 'Respondió' || status === 'Interesado') return badge(status, 'ok');
  if (status === 'Relanzar') return badge(status, 'warn');

  return badge(status);
}

function priorityBadge(lead) {
  const priority = lead.priority || 'Media';

  if (priority === 'Alta') return badge('Prioridad alta', 'danger');
  if (priority === 'Media') return badge('Prioridad media', 'warn');
  return badge('Prioridad baja');
}

function proposalBadge(lead) {
  if (lead.proposal_sent) return badge('Propuesta enviada', 'purple');
  return badge('Sin propuesta');
}

function leadTemperature(lead) {
  if (lead.status === 'Ganado') return 'Cliente';

  if (
    lead.interest_level === 'Interés alto' ||
    lead.meeting_done ||
    lead.meeting_status === 'Agendada' ||
    lead.proposal_sent ||
    lead.status === 'Propuesta enviada'
  ) {
    return 'Caliente';
  }

  if (
    lead.response ||
    lead.interest_level === 'Interés medio' ||
    lead.status === 'Respondió' ||
    lead.status === 'Interesado'
  ) {
    return 'Tibio';
  }

  return 'Frío';
}

function temperatureBadge(lead) {
  const temp = leadTemperature(lead);

  if (temp === 'Cliente') return badge('Cliente', 'gold');
  if (temp === 'Caliente') return badge('Caliente', 'ok');
  if (temp === 'Tibio') return badge('Tibio', 'warn');
  return badge('Frío');
}

function getLeadScore(lead) {
  let score = 0;

  if (lead.response) score += 15;
  if (lead.interest_level === 'Interés bajo') score += 10;
  if (lead.interest_level === 'Interés medio') score += 25;
  if (lead.interest_level === 'Interés alto') score += 40;
  if (lead.meeting_status === 'Agendada') score += 20;
  if (lead.meeting_done) score += 30;
  if (lead.proposal_sent) score += 35;
  if (lead.status === 'Ganado') score = 100;
  if (lead.status === 'Perdido') score = Math.min(score, 15);

  return Math.min(score, 100);
}

function isSuggestedFollowup(lead) {
  if (lead.archived) return false;
  if (!lead.response) return false;
  if (lead.meeting_done || lead.meeting_status === 'Agendada') return false;

  const baseDate = lead.response_date || lead.last_activity || lead.contact_date;
  return daysBetween(baseDate) >= 2;
}

function isRelaunchDue(lead) {
  if (lead.archived) return false;
  if (lead.response) return false;
  if (!lead.followup_date) return false;
  if (lead.followup_done) return false;

  return lead.followup_date <= today();
}

function shouldAutoArchive(lead) {
  if (lead.archived) return false;
  if (lead.response) return false;
  if (lead.status === 'Ganado') return false;

  const mostRecent = [lead.last_activity, lead.followup_date, lead.contact_date]
    .filter(Boolean)
    .sort()
    .pop();

  return mostRecent && daysBetween(mostRecent) >= 10;
}

function getDateValueForFilter(lead, field) {
  if (field === 'all') {
    return [
      lead.contact_date,
      lead.last_activity,
      lead.followup_date,
      lead.response_date,
      lead.meeting_date,
      lead.proposal_date,
      lead.won_date,
      lead.lost_date
    ].filter(Boolean);
  }

  return lead[field] ? [lead[field]] : [];
}

async function loadAll() {
  const [leadsResult, clientsResult, goalsResult] = await Promise.all([
    supabaseClient.from('leads').select('*').order('created_at', { ascending: false }),
    supabaseClient.from('clients').select('*').order('created_at', { ascending: false }),
    supabaseClient.from('monthly_goals').select('*').order('created_at', { ascending: false })
  ]);

  if (leadsResult.error) {
    toast('Error cargando leads: ' + leadsResult.error.message);
    return;
  }

  if (clientsResult.error) {
    toast('Error cargando clientes: ' + clientsResult.error.message);
    return;
  }

  if (goalsResult.error) {
    toast('Error cargando objetivos: ' + goalsResult.error.message);
    return;
  }

  leads = leadsResult.data || [];
  clients = clientsResult.data || [];
  goals = goalsResult.data || [];

  await runAutoArchive();
  applyFilters();
}

async function runAutoArchive() {
  const toArchive = leads.filter(shouldAutoArchive);

  if (!toArchive.length) return;

  const ids = toArchive.map(lead => lead.id);

  const { error } = await supabaseClient
    .from('leads')
    .update({ archived: true, status: 'Relanzar' })
    .in('id', ids);

  if (!error) {
    leads = leads.map(lead => ids.includes(lead.id) ? { ...lead, archived: true, status: 'Relanzar' } : lead);
  }
}

function applyFilters() {
  const q = $('searchInput').value.toLowerCase().trim();
  const country = $('countryFilter').value;
  const location = $('locationFilter').value.toLowerCase().trim();
  const status = $('statusFilter').value;
  const channel = $('channelFilter').value;
  const interest = $('interestFilter').value;
  const from = $('dateFromFilter').value;
  const to = $('dateToFilter').value;
  const dateField = $('dateFieldFilter').value;

  filteredLeads = leads.filter(lead => {
    const text = [
      lead.name,
      lead.lead_type,
      lead.country,
      lead.location,
      lead.company_size,
      lead.contact_channel,
      lead.status,
      lead.priority,
      lead.interest_level,
      lead.meeting_status,
      lead.proposal_status,
      lead.rejection_reason,
      lead.next_action,
      lead.notes,
      lead.history
    ].join(' ').toLowerCase();

    if (q && !text.includes(q)) return false;
    if (country !== 'all' && lead.country !== country) return false;
    if (location && !String(lead.location || '').toLowerCase().includes(location)) return false;
    if (status !== 'all' && lead.status !== status) return false;
    if (channel !== 'all' && lead.contact_channel !== channel) return false;
    if (interest !== 'all' && lead.interest_level !== interest) return false;

    if (from || to) {
      const values = getDateValueForFilter(lead, dateField);
      if (!values.length) return false;

      const matchesDate = values.some(date => {
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      });

      if (!matchesDate) return false;
    }

    return true;
  });

  render();
}
function activeClients() {
  return clients.filter(client => client.status === 'Activo');
}

function funnelData(sourceLeads = leads) {
  const active = sourceLeads.filter(lead => !lead.archived);

  const emails = active.reduce(
    (sum, lead) => sum + Number(lead.emails_sent || 0),
    0
  );

  const responses = active.filter(lead => lead.response).length;

  const meetings = active.filter(
    lead =>
      lead.meeting_done ||
      lead.meeting_status === 'Agendada' ||
      lead.meeting_status === 'Realizada'
  ).length;

  const proposals = active.filter(
    lead =>
      lead.proposal_sent ||
      lead.status === 'Propuesta enviada'
  ).length;

  const wins = active.filter(
    lead => lead.status === 'Ganado'
  ).length;

  const revenue =
    active.reduce(
      (sum, lead) =>
        sum +
        Number(
          lead.closed_value ||
          (lead.status === 'Ganado'
            ? lead.proposal_amount || lead.estimated_value || 0
            : 0)
        ),
      0
    ) +
    clients.reduce(
      (sum, client) =>
        sum + Number(client.total_value || 0),
      0
    );

  return {
    emails,
    responses,
    meetings,
    proposals,
    wins,
    revenue
  };
}

function getCurrentGoal() {
  const month = currentGoalMonth();

  return (
    goals.find(goal => goal.month === month) || {
      month,
      target_emails: 500,
      target_responses: 50,
      target_meetings: 15,
      target_proposals: 6,
      target_clients: 5,
      target_revenue: 5000
    }
  );
}

function renderDashboard() {
  const data = funnelData(leads);

  const pipelinePotential = leads
    .filter(
      lead =>
        !lead.archived &&
        lead.status !== 'Ganado' &&
        lead.status !== 'Perdido'
    )
    .reduce(
      (sum, lead) =>
        sum + Number(lead.estimated_value || 0),
      0
    );

  const proposalValue = leads
    .filter(
      lead =>
        lead.proposal_sent ||
        lead.status === 'Propuesta enviada'
    )
    .reduce(
      (sum, lead) =>
        sum +
        Number(
          lead.proposal_amount ||
          lead.estimated_value ||
          0
        ),
      0
    );

  const closedRevenue =
    leads
      .filter(lead => lead.status === 'Ganado')
      .reduce(
        (sum, lead) =>
          sum +
          Number(
            lead.closed_value ||
            lead.proposal_amount ||
            lead.estimated_value ||
            0
          ),
        0
      ) +
    clients.reduce(
      (sum, client) =>
        sum +
        Number(
          client.total_value ||
          client.setup_fee ||
          client.monthly_fee ||
          0
        ),
      0
    );

  $('kpiEmails').textContent = data.emails;
  $('kpiResponses').textContent = data.responses;
  $('kpiMeetings').textContent = data.meetings;
  $('kpiProposals').textContent = data.proposals;
  $('kpiClients').textContent =
    data.wins + activeClients().length;
  $('kpiRevenue').textContent = money(data.revenue);

  if ($('kpiPipeline'))
    $('kpiPipeline').textContent =
      money(pipelinePotential);

  if ($('kpiProposalValue'))
    $('kpiProposalValue').textContent =
      money(proposalValue);

  if ($('kpiClosedRevenue'))
    $('kpiClosedRevenue').textContent =
      money(closedRevenue);

  if ($('kpiActiveClients'))
    $('kpiActiveClients').textContent =
      activeClients().length;

  renderGoals();
  renderFunnel('miniFunnel', data);
  renderAlerts();
}

function renderGoals() {
  if (!$('goalsMonth')) return;

  const goal = getCurrentGoal();
  const data = funnelData(leads);

  $('goalsMonth').textContent = goal.month;

  $('goalEmails').value =
    goal.target_emails || 0;

  $('goalResponses').value =
    goal.target_responses || 0;

  $('goalMeetings').value =
    goal.target_meetings || 0;

  $('goalProposals').value =
    goal.target_proposals || 0;

  $('goalClients').value =
    goal.target_clients || 0;

  $('goalRevenue').value =
    goal.target_revenue || 0;

  const rows = [
    [
      t('goal_emails'),
      data.emails,
      goal.target_emails
    ],
    [
      t('goal_responses'),
      data.responses,
      goal.target_responses
    ],
    [
      t('goal_meetings'),
      data.meetings,
      goal.target_meetings
    ],
    [
      t('goal_proposals'),
      data.proposals,
      goal.target_proposals
    ],
    [
      t('goal_clients'),
      data.wins + activeClients().length,
      goal.target_clients
    ],
    [
      'Revenue',
      data.revenue,
      goal.target_revenue,
      true
    ]
  ];

  $('goalsProgress').innerHTML = rows
    .map(([label, current, target, moneyMode]) => {
      const progress = target
        ? Math.min(
            (current / target) * 100,
            100
          )
        : 0;

      return `
        <div class="goal-progress-row">
          <div class="goal-progress-label">
            ${label}
          </div>

          <div class="goal-progress-bar-wrap">
            <div
              class="goal-progress-bar"
              style="width:${Math.max(progress, 4)}%"
            ></div>
          </div>

          <div class="goal-progress-value">
            ${
              moneyMode
                ? money(current)
                : current
            }
            /
            ${
              moneyMode
                ? money(target)
                : target
            }
          </div>
        </div>
      `;
    })
    .join('');
}

async function saveGoals() {
  const month = currentGoalMonth();

  const payload = {
    month,
    target_emails: Number(
      $('goalEmails').value || 0
    ),
    target_responses: Number(
      $('goalResponses').value || 0
    ),
    target_meetings: Number(
      $('goalMeetings').value || 0
    ),
    target_proposals: Number(
      $('goalProposals').value || 0
    ),
    target_clients: Number(
      $('goalClients').value || 0
    ),
    target_revenue: Number(
      $('goalRevenue').value || 0
    )
  };

  const existing = goals.find(
    goal => goal.month === month
  );

  const result = existing
    ? await supabaseClient
        .from('monthly_goals')
        .update(payload)
        .eq('id', existing.id)
    : await supabaseClient
        .from('monthly_goals')
        .insert(payload);

  if (result.error) {
    toast(result.error.message);
    return;
  }

  toast(t('toast_goals_saved'));
  await loadAll();
}

function renderFunnel(containerId, data) {
  const steps = [
    [t('kpi_emails'), data.emails],
    [t('kpi_responses'), data.responses],
    [t('kpi_meetings'), data.meetings],
    [t('kpi_proposals'), data.proposals],
    [t('kpi_clients'), data.wins]
  ];

  const max =
    Math.max(...steps.map(step => step[1])) || 1;

  $(containerId).innerHTML = steps
    .map(([label, value]) => {
      const width =
        (value / max) * 100;

      return `
        <div class="funnel-step">
          <div class="funnel-label">
            ${label}
          </div>

          <div class="funnel-bar-wrap">
            <div
              class="funnel-bar"
              style="width:${Math.max(width, 5)}%"
            >
              ${value}
            </div>
          </div>

          <div class="funnel-rate">
            ${percent(value, steps[0][1])}
          </div>
        </div>
      `;
    })
    .join('');
}
function renderFullFunnel() {
  const data = funnelData(filteredLeads);

  $('funnelSummary').textContent =
    `${t('kpi_responses')} ${percent(data.responses, data.emails)} · ${t('kpi_meetings')} ${percent(data.meetings, data.responses)} · Cierre ${percent(data.wins, data.meetings)}`;

  renderFunnel('fullFunnel', data);
}

function renderAlerts() {
  const suggested = leads.filter(isSuggestedFollowup).length;
  const relaunch = leads.filter(isRelaunchDue).length;
  const hot = leads.filter(lead => !lead.archived && leadTemperature(lead) === 'Caliente').length;
  const archived = leads.filter(lead => lead.archived).length;

  const items = [
    {
      title: `${suggested} ${t('nav_followups')}`,
      text: currentLanguage === 'fr'
        ? 'Leads ayant répondu, sans réunion, à suivre après 2 jours.'
        : currentLanguage === 'en'
          ? 'Leads that replied, have no meeting, and need follow-up after 2 days.'
          : 'Leads que respondieron, no tienen reunión y necesitan seguimiento a los 2 días.'
    },
    {
      title: `${relaunch} ${t('nav_relaunch')}`,
      text: currentLanguage === 'fr'
        ? 'Leads sans réponse avec une relance prévue aujourd’hui ou en retard.'
        : currentLanguage === 'en'
          ? 'Leads with no response and a relaunch due today or overdue.'
          : 'Leads sin respuesta con relanzamiento vencido o para hoy.'
    },
    {
      title: `${hot} leads calientes`,
      text: currentLanguage === 'fr'
        ? 'Contacts avec intérêt élevé, réunion, proposition ou signaux d’achat.'
        : currentLanguage === 'en'
          ? 'Contacts with high interest, meeting, proposal, or strong buying signals.'
          : 'Contactos con interés alto, reunión, propuesta o señales fuertes de compra.'
    },
    {
      title: `${archived} ${t('nav_history')}`,
      text: currentLanguage === 'fr'
        ? 'Leads archivés par absence de réponse ou statut perdu.'
        : currentLanguage === 'en'
          ? 'Leads archived due to no response or lost status.'
          : 'Leads archivados por falta de respuesta o estado perdido.'
    }
  ];

  $('alertsBox').innerHTML = items.map(item => `
    <div class="alert">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.text)}</p>
    </div>
  `).join('');
}

function activeLeads() {
  return filteredLeads.filter(lead => !lead.archived && lead.status !== 'Perdido');
}

function archivedLeads() {
  return filteredLeads.filter(lead => lead.archived || lead.status === 'Perdido');
}

function renderLeadCard(lead) {
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <h3>${escapeHtml(lead.name)}</h3>
          <div class="badges">
            ${temperatureBadge(lead)}
            ${statusBadge(lead)}
            ${responseBadge(lead)}
            ${interestBadge(lead)}
            ${meetingBadge(lead)}
            ${proposalBadge(lead)}
            ${priorityBadge(lead)}
            ${lead.archived ? badge('Archivado', 'danger') : ''}
          </div>
        </div>

        <div>${badge(`${getLeadScore(lead)}/100`, 'purple')}</div>
      </div>

      <div class="meta">
        <div><span>${t('field_contact_date')}</span>${lead.contact_date || '-'}</div>
        <div><span>${t('field_last_activity')}</span>${lead.last_activity || '-'}</div>
        <div><span>${t('field_country')}</span>${escapeHtml(lead.country || '-')}</div>
        <div><span>${t('field_location')}</span>${escapeHtml(lead.location || '-')}</div>
        <div><span>${t('field_channel')}</span>${escapeHtml(lead.contact_channel || '-')}</div>
        <div><span>${t('field_emails_sent')}</span>${Number(lead.emails_sent || 0)}</div>
        <div><span>${t('field_estimated_value')}</span>${money(lead.estimated_value)}</div>
        <div><span>${t('field_closed_value')}</span>${money(lead.closed_value)}</div>
      </div>

      <p class="notes">${escapeHtml(lead.notes || 'Sin notas')}</p>

      <div class="card-actions">
        ${lead.status === 'Ganado' ? `<button class="btn gold-btn" onclick="openClientFromLead('${lead.id}')">${t('btn_convert_client')}</button>` : ''}
        <button class="btn secondary" onclick="editLead('${lead.id}')">Editar</button>
        <button class="btn ghost" onclick="toggleArchiveLead('${lead.id}')">
          ${lead.archived ? 'Desarchivar' : 'Archivar'}
        </button>
      </div>
    </article>
  `;
}

function renderLeadTable(source) {
  $('tableBody').innerHTML = source.map(lead => `
    <tr>
      <td>${lead.contact_date || ''}</td>
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.country || '')}</td>
      <td>${escapeHtml(lead.location || '')}</td>
      <td>${escapeHtml(lead.contact_channel || '')}</td>
      <td>${Number(lead.emails_sent || 0)}</td>
      <td>${lead.response ? 'Sí' : 'No'}</td>
      <td>${escapeHtml(lead.interest_level || '')}</td>
      <td>${lead.meeting_done ? 'Sí' : 'No'}</td>
      <td>${escapeHtml(lead.status || '')}</td>
      <td>${money(lead.estimated_value)}</td>
      <td><button class="btn secondary" onclick="editLead('${lead.id}')">Editar</button></td>
    </tr>
  `).join('');
}

function renderLeads() {
  const source = activeLeads();

  $('activeLeadCount').textContent = `${source.length} resultados`;

  $('cardsView').innerHTML =
    source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay leads activos con estos filtros.</p>';

  renderLeadTable(source);

  const mode = $('viewMode').value;
  $('cardsView').classList.toggle('hidden', mode !== 'cards');
  $('tableView').classList.toggle('hidden', mode !== 'table');
}

function renderSuggestedFollowups() {
  const source = filteredLeads
    .filter(isSuggestedFollowup)
    .sort((a, b) =>
      String(a.response_date || a.last_activity || '')
        .localeCompare(String(b.response_date || b.last_activity || ''))
    );

  $('followupCount').textContent = `${source.length} pendientes`;
  $('followupList').innerHTML =
    source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay seguimientos sugeridos.</p>';
}

function renderRelaunch() {
  const source = filteredLeads
    .filter(isRelaunchDue)
    .sort((a, b) =>
      String(a.followup_date || '')
        .localeCompare(String(b.followup_date || ''))
    );

  $('relaunchCount').textContent = `${source.length} pendientes`;
  $('relaunchList').innerHTML =
    source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay relanzamientos vencidos.</p>';
}

function renderKanban() {
  if (!$('kanbanBoard')) return;

  const source = filteredLeads.filter(lead => !lead.archived);
  $('kanbanCount').textContent = `${source.length} leads`;

  $('kanbanBoard').innerHTML = KANBAN_COLUMNS.map(status => {
    const items = source.filter(lead => lead.status === status);

    return `
      <div class="kanban-column" data-status="${escapeHtml(status)}">
        <div class="kanban-column-head">
          <h3>${escapeHtml(status)}</h3>
          <span>${items.length}</span>
        </div>

        ${items.map(lead => `
          <div
            class="kanban-card"
            draggable="true"
            data-id="${lead.id}"
          >
            <h4>${escapeHtml(lead.name)}</h4>
            <p>${escapeHtml(lead.country || '')} · ${escapeHtml(lead.location || '')}</p>

            <div class="badges">
              ${responseBadge(lead)}
              ${interestBadge(lead)}
              ${badge(money(lead.estimated_value), 'gold')}
            </div>

            <div class="kanban-card-footer">
              <span>${Number(lead.emails_sent || 0)} emails</span>
              <button class="btn ghost" onclick="editLead('${lead.id}')">Editar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  setupKanbanDragAndDrop();
}

function setupKanbanDragAndDrop() {
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text/plain', card.dataset.id);
    });
  });

  document.querySelectorAll('.kanban-column').forEach(column => {
    column.addEventListener('dragover', event => {
      event.preventDefault();
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });

    column.addEventListener('drop', async event => {
      event.preventDefault();
      column.classList.remove('drag-over');

      const id = event.dataTransfer.getData('text/plain');
      const newStatus = column.dataset.status;

      await updateLeadStatusFromKanban(id, newStatus);
    });
  });
}

async function updateLeadStatusFromKanban(id, status) {
  const payload = {
    status,
    last_activity: today()
  };

  if (status === 'Respondió') {
    payload.response = true;
    payload.response_date = today();
  }

  if (status === 'Reunión agendada') {
    payload.meeting_status = 'Agendada';
    payload.meeting_date = today();
  }

  if (status === 'Propuesta enviada') {
    payload.proposal_sent = true;
    payload.proposal_status = 'Pendiente';
    payload.proposal_date = today();
  }

  if (status === 'Ganado') {
    payload.won_date = today();
    payload.archived = false;
  }

  if (status === 'Perdido') {
    payload.lost_date = today();
    payload.archived = true;
  }

  const { error } = await supabaseClient
    .from('leads')
    .update(payload)
    .eq('id', id);

  if (error) {
    toast(error.message);
    return;
  }

  toast('Lead actualizado');
  await loadAll();
}

function renderClients() {
  const source = clients.filter(client => client.status !== 'Finalizado');

  $('clientCount').textContent = `${source.length} clientes`;

  $('clientsGrid').innerHTML = source.map(client => `
    <article class="card">
      <div class="card-head">
        <div>
          <h3>${escapeHtml(client.client_name)}</h3>
          <div class="badges">
            ${badge(client.status || 'Activo', client.status === 'Activo' ? 'ok' : 'warn')}
            ${badge(client.country || '', 'blue')}
          </div>
        </div>
        <div>${badge(money(client.total_value || client.monthly_fee || 0), 'gold')}</div>
      </div>

      <div class="meta">
        <div><span>${t('field_services')}</span>${escapeHtml((client.services || []).join(', ') || '-')}</div>
        <div><span>${t('field_monthly_fee')}</span>${money(client.monthly_fee)}</div>
        <div><span>${t('field_setup_fee')}</span>${money(client.setup_fee)}</div>
        <div><span>${t('field_total_value')}</span>${money(client.total_value)}</div>
        <div><span>${t('field_start_date')}</span>${client.start_date || '-'}</div>
        <div><span>${t('field_end_date')}</span>${client.end_date || '-'}</div>
      </div>

      <p class="notes">${escapeHtml(client.notes || 'Sin notas')}</p>

      <div class="card-actions">
        <button class="btn secondary" onclick="editClient('${client.id}')">Editar</button>
      </div>
    </article>
  `).join('') || '<p class="notes">No hay clientes activos.</p>';
}
function renderHistory() {
  const source = archivedLeads();

  $('historyCount').textContent = `${source.length} archivados`;

  $('historyGrid').innerHTML =
    source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay leads archivados.</p>';
}

function groupMetrics(source, key, labels) {
  return labels.map(label => {
    const group = source.filter(lead => lead[key] === label);
    const data = funnelData(group);

    return {
      label,
      emails: data.emails,
      responses: data.responses,
      meetings: data.meetings,
      wins: data.wins,
      revenue: group.reduce((sum, lead) => sum + Number(lead.closed_value || 0), 0)
    };
  });
}

function renderMetricTable(containerId, rows) {
  $(containerId).innerHTML = `
    <div class="metric-table">
      <div class="metric-row head">
        <div>Segmento</div>
        <div>Emails</div>
        <div>Resp.</div>
        <div>Reun.</div>
        <div>Clientes</div>
        <div>€</div>
      </div>

      ${rows.map(row => `
        <div class="metric-row">
          <div><strong>${escapeHtml(row.label)}</strong></div>
          <div>${row.emails}</div>
          <div>${row.responses} · ${percent(row.responses, row.emails)}</div>
          <div>${row.meetings} · ${percent(row.meetings, row.responses)}</div>
          <div>${row.wins} · ${percent(row.wins, row.meetings)}</div>
          <div>${money(row.revenue)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMetrics() {
  renderMetricTable('countryMetrics', groupMetrics(filteredLeads, 'country', COUNTRIES));
  renderMetricTable('channelMetrics', groupMetrics(filteredLeads, 'contact_channel', CHANNELS));
}

function render() {
  renderDashboard();
  renderFullFunnel();
  renderKanban();
  renderLeads();
  renderSuggestedFollowups();
  renderRelaunch();
  renderClients();
  renderHistory();
  renderMetrics();
  applyTranslations();
}

function switchSection(section) {
  currentSection = section;

  document.querySelectorAll('.section').forEach(el => {
    el.classList.toggle('active', el.id === section);
  });

  document.querySelectorAll('.nav').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  applyTranslations();
}

function openNewLead() {
  $('modalTitle').textContent = 'Nuevo lead';
  $('leadForm').reset();
  $('leadId').value = '';

  $('contactDate').value = today();
  $('lastActivity').value = today();
  $('country').value = 'Francia';
  $('contactChannel').value = 'Email';
  $('emailsSent').value = 1;
  $('status').value = 'Nuevo';
  $('priority').value = 'Media';
  $('interestLevel').value = 'Sin interés';
  $('meetingStatus').value = 'Sin reunión';
  $('proposalStatus').value = 'Sin propuesta';
  $('proposalAmount').value = 1000;
  $('estimatedValue').value = 1000;
  $('closedValue').value = 0;
  $('archived').value = 'false';
  $('leadScore').value = 0;

  $('deleteLeadBtn').classList.add('hidden');
  $('convertClientBtn').classList.add('hidden');

  $('leadDialog').showModal();
}

window.editLead = function(id) {
  const lead = leads.find(item => item.id === id);
  if (!lead) return;

  $('modalTitle').textContent = 'Editar lead';
  $('leadId').value = lead.id;

  $('contactDate').value = lead.contact_date || today();
  $('lastActivity').value = lead.last_activity || lead.contact_date || today();
  $('name').value = lead.name || '';
  $('leadType').value = lead.lead_type || 'Lead';
  $('country').value = lead.country || 'Francia';
  $('location').value = lead.location || '';
  $('companySize').value = lead.company_size || 'No definido';
  $('contactChannel').value = lead.contact_channel || 'Email';
  $('emailsSent').value = lead.emails_sent ?? 1;

  $('status').value = lead.status || 'Nuevo';
  $('priority').value = lead.priority || 'Media';
  $('interestLevel').value = lead.interest_level || 'Sin interés';

  $('response').value = String(!!lead.response);
  $('responseDate').value = lead.response_date || '';
  $('followupDone').value = String(!!lead.followup_done);
  $('followupDate').value = lead.followup_date || '';

  $('meetingDone').value = String(!!lead.meeting_done);
  $('meetingDate').value = lead.meeting_date || '';
  $('meetingStatus').value = lead.meeting_status || 'Sin reunión';

  $('proposalSent').value = String(!!lead.proposal_sent);
  $('proposalDate').value = lead.proposal_date || '';
  $('proposalAmount').value = lead.proposal_amount ?? 1000;
  $('proposalStatus').value = lead.proposal_status || 'Sin propuesta';

  $('estimatedValue').value = lead.estimated_value ?? 1000;
  $('closedValue').value = lead.closed_value ?? 0;
  $('wonDate').value = lead.won_date || '';
  $('lostDate').value = lead.lost_date || '';

  $('rejectionReason').value = lead.rejection_reason || '';
  $('archived').value = String(!!lead.archived);
  $('leadScore').value = lead.lead_score ?? getLeadScore(lead);

  $('nextAction').value = lead.next_action || '';
  $('notes').value = lead.notes || '';
  $('historyText').value = lead.history || '';

  $('deleteLeadBtn').classList.remove('hidden');
  $('convertClientBtn').classList.toggle('hidden', lead.status !== 'Ganado');

  $('leadDialog').showModal();
};

function getLeadFormData() {
  const response = $('response').value === 'true';
  const meetingDone = $('meetingDone').value === 'true';
  const proposalSent = $('proposalSent').value === 'true';
  const status = $('status').value;

  let responseDate = $('responseDate').value || null;
  let followupDate = $('followupDate').value || null;
  let meetingDate = $('meetingDate').value || null;
  let proposalDate = $('proposalDate').value || null;
  let wonDate = $('wonDate').value || null;
  let lostDate = $('lostDate').value || null;

  if (response && !responseDate) responseDate = today();

  if (response && !meetingDone && $('meetingStatus').value !== 'Agendada' && !followupDate) {
    followupDate = addDays(responseDate || today(), 2);
  }

  if (meetingDone && !meetingDate) meetingDate = today();
  if (proposalSent && !proposalDate) proposalDate = today();
  if (status === 'Ganado' && !wonDate) wonDate = today();
  if (status === 'Perdido' && !lostDate) lostDate = today();

  const payload = {
    contact_date: $('contactDate').value || today(),
    last_activity: $('lastActivity').value || today(),

    name: $('name').value.trim(),
    lead_type: $('leadType').value,
    country: $('country').value,
    location: $('location').value.trim(),
    company_size: $('companySize').value,

    contact_channel: $('contactChannel').value,
    emails_sent: Number($('emailsSent').value || 0),

    status,
    priority: $('priority').value,
    interest_level: $('interestLevel').value,
    lead_score: Number($('leadScore').value || 0),

    response,
    response_date: responseDate,

    followup_done: $('followupDone').value === 'true',
    followup_date: followupDate,

    meeting_done: meetingDone,
    meeting_date: meetingDate,
    meeting_status: $('meetingStatus').value,

    proposal_sent: proposalSent,
    proposal_date: proposalDate,
    proposal_amount: Number($('proposalAmount').value || 0),
    proposal_status: $('proposalStatus').value,

    estimated_value: Number($('estimatedValue').value || 0),
    closed_value: Number($('closedValue').value || 0),
    won_date: wonDate,
    lost_date: lostDate,

    rejection_reason: $('rejectionReason').value || null,
    archived: $('archived').value === 'true' || status === 'Perdido',

    next_action: $('nextAction').value.trim(),
    notes: $('notes').value.trim(),
    history: $('historyText').value.trim()
  };

  payload.lead_score = getLeadScore(payload);

  if (status === 'Ganado') {
    payload.archived = false;

    if (!payload.closed_value) {
      payload.closed_value =
        payload.proposal_amount ||
        payload.estimated_value ||
        1000;
    }
  }

  if (status === 'Perdido') {
    payload.archived = true;
  }

  return payload;
}

async function saveLead(event) {
  event.preventDefault();

  const payload = getLeadFormData();

  if (!payload.name) {
    toast('El nombre es obligatorio');
    return;
  }

  const id = $('leadId').value;

  const result = id
    ? await supabaseClient
        .from('leads')
        .update(payload)
        .eq('id', id)
    : await supabaseClient
        .from('leads')
        .insert(payload);

  if (result.error) {
    toast(result.error.message);
    return;
  }

  $('leadDialog').close();
  toast(t('toast_lead_saved'));
  await loadAll();
}

async function deleteLead() {
  const id = $('leadId').value;
  if (!id) return;

  if (!confirm('¿Eliminar este lead definitivamente?')) return;

  const { error } = await supabaseClient
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    toast(error.message);
    return;
  }

  $('leadDialog').close();
  toast('Lead eliminado');
  await loadAll();
}

window.toggleArchiveLead = async function(id) {
  const lead = leads.find(item => item.id === id);
  if (!lead) return;

  const { error } = await supabaseClient
    .from('leads')
    .update({
      archived: !lead.archived,
      last_activity: today()
    })
    .eq('id', id);

  if (error) {
    toast(error.message);
    return;
  }

  toast(lead.archived ? t('toast_lead_unarchived') : t('toast_lead_archived'));
  await loadAll();
};

async function archiveCurrentLead() {
  const id = $('leadId').value;

  if (!id) {
    const current = $('archived').value === 'true';
    $('archived').value = String(!current);
    return;
  }

  await window.toggleArchiveLead(id);
  $('leadDialog').close();
}

window.openClientFromLead = function(id) {
  const lead = leads.find(item => item.id === id);
  if (!lead) return;

  $('clientForm').reset();
  $('clientModalTitle').textContent = 'Convertir lead a cliente';
  $('clientId').value = '';
  $('clientLeadId').value = lead.id;
  $('clientName').value = lead.name || '';
  $('clientCountry').value = lead.country || 'Francia';
  $('clientServices').value = '';
  $('monthlyFee').value = 0;
  $('setupFee').value = lead.closed_value || lead.proposal_amount || lead.estimated_value || 1000;
  $('totalValue').value = lead.closed_value || lead.proposal_amount || lead.estimated_value || 1000;
  $('startDate').value = today();
  $('clientStatus').value = 'Activo';
  $('clientNotes').value = lead.notes || '';
  $('deleteClientBtn').classList.add('hidden');

  $('clientDialog').showModal();
};

function openNewClient() {
  $('clientForm').reset();
  $('clientModalTitle').textContent = 'Nuevo cliente';
  $('clientId').value = '';
  $('clientLeadId').value = '';
  $('clientCountry').value = 'Francia';
  $('monthlyFee').value = 0;
  $('setupFee').value = 0;
  $('totalValue').value = 0;
  $('startDate').value = today();
  $('clientStatus').value = 'Activo';
  $('deleteClientBtn').classList.add('hidden');

  $('clientDialog').showModal();
}

window.editClient = function(id) {
  const client = clients.find(item => item.id === id);
  if (!client) return;

  $('clientModalTitle').textContent = 'Editar cliente';
  $('clientId').value = client.id;
  $('clientLeadId').value = client.lead_id || '';
  $('clientName').value = client.client_name || '';
  $('clientCountry').value = client.country || 'Francia';
  $('clientServices').value = (client.services || []).join(', ');
  $('monthlyFee').value = client.monthly_fee ?? 0;
  $('setupFee').value = client.setup_fee ?? 0;
  $('totalValue').value = client.total_value ?? 0;
  $('startDate').value = client.start_date || '';
  $('endDate').value = client.end_date || '';
  $('clientStatus').value = client.status || 'Activo';
  $('clientNotes').value = client.notes || '';

  $('deleteClientBtn').classList.remove('hidden');

  $('clientDialog').showModal();
};

async function saveClient(event) {
  event.preventDefault();

  const payload = {
    lead_id: $('clientLeadId').value || null,
    client_name: $('clientName').value.trim(),
    country: $('clientCountry').value,
    services: $('clientServices').value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),

    monthly_fee: Number($('monthlyFee').value || 0),
    setup_fee: Number($('setupFee').value || 0),
    total_value: Number($('totalValue').value || 0),

    start_date: $('startDate').value || null,
    end_date: $('endDate').value || null,

    status: $('clientStatus').value,
    notes: $('clientNotes').value.trim()
  };

  if (!payload.client_name) {
    toast('Nombre cliente obligatorio');
    return;
  }

  const id = $('clientId').value;

  const result = id
    ? await supabaseClient.from('clients').update(payload).eq('id', id)
    : await supabaseClient.from('clients').insert(payload);

  if (result.error) {
    toast(result.error.message);
    return;
  }

  $('clientDialog').close();
  toast(t('toast_client_saved'));
  await loadAll();
}

async function deleteClient() {
  const id = $('clientId').value;
  if (!id) return;

  if (!confirm('¿Eliminar cliente?')) return;

  const { error } = await supabaseClient
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    toast(error.message);
    return;
  }

  $('clientDialog').close();
  toast('Cliente eliminado');
  await loadAll();
}

function exportCSV() {
  const type = $('exportType').value;

  let rows = [];
  let filename = `crm_${type}_${today()}.csv`;

  if (type === 'clients') {
    rows = clients.map(client => ({
      nombre: client.client_name,
      pais: client.country,
      servicios: (client.services || []).join(', '),
      fee_mensual: client.monthly_fee,
      setup: client.setup_fee,
      valor_total: client.total_value,
      inicio: client.start_date,
      fin: client.end_date,
      estado: client.status,
      notas: client.notes
    }));
  } else {
    let source = filteredLeads;

    if (type === 'active') source = leads.filter(l => !l.archived && l.status !== 'Perdido');
    if (type === 'responded') source = leads.filter(l => l.response);
    if (type === 'no_response') source = leads.filter(l => !l.response && !l.archived);
    if (type === 'meetings') source = leads.filter(l => l.meeting_done || l.meeting_status === 'Agendada' || l.meeting_status === 'Realizada');
    if (type === 'won') source = leads.filter(l => l.status === 'Ganado');
    if (type === 'lost') source = leads.filter(l => l.status === 'Perdido');
    if (type === 'archived') source = leads.filter(l => l.archived);

    rows = source.map(lead => ({
      fecha_contacto: lead.contact_date,
      ultima_actividad: lead.last_activity,
      nombre: lead.name,
      tipo: lead.lead_type,
      pais: lead.country,
      ubicacion: lead.location,
      canal: lead.contact_channel,
      emails_enviados: lead.emails_sent,
      respuesta: lead.response ? 'Sí' : 'No',
      fecha_respuesta: lead.response_date,
      interes: lead.interest_level,
      reunion: lead.meeting_done ? 'Sí' : 'No',
      fecha_reunion: lead.meeting_date,
      estado_reunion: lead.meeting_status,
      propuesta: lead.proposal_sent ? 'Sí' : 'No',
      monto_propuesta: lead.proposal_amount,
      estado_propuesta: lead.proposal_status,
      estado: lead.status,
      valor_potencial: lead.estimated_value,
      valor_cerrado: lead.closed_value,
      archivado: lead.archived ? 'Sí' : 'No',
      motivo_rechazo: lead.rejection_reason,
      notas: lead.notes,
      historial: lead.history
    }));
  }

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

async function importCSV() {
  const file = $('csvFile').files[0];

  if (!file) {
    toast(t('toast_select_csv'));
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async results => {
      const rows = results.data.map(row => ({
        contact_date: parseDate(row.contact_date || row.fecha_contacto || row.fecha) || today(),
        last_activity: today(),
        name: row.name || row.nombre || '',
        country: row.country || row.pais || 'Francia',
        location: row.location || row.ubicacion || '',
        contact_channel: row.contact_channel || row.canal || 'Email',
        emails_sent: Number(row.emails_sent || row.emails || 1),
        status: row.status || row.estado || 'Nuevo',
        priority: row.priority || 'Media',
        response: normalizeBool(row.response || row.respuesta),
        interest_level: row.interest_level || row.interes || 'Sin interés',
        estimated_value: Number(row.estimated_value || row.valor || 1000),
        notes: row.notes || row.notas || ''
      })).filter(row => row.name);

      const { error } = await supabaseClient.from('leads').insert(rows);

      if (error) {
        toast(error.message);
        return;
      }

      $('importDialog').close();
      toast(`${rows.length} ${t('toast_imported')}`);
      await loadAll();
    }
  });
}

function setupFilters() {
  [
    'searchInput',
    'countryFilter',
    'locationFilter',
    'dateFromFilter',
    'dateToFilter',
    'dateFieldFilter',
    'statusFilter',
    'channelFilter',
    'interestFilter',
    'viewMode'
  ].forEach(id => {
    if (!$(id)) return;
    $(id).addEventListener('input', applyFilters);
    $(id).addEventListener('change', applyFilters);
  });
}

function setupNavigation() {
  document.querySelectorAll('.nav').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.section);
    });
  });
}

function setupButtons() {
  $('openLeadBtn').onclick = openNewLead;
  $('openClientBtn').onclick = openNewClient;
  $('refreshBtn').onclick = loadAll;
  $('exportBtn').onclick = exportCSV;

  if ($('saveGoalsBtn')) {
    $('saveGoalsBtn').onclick = saveGoals;
  }

  if ($('languageSelect')) {
    $('languageSelect').value = currentLanguage;
    $('languageSelect').onchange = event => {
      setLanguage(event.target.value);
    };
  }

  $('openImportBtn').onclick = () => $('importDialog').showModal();
  $('closeImportBtn').onclick = () => $('importDialog').close();
  $('cancelImportBtn').onclick = () => $('importDialog').close();
  $('importBtn').onclick = () => importCSV();

  $('closeLeadBtn').onclick = () => $('leadDialog').close();
  $('cancelLeadBtn').onclick = () => $('leadDialog').close();

  $('closeClientBtn').onclick = () => $('clientDialog').close();
  $('cancelClientBtn').onclick = () => $('clientDialog').close();

  $('leadForm').addEventListener('submit', saveLead);
  $('clientForm').addEventListener('submit', saveClient);

  $('deleteLeadBtn').onclick = deleteLead;
  $('deleteClientBtn').onclick = deleteClient;
  $('archiveLeadBtn').onclick = archiveCurrentLead;

  $('convertClientBtn').onclick = () => {
    const id = $('leadId').value;
    $('leadDialog').close();
    window.openClientFromLead(id);
  };
}

function setupDropdowns() {
  fillSelect($('countryFilter'), COUNTRIES, t('all'));
  fillSelect($('statusFilter'), STATUSES, t('all'));
  fillSelect($('channelFilter'), CHANNELS, t('all'));
  fillSelect($('interestFilter'), INTEREST_LEVELS, t('all'));

  fillSelect($('country'), COUNTRIES);
  fillSelect($('clientCountry'), COUNTRIES);

  fillSelect($('contactChannel'), CHANNELS);
  fillSelect($('status'), STATUSES);
  fillSelect($('interestLevel'), INTEREST_LEVELS);
  fillSelect($('meetingStatus'), MEETING_STATUSES);
  fillSelect($('proposalStatus'), PROPOSAL_STATUSES);
  fillSelect($('companySize'), COMPANY_SIZES);
  fillSelect($('rejectionReason'), REJECTION_REASONS);
}

async function init() {
  setupDropdowns();
  setupFilters();
  setupNavigation();
  setupButtons();

  switchSection('dashboard');
  applyTranslations();

  await loadAll();

  console.log('CRM listo V4');
}

document.addEventListener('DOMContentLoaded', init);
