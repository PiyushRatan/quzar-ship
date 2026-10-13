/**
 * test-research.ts
 * Verification script for Darpan360 research port in TypeScript.
 * Tests SSRF protection, DOM parser, tech signals, markdown chunking, and crawler facade.
 */

import {
  isPrivateHost,
  isPrivateIp,
  normalizePublicWebsiteUrl,
  assertSafeUrl,
  parseIpv4ToNumber
} from './ssrfGuard';
import {
  parsePage,
  extractStructuredHtmlSignals,
  detectTechSignals,
  extractNavigationLinks
} from './domParser';
import {
  cleanText,
  cleanMarkdown,
  budgetContext,
  synthesizeResearchContext,
  chunkMarkdown
} from './markdownChunker';
import {
  crawlAndAnalyzeCompetitor
} from './index';


let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

console.log('--- 1. Testing SSRF Protection ---');

// Private IPv4 and hostnames that MUST be blocked
const blockedTargets = [
  'localhost',
  'http://localhost:3000',
  'http://127.0.0.1:8080/secret',
  '127.0.0.1',
  '127.1',
  '0177.0.0.1',
  '0x7f000001',
  'http://10.0.0.1/admin',
  '10.255.0.1',
  'http://172.16.0.1',
  '172.31.255.255',
  'http://192.168.1.1:8080',
  '192.168.0.1',
  'http://169.254.169.254/latest/meta-data/',
  '0.0.0.0',
  'http://[::1]/',
  '::1',
  'http://[fe80::1]/',
  'fe80::1',
  'http://[fc00::1]/',
  'http://[fd00::1]/',
  'http://[::ffff:127.0.0.1]/',
  'http://router.local',
  'http://service.internal',
  'http://machine.lan',
  'http://intranet'
];

for (const target of blockedTargets) {
  let threw = false;
  try {
    assertSafeUrl(target);
  } catch {
    threw = true;
  }
  const isNormNull = normalizePublicWebsiteUrl(target) === null;
  assert(threw && isNormNull, `SSRF blocks: ${target}`);
}

// Public URLs that MUST be allowed
const allowedTargets = [
  'https://example.com',
  'example.com',
  'https://github.com/PiyushRatan',
  'http://93.184.216.34'
];

for (const target of allowedTargets) {
  let allowed = false;
  try {
    const res = assertSafeUrl(target);
    allowed = Boolean(res && res.startsWith('http'));
  } catch {
    allowed = false;
  }
  assert(allowed, `SSRF allows public target: ${target}`);
}

// Test numeric IPv4 conversion
assert(parseIpv4ToNumber('127.0.0.1') === 0x7f000001, 'Parse standard IPv4 to number');
assert(parseIpv4ToNumber('0x7f000001') === 0x7f000001, 'Parse hex IPv4 to number');
assert(parseIpv4ToNumber('2130706433') === 0x7f000001, 'Parse dword IPv4 to number');

console.log('\n--- 2. Testing DOM Parser & Tech Signals ---');

const sampleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Acme Cloud Solutions - Modern Infrastructure</title>
  <meta name="description" content="Acme Cloud delivers cutting-edge infrastructure and DevOps automation." />
  <meta property="og:site_name" content="Acme Inc" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Acme Corporation",
    "email": "contact@acme.example.com",
    "telephone": "+1-800-555-0199"
  }
  </script>
  <script src="https://www.googletagmanager.com/gtag/js?id=G-123456"></script>
  <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
  <script id="__NEXT_DATA__">{"props":{}}</script>
</head>
<body class="bg-gray-100 flex flex-col min-h-screen">
  <header>
    <nav>
      <a href="/pricing">Pricing Plans</a>
      <a href="/features">Product Features</a>
      <a href="/about">About Us</a>
      <a href="/blog">Engineering Blog</a>
      <a href="https://external.com">Partner Portal</a>
    </nav>
  </header>
  <main>
    <h1>Next-Gen Cloud Orchestration</h1>
    <h2>Scale faster with intelligent microservices</h2>
    <p>Our platform handles 10M requests per second with sub-millisecond latency.</p>
    <h3>Developer Experience First</h3>
    <p>Get started with a single CLI command.</p>
    <a href="mailto:sales@acme.example.com">Contact Sales</a>
    <a href="tel:+18005550100">Direct Line</a>
  </main>
  <footer>
    <a href="/privacy">Privacy Policy</a>
  </footer>
</body>
</html>
`;

const parsed = parsePage(sampleHtml, 'https://acme.example.com');

assert(parsed.title === 'Acme Cloud Solutions - Modern Infrastructure', 'Extracted page title');
assert(parsed.description.includes('cutting-edge infrastructure'), 'Extracted meta description');
assert(parsed.headings.includes('Next-Gen Cloud Orchestration'), 'Extracted H1 heading');
assert(parsed.headings.includes('Scale faster with intelligent microservices'), 'Extracted H2 heading');
assert(parsed.emails.includes('sales@acme.example.com'), 'Extracted mailto link');
assert(parsed.emails.includes('contact@acme.example.com'), 'Extracted email from JSON-LD');
assert(parsed.phones.includes('+18005550100') || parsed.phones.includes('+1-800-555-0199'), 'Extracted phone');

// Tech signals detection
assert(parsed.techSignals.analytics.includes('Google Analytics / GTM'), 'Detected Google Analytics');
assert(parsed.techSignals.analytics.includes('Meta Pixel'), 'Detected Meta Pixel');
assert(parsed.techSignals.frameworks.includes('Next.js'), 'Detected Next.js');
assert(parsed.techSignals.frameworks.includes('React'), 'Detected React');
assert(parsed.techSignals.uiLibraries.includes('Tailwind CSS'), 'Detected Tailwind CSS classes');

// Navigation links
const navHrefs = parsed.navLinks.map((n) => n.href);
assert(navHrefs.includes('/pricing'), 'Discovered /pricing nav link');
assert(navHrefs.includes('/features'), 'Discovered /features nav link');
assert(navHrefs.includes('/about'), 'Discovered /about nav link');

console.log('\n--- 3. Testing Markdown Chunker & Context Budgeting ---');

const cleaned = cleanMarkdown('# Header\n\n![Image](https://img.png)\n\nParagraph with   extra   spaces.');
assert(!cleaned.includes('![Image]'), 'Stripped markdown images');
assert(cleanText('  Multi    line\n   text  ') === 'Multi line text', 'Normalized whitespace');

const budgetTest = synthesizeResearchContext({
  websiteSection: 'A'.repeat(15000),
  searchSection: 'B'.repeat(3000),
  maxBudget: 10000
});
assert(budgetTest.length <= 10000, `Context budgeted under 10000 chars (actual: ${budgetTest.length})`);

const chunks = chunkMarkdown('Paragraph 1\n\nParagraph 2\n\nParagraph 3', { chunkSize: 25 });
assert(chunks.length >= 2, 'Markdown correctly chunked into blocks');

async function runLiveTest() {
  console.log('\n--- 4. Testing Live Competitor Crawl Facade ---');

  try {
    const intel = await crawlAndAnalyzeCompetitor('https://example.com', {
      timeoutMs: 8000,
      maxSubpages: 3
    });

    assert(intel.url === 'https://example.com/', 'Normalized competitor URL');
    assert(intel.domain === 'example.com', 'Derived domain');
    assert(typeof intel.title === 'string' && intel.title.length > 0, `Captured page title (${intel.title})`);
    assert(Array.isArray(intel.headings), 'Captured headings array');
    assert(typeof intel.rawContext === 'string' && intel.rawContext.length > 0, 'Synthesized raw context');
    assert(intel.sourcesUsed.includes('https://example.com/'), 'Tracked sources used');
  } catch (err: any) {
    console.log(`  [INFO] Live crawl skipped or network offline: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log(`========================================\n`);

  if (passedTests === totalTests) {
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
  }
}

runLiveTest().catch((e) => {
  console.error(e);
  process.exit(1);
});


