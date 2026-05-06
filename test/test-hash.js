const bcrypt = require('bcrypt');

async function check() {
  const hash = '$2a$12$fSl2FSe4rFzowY3jW5dj8OWVVpOirw9ybZGvIWxbtX5O/QCvbxO4m';
  const isPassword = await bcrypt.compare('password123', hash);
  const isCalma = await bcrypt.compare('calma123', hash);
  
  const hash2 = '$2a$12$1J5d/nX9A3cbhsXBypaBI.GKlbC909NFDMGNkLeTkE1eKWozejKPa';
  const isPassword2 = await bcrypt.compare('password123', hash2);
  const isCalma2 = await bcrypt.compare('calma123', hash2);

  console.log('HASH 1 (director/admin):');
  console.log('password123:', isPassword);
  console.log('calma123:', isCalma);

  console.log('HASH 2 (analista):');
  console.log('password123:', isPassword2);
  console.log('calma123:', isCalma2);
}
check();
