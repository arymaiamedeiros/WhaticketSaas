import bcrypt from 'bcryptjs';

async function testAuth() {
  try {
    const password = '123456';
    const storedHash = '$2a$08$WKBQhx.5xN5k3MjwuUNvnONrrWoU.4.mUxKXu/WnzR8OHUdn5Jk6O';
    
    // Gera um novo hash para comparação
    const newHash = await bcrypt.hash(password, 8);
    console.log('Novo hash gerado:', newHash);
    
    // Compara diretamente com bcrypt
    const directCompare = await bcrypt.compare(password, storedHash);
    console.log('Comparação direta com bcrypt:', directCompare);

    // Testa com o novo hash
    const compareWithNew = await bcrypt.compare(password, newHash);
    console.log('Comparação com novo hash:', compareWithNew);

  } catch (error) {
    console.error('Erro:', error);
  }
}

testAuth();
