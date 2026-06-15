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

const $ = id => document.getElementById(id);

function today() {
  return new Date().toISOString().slice(0, 10);
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
  ) return 'Caliente';

  if (lead.response || lead.interest_level === 'Interés medio' || lead.status === 'Respondió' || lead.status === 'Interesado') {
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

function activeLeads() {
  return filteredLeads.filter(lead => !lead.archived && lead.status !== 'Perdido');
}

function archivedLeads() {
  return filteredLeads.filter(lead => lead.archived || lead.status === 'Perdido');
}

function wonLeads() {
  return leads.filter(lead => lead.status === 'Ganado');
}

function activeClients() {
  return clients.filter(client => client.status === 'Activo');
}

function funnelData(sourceLeads = leads) {
  const notArchivedForSales = sourceLeads.filter(lead => lead.status !== 'Perdido');

  const emails = sourceLeads.reduce((sum, lead) => sum + Number(lead.emails_sent || 0), 0);
  const responses = sourceLeads.filter(lead => lead.response).length;
  const meetings = sourceLeads.filter(lead => lead.meeting_done || lead.meeting_status === 'Agendada' || lead.meeting_status === 'Realizada').length;
  const proposals = sourceLeads.filter(lead => lead.proposal_sent || lead.status === 'Propuesta enviada').length;
  const wins = sourceLeads.filter(lead => lead.status === 'Ganado').length;

  const revenueFromClients = clients.reduce((sum, client) => {
    return sum + Number(client.total_value || client.setup_fee || 0) + Number(client.monthly_fee || 0);
  }, 0);

  const revenueFromLeads = sourceLeads.reduce((sum, lead) => {
    return sum + Number(lead.closed_value || 0);
  }, 0);

  return {
    emails,
    responses,
    meetings,
    proposals,
    wins,
    revenue: revenueFromClients + revenueFromLeads,
    activePipeline: notArchivedForSales.reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0)
  };
}

function renderDashboard() {
  const data = funnelData(leads);

  $('kpiEmails').textContent = data.emails;
  $('kpiResponses').textContent = data.responses;
  $('kpiMeetings').textContent = data.meetings;
  $('kpiProposals').textContent = data.proposals;
  $('kpiClients').textContent = data.wins + activeClients().length;
  $('kpiRevenue').textContent = money(data.revenue);

  renderFunnel('miniFunnel', data);
  renderAlerts();
}

function renderFunnel(containerId, data = funnelData(leads)) {
  const max = Math.max(data.emails, data.responses, data.meetings, data.proposals, data.wins, 1);

  const steps = [
    {
      label: 'Emails enviados',
      value: data.emails,
      rate: 'Base'
    },
    {
      label: 'Respuestas',
      value: data.responses,
      rate: percent(data.responses, data.emails)
    },
    {
      label: 'Reuniones',
      value: data.meetings,
      rate: percent(data.meetings, data.responses)
    },
    {
      label: 'Propuestas',
      value: data.proposals,
      rate: percent(data.proposals, data.meetings)
    },
    {
      label: 'Clientes',
      value: data.wins,
      rate: percent(data.wins, data.meetings)
    }
  ];

  $(containerId).innerHTML = steps.map(step => {
    const width = Math.max((step.value / max) * 100, step.value ? 8 : 4);

    return `
      <div class="funnel-step">
        <div class="funnel-label">${step.label}</div>
        <div class="funnel-bar-wrap">
          <div class="funnel-bar" style="width:${width}%">${step.value}</div>
        </div>
        <div class="funnel-rate">${step.rate}</div>
      </div>
    `;
  }).join('');
}

function renderFullFunnel() {
  const data = funnelData(filteredLeads);

  $('funnelSummary').textContent =
    `Respuesta ${percent(data.responses, data.emails)} · Reunión ${percent(data.meetings, data.responses)} · Cierre ${percent(data.wins, data.meetings)}`;

  renderFunnel('fullFunnel', data);
}

function renderAlerts() {
  const suggested = leads.filter(isSuggestedFollowup).length;
  const relaunch = leads.filter(isRelaunchDue).length;
  const hot = leads.filter(lead => !lead.archived && leadTemperature(lead) === 'Caliente').length;
  const archived = leads.filter(lead => lead.archived).length;

  const items = [
    {
      title: `${suggested} seguimientos sugeridos`,
      text: 'Leads que respondieron, no tienen reunión y necesitan seguimiento a los 2 días.'
    },
    {
      title: `${relaunch} relanzamientos pendientes`,
      text: 'Leads sin respuesta con fecha de relanzamiento vencida o para hoy.'
    },
    {
      title: `${hot} leads calientes`,
      text: 'Contactos con interés alto, reunión, propuesta o señales fuertes de compra.'
    },
    {
      title: `${archived} leads en histórico`,
      text: 'Leads archivados por falta de respuesta o estado perdido.'
    }
  ];

  $('alertsBox').innerHTML = items.map(item => `
    <div class="alert">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.text)}</p>
    </div>
  `).join('');
}

function renderLeadCard(lead, options = {}) {
  const isArchiveView = options.archiveView || false;

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
        <div><span>Fecha contacto</span>${lead.contact_date || '-'}</div>
        <div><span>Última actividad</span>${lead.last_activity || '-'}</div>
        <div><span>País</span>${escapeHtml(lead.country || '-')}</div>
        <div><span>Ubicación</span>${escapeHtml(lead.location || '-')}</div>
        <div><span>Vía</span>${escapeHtml(lead.contact_channel || '-')}</div>
        <div><span>Emails</span>${Number(lead.emails_sent || 0)}</div>
        <div><span>Valor potencial</span>${money(lead.estimated_value)}</div>
        <div><span>Valor cerrado</span>${money(lead.closed_value)}</div>
      </div>

      <p class="notes">${escapeHtml(lead.notes || 'Sin notas')}</p>

      <div class="card-actions">
        ${lead.status === 'Ganado' ? `<button class="btn gold-btn" onclick="openClientFromLead('${lead.id}')">Convertir a cliente</button>` : ''}
        <button class="btn secondary" onclick="editLead('${lead.id}')">Editar</button>
        <button class="btn ghost" onclick="toggleArchiveLead('${lead.id}')">${lead.archived ? 'Desarchivar' : 'Archivar'}</button>
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

  $('cardsView').innerHTML = source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay leads activos con estos filtros.</p>';

  renderLeadTable(source);

  const mode = $('viewMode').value;
  $('cardsView').classList.toggle('hidden', mode !== 'cards');
  $('tableView').classList.toggle('hidden', mode !== 'table');
}

function renderSuggestedFollowups() {
  const source = filteredLeads
    .filter(isSuggestedFollowup)
    .sort((a, b) => String(a.response_date || a.last_activity || '').localeCompare(String(b.response_date || b.last_activity || '')));

  $('followupCount').textContent = `${source.length} pendientes`;
  $('followupList').innerHTML = source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay seguimientos sugeridos.</p>';
}

function renderRelaunch() {
  const source = filteredLeads
    .filter(isRelaunchDue)
    .sort((a, b) => String(a.followup_date || '').localeCompare(String(b.followup_date || '')));

  $('relaunchCount').textContent = `${source.length} pendientes`;
  $('relaunchList').innerHTML = source.map(lead => renderLeadCard(lead)).join('') ||
    '<p class="notes">No hay relanzamientos vencidos.</p>';
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
        <div><span>Servicios</span>${escapeHtml((client.services || []).join(', ') || '-')}</div>
        <div><span>Fee mensual</span>${money(client.monthly_fee)}</div>
        <div><span>Setup</span>${money(client.setup_fee)}</div>
        <div><span>Total</span>${money(client.total_value)}</div>
        <div><span>Inicio</span>${client.start_date || '-'}</div>
        <div><span>Fin</span>${client.end_date || '-'}</div>
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
  $('historyGrid').innerHTML = source.map(lead => renderLeadCard(lead, { archiveView: true })).join('') ||
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
  renderLeads();
  renderSuggestedFollowups();
  renderRelaunch();
  renderClients();
  renderHistory();
  renderMetrics();
}

function switchSection(section) {
  currentSection = section;

  document.querySelectorAll('.section').forEach(el => {
    el.classList.toggle('active', el.id === section);
  });

  document.querySelectorAll('.nav').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  const titles = {
    dashboard: 'Dashboard',
    funnel: 'Embudo',
    leads: 'Leads activos',
    followups: 'Seguimientos sugeridos',
    relaunch: 'Relanzamientos',
    clients: 'Clientes',
    history: 'Histórico',
    metrics: 'Métricas'
  };

  $('pageTitle').textContent = titles[section] || 'CRM';
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
  const existingId = $('leadId').value;
  const existingLead = existingId ? leads.find(lead => lead.id === existingId) : null;

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
    if (!payload.closed_value) payload.closed_value = payload.proposal_amount || payload.estimated_value || 1000;
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
    ? await supabaseClient.from('leads').update(payload).eq('id', id)
    : await supabaseClient.from('leads').insert(payload);

  if (result.error) {
    toast('Error guardando lead: ' + result.error.message);
    return;
  }

  $('leadDialog').close();
  toast('Lead guardado');
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
    toast('Error eliminando lead: ' + error.message);
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
    toast('Error actualizando archivo: ' + error.message);
    return;
  }

  toast(lead.archived ? 'Lead desarchivado' : 'Lead archivado');
  await loadAll();
};

async function archiveCurrentLead() {
  const id = $('leadId').value;

  if (!id) {
    const current = $('archived').value === 'true';
    $('archived').value = String(!current);
    toast(!current ? 'Marcado como archivado' : 'Marcado como activo');
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
    toast('Error guardando cliente: ' + result.error.message);
    return;
  }

  $('clientDialog').close();
  toast('Cliente guardado');
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
    toast('Error eliminando cliente');
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
async function importCSV() {
  const file = $('csvFile').files[0];

  if (!file) {
    toast('Seleccioná un CSV');
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
      toast(`${rows.length} leads importados`);
      await loadAll();
    }
  });
}
function setupButtons() {
  $('openLeadBtn').onclick = openNewLead;
  $('openClientBtn').onclick = openNewClient;

  $('refreshBtn').onclick = loadAll;
  $('exportBtn').onclick = exportCSV;

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
  fillSelect($('countryFilter'), COUNTRIES, 'Todos');
  fillSelect($('statusFilter'), STATUSES, 'Todos');
  fillSelect($('channelFilter'), CHANNELS, 'Todos');
  fillSelect($('interestFilter'), INTEREST_LEVELS, 'Todos');

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

  await loadAll();

  console.log('CRM listo');
}

document.addEventListener('DOMContentLoaded', init);
