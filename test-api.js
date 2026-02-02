const https = require('https');

const loginData = JSON.stringify({
  email: 'dimasz@gmail.com',
  password: '123456'
});

const loginOptions = {
  hostname: 'backend-libraone.vercel.app',
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = https.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Login Status:', res.statusCode);
    console.log('User Role:', result.user?.role);
    
    if (result.token) {
      testCreateBook(result.token);
    }
  });
});

loginReq.write(loginData);
loginReq.end();

function testCreateBook(token) {
  const bookData = JSON.stringify({
    judul: 'Test Book ' + Date.now(),
    pengarang: 'Test Author',
    penerbit: 'Test Publisher',
    tahun_terbit: '2024',
    kategori: 'Pendidikan',
    buku_deskripsi: 'Test description',
    jumlah_halaman: 150
  });

  const options = {
    hostname: 'backend-libraone.vercel.app',
    path: '/api/books',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': Buffer.byteLength(bookData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\n--- Create Book Response ---');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
  });

  req.write(bookData);
  req.end();
}
