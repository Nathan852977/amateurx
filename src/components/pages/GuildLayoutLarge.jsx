import React, { useEffect, useState } from "react";
import "../../CSS/GuildExist.css";
import { fetchUserName, getUserUid, getUsername } from "../UI/InfoUser";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion, orderBy, addDoc, onSnapshot} from "firebase/firestore";
import { FaEnvelopeOpenText, FaGear } from "react-icons/fa6";
import { FotoUserPadrao } from "../UI/img";
import { FaChevronCircleLeft, FaCrown, FaChevronCircleRight, FaUser } from "react-icons/fa";
import { BsChatLeftQuoteFill } from "react-icons/bs";
import { MdMeetingRoom } from "react-icons/md";
import { format } from 'date-fns';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export default function GuildLayoutLarge() {
  
    const [guildData, setGuildData] = useState(null);
    const [userUid, setUserUid] = useState("");
    const [userGuild, setUserGuild] = useState(null);
    const [isCaptain, setIsCaptain] = useState(false);
    const [description, setDescription] = useState("");
    const [currentSection, setCurrentSection] = useState(0); // Estado para controlar a seção atual
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("");
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const db = getFirestore();

    useEffect(() => {
      const loadUserData = async () => {
        await fetchUserName(); 
        const name = getUsername();
        const uid = getUserUid();
        setUserName(name); 
        setUserUid(uid); 

        if (uid) {
          await checkUserGuild(uid);
        }
      };
      
  
      loadUserData();
    }, []);
  

  const checkUserGuild = async (uid) => {
    const db = getFirestore();
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.guild) {
        setUserGuild(userData.guild);
        await fetchGuildData(userData.guild);
      } else {
        setUserGuild(null);
      }
    } else {
      setUserGuild(null);
    }
  };

  const fetchGuildData = async (guildName, uid) => {
    const guildDocRef = doc(db, "Guilds", guildName);
    const guildDoc = await getDoc(guildDocRef);

    if (guildDoc.exists()) {
      const guildData = guildDoc.data();
      setGuildData(guildData);
      setDescription(guildData.description);
      if (guildData.captain === uid) {
        setIsCaptain(true);
      }
    } else {
      setGuildData(null);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleDescriptionSave = async () => {
    if (isCaptain && guildData) {
      const db = getFirestore();
      const guildDocRef = doc(db, "Guilds", userGuild);
      await updateDoc(guildDocRef, {
        description: description,
      });
      alert("Descrição atualizada com sucesso!");
    }
  };

  // Função para ir para a próxima seção
  const handleNext = () => {
    setCurrentSection((prevSection) => (prevSection + 1) % 2); // Alterna entre as 2 seções
  };

  // Função para ir para a seção anterior
  const handlePrev = () => {
    setCurrentSection((prevSection) => (prevSection - 1 + 2) % 2); // Alterna entre as 2 seções
  };

  const handleInputChange = (e) => {
    setMemberName(e.target.value);
  };

  const handleAddMember = async () => {
    if (!memberName.trim()) {
        setMessage('Digite um nome válido!');
        setIsError(true);
        return;
    }

    setLoading(true);

    try {
        // Cria uma referência para o documento do usuário logado
        const userRef = doc(db, 'users', userUid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            setMessage('Erro ao obter informações do usuário.');
            setIsError(true);
            setLoading(false);
            return;
        }

        // Obtém a lista de amigos do usuário logado
        const userData = userSnap.data();
        const friends = userData.Friends || [];

        // Verifica se o nome do membro está na lista de amigos
        const isFriend = friends.some(friend => friend.username === memberName);

        if (!isFriend) {
            setMessage('Você só pode convidar membros que estão na sua lista de amigos.');
            setIsError(true);
            setLoading(false);
            return;
        }

        // Cria uma referência para a coleção 'users'
        const usersRef = collection(db, 'users');

        // Procura um usuário onde o 'username' seja igual ao nome digitado
        const q = query(usersRef, where('username', '==', memberName));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setMessage('Usuário não encontrado.');
            setIsError(true);
            setLoading(false);
            return;
        }

        // Percorre os resultados (supondo que só haverá um usuário com esse nome)
        querySnapshot.forEach(async (docSnapshot) => {
            const userDocRef = doc(db, 'users', docSnapshot.id);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                setMessage('Erro ao obter informações do usuário a ser convidado.');
                setIsError(true);
                setLoading(false);
                return;
            }

            const userDocData = userDocSnap.data();
            const msgBox = userDocData.msgBox || [];

            // Verifica se já existe um convite pendente do mesmo remetente e tipo "guild"
            const alreadyInvited = msgBox.some(
                (invite) => 
                    invite.Convite &&
                    invite.Convite.tipo === "guild" &&
                    invite.Convite.senderUid === userUid &&
                    invite.Convite.guildName === userGuild
            );

            if (alreadyInvited) {
                setMessage('Convite já enviado anteriormente.');
                setIsError(true);
                setLoading(false);
                return;
            }

            // Cria o convite para adicionar à caixa de mensagens
            const inviteMessage = {
                Convite: {
                    tipo: "guild",
                    sender: userName,
                    senderUid: userUid,
                    message: `O Capitão ${userName} quer que você se junte à guilda ${userGuild}, deseja aceitar o convite?`,
                    timestamp: Date.now(),
                    guildName: userGuild,
                },
            };

            // Adiciona o convite à caixa de mensagens do usuário sem sobrescrever o conteúdo existente
            await updateDoc(userDocRef, {
                msgBox: arrayUnion(inviteMessage),
            });

            setMessage('Convite enviado com sucesso!');
            setIsError(false);
            setTimeout(() => {
                setIsAddingMember(false);
                setMessage('');
            }, 3000);
        });
    } catch (error) {
        console.error('Erro ao enviar o convite: ', error);
        setMessage('Ocorreu um erro ao enviar o convite.');
        setIsError(true);
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="guildLayoutLargeContainer">
      {guildData ? (
        <>
        <section className="secHeaderGuildLayout">
            <div className="alignHeaderOneGuildLayout">
                <img src={guildData.imageUrl} alt={guildData.name} />
                <h1>{guildData.name}</h1> 
            </div>
            
            <div className="divCarouselBtns">
                <button className="btnCarousel" onClick={handlePrev}> <FaChevronCircleLeft /> </button>
                    <div className="divCaroselSpans">
                        <MdMeetingRoom className={currentSection === 0 ? 'active' : 'svgDecline'}  onClick={() => setCurrentSection(0)} />
                        <BsChatLeftQuoteFill className={currentSection === 1 ? 'active' : 'svgDecline'} onClick={() => setCurrentSection(1)} />
                    </div>
                <button className="btnCarousel" onClick={handleNext}> <FaChevronCircleRight /> </button>
            </div>

            <div className="alignHeaderTwoGuildLayout">
                <button className="btnAlignHeaderThreeGuildLayout"> <FaEnvelopeOpenText /> </button>
                <button className="btnAlignHeaderThreeGuildLayout"> <FaGear /> </button>
            </div>
        </section>

        <div className="carouselGuildLayoutContainer" style={{ transform: `translateX(-${currentSection * 100}%)`, transition: 'transform 0.5s ease-in-out' }}>
            <section className="carouselSection">
                <div className="carouselCardsContainer">
                    <div className="cardWrapper">

                        <div className="cardPlayerOfCap" style={{ width: '50%' }}>
                          {userName === guildData.Capitao ? (
                            <div className="divPOCall">
                                <div className="divPOCcaptain">
                                    <h1> <FaCrown style={{ color: 'gold' }} /> {guildData.Capitao}</h1>
                                    {guildData.Players && typeof guildData.Players === 'object' &&
                                    Object.entries(guildData.Players).map(([key, player], index) => (
                                        <h3 key={index}> <FaUser style={{ color: 'cyan' }} /> {player}</h3>
                                    ))}
                                </div>
                                <div className="divAddMember">
                                  <input
                                  placeholder="Nome do membro"
                                  className="inputAddMember"
                                  value={memberName}
                                  onChange={handleInputChange}
                                  />
                                  <button
                                  className="btnAddMember"
                                  onClick={handleAddMember}
                                  disabled={loading}
                                  >
                                    +
                                  </button>
                                  <p style={{ color: isError ? '#e06c6c' : 'green' }}>{message}</p>
                                </div>
                            </div>
                            ) : (
                                <div className="divPOCplayer">
                                  <h1> <FaCrown style={{ color: 'gold' }} /> {guildData.Capitao}</h1>
                                  {guildData.Players && typeof guildData.Players === 'object' &&
                                  Object.entries(guildData.Players).map(([key, player], index) => (
                                      <h3 key={index}> <FaUser style={{ color: 'cyan' }} /> {player}</h3>
                                  ))}
                                </div>
                            )}             
                        </div>

                        <div className="cardDescription" style={{ width: '50%' }}>
                          {userName === guildData.Capitao ? (
                            <>
                                <textarea
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    className="descriptionTextArea"
                                />
                                <button onClick={handleDescriptionSave} className="saveDescriptionButton">Salvar</button>
                            </>
                            ) : (
                                <p>{guildData.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="cardWrapperTwo">
                        <div className="card" style={{ width: '100%' }}>
                            Card 3
                        </div>
                    </div>
                </div>
            </section>

            <section className="carouselSection">
              <div className="divChatWebSocketsGuildEmBreve">
                <h1> Chat Da Guilda Em Breve </h1>
              </div>        
            </section>
        </div>

        
        </>
      ) : (
        <p>Carregando dados da guilda...</p>
      )}
    </div>
  );
}
