import React, { useEffect, useState } from "react"
import { LogoOficialTwo } from "../UI/img.jsx"
import { BiSupport } from "react-icons/bi"
import { FaHome, FaGuilded, FaEnvelope, FaChevronCircleLeft, FaChevronCircleRight  } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { TiContacts, TiDelete } from "react-icons/ti";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { GiWingedSword } from "react-icons/gi";
import { signOut } from 'firebase/auth';
import { auth } from "../UI/firebase.js";
import { fetchUserName, getUsername, getUserUid } from "../UI/InfoUser.js";
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, arrayRemove, collection, arrayUnion, query, where, getDocs } from 'firebase/firestore';
import "../../CSS/OnHeader.css"

export default function OnHeader({ activeComponent, setActiveComponent }) {

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isBoxMsgVisible, setIsBoxMsgVisible] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const [userName, setUserName] = useState(""); 
    const [msgBoxes, setMsgBoxes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userUid, setUserUid] = useState('');
    const db = getFirestore();
    const [isError, setIsError] = useState(false); // Estado para indicar se houve erro
    const [message, setMessage] = useState(''); 

    const countConviteFriends = msgBoxes.filter(box => box.ConviteFriends).length;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % msgBoxes.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex - 1 + msgBoxes.length) % msgBoxes.length
        );
    };
    
    useEffect(() => {
        const loadUserData = async () => {
          await fetchUserName(); // Busca o nome e UID do usuário
          const name = getUsername(); // Obtém o nome do usuário
          const uid = getUserUid(); // Obtém o UID do usuário
          setUserName(name); // Atualiza o estado com o nome do usuário
          setUserUid(uid); // Atualiza o estado com o UID do usuário
        };
    
        loadUserData();
      }, []);

      useEffect(() => { 
        const fetchMsgBoxes = () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const uid = currentUser.uid;
    
            try {
                const db = getFirestore();
                const userDocRef = doc(db, 'users', uid);
    
                // Usa onSnapshot para escutar mudanças em tempo real
                const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        const msgBox = userData.msgBox;
    
                        if (Array.isArray(msgBox)) {
                            // Filtrar apenas mensagens que possuam "Convite"
                            const filteredMsgBox = msgBox.filter((message) => message.Convite);
                            setMsgBoxes(filteredMsgBox);
                            setMessageCount(filteredMsgBox.length); // Atualiza o contador de mensagens
                        } else {
                            console.log("msgBox não é um array ou não encontrado!");
                        }
                    } else {
                        console.log("Usuário não encontrado!");
                    }
                });
    
                // Retorna uma função para cancelar a inscrição quando o componente desmontar
                return () => unsubscribe();
    
            } catch (error) {
                console.error("Erro ao buscar msgBox:", error);
            }
        };
    
        fetchMsgBoxes();
    }, []); // O array de dependências vazio indica que o efeito será executado apenas uma vez, na montagem  
    
    

    const toggleBoxMsg = () => {
        setIsDropdownVisible(false);
        setIsBoxMsgVisible(!isBoxMsgVisible);
    };

    const toggleDropdown = () => {
        setIsBoxMsgVisible(false);
        setIsDropdownVisible(!isDropdownVisible);
    };
        
    // Funçao Para Deslogar
    const handleLogout = () => {
        signOut(auth)
          .then(() => {
            console.log('Usuário deslogado com sucesso.');
          })
          .catch((error) => {
            console.error('Erro ao deslogar:', error);
          });
    }

    const renderDots = () => {
        const total = msgBoxes.length;
        const maxVisibleDots = 3;

        if (total <= maxVisibleDots) {
            return msgBoxes.map((_, index) => (
                <span
                    key={index}
                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                ></span>
            ));
        } else {
            // Mostrar as primeiras 3 bolinhas
            const dots = msgBoxes.slice(0, maxVisibleDots).map((_, index) => (
                <span
                    key={index}
                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                ></span>
            ));

            // Adicionar o "+" com a quantidade restante
            dots.push(
                <span key="more" className="dot more">
                    +{total - maxVisibleDots}
                </span>
            );

            return dots;
        }
    };

    const handleDeleteMsg = async (msgIndex) => {
        if (!userUid) return; // Verifica se o UID do usuário está disponível
    
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'users', userUid); // Usa o 'userUid' em vez de 'auth.currentUser.uid'
    
            // Mensagem a ser deletada
            const msgToDelete = msgBoxes[msgIndex];
    
            // Remover a mensagem do Firestore
            await updateDoc(userDocRef, {
                msgBox: arrayRemove(msgToDelete)
            });
    
            // Remover a mensagem localmente
            const updatedMsgBoxes = msgBoxes.filter((_, index) => index !== msgIndex);
            setMsgBoxes(updatedMsgBoxes);
    
            // Atualizar a contagem de mensagens
            setMessageCount(updatedMsgBoxes.length);
    
        } catch (error) {
            console.error("Erro ao deletar a mensagem:", error);
        }
    };

    const acceptInvitationFriend = async (index) => {
        try {
            const userRef = doc(db, "users", userUid); // 'userUid' é o ID do usuário logado
            const docSnap = await getDoc(userRef);
    
            if (docSnap.exists()) {
                const data = docSnap.data();
    
                if (data.msgBox && Array.isArray(data.msgBox) && data.msgBox.length > 0) {
                    const convite = data.msgBox[index]; // Pega o convite baseado no index passado
    
                    if (convite && convite.Convite.tipo === "friend") {
                        const sender = convite.Convite.sender; // Nome do remetente
                        const senderUid = convite.Convite.senderUid; // UID do remetente
    
                        // Adiciona o sender (com nome e UID) ao array Friends do usuário logado e remove o convite selecionado
                        await updateDoc(userRef, {
                            Friends: arrayUnion({
                                username: sender, // Nome de usuário do remetente
                                uid: senderUid // UID do remetente
                            }),
                            msgBox: arrayRemove(convite)
                        });
    
                        // Defina a referência para a coleção de usuários
                        const usersRef = collection(db, "users");
    
                        // Atualiza o Friends do remetente
                        const senderRef = query(usersRef, where("username", "==", sender));
                        const senderSnap = await getDocs(senderRef);
    
                        if (!senderSnap.empty) {
                            const senderDoc = senderSnap.docs[0];
                            const senderDocRef = doc(db, "users", senderDoc.id);
    
                            // Adiciona o userName e UID do usuário logado aos amigos do remetente
                            await updateDoc(senderDocRef, {
                                Friends: arrayUnion({
                                    username: userName, // Nome do usuário logado
                                    uid: userUid // UID do usuário logado
                                })
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados: ", error);
        }
    };

    const acceptInvitationGuild = async (index) => {
        try {
            const convite = msgBoxes[index].Convite;
            const userRef = doc(db, "users", userUid);
    
            if (convite && convite.tipo === "guild") {
                // Atualiza o usuário logado com o nome da guilda
                await updateDoc(userRef, {
                    guild: convite.guildName,
                    msgBox: arrayRemove(msgBoxes[index])
                });
    
                // Adiciona o jogador à guilda
                const guildRef = doc(db, "Guilds", convite.guildName);
                await updateDoc(guildRef, {
                    Players: arrayUnion(userName)
                });
    
                setMessage("Você agora faz parte da guilda " + convite.guildName + "!");
                setIsError(false);
                setTimeout(() => {
                    setMessage("");
                }, 3000);
            }
        } catch (error) {
            console.error("Erro ao aceitar convite de guilda: ", error);
            setMessage("Erro ao aceitar o convite de guilda.");
            setIsError(true);
        }
    };    
    
    

    return (
    <header className="headerStyle">
        <section className="secHeaderAlignOne">
            <img src={LogoOficialTwo} alt="" className="imgLogoOficial" />
            <h2 className="titleAX">
                AMATEUR-X
            </h2>
        </section>

        <section className="secHeaderAlignAnchor">
            <button className={activeComponent === 'Home' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Home')}> <FaHome /> </button>
            <button className={activeComponent === 'Guild' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Guild')}> <FaGuilded /> </button>
            <button className={activeComponent === 'Sword' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Sword')}> <GiWingedSword /> </button>
            <button className={activeComponent === 'Contacts' ? 'anchorHeaderOnStyle' : 'anchorHeaderOffStyle'} onClick={() => setActiveComponent('Contacts')}> <TiContacts /> </button>
        </section>

        <section className="secHeaderAlignSingUp">
            <h1 className="TitlePlayerName">{userName ? userName : "Player"}</h1>
            <button className="btnLayoutAnside" onClick={toggleBoxMsg}> 
                {messageCount > 0 && <span className="notificationCount">{messageCount}</span>}    
                <FaEnvelope /> 
            </button>
            <button className="btnLayoutAnside" onClick={toggleDropdown}> <FaCircleUser /> </button>

            {isBoxMsgVisible && (
            <div className={`menuUserTrue ${isBoxMsgVisible ? 'menuUserFalse' : ''}`}>
                <div>
                    {msgBoxes.length > 0 ? (
                    <div className="divCarouselHeader">
                        <section className="carouselSlideHeader">
                            <h3>
                            {msgBoxes[currentIndex].Convite.tipo === 'friend' 
                                ? "Convite De Amizade" 
                                : msgBoxes[currentIndex].Convite.tipo === 'guild' 
                                ? "Convite De Guilda" 
                                : "Convite"}
                            </h3>
                            <p>{msgBoxes[currentIndex].Convite?.message || "Sem mensagem."}</p>
                            <div>
                                <button className="btnStyleDeleteMsg" onClick={() => handleDeleteMsg(currentIndex)}> <TiDelete /> </button>
                                <button
                                    className="btnStyleAcceptMsg"
                                    onClick={() => {
                                        const convite = msgBoxes[currentIndex].Convite;
                                        if (convite.tipo === 'friend') {
                                            acceptInvitationFriend(currentIndex);
                                        } else if (convite.tipo === 'guild') {
                                            acceptInvitationGuild(currentIndex);
                                        }
                                    }}
                                >
                                    <RiVerifiedBadgeFill />
                                </button>
                            </div>
                        </section>
                        
                    </div>
                    ) : (
                        <p className="conviteDontExistStyle">Não há Mensagens.</p>
                    )}
                </div>
                {msgBoxes.length > 0 ? (
                <section className="carouselControls">
                    <button className="btnStylePassSlide" onClick={prevSlide}> <FaChevronCircleLeft /> </button>
                    {renderDots()}
                    <button className="btnStylePassSlide" onClick={nextSlide}> <FaChevronCircleRight /> </button>
                </section>
                ) : (
                null 
                )}
            </div>
            )}
  
            {isDropdownVisible && (
                <div className={`menuUserTrue ${isDropdownVisible ? 'menuUserFalse' : ''}`}>
                    <button onClick={handleLogout} className="btnLogoutOnHeader"> Deslogar </button>
                    <div className="contentGlobalMenuUser">
                        <p>Suporte <BiSupport /> </p>
                    </div>           
                </div>
            )}
        </section>
    </header>
    )
}