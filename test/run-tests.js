const BASE_URL = 'http://localhost:5000';
const TEST_THRESHOLD = 0.25;

function genUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const tests = [
  {
    question: 'What should I feed my newborn baby?',
    text: ['breast', 'bottle', 'formula', 'feed'],
    locations: []
  },
  {
    question: 'Where can I find prenatal vitamins near me in College Station?',
    text: [],
    locations: [
      'BCS Prenatal Clinic',
      'Student Health Services',
      'Brazos Valley Women\'s Center',
      'City of College Station Community Development',
      'Women\'s Care Plus'
    ]
  },
  {
    question: 'What are the best practices for breastfeeding?',
    text: ['breastfeeding', 'position', 'baby', 'comfort'],
    locations: []
  },
  {
    question: 'What are some tips for maintaining a healthy pregnancy?',
    text: ['nutrition', 'exercise', 'prenatal care', 'hydration', 'sleep'],
    locations: []
  },
  {
    question: 'What should I do if my baby is crying a lot',
    text: ['crying', 'baby', 'soothing', 'holding', 'comfort'],
    locations: []
  },
  {
    question: 'What vaccinations are required for newborns?',
    text: ['vaccinations', 'newborn', 'schedule', 'healthcare'],
    locations: []
  },
  {
    question: 'How do I prepare for labor and delivery?',
    text: ['labor', 'delivery', 'preparation', 'breathing', 'hospital'],
    locations: []
  }
];

function printResult(pass, msg, prevLine = true) {
  console.log(`${prevLine ? '\x1B[F\x1B[K' : ''}${pass ?
    `\x1B[92m[PASS]\x1B[m ${msg}`
    : `\x1B[91m[FAIL]\x1B[m ${msg}`}`);
}

async function runTest(test, token, cookie, uuid = null) {
  if (uuid === null) {
    console.log(`\n\x1B[96m[TEST]\x1B[m Question: ${test.question}`);
    console.log(`\x1B[93m[WAIT]\x1B[0;2m Running test...\x1B[m`);
  }
  const res = await runQuestion(test.question, token, cookie, uuid);
  let pass = true;

  let matchCount = 0;
  const textMissing = [];
  for (const word of test.text) {
    if (res.response.toLowerCase().includes(word.toLowerCase())) {
      matchCount++;
    }
    else textMissing.push(word);
  }
  const matchRatio = matchCount / test.text.length;
  if (matchRatio < TEST_THRESHOLD) {
    console.log(`\x1B[F\x1B[K\x1B[94m[INFO]\x1B[m Full response: ${res.response}`);
    console.log(`\x1B[94m[INFO]\x1B[m Missing words: \x1B[91m${textMissing.join('\x1B[m, \x1B[91m')}\x1B[m`);
    printResult(false, `Response contains only ${Math.floor(matchRatio * 100)}% of the required words.`, false);
    return false;
  }

  if (test.locations.length === 0 && res.locations.length !== 0) {
    console.log(`\x1B[F\x1B[K\x1B[94m[INFO]\x1B[m Full response: ${res.locations.map(loc => loc.name).join(', ')}`);
    printResult(false, 'Response locations should be empty.', false);
    return false;
  }

  let locationMatchCount = 0;
  const locationMissing = [];
  for (const loc of test.locations) {
    const found = res.locations.some(
      rLoc => rLoc.name.toLowerCase().includes(loc.toLowerCase())
    );
    if (found) locationMatchCount++;
    else locationMissing.push(loc);
  }
  const locationMatchRatio = locationMatchCount / test.locations.length;
  if (locationMatchRatio < TEST_THRESHOLD) {
    console.log(`\x1B[F\x1B[K\x1B[94m[INFO]\x1B[m Full response: ${res.locations.map(loc => loc.name).join(', ')}`);
    console.log(`\x1B[94m[INFO]\x1B[m Missing locations: \x1B[91m${locationMissing.join('\x1B[m, \x1B[91m')}\x1B[m`);
    printResult(false, `Response contains only ${Math.round(locationMatchRatio * 100)}% of the required locations.`, false);
    return false;
  }

  printResult(true, 'Test passed.');
  return true;
}

async function runQuestion(question, token, cookie, uuid = null) {
  const formData = new FormData();
  formData.append('data', question);
  formData.append('conversationId', uuid ?? genUUIDv4());

  const res = await fetch(`${BASE_URL}/formattedresults`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cookie': cookie
    },
    body: formData
  });

  return await res.json();
}

async function main() {
  console.log('\n\x1B[1;4mTest Suite\x1B[m\n');

  // Check if server is online
  try {
    console.log(`\x1B[94m[INFO]\x1B[m Checking server status at: \x1B[96m${BASE_URL}\x1B[m`);
    const serverRes = await fetch(BASE_URL);
    if (!serverRes.ok) {
      console.log(`\x1B[91m[FAIL]\x1B[m Server is not OK, returned HTTP ${serverRes.status}.`);
      return;
    }
    else {
      console.log('\x1B[92m[ OK ]\x1B[m Server is online.');
    }
  } catch (error) {
    console.log('\x1B[91m[FAIL]\x1B[m Failed to connect to the server.');
    return;
  }

  // Get auth token and session cookie
  const authRes = await fetch(`${BASE_URL}/signin`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'email': 'john.smith@example.com',
      'password': 'Example@123'
    })
  });

  const body = await authRes.json();
  const token = body.accessToken;
  const cookie = authRes.headers.get('set-cookie');

  if (!token || !cookie) {
    console.error('\x1B[91m[FAIL]\x1B[m Authentication failed. Token or cookie is missing.');
    return;
  }

  let passedCount = 0;
  for (const test of tests) {
    const pass = await runTest(test, token, cookie);
    if (pass) passedCount++;
  }

  const followUpUUID = genUUIDv4();

  const followInitial = 'What foods should I avoid during pregnancy?';

  // Test follow-up
  const followTest = {
    question: 'What kinds of fish are safe?',
    text: ['salmon'],
    locations: []
  };

  await runQuestion(followInitial, token, cookie, followUpUUID);

  console.log(`\n\x1B[96m[TEST]\x1B[m Follow-Up Question:`);
  console.log(`  Initial Question: ${followInitial}`);
  console.log(`  Follow-Up Question: ${followTest.question}`);
  console.log(`\x1B[93m[WAIT]\x1B[0;2m Running test...\x1B[m`);

  const pass = await runTest(followTest, token, cookie, followUpUUID);
  if (pass) passedCount++;

  console.log(`\n\x1B[94m[INFO]\x1B[m ${passedCount} of ${tests.length + 1} tests passed.\n`);
}

main();
