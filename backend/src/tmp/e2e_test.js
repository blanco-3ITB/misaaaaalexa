const axios = require('axios');

const API = 'http://localhost:5001/api';

async function run() {
  try {
    console.log('1) Logging in as coordinator (admin@gmail.com)');
    let res = await axios.post(`${API}/auth/login`, { email: 'admin@gmail.com', password: 'admin123' });
    const coordToken = res.data.token;

    const coordClient = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${coordToken}` } });

    console.log('2) Creating one test bill (unassigned)');
    const billsPayload = {
      bills: [
        {
          accountNumber: 'ACCT-E2E-1001',
          customerName: 'E2E Test User',
          address: '123 Test Ave',
          route: 'R1',
          billType: 'regular_bill',
          billingMonth: '2026-02'
        }
      ]
    };
    await coordClient.post('/coordinator/bills', billsPayload);

    console.log('3) Fetching unassigned bills');
    res = await coordClient.get('/coordinator/bills', { params: { status: 'unassigned' } });
    const unassigned = res.data;
    if (!unassigned.length) throw new Error('No unassigned bills found');
    const billId = unassigned[0]._id;
    console.log('   Found bill id:', billId);

    console.log('4) Fetching messengers to assign to');
    res = await coordClient.get('/coordinator/messengers');
    const messengers = res.data;
    if (!messengers.length) throw new Error('No messengers available');
    // Prefer the e2e test messenger if present (updated sample email)
    const e2e = messengers.find(m => m.email === 'e2e-m@example.com');
    const messengerId = (e2e ? e2e._id : messengers[0]._id);
    console.log('   Using messenger id:', messengerId);

    console.log('5) Assigning bill to messenger');
    await coordClient.post('/coordinator/assign-bills', { billIds: [billId], messengerId });

    console.log('6) Retrieving tracking to find delivery id');
    res = await coordClient.get('/coordinator/tracking');
    const deliveries = res.data.deliveries;
    const delivery = deliveries.find(d => d.billId && d.billId._id === billId);
    if (!delivery) throw new Error('Delivery not found after assignment');
    const deliveryId = delivery._id;
    console.log('   Delivery id:', deliveryId);

    console.log('7) Logging in as messenger (selected messenger)');
    // Attempt to login using the selected messenger email (password may vary in your seed)
    const messengerEmail = e2e ? e2e.email : messengers[0].email;
    res = await axios.post(`${API}/auth/login`, { email: messengerEmail, password: 'pass123' });
    const messToken = res.data.token;
    const messClient = axios.create({ baseURL: API, headers: { Authorization: `Bearer ${messToken}` } });

    console.log('8) Uploading proof image (mock base64 data)');
    const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVQImWNgYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==';
    await messClient.post(`/messenger/deliveries/${deliveryId}/proof`, { imageData });

    console.log('9) As coordinator, verifying delivery');
    await coordClient.put(`/coordinator/deliveries/${deliveryId}/verify`, {
      verificationStatus: 'verified',
      verificationNotes: 'E2E: OK'
    });

    console.log('10) Generating DSR report');
    res = await coordClient.post('/reports/dsr', { note: 'E2E run', reportDate: new Date().toISOString() });
    console.log('   DSR created:', res.data.report?._id || res.data);

    console.log('\nE2E test completed successfully');
  } catch (err) {
    console.error('E2E test failed:', err.response ? (err.response.data || err.response.statusText) : err.message);
    process.exitCode = 1;
  }
}

run();
