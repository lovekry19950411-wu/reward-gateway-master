import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import gatewayAudit from './api/gateway/audit.js';
import gatewayEvent from './api/gateway/event.js';
import gatewayMember from './api/gateway/member.js';
import gatewayReward from './api/gateway/reward.js';

loadDotEnv();

const PORT = Number(process.env.PORT || 3000);
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appbYPgnacH3fK7fs';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

const TABLES = {
  users: 'tblyech4Bk4BTga02',
  tasks: 'tblscgHtLqgVX9hd9',
  lottery: 'tblJ4oHcIzBwqDxZj',
  tokenomics: 'tblHICS6hSCqNtn12',
  loans: 'tblqsVs9BhYDKlVzQ',
  transactions: 'tbla02cOYOSQThxwo'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function loadDotEnv() {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, securityHeaders({ 'Content-Type': 'application/json; charset=utf-8' }));
  res.end(JSON.stringify(payload));
}

function securityHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    ...extra
  };
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      const error = new Error('Request body is too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function assertRequired(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length > 0) {
    const error = new Error(`Missing required field(s): ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

function requireAirtableConfig() {
  if (!AIRTABLE_PAT) {
    const error = new Error('AIRTABLE_PAT is missing. Copy .env.example to .env and fill in your token.');
    error.status = 500;
    throw error;
  }
}

async function createAirtableRecord(tableId, fields) {
  requireAirtableConfig();

  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Airtable request failed');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function listAirtableRecords(tableId, maxRecords = 10) {
  requireAirtableConfig();

  const params = new URLSearchParams({
    maxRecords: String(maxRecords),
    pageSize: String(maxRecords)
  });

  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Airtable list request failed');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data.records || [];
}

async function handleApi(req, res, path) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, securityHeaders());
    res.end();
    return;
  }

  if (req.method === 'GET' && path === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      baseId: AIRTABLE_BASE_ID,
      hasAirtableToken: Boolean(AIRTABLE_PAT)
    });
    return;
  }

  const gatewayRoutes = {
    '/api/gateway/audit': gatewayAudit,
    '/api/gateway/event': gatewayEvent,
    '/api/gateway/member': gatewayMember,
    '/api/gateway/reward': gatewayReward
  };

  if (gatewayRoutes[path]) {
    await gatewayRoutes[path](req, res);
    return;
  }

  if (req.method === 'GET' && path === '/api/audit') {
    const [users, tasks, lottery, tokenomics, loans, transactions] = await Promise.all([
      listAirtableRecords(TABLES.users),
      listAirtableRecords(TABLES.tasks),
      listAirtableRecords(TABLES.lottery),
      listAirtableRecords(TABLES.tokenomics),
      listAirtableRecords(TABLES.loans),
      listAirtableRecords(TABLES.transactions)
    ]);

    sendJson(res, 200, {
      checkedAt: new Date().toISOString(),
      baseId: AIRTABLE_BASE_ID,
      tables: {
        users: { tableId: TABLES.users, count: users.length, records: users },
        tasks: { tableId: TABLES.tasks, count: tasks.length, records: tasks },
        lottery: { tableId: TABLES.lottery, count: lottery.length, records: lottery },
        tokenomics: { tableId: TABLES.tokenomics, count: tokenomics.length, records: tokenomics },
        loans: { tableId: TABLES.loans, count: loans.length, records: loans },
        transactions: { tableId: TABLES.transactions, count: transactions.length, records: transactions }
      }
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody(req);

  if (path === '/api/world-id/register') {
    assertRequired(body, ['nullifierHash']);
    const record = await createAirtableRecord(TABLES.users, {
      fld8EEakjjyFhGGeL: body.nullifierHash,
      fldJphRqvzx5r4imY: body.walletAddress || '',
      fldZHc3I2ekKgttEv: 'selyU9MPx7BH0fcUU',
      fldZtaIA3AqP3SaCR: new Date().toISOString()
    });
    sendJson(res, 201, record);
    return;
  }

  if (path === '/api/tasks/complete') {
    assertRequired(body, ['userRecordId', 'taskName']);
    const record = await createAirtableRecord(TABLES.tasks, {
      fld2Ez2qpe5o4fRqC: body.taskName,
      fldwIwY2L91QNtwWU: body.taskTypeSelectId || 'selLH5kwJi6IIm3IA',
      fldJj31Xp157kzgw3: body.statusSelectId || 'selzosyycqzfIaoEq',
      fldU5zrzjrzKdRxI8: Number(body.rewardPoints || 100),
      fldYLH7Bif2DD4TEu: Number(body.rewardTokens || 50),
      fldAMhU1isbMNoWua: [body.userRecordId],
      fldOEcRUG7HTcddZb: new Date().toISOString()
    });
    sendJson(res, 201, record);
    return;
  }

  if (path === '/api/lottery/deposit') {
    assertRequired(body, ['userRecordId', 'poolName', 'savingsAmount', 'ticketCount']);
    const record = await createAirtableRecord(TABLES.lottery, {
      fldItuIYrxSnptEAI: body.poolName,
      fld8yqdP9Gkmoatri: [body.userRecordId],
      fld36S19SGFtkgAmH: Number(body.savingsAmount),
      fld0yiIjNc8VKNnWY: Number(body.ticketCount),
      fldD3ZhOT9ee4QtHD: body.winStatusSelectId || 'seltcjyO5rRxwiVBF',
      flddgBaRaBHZ3sHpT: new Date().toISOString()
    });
    sendJson(res, 201, record);
    return;
  }

  if (path === '/api/loans/create') {
    assertRequired(body, ['userRecordId', 'walletAddress', 'collateralValue', 'amount', 'txHash']);
    const loanOrderId = body.loanOrderId || `LOAN-${Date.now()}`;

    const loan = await createAirtableRecord(TABLES.loans, {
      fld5e4EKuszXC4C4b: loanOrderId,
      fldWmrTW35pCZMrBX: [body.userRecordId],
      fldeDNoKtKbxUZPr6: body.walletAddress,
      fldaiY4H7Ae31BXxA: body.collateralAssetSelectId || 'selarEOqUNT7Opc5M',
      fldD8oEegWx7lqCWQ: Number(body.collateralValue),
      fld902Z56zVeu2SRm: body.borrowAssetSelectId || 'selt7tEIXipp4Lda6',
      fld2icUJi21Ws14HQ: Number(body.liquidationLine || 75),
      fldiucgr2UfdyOaGn: Number(body.interestRate || 0.08),
      fldZNCa0UmfclZEKe: body.repaymentStatusSelectId || 'selYJvOpKj7qC8udY',
      fld656tNfe7LI9k8z: new Date().toISOString()
    });

    const transaction = await createAirtableRecord(TABLES.transactions, {
      fldPdlhoIaUIX58pg: body.txHash,
      fldBbpDZZ1qrVWLDR: [body.userRecordId],
      fldRYX45r5jx8XB4V: body.transactionTypeSelectId || 'selGA3fOgPnvVv3O9',
      fldks2povBwvdbADT: Number(body.amount),
      fldjoDVXwyHYvZAKd: body.transactionStatusSelectId || 'selbkXC9vyPTd3cHy',
      fldF0QvNawbl7Yfi2: new Date().toISOString(),
      fldf4F9svawWukX1E: loanOrderId
    });

    sendJson(res, 201, { loan, transaction });
    return;
  }

  sendJson(res, 404, { error: 'API route not found' });
}

async function serveStatic(res, path) {
  const publicRoot = join(process.cwd(), 'public');
  const cleanPath = decodeURIComponent(path).replace(/^\/public\/?/, '/').replace(/^\/+/, '');
  const relativePath = path === '/' || cleanPath === '' ? 'index.html' : cleanPath;
  let filePath = normalize(join(publicRoot, relativePath));
  if (!filePath.startsWith(publicRoot + sep) && filePath !== publicRoot) {
    const error = new Error('Invalid static path');
    error.status = 400;
    throw error;
  }
  if (existsSync(filePath) && !extname(filePath)) {
    filePath = join(filePath, 'index.html');
  }
  const content = await readFile(filePath);
  const contentType = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, securityHeaders({ 'Content-Type': contentType }));
  res.end(content);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url.pathname);
      return;
    }

    await serveStatic(res, url.pathname);
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message,
      details: error.details
    });
  }
});

server.listen(PORT, () => {
  console.log(`Airtable proxy running at http://localhost:${PORT}`);
});
