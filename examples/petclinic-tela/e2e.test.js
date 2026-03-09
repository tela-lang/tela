'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert');

const BASE = 'http://localhost:8080';
let browser, page;

async function setup() {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  [browser error]', msg.text());
  });
  page.on('pageerror', err => console.error('  [page error]', err.message));
}

async function teardown() {
  await browser.close();
}

async function run(name, fn) {
  try {
    await fn();
    console.log('  ✓', name);
  } catch (e) {
    console.error('  ✗', name);
    console.error('   ', e.message);
    process.exitCode = 1;
  }
}

(async () => {
  await setup();

  console.log('\nTela PetClinic — UI Tests\n');

  // ── App loads ──────────────────────────────────────────────────────────────

  await run('App loads without JS errors', async () => {
    const errors = [];
    page.once('pageerror', e => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    assert.strictEqual(errors.length, 0, `JS errors: ${errors.join(', ')}`);
  });

  await run('Nav bar renders with all 5 buttons', async () => {
    const buttons = await page.locator('nav button').allTextContents();
    assert.ok(buttons.some(t => t.includes('Home')),    'Home button');
    assert.ok(buttons.some(t => t.includes('Owners')),  'Owners button');
    assert.ok(buttons.some(t => t.includes('Pets')),    'Pets button');
    assert.ok(buttons.some(t => t.includes('Vets')),    'Vets button');
    assert.ok(buttons.some(t => t.includes('Visits')),  'Visits button');
  });

  await run('Home page shows 4 feature cards', async () => {
    const cards = await page.locator('h3').allTextContents();
    assert.ok(cards.some(t => t.includes('Owners')),  'Owners card');
    assert.ok(cards.some(t => t.includes('Pets')),    'Pets card');
    assert.ok(cards.some(t => t.includes('Vets')),    'Vets card');
    assert.ok(cards.some(t => t.includes('Visits')),  'Visits card');
  });

  // ── Routing ────────────────────────────────────────────────────────────────

  await run('Clicking Owners nav updates URL to /owners', async () => {
    await page.click('nav button:has-text("Owners")');
    await page.waitForFunction(() => window.location.pathname === '/owners');
    assert.strictEqual(new URL(page.url()).pathname, '/owners');
  });

  await run('Owners page renders a table with seeded data', async () => {
    await page.waitForSelector('table', { timeout: 5000 });
    const rows = await page.locator('tbody tr').count();
    assert.ok(rows >= 5, `expected ≥5 owner rows, got ${rows}`);
  });

  await run('Clicking Pets nav updates URL to /pets', async () => {
    await page.click('nav button:has-text("Pets")');
    await page.waitForFunction(() => window.location.pathname === '/pets');
    assert.strictEqual(new URL(page.url()).pathname, '/pets');
  });

  await run('Pets page renders pet type badges', async () => {
    await page.waitForSelector('table', { timeout: 5000 });
    const badges = await page.locator('tbody tr span').allTextContents();
    assert.ok(badges.length > 0, 'should have at least one type badge');
    // Check that "cat" and "dog" appear in some badge text
    const allBadgeText = badges.join(' ');
    assert.ok(allBadgeText.includes('cat') || allBadgeText.includes('dog'), 'should have cat or dog badge');
  });

  await run('Clicking Vets nav updates URL to /vets and loads vet cards', async () => {
    await page.click('nav button:has-text("Vets")');
    await page.waitForFunction(() => window.location.pathname === '/vets');
    // Wait for async data to load — Dr. cards appear after fetch completes
    await page.waitForSelector('h3:has-text("Dr.")', { timeout: 5000 });
    const cards = await page.locator('h3').allTextContents();
    assert.ok(cards.some(t => t.startsWith('Dr.')), 'should show Dr. cards');
  });

  await run('Vet with no specialties shows "General Practice" fallback', async () => {
    // James Carter has empty specialties → should show "General Practice"
    await page.waitForSelector('h3:has-text("Dr.")', { timeout: 5000 });
    const vetText = await page.locator('p').allTextContents();
    assert.ok(vetText.some(t => t.includes('General Practice')), 'should show General Practice fallback');
  });

  await run('Clicking Visits nav updates URL to /visits', async () => {
    await page.click('nav button:has-text("Visits")');
    await page.waitForFunction(() => window.location.pathname === '/visits');
    await page.waitForSelector('table', { timeout: 5000 });
    const rows = await page.locator('tbody tr').count();
    assert.ok(rows >= 4, `expected ≥4 visit rows, got ${rows}`);
  });

  await run('Browser back button returns to /vets', async () => {
    await page.goBack();
    await page.waitForFunction(() => window.location.pathname === '/vets');
    assert.strictEqual(new URL(page.url()).pathname, '/vets');
  });

  await run('Browser forward button returns to /visits', async () => {
    await page.goForward();
    await page.waitForFunction(() => window.location.pathname === '/visits');
    assert.strictEqual(new URL(page.url()).pathname, '/visits');
  });

  // ── Add Owner form ─────────────────────────────────────────────────────────

  await run('Navigate to /owners and open Add Owner form', async () => {
    await page.click('nav button:has-text("Owners")');
    await page.waitForFunction(() => window.location.pathname === '/owners');
    await page.waitForSelector('table');
    await page.click('button:has-text("Add Owner")');
    await page.waitForSelector('h3:has-text("New Owner")');
  });

  await run('Add Owner form has 5 input fields', async () => {
    const inputs = await page.locator('input[placeholder]').count();
    assert.ok(inputs >= 5, `expected ≥5 inputs, got ${inputs}`);
  });

  await run('Submitting empty form shows validation error', async () => {
    await page.click('button:has-text("Save")');
    await page.waitForSelector('p:has-text("All fields are required")');
  });

  await run('Fill and submit Add Owner form', async () => {
    await page.fill('input[placeholder="First Name"]', 'Test');
    await page.fill('input[placeholder="Last Name"]',  'User');
    await page.fill('input[placeholder="Address"]',    '99 Test Lane');
    await page.fill('input[placeholder="City"]',       'Testville');
    await page.fill('input[placeholder="Telephone"]',  '5550000001');
    await page.click('button:has-text("Save")');
    // Form should close and table should show the new owner
    await page.waitForSelector('h3:has-text("New Owner")', { state: 'hidden', timeout: 5000 });
    const rows = await page.locator('tbody tr').allTextContents();
    assert.ok(rows.some(r => r.includes('Test') && r.includes('User')), 'new owner should appear in table');
  });

  await run('Delete the newly added owner', async () => {
    const rowsBefore = await page.locator('tbody tr').count();
    // Find the Test User row and click its Delete button
    const row = page.locator('tbody tr', { hasText: 'Test User' });
    await row.locator('button:has-text("Delete")').click();
    await page.waitForFunction(
      (before) => document.querySelectorAll('tbody tr').length < before,
      rowsBefore,
      { timeout: 5000 }
    );
    const rowsAfter = await page.locator('tbody tr').count();
    assert.strictEqual(rowsAfter, rowsBefore - 1, 'row count should decrease by 1');
  });

  // ── Add Pet form ───────────────────────────────────────────────────────────

  await run('Navigate to /pets and add a new pet', async () => {
    await page.click('nav button:has-text("Pets")');
    await page.waitForFunction(() => window.location.pathname === '/pets');
    await page.waitForSelector('table');
    await page.click('button:has-text("Add Pet")');
    await page.waitForSelector('h3:has-text("New Pet")');
    await page.fill('input[placeholder="Pet Name"]',                'Biscuit');
    await page.fill('input[placeholder="Type (dog, cat, bird…)"]',  'dog');
    await page.fill('input[placeholder="Birth Date (YYYY-MM-DD)"]', '2022-06-01');
    await page.fill('input[placeholder="Owner ID"]',                '1');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('h3:has-text("New Pet")', { state: 'hidden', timeout: 5000 });
    const rows = await page.locator('tbody tr').allTextContents();
    assert.ok(rows.some(r => r.includes('Biscuit')), 'Biscuit should appear in table');
  });

  await run('Dog badge renders with 🐕 emoji for new pet', async () => {
    const badges = await page.locator('tbody tr span').allTextContents();
    assert.ok(badges.some(b => b.includes('🐕')), 'should show dog emoji badge');
  });

  // ── Home page ──────────────────────────────────────────────────────────────

  await run('Clicking Home nav returns to / ', async () => {
    await page.click('nav button:has-text("Home")');
    await page.waitForFunction(() => window.location.pathname === '/');
    const heading = await page.locator('h1').textContent();
    assert.ok(heading.includes('PetClinic'), 'should show hero heading');
  });

  await run('Deep-link to /owners loads directly (SPA fallback)', async () => {
    await page.goto(`${BASE}/owners`, { waitUntil: 'networkidle' });
    assert.strictEqual(new URL(page.url()).pathname, '/owners');
    await page.waitForSelector('table', { timeout: 5000 });
    const rows = await page.locator('tbody tr').count();
    assert.ok(rows >= 5, `should have ≥5 owner rows on direct URL load, got ${rows}`);
  });

  await run('Deep-link to /pets loads directly (SPA fallback)', async () => {
    await page.goto(`${BASE}/pets`, { waitUntil: 'networkidle' });
    assert.strictEqual(new URL(page.url()).pathname, '/pets');
    await page.waitForSelector('table', { timeout: 5000 });
  });

  console.log('\n');
  await teardown();
})();
