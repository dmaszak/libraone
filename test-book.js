const https = require('https');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  try {
    // Login
    console.log('1. Login...');
    const loginRes = await makeRequest({
      hostname: 'backend-libraone.vercel.app',
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email: 'dimasz@gmail.com', password: '123456' }));
    
    const { token } = JSON.parse(loginRes.body);
    console.log('   Login OK, role:', JSON.parse(loginRes.body).user?.role);

    // Create book
    console.log('\n2. Creating book...');
    const bookData = {
      id_buku: 'testbook' + Date.now(),
      judul: 'Test Buku Baru',
      pengarang: 'Penulis Test',
      penerbit: 'Penerbit Test',
      tahun_terbit: '2024-01-01',
      kategori: 'pendidikan',
      cover: 'test.jpg',
      buku_deskripsi: 'Ini adalah deskripsi buku test',
      jumlah_halaman: 200
    };
    console.log('   Data:', JSON.stringify(bookData, null, 2));

    const createRes = await makeRequest({
      hostname: 'backend-libraone.vercel.app',
      path: '/api/books',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }, JSON.stringify(bookData));

    console.log('\n3. Response:');
    console.log('   Status:', createRes.status);
    console.log('   Body:', createRes.body);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
