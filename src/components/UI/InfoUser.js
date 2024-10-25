import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let username = ""; // Variável para armazenar o nome do usuário localmente
let uid = ""; // Variável para armazenar o UID do usuário localmente
let jogos = ""; // Variável para armazenar os jogos do usuário localmente

// Função para buscar o nome, UID e jogos do usuário no Firestore
export const fetchUserName = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      uid = user.uid; // Armazena o UID do usuário
      const db = getFirestore();
      const docRef = doc(db, 'users', uid); // Navegar até o documento do usuário
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        username = userData.username || ""; // Armazena o nome do usuário
        jogos = userData.jogos || ""; // Armazena os jogos do usuário
      } else {
        console.error('Documento não encontrado!');
      }
    } else {
      console.error('Usuário não autenticado!');
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
  }
};

// Função para acessar o nome do usuário
export const getUsername = () => username;

// Função para acessar o UID do usuário
export const getUserUid = () => uid;

// Função para acessar os jogos do usuário
export const getUserGames = () => jogos;
