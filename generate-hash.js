const bcrypt = require('bcryptjs');

async function generateHashes() {
  // Password for Julija (she can change it later)
  const julijaPassword = 'TempVera2024!';
  const julijaHash = await bcrypt.hash(julijaPassword, 10);
  
  // Password for Taylor (test account)
  const taylorPassword = 'TestVera2024!';
  const taylorHash = await bcrypt.hash(taylorPassword, 10);
  
  console.log('\n=== JULIJA ===');
  console.log('Email: krajceva@gmail.com');
  console.log('Temp Password:', julijaPassword);
  console.log('Hash:', julijaHash);
  
  console.log('\n=== TAYLOR ===');
  console.log('Email: taylor@veraneural.com');
  console.log('Password:', taylorPassword);
  console.log('Hash:', taylorHash);
  console.log('\n');
}

generateHashes();
