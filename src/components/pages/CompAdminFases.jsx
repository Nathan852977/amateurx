import React, { useEffect, useState } from "react";
import "../../CSS/CompAdminFases.css"
import { db } from '../UI/firebase.js';
import { collection, getDocs, setDoc, deleteDoc, doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { FaDeleteLeft } from "react-icons/fa6";

export default function CompAdminFases({ comp, onBack, selectedComp}) {

  const [activeTab, setActiveTab] = useState('Status');
  const [playersVerification, setPlayersVerification] = useState([]);
  const [playersConfirmed, setPlayersConfirmed] = useState([]);
  const [formData, setFormData] = useState({});
  const [sentPlayers, setSentPlayers] = useState([]);
  const [horarioCompeticao, setHorarioCompeticao] = useState('');
  const [tempoRestante, setTempoRestante] = useState('');

  const handleEncerrarGeral = async () => {
    if (!selectedComp?.id) {
      console.error('ID da competição não encontrado.');
      return;
    }
  
    try {
      console.log(`Iniciando o processo de encerramento para a competição: ${selectedComp.id}`);
  
      // Referência à subcoleção 'PlayersConfirmed'
      const playersConfirmedRef = collection(db, 'comp', selectedComp.id, 'PlayersConfirmed');
      const querySnapshot = await getDocs(playersConfirmedRef);
  
      if (querySnapshot.empty) {
        console.error('Nenhum jogador encontrado em PlayersConfirmed.');
        return;
      }
  
      const batch = writeBatch(db); // Usar writeBatch para operações em lote
      let winnerUid = null;
  
      // Iterar sobre cada jogador em 'PlayersConfirmed'
      querySnapshot.forEach((docSnap) => {
        const playerData = docSnap.data();
        const { userUid, kills = "0", mortes = "0", colocacao } = playerData;
  
        if (!userUid) {
          console.error(`userUid não encontrado para o jogador ${docSnap.id}`);
          return;
        }
  
        // Converte kills e mortes para números para garantir a soma correta
        const killsNumber = parseInt(kills, 10);
        const mortesNumber = parseInt(mortes, 10);
  
        console.log(`Atualizando usuário ${userUid} com kills: ${killsNumber}, mortes: ${mortesNumber}`);
  
        // Referência ao documento do usuário na coleção 'users'
        const userDocRef = doc(db, 'users', userUid);
  
        // Incrementar os campos 'kills' e 'mortes' no documento do usuário
        batch.update(userDocRef, {
          kills: increment(killsNumber),
          mortes: increment(mortesNumber),
          participacoes: increment(1),
        });
  
        // Verificar se o jogador tem colocacao igual a "1"
        if (colocacao === "1") {
          winnerUid = userUid;
        }
      });
  
      // Se encontramos um vencedor, incrementamos o campo 'win'
      if (winnerUid) {
        const winnerDocRef = doc(db, 'users', winnerUid);
        batch.update(winnerDocRef, {
          win: increment(1),
        });
        console.log(`Usuário ${winnerUid} recebeu uma vitória.`);
      }
  
      // Enviar todas as operações do batch
      await batch.commit();
  
      console.log('Todos os usuários foram atualizados com kills, mortes, participação incrementada e vitória para o primeiro colocado.');
    } catch (error) {
      console.error('Erro ao encerrar a competição e atualizar os usuários:', error);
    }
  };
   
  
  
  

  useEffect(() => {
    const fetchHorarioCompeticao = async () => {
      if (!selectedComp?.id) return;
  
      try {
        const docRef = doc(db, 'comp', selectedComp.id);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHorarioCompeticao(data.horarioCompeticao || 'Horário não disponível');
  
          // Calcular a diferença de tempo se o horário for válido
          const horario = new Date(data.horarioCompeticao); // Supondo que esteja no formato ISO
          const now = new Date();
  
          if (horario > now) {
            const diffTime = horario - now;
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);
  
            setTempoRestante(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
          } else {
            setTempoRestante('O campeonato já começou!');
          }
        } else {
          console.error('Documento da competição não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar horário da competição:', error);
      }
    };
  
    fetchHorarioCompeticao();
  
    // Atualização automática do tempo restante
    const interval = setInterval(() => {
      const now = new Date();
      const horario = new Date(horarioCompeticao);
  
      if (horario > now) {
        const diffTime = horario - now;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);
  
        setTempoRestante(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
      } else {
        setTempoRestante('O campeonato já começou!');
        clearInterval(interval);
      }
    }, 1000);
  
    return () => clearInterval(interval); // Limpar o intervalo quando o componente desmontar
  }, [selectedComp, horarioCompeticao]);
    

  useEffect(() => {
    const fetchPlayersVerification = async () => {
      if (!selectedComp?.id) return;

      try {
        const playersVerificationRef = collection(db, 'comp', selectedComp.id, 'PlayersVerification');
        const querySnapshot = await getDocs(playersVerificationRef);
        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlayersVerification(playersData);
      } catch (error) {
        console.error('Erro ao buscar documentos de PlayersVerification:', error);
      }
    };

    fetchPlayersVerification();
  }, [selectedComp]);

  useEffect(() => {
    const fetchPlayersConfirmed = async () => {
      if (!selectedComp?.id) return;
  
      try {
        const playersConfirmedRef = collection(db, 'comp', selectedComp.id, 'PlayersConfirmed');
        const querySnapshot = await getDocs(playersConfirmedRef);
        const playersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setPlayersConfirmed(playersData);
      } catch (error) {
        console.error('Erro ao buscar documentos de PlayersConfirmed:', error);
      }
    };
  
    fetchPlayersConfirmed();
  }, [selectedComp]);
  

  const handleConfirmPlayer = async (player) => {
    if (!selectedComp?.id) return;
  
    try {
      // Adicionar o jogador em "PlayersConfirmed"
      await setDoc(
        doc(db, 'comp', selectedComp.id, 'PlayersConfirmed', player.id),
        {
          userName: player.userName,
          nickname: player.nickname,
          userUid: player.userUid,
          chavePix: player.chavePix,
          pagamentoStatus: "pago",
        }
      );
  
      // Atualizar o status de pagamento na subcoleção 'competitions' do usuário
      await setDoc(
        doc(db, 'users', player.userUid, 'competitions', selectedComp.id),
        {
          pagamentoStatus: "pago",
        },
        { merge: true } // Usar merge para atualizar apenas o campo 'pagamentoStatus' sem sobrescrever outros dados
      );
  
      // Remover o jogador de "PlayersVerification"
      await deleteDoc(
        doc(db, 'comp', selectedComp.id, 'PlayersVerification', player.id)
      );
  
      // Atualizar a lista local de jogadores
      setPlayersVerification((prev) =>
        prev.filter((p) => p.id !== player.id)
      );
  
      console.log(`${player.userName} foi movido para PlayersConfirmed e pagamento atualizado para 'pago'.`);
    } catch (error) {
      console.error('Erro ao mover jogador para PlayersConfirmed e atualizar status de pagamento:', error);
    }
  };
  
  
  const handleDeletePlayer = async (playerId) => {
    if (!selectedComp?.id) return;
  
    try {
      // Encontre o jogador com base no playerId
      const player = playersVerification.find((p) => p.id === playerId);
      if (!player) {
        console.error('Jogador não encontrado.');
        return;
      }
  
      // Extraia o userUid do jogador
      const { userUid } = player;
  
      // Remover o jogador de "PlayersVerification"
      await deleteDoc(
        doc(db, 'comp', selectedComp.id, 'PlayersVerification', playerId)
      );
  
      // Remover o documento da competição na subcoleção "competitions" do usuário
      await deleteDoc(
        doc(db, 'users', userUid, 'competitions', selectedComp.id)
      );
  
      // Atualizar a lista local de jogadores
      setPlayersVerification((prev) =>
        prev.filter((p) => p.id !== playerId)
      );
  
      console.log(`Jogador com ID ${playerId} foi removido de PlayersVerification e do documento de competitions.`);
    } catch (error) {
      console.error('Erro ao remover jogador de PlayersVerification e competitions:', error);
    }
  };  

  const handleInputChange = (playerId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (playerId) => {
    if (!selectedComp?.id) return;
  
    try {
      const playerData = formData[playerId];
      if (!playerData) return;
  
      // Define valores padrão para os campos se estiverem vazios
      const kills = playerData.kills ? playerData.kills : "0";
      const mortes = playerData.mortes ? playerData.mortes : "0";
      const colocacao = playerData.colocacao ? playerData.colocacao : "sem colocação";
  
      // Atualiza o documento do jogador em PlayersConfirmed com os novos valores
      await setDoc(
        doc(db, 'comp', selectedComp.id, 'PlayersConfirmed', playerId),
        {
          kills,
          mortes,
          colocacao,
        },
        { merge: true }
      );
  
      console.log(`Dados do jogador ${playerId} atualizados com sucesso.`);
  
      // Adiciona o jogador ao estado de enviados, garantindo que não haja duplicatas
      setSentPlayers((prev) => [...prev, playerId]);
    } catch (error) {
      console.error('Erro ao atualizar os dados do jogador:', error);
    }
  };

  const handleEncerrarParticipantes = async () => {
    if (!selectedComp?.id) {
      console.error("ID da competição não encontrado.");
      return;
    }
  
    try {
      const compDocRef = doc(db, "comp", selectedComp.id);
  
      // Atualiza o campo compStatus para "invisible"
      await setDoc(compDocRef, { compStatus: "invisible" }, { merge: true });
  
      console.log(`Competição ${selectedComp.id} foi encerrada para os participantes (compStatus: invisible).`);
  
      // Atualize localmente se necessário, ou busque novamente as competições
      // fetchCompeticoes(); // Se houver uma função para atualizar a lista de competições.
    } catch (error) {
      console.error("Erro ao encerrar a competição para os participantes:", error);
    }
  };  

  
  function FaseMataMata() {
    // Cria um array de jogadores com base no número de participantes
    const players = Array.from({ length: comp.numPlayers }, (_, index) => ({
      id: index + 1,
      nome: `Jogador ${index + 1}`,
    }));
  
    return (
      <div className="divAllfaseMataMata">
        {comp.estiloCompeticao === "Solo" ? (
          <div className="playersContainer" data-num-players={comp.numPlayers}>
            {playersConfirmed.map((player) => (
              <div key={player.id} className={`playerBox ${sentPlayers.includes(player.id) ? 'sent' : ''}`}>
                <section className="alignSecOnePlayerBox">
                  <h3>{player.userName}</h3>
                  <h3>{player.nickname}</h3>
                </section>
                <section className="alignSecTwoPlayerBox">
                  <input
                    type="number"
                    placeholder="kills"
                    value={formData[player.id]?.kills || ''}
                    onChange={(e) =>
                      handleInputChange(player.id, 'kills', e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="morte"
                    value={formData[player.id]?.mortes || ''}
                    onChange={(e) =>
                      handleInputChange(player.id, 'mortes', e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="colocação"
                    value={formData[player.id]?.colocacao || ''}
                    onChange={(e) =>
                      handleInputChange(player.id, 'colocacao', e.target.value)
                    }
                  />
                </section>
                <button onClick={() => handleSubmit(player.id)}>enviar</button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h1>Squad</h1>
          </div>
        )}
      </div>
    );
  }






  return (
    <div className="divAllcompAdminFases">
      <button onClick={onBack} className="btnBack">Voltar</button>

      <nav className="navigationCompAdminFases">
        <h3 className={activeTab === 'Status' ? 'textNavActive' : ''} onClick={() => setActiveTab('Status')}> Status </h3>
        <h3 className={activeTab === 'TipoTorneio' ? 'textNavActive' : ''} onClick={() => setActiveTab('TipoTorneio')}> {comp.tipoTorneio} </h3>
        <h3 className={activeTab === 'releasePlayer' ? 'textNavActive' : ''} onClick={() => setActiveTab('releasePlayer')}> releasePlayer </h3>
      </nav>
      
      {activeTab === 'Status' && (
        <div className="statusDivAll">
          <h2>Tempo restante: {tempoRestante} </h2>
          <div>
            <button className="btnEndCompOne" onClick={handleEncerrarParticipantes}> Encerrar Pros Paricipantes </button>
            <button className="btnEndCompTwo" onClick={handleEncerrarGeral}> Encerrar Geral </button>
          </div>
        </div>
      )}

      {activeTab === 'TipoTorneio' && (
         <div>
         <FaseMataMata />
       </div>
      )}

      {activeTab === 'releasePlayer' && (
        <div className="divAllReleasePlayer">
          {playersVerification.map((player) => (
            <div key={player.id} className="releasePlayerCard">
              <h3> {player.userName} </h3>
              <h3> Nick: {player.nickname} </h3>
              <button onClick={() => handleConfirmPlayer(player)} />
              <h3>Pagamento {player.pagamentoStatus}</h3>
              <FaDeleteLeft onClick={() => handleDeletePlayer(player.id)} style={{ cursor: 'pointer' }} />
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}
