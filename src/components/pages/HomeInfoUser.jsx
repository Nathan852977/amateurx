import React, { useEffect, useState } from "react"
import "../../CSS/HomeInfoUser.css"
import { fetchUserName, getUsername, getUserUid, getUserGames } from "../UI/InfoUser";
import { doc, getDoc, getFirestore, collection, getDocs } from "firebase/firestore";
import { 
valorantLogo, freefireLogo,
InicianteX, 
FotoUserPadrao 
} from "../UI/img";
import { FaGear } from "react-icons/fa6";
import { GiTombstone, GiHarryPotterSkull, GiTrophy, GiLaurelsTrophy } from "react-icons/gi";

export default function HomeInfoUser() {

  const [userName, setUserName] = useState(""); 
  const [userUid, setUserUid] = useState('');
  const [gameSelected, setGameSelected] = useState("");
  const [compName, setCompName] = useState("");
  const [compDetails, setCompDetails] = useState({ compStatus: "", nome: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playersConfirmed, setPlayersConfirmed] = useState([]);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      await fetchUserName(); // Busca o nome e UID do usuário
      const name = getUsername(); // Obtém o nome do usuário
      const uid = getUserUid(); // Obtém o UID do usuário
      const game = getUserGames()        
      setUserName(name); // Atualiza o estado com o nome do usuário
      setUserUid(uid); // Atualiza o estado com o UID do usuário
      setGameSelected(game);
    };
  
    loadUserData();
  }, []);

  useEffect(() => {
    const fetchUserCompetitionName = async () => {
      if (!userUid) return;

      try {
        const competitionsRef = collection(getFirestore(), "users", userUid, "competitions");
        const querySnapshot = await getDocs(competitionsRef);
        const compNames = querySnapshot.docs.map(doc => doc.id);

        if (compNames.length > 0) {
          const compName = compNames[0];
          setCompName(compName);

          const compRef = doc(getFirestore(), "users", userUid, "competitions", compName);
          const compSnap = await getDoc(compRef);

          if (compSnap.exists()) {
            const compData = compSnap.data();
            setIsPaymentCompleted(compData.pagamentoStatus === "pago"); // Verifica se o pagamento está concluído
            setCompDetails({
              compStatus: compData.compStatus || "Status não disponível",
              nome: compData.nome || "Nome não disponível",
              admin: compData.admin || "Admin não disponível"
            });
          }
        } else {
          setIsPaymentCompleted(false); // Define como false se não houver competições
        }
      } catch (error) {
        console.error("Erro ao buscar o nome da competição do usuário:", error);
      }
    };

    fetchUserCompetitionName();
  }, [userUid]);

  useEffect(() => {
    const fetchPlayersConfirmed = async () => {
      if (!compName) return;

      try {
        const db = getFirestore();
        const playersConfirmedRef = collection(db, 'comp', compName, 'PlayersConfirmed');
        const querySnapshot = await getDocs(playersConfirmedRef);
        const playersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlayersConfirmed(playersData);
      } catch (error) {
        console.error('Erro ao buscar jogadores confirmados:', error);
      }
    };

    fetchPlayersConfirmed();
  }, [compName]); 

  const games = [
    { src: freefireLogo, id: 'freefire' },
    { src: valorantLogo, id: 'valorant' },
  ];

  const getGameLogo = (gameId) => {
    const game = games.find(game => game.id === gameId);
    return game ? game.src : null; // Retorna o src do logo ou null se não encontrar
  };

  const gameLogoSrc = getGameLogo(gameSelected);
    

  return (
    <div className="divAllHomeInfoUser">
      <section>
        <div className="divCrendecionsOne">
          <h3 className="TitlePlayerName"> {userName} </h3>
          <h1 className="titleAX"> Amateur-X </h1>
          <button> 
            <FaGear />
          </button>   
        </div>

        <div className="divCrendecionsTwo">
          <img src={FotoUserPadrao} alt="" className="imgFotoUser"/>

          <div className="divCardEstatisticas">
            <div className="cardEstatisticas">
              <GiHarryPotterSkull />
              <p>0</p>
              <h3>Kils</h3>
            </div>
            <div className="cardEstatisticas">
              <GiTombstone />
              <p>0</p>
              <h3>Mortes</h3>
            </div>
            <div className="cardEstatisticas">
              <GiTrophy />
              <p>0</p>
              <h3>Vitorias</h3>
           </div>
           <div className="cardEstatisticas" style={{ border: 'none' }}>
              <GiLaurelsTrophy />
              <p>0</p>
              <h3>Paticipaçao</h3>
           </div>
          </div> 
        </div>

        <div className="divCrendecionsThree">
          <img src={InicianteX} alt="Patente" className="imgLogoCrendecionsOne"/>
          <img src={gameLogoSrc} alt={gameSelected || "Logo do jogo"} className="imgLogoCrendecionsOne" />
          <div className="divInfoCompActives">
            <h3>Campeonatos Ativos</h3>
            {isPaymentCompleted ? (
            <section>
              <p>{compDetails.nome || "Nenhum campeonato ativo"}</p>
              <button onClick={() => setIsModalOpen(true)}>ir para o campeonato</button>
            </section>
          ) : (
            <p>sem campeonato</p>
          )}
          </div>
        </div>
      </section>


      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalCampeonatoContent" onClick={(e) => e.stopPropagation()}>
            <div className="alignOneContentCampeonato">
              <button onClick={() => setIsModalOpen(false)} className="btnbackEnterGuild">Fechar</button>
              <button className="btnDesistir"> Desistir </button>
            </div>

            <div className="alignTwoContentCampeonato">
              <h1> {compDetails.nome} </h1>
              <h3> Admin: {compDetails.admin} </h3>
              <h3> Status Do Pagamento: pago </h3>
            </div>

            <div className="playersList">
              {playersConfirmed.length > 0 ? (
                playersConfirmed.map((player) => (
                  <div key={player.id} className="playerCard">
                    <h3>{player.userName}</h3>
                    <p>Nickname: {player.nickname}</p>
                  </div>
                ))
              ) : (
                <p>Nenhum jogador confirmado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    )
}