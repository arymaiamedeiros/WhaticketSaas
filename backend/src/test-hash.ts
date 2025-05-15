import { compare, hash } from 'bcryptjs';

async function testHash() {
  try {
    const password = '123456';
    const storedHash = '$2a$08$b4wYAZ7MZm4sbbKeksn9Ae1vIA7yfRgLP2IcitcOiKQb5BfsXnEAq';
    
    // Gera um novo hash
    const newHash = await hash(password, 8);
    console.log('Novo hash gerado:', newHash);
    
    // Compara com o hash armazenado
    const compareWithStored = await compare(password, storedHash);
    console.log('Comparação com hash armazenado:', compareWithStored);
    
    // Compara com o novo hash
    const compareWithNew = await compare(password, newHash);
    console.log('Comparação com novo hash:', compareWithNew);
    
    // Testa com o hash antigo que não funcionou
    const oldHash = '$2a$08$WKBQhx.5xN5k3MjwuUNvnONrrWoU.4.mUxKXu/WnzR8OHUdn5Jk6O';
    const compareWithOld = await compare(password, oldHash);
    console.log('Comparação com hash antigo:', compareWithOld);

  } catch (error) {
    console.error('Erro:', error);
  }
}

testHash(); 
