const SUPABASE_URL = 'https://qymfcrginsxemxmyujvr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iXUK6jm_JshRc_fOixTSpA_gWzlRrRX';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COUNTRIES = ['Francia','Bélgica','Suiza'];
const CHANNELS = ['Email','WhatsApp','LinkedIn','Formulario web'];
const STATUSES = ['Nuevo','Contactado','Respondió','Interesado','Reunión agendada','Reunión hecha','Propuesta enviada','Ganado','Perdido','Relanzar'];
const MEETING_STATUSES = ['Sin reunión','Agendada','Realizada','No asistió','Reprogramar','Ganada','Perdida'];

let leads = [];
let filtered = [];

const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);

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
    option.textContent = value;
    el.appendChild(option);
  });
}

function boolText(value) {
  return value ? 'Sí' : 'No';
}

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  setTimeout(() => $('toast').classList.add('hidden'), 2600);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>'"]/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    "'":'&#39;',
    '"':'&quot;'
  }[c]));
}

function normalizeBool(value) {
  if (typeof value === 'boolean') return value;
  const s = String(value || '').toLowerCase().trim();
  return ['si','sí','true','1','yes','x'].includes(s);
}

function parseDate(value) {
  if (!value) return null;
  const d = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

  const match = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const yyyy = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${yyyy}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`;
  }

  return null;
}

function isDue(lead) {
  return lead.followup_date && !lead.followup_done && lead.followup_date <= today();
}

async function loadLeads() {
  const { data, error } = await supabaseClient
    .from('leads')
    .select('*')
    .order('contact_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    toast('Error cargando datos: ' + error.message);
    return;
  }

  leads = data || [];
  applyFilters();
}

function applyFilters() {
  const q = $('searchInput').value.toLowerCase().trim();
  const country = $('countryFilter').value;
  const status = $('statusFilter').value;
  const channel = $('channelFilter').value;
  const response = $('responseFilter').value;
  const meeting = $('meetingFilter').value;
  const followup = $('followupFilter').value;

  filtered = leads.filter(lead => {
    const text = [
      lead.name,
      lead.country,
      lead.location,
      lead.contact_channel,
      lead.status,
      lead.priority,
      lead.meeting_status,
      lead.next_action,
      lead.notes,
      lead.history
    ].join(' ').toLowerCase();

    if (q && !text.includes(q)) return false;
    if (country !== 'all' && lead.country !== country) return false;
    if (status !== 'all' && lead.status !== status) return false;
    if (channel !== 'all' && lead.contact_channel !== channel) return false;
    if (response !== 'all' && String(!!lead.response) !== response) return false;
    if (meeting !== 'all' && String(!!lead.meeting_done) !== meeting) return false;
    if (followup === 'due' && !isDue(lead)) return false;
    if (followup === 'pending' && !(lead.followup_date && !lead.followup_done && lead.followup_date > today())) return false;
    if (followup === 'done' && !lead.followup_done) return false;

    return true;
  });

  render();
}

function renderStats() {
  const total = leads.length;
  const responses = leads.filter(l => l.response).length;
  const meetings = leads.filter(l => l.meeting_done).length;
  const due = leads.filter(isDue).length;

  $('statTotal').textContent = total;
  $('statResponses').textContent = responses;
  $('statMeetings').textContent = meetings;
  $('statDue').textContent = due;
  $('statResponseRate').textContent = total ? Math.round(responses / total * 100) + '%' : '0%';
  $('statMeetingRate').textContent = total ? Math.round(meetings / total * 100) + '%' : '0%';
}

function renderDue() {
  const due = leads
    .filter(isDue)
    .sort((a,b) => String(a.followup_date).localeCompare(String(b.followup_date)));

  $('dueCounter').textContent = `${due.length} pendientes`;

  $('dueList').innerHTML = due.slice(0,6).map(lead => `
    <div class="due-item">
      <strong>${escapeHtml(lead.name)}</strong>
      <p>${lead.followup_date} · ${escapeHtml(lead.country || '')} · ${escapeHtml(lead.contact_channel || '')}</p>
      <p>${escapeHtml(lead.next_action || lead.notes || 'Sin próxima acción')}</p>
    </div>
  `).join('') || '<p class="notes">No hay relanzamientos vencidos para hoy.</p>';
}

function badge(value, cls = '') {
  return `<span class="badge ${cls}">${value}</span>`;
}

function renderCards() {
  $('cardsView').innerHTML = filtered.map(lead => `
    <article class="card">
      <div class="card-head">
        <div>
          <h3>${escapeHtml(lead.name)}</h3>
          <div>${badge(escapeHtml(lead.status || 'Nuevo'))} ${badge(escapeHtml(lead.priority || 'Media'))}</div>
        </div>
        ${isDue(lead) ? badge('Relanzar hoy','warn') : ''}
      </div>

      <div class="meta">
        <div><span>Fecha</span>${lead.contact_date || '-'}</div>
        <div><span>País</span>${escapeHtml(lead.country || '-')}</div>
        <div><span>Ubicación</span>${escapeHtml(lead.location || '-')}</div>
        <div><span>Vía</span>${escapeHtml(lead.contact_channel || '-')}</div>
        <div><span>Respuesta</span>${badge(boolText(lead.response), lead.response ? 'ok' : '')}</div>
        <div><span>Reunión</span>${badge(boolText(lead.meeting_done), lead.meeting_done ? 'ok' : '')}</div>
        <div><span>Relanzamiento</span>${lead.followup_date || '-'}</div>
        <div><span>Estado reunión</span>${escapeHtml(lead.meeting_status || '-')}</div>
      </div>

      <p class="notes">${escapeHtml(lead.notes || 'Sin notas')}</p>

      <div class="card-actions">
        <button class="btn secondary" onclick="editLead('${lead.id}')">Editar</button>
      </div>
    </article>
  `).join('') || '<p class="notes">No hay leads con estos filtros.</p>';
}

function renderTable() {
  $('tableBody').innerHTML = filtered.map(lead => `
    <tr>
      <td>${lead.contact_date || ''}</td>
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.country || '')}</td>
      <td>${escapeHtml(lead.location || '')}</td>
      <td>${escapeHtml(lead.contact_channel || '')}</td>
      <td>${boolText(lead.response)}</td>
      <td>${lead.followup_date || ''}</td>
      <td>${boolText(lead.meeting_done)}</td>
      <td>${escapeHtml(lead.status || '')}</td>
      <td>${escapeHtml(lead.priority || '')}</td>
      <td><button class="btn secondary" onclick="editLead('${lead.id}')">Editar</button></td>
    </tr>
  `).join('');
}

function render() {
  renderStats();
  renderDue();
  renderCards();
  renderTable();

  $('resultCount').textContent = `${filtered.length} resultados`;

  const mode = $('viewMode').value;
  $('cardsView').classList.toggle('hidden', mode !== 'cards');
  $('tableView').classList.toggle('hidden', mode !== 'table');
}

function openNew() {
  $('modalTitle').textContent = 'Nuevo lead';
  $('leadForm').reset();
  $('leadId').value = '';
  $('contactDate').value = today();
  $('country').value = 'Francia';
  $('contactChannel').value = 'Email';
  $('status').value = 'Nuevo';
  $('priority').value = 'Media';
  $('meetingStatus').value = 'Sin reunión';
  $('deleteLeadBtn').classList.add('hidden');
  $('leadDialog').showModal();
}

window.editLead = function(id) {
  const lead = leads.find(x => x.id === id);
  if (!lead) return;

  $('modalTitle').textContent = 'Editar lead';
  $('leadId').value = lead.id;
  $('contactDate').value = lead.contact_date || '';
  $('name').value = lead.name || '';
  $('country').value = lead.country || 'Francia';
  $('location').value = lead.location || '';
  $('contactChannel').value = lead.contact_channel || 'Email';
  $('status').value = lead.status || 'Nuevo';
  $('priority').value = lead.priority || 'Media';
  $('response').value = String(!!lead.response);
  $('followupDone').value = String(!!lead.followup_done);
  $('followupDate').value = lead.followup_date || '';
  $('meetingDone').value = String(!!lead.meeting_done);
  $('meetingStatus').value = lead.meeting_status || 'Sin reunión';
  $('nextAction').value = lead.next_action || '';
  $('notes').value = lead.notes || '';
  $('historyText').value = lead.history || '';
  $('deleteLeadBtn').classList.remove('hidden');

  $('leadDialog').showModal();
};

function getFormData() {
  return {
    contact_date: $('contactDate').value || today(),
    name: $('name').value.trim(),
    country: $('country').value,
    location: $('location').value.trim(),
    contact_channel: $('contactChannel').value,
    status: $('status').value,
    priority: $('priority').value,
    response: $('response').value === 'true',
    followup_done: $('followupDone').value === 'true',
    followup_date: $('followupDate').value || null,
    meeting_done: $('meetingDone').value === 'true',
    meeting_status: $('meetingStatus').value,
    next_action: $('nextAction').value.trim(),
    notes: $('notes').value.trim(),
    history: $('historyText').value.trim()
  };
}

async function saveLead(event) {
  event.preventDefault();

  const payload = getFormData();

  if (!payload.name) {
    toast('El nombre es obligatorio');
    return;
  }

  const id = $('leadId').value;

  const result = id
    ? await supabaseClient.from('leads').update(payload).eq('id', id)
    : await supabaseClient.from('leads').insert(payload);

  if (result.error) {
    toast('Error guardando: ' + result.error.message);
    return;
  }

  $('leadDialog').close();
  toast('Lead guardado');
  await loadLeads();
}

async function deleteLead() {
  const id = $('leadId').value;

  if (!id || !confirm('¿Eliminar este lead?')) return;

  const { error } = await supabaseClient.from('leads').delete().eq('id', id);

  if (error) {
    toast('Error eliminando: ' + error.message);
    return;
  }

  $('leadDialog').close();
  toast('Lead eliminado');
  await loadLeads();
}

function exportCsv() {
  const rows = filtered.map(lead => ({
    fecha: lead.contact_date,
    nombre: lead.name,
    pais: lead.country,
    ubicacion: lead.location,
    via: lead.contact_channel,
    estado: lead.status,
    prioridad: lead.priority,
    respuesta: boolText(lead.response),
    hubo_relanzamiento: boolText(lead.followup_done),
    fecha_relanzamiento: lead.followup_date,
    reunion: boolText(lead.meeting_done),
    estado_reunion: lead.meeting_status,
    proxima_accion: lead.next_action,
    notas: lead.notes,
    historial: lead.history
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `crm_export_${today()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

async function importCsv() {
  const file = $('csvFile').files[0];

  if (!file) {
    toast('Elegí un archivo CSV');
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async ({ data }) => {
      const payload = data.map(row => {
        const get = (...keys) => {
          for (const key of keys) {
            const found = Object.keys(row).find(x => x.toLowerCase().trim() === key);
            if (found) return row[found];
          }
          return '';
        };

        const countryRaw = get('pais','país','country') || 'Francia';
        const country = COUNTRIES.find(c => countryRaw.toLowerCase().includes(c.toLowerCase().slice(0,5))) || 'Francia';

        const channelRaw = get('via','vía','via de contacto','vía de contacto','contact_channel','canal') || 'Email';
        const channel = CHANNELS.find(c => channelRaw.toLowerCase().includes(c.toLowerCase().split(' ')[0])) || 'Email';

        return {
          contact_date: parseDate(get('fecha','fecha de contacto','contact_date')) || today(),
          name: get('nombre','name').trim(),
          country,
          location: get('ubicacion','ubicación','location'),
          contact_channel: channel,
          status: get('estado','status') || 'Nuevo',
          priority: get('prioridad','priority') || 'Media',
          response: normalizeBool(get('respuesta','respondio','respondió','response')),
          followup_done: normalizeBool(get('hubo relanzamiento','relanzamiento','followup_done')),
          followup_date: parseDate(get('fecha relanzamiento','fecha de relanzamiento','followup_date')),
          meeting_done: normalizeBool(get('reunion','reunión','meeting_done')),
          meeting_status: get('estado reunion','estado reunión','meeting_status') || 'Sin reunión',
          next_action: get('proxima accion','próxima acción','next_action'),
          notes: get('notas','notes'),
          history: get('historial','history')
        };
      }).filter(x => x.name);

      if (!payload.length) {
        toast('No encontré filas válidas con nombre');
        return;
      }

      const { error } = await supabaseClient.from('leads').insert(payload);

      if (error) {
        toast('Error importando: ' + error.message);
        return;
      }

      $('importDialog').close();
      toast(`${payload.length} leads importados`);
      await loadLeads();
    }
  });
}

function init() {
  fillSelect($('country'), COUNTRIES);
  fillSelect($('countryFilter'), COUNTRIES, 'Todos');
  fillSelect($('contactChannel'), CHANNELS);
  fillSelect($('channelFilter'), CHANNELS, 'Todas');
  fillSelect($('status'), STATUSES);
  fillSelect($('statusFilter'), STATUSES, 'Todos');
  fillSelect($('meetingStatus'), MEETING_STATUSES);

  $('openLeadBtn').onclick = openNew;
  $('refreshBtn').onclick = loadLeads;
  $('exportBtn').onclick = exportCsv;
  $('openImportBtn').onclick = () => $('importDialog').showModal();
  $('closeLeadBtn').onclick = () => $('leadDialog').close();
  $('cancelLeadBtn').onclick = () => $('leadDialog').close();
  $('closeImportBtn').onclick = () => $('importDialog').close();
  $('cancelImportBtn').onclick = () => $('importDialog').close();
  $('leadForm').addEventListener('submit', saveLead);
  $('deleteLeadBtn').onclick = deleteLead;
  $('importBtn').onclick = importCsv;

  [
    'searchInput',
    'countryFilter',
    'statusFilter',
    'channelFilter',
    'responseFilter',
    'meetingFilter',
    'followupFilter',
    'viewMode'
  ].forEach(id => $(id).addEventListener('input', applyFilters));

  loadLeads();
}

init();
