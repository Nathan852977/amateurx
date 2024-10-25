import React, { useEffect, useState } from "react";
import "../../CSS/FriendsAside.css";
import { FaUserFriends } from "react-icons/fa";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc, getFirestore, onSnapshot } from "firebase/firestore";
import { fetchUserName, getUsername, getUserUid } from "../UI/InfoUser";
import { FotoUserPadrao } from "../UI/img";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export default function FriendsAside({ onFriendClick }) {

    const [showFirstSection, setShowFirstSection] = useState(true); // Controla a exibição da primeira section
    const [friendName, setFriendName] = useState(""); // Armazena o nome do amigo
    const [isError, setIsError] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [friends, setFriends] = useState([]);
    const [userName, setUserName] = useState("");
    const [userUid, setUserUid] = useState('');
    const [selectedFriend, setSelectedFriend] = useState(null);

    const db = getFirestore(); 

    // Função chamada ao clicar na div de um amigo
    const handleClick = (friend) => {
        console.log(`Amigo clicado: ${friend.username}, UID: ${friend.uid}`); // Exibe o nome e UID do amigo
        setSelectedFriend(friend); // Armazena o amigo clicado
        onFriendClick(friend); // Chama a função para ativar o chat
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

    const addFriendMsgBox = async () => {
        if (friendName.trim() === "") {
            setStatusMessage("Campo em Branco");
            setIsError(true);
            return;
        }
    
        // Verifique se o nome do usuário está definido antes de continuar
        if (!userName) {
            setStatusMessage("Erro: Usuário Inexistente");
            setIsError(true);
            return;
        }
    
        // Verifica se o nome do amigo é igual ao nome do usuário logado
        if (friendName.trim() === userName.trim()) {
            setStatusMessage("Seu Nome NÃO");
            setIsError(true);
            return;
        }
    
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", friendName));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userDocRef = doc(db, "users", userDoc.id);
    
                const msgBox = userDoc.data().msgBox || [];
                const conviteJaEnviado = msgBox.some(convite => 
                    convite.ConviteFriends && convite.ConviteFriends.sender === userName
                );
    
                if (conviteJaEnviado) {
                    setStatusMessage("Convite já Enviado");
                    setIsError(true);
                    return;
                }
    
                await updateDoc(userDocRef, {
                    msgBox: arrayUnion({
                        ConviteFriends: {
                            sender: userName,
                            senderUid: userUid,
                            message: `O ${userName} quer ser seu amigo, deseja aceitar o convite?`,
                            timestamp: Date.now()
                        }
                    })
                });
    
                setStatusMessage("Convite enviado com sucesso!");
                setIsError(false);
    
                setTimeout(() => {
                    setShowFirstSection(true);
                    setStatusMessage("");
                    setFriendName("");
                }, 2000);
            } else {
                setStatusMessage("Usuário Inexistente");
                setIsError(true);
            }
        } catch (error) {
            console.error("Erro ao adicionar ao msgBox:", error);
            setStatusMessage("Erro ao enviar a mensagem!");
            setIsError(true);
        }
    }; 

    useEffect(() => {
        if (!userUid) return; // Verifica se o UID do usuário está definido
    
        const userRef = doc(db, "users", userUid);
    
        const unsubscribe = onSnapshot(userRef, async (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.Friends && Array.isArray(data.Friends)) {
    
                    // Inicializa a lista de amigos com seus usernames e fotos padrão
                    const initialFriends = data.Friends.map((friend) => ({
                        username: friend.username,   // Assumindo que 'username' está presente
                        uid: friend.uid,             // Para futuras referências, armazenando o UID
                        photoUrl: FotoUserPadrao      // Inicializa com a foto padrão
                    }));
    
                    setFriends(initialFriends);
    
                    // Busca as fotos de cada amigo no Firebase Storage
                    try {
                        const friendsWithPhotos = await Promise.all(
                            data.Friends.map(async (friend) => {
                                const friendPhotoUrl = await getFriendPhoto(friend.username);
                                return { 
                                    username: friend.username, 
                                    uid: friend.uid, 
                                    photoUrl: friendPhotoUrl || FotoUserPadrao 
                                };
                            })
                        );
    
                        setFriends(friendsWithPhotos);
                    } catch (error) {
                        console.error("Erro ao buscar as fotos dos amigos:", error);
                    }
                } else {
                    console.log("Nenhum amigo encontrado para este usuário.");
                }
            } else {
                console.log("Nenhum documento encontrado para o UID do usuário:", userUid);
            }
        });
    
        return () => unsubscribe();
    }, [userUid]);    

    const getFriendPhoto = async (friendName) => {
        const storage = getStorage();
        const friendPhotoRef = ref(storage, `imagesUsers/${friendName}.png`);
        try {
            const url = await getDownloadURL(friendPhotoRef);
            return url; 
        } catch (error) {
            console.error("Imagem não encontrada para:", friendName, error);
            return null;
        }
    };
    

    return(
    <aside className="MobileFriendsAsideStyle">
        <div className="FriendsAsideContentAlignOne">
            <section>
                <h3> <FaUserFriends /> Amigos </h3>
            </section>
            <section className="secAllFriendsAdd">
                {showFirstSection ? (
                <div>
                    <button className="addFriendButton" onClick={() => setShowFirstSection(false)}> + </button>
                </div>
                ) : (
                <div className="divInputAddFriends">
                    <input
                    type="text"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    placeholder="Nome do amigo"
                    />
                    <button className="sendInviteButton" onClick={addFriendMsgBox}> &gt; </button>
                </div>
                )}
            </section>
        </div>

        <div className="divMessageFriendsInvite">
            {statusMessage && (
            <p className={`statusMessage ${isError ? "error" : "success"}`}>
                {statusMessage}
            </p>
            )}
        </div>

        <div className="FriendsAsideContentAlignTwo">
            {friends.map((friend, index) => (
            <div key={index} className="divStyleFriends" onClick={() => handleClick(friend)}>
                <img src={friend.photoUrl} alt="" className="imgStyleFriends" />
                <p className="pStyleFriends">{friend.username}</p>
            </div>
            ))}
        </div>
    </aside>
    )
}