import React, { useState, useEffect } from "react";
import "../../CSS/Comp.css"
import CompAdmin from "./CompAdmin.jsx";
import CompAdminFases from "../pages/CompAdminFases.jsx";
import CompUser from "./CompUser.jsx"
import { db } from "../UI/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { fetchUserName, getUsername, getUserUid } from "../UI/InfoUser.js";

export default function Comp() {

  const [selectedComp, setSelectedComp] = useState(null);
  const [userUid, setUserUid] = useState('');
  const [userName, setUserName] = useState(""); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      await fetchUserName(); // Busca o nome e UID do usuário
      const name = getUsername(); // Obtém o nome do usuário
      const uid = getUserUid(); // Obtém o UID do usuário
      setUserName(name); // Atualiza o estado com o nome do usuário
      setUserUid(uid); // Atualiza o estado com o UID do usuário

      if (uid) {
        await fetchAdminStatus(uid);
      }
    };

    const fetchAdminStatus = async (uid) => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.Admin === true); // Verifica se o campo 'Admin' é true
        }
      } catch (error) {
        console.error("Erro ao buscar os dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  if (loading) {
    return <p>Carregando...</p>; // Exibe um estado de carregamento enquanto os dados são buscados
  }

  return (
    <div className="divAllComp">
       {selectedComp ? (
  <CompAdminFases 
    comp={selectedComp} 
    selectedComp={selectedComp} 
    onBack={() => setSelectedComp(null)} 
  />
) : isAdmin ? (
  <CompAdmin onSelectComp={(comp) => setSelectedComp(comp)} />
) : (
  <CompUser />
)}

    </div>
  );
}
