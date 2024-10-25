import { useEffect, useState } from "react";
import "../../CSS/EnterGuild.css"
import { valorantLogo, freefireLogo } from "../UI/img.jsx"
import { FaChevronLeft, FaCrown, FaSearch, FaUser } from "react-icons/fa";
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, getFirestore, getDocs } from "firebase/firestore";
import { db } from "../UI/firebase.js";
import { fetchUserName, getUserGames } from "../UI/InfoUser.js";


export default function EnterGuild({ handleBackEnterGuildClick }) {

    const [guilds, setGuilds] = useState([]);
    const [jogos, setJogos] = useState([]);
    const [selectedGuild, setSelectedGuild] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [remainingInvites, setRemainingInvites] = useState(3);
    const [errorMessage, setErrorMessage] = useState("");
    const [guildLogoUrl, setGuildLogoUrl] = useState("");
    const [jogoSelected, setJogoSelected] = useState(""); // Adiciona o estado para o jogo selecionado

    const db = getFirestore(); 
    
    const games = [
        { src: freefireLogo, id: 'freefire' },
        { src: valorantLogo, id: 'valorant' },
    ];
    
    useEffect(() => {
        const loadUserData = async () => {
            await fetchUserName();  // Busca os dados do Firestore
            const gameSelected = getUserGames();  // Obtém os jogos do usuário
            setJogoSelected(gameSelected);  // Atualiza o estado dos jogos
        };
        loadUserData();
    }, []);

    useEffect(() => {
        const today = new Date().toLocaleDateString(); // Obtém a data de hoje
    
        // Verifica o número de convites restantes e a data do último convite no localStorage
        const storedInvites = localStorage.getItem('remainingInvites');
        const storedDate = localStorage.getItem('lastInviteDate');
    
        // Se for um novo dia, reseta o contador de convites
        if (storedDate !== today) {
          localStorage.setItem('remainingInvites', 3);
          localStorage.setItem('lastInviteDate', today);
          setRemainingInvites(3);
        } else if (storedInvites !== null) {
          setRemainingInvites(parseInt(storedInvites, 10));
        }
      }, []);
    
    const handleSendInvite = () => {
        if (remainingInvites > 0) {
          // Diminui o contador de convites e salva no localStorage
          const newRemainingInvites = remainingInvites - 1;
          setRemainingInvites(newRemainingInvites);
          localStorage.setItem('remainingInvites', newRemainingInvites);
    
          alert('Convite Enviado!');
        } else {
          setErrorMessage("Você já enviou o limite de convites por hoje. Tente novamente amanhã.");
        }
    };
    
    // Função para pegar o logo do jogo com base no nome do jogo
    const getJogoLogo = (jogo) => {
        if (!jogo) {
            return 'link_para_imagem_padrao'; // Verifica se "jogo" existe
        }

        // Remove espaços extras e converte para minúsculas
        const normalizedJogo = jogo.trim().toLowerCase();

        // Verifica se o jogo existe no array de games
        const game = games.find(game => game.id === normalizedJogo);

        if (!game) {
            return 'link_para_imagem_padrao'; // Retorna uma imagem padrão caso o logo não seja encontrado
        }

        return game.src; // Retorna o src da imagem se o jogo for encontrado
    };

    const handleGuildClick = (guild) => {
        setSelectedGuild(guild); // Armazena a guilda selecionada
        setShowModal(true); // Exibe o modal
      };    
    
      const handleCloseModal = () => {
        setShowModal(false); // Fecha o modal
        setSelectedGuild(null); // Limpa a guilda selecionada
        setErrorMessage(""); 
      };
  
    useEffect(() => {
        const fetchGuilds = async () => {
            try {
                const guildsCollection = collection(db, 'Guilds');
                const guildSnapshot = await getDocs(guildsCollection);
                const guildList = guildSnapshot.docs.map(doc => doc.data());
    
                // Armazenar guildas que correspondem ao jogo selecionado
                const filteredByGame = guildList.filter(guild => guild.jogo.toLowerCase() === jogoSelected.toLowerCase());
                setGuilds(filteredByGame); // Armazena apenas as guildas com o mesmo jogo
            } catch (error) {
                console.error('Erro ao buscar guildas:', error);
            }
        };
    
        fetchGuilds();
    }, [db, jogoSelected]);

    const filteredGuilds = guilds.filter(guild =>
        guild.name.toLowerCase().includes(searchTerm.toLowerCase()) // Filtra pelo nome da guilda
    );

    return (
    <div className="divEnterGuild">

        <div className="alignOneEnterGuild">
            <button onClick={handleBackEnterGuildClick} className="btnbackEnterGuild">
                <FaChevronLeft /> Voltar
            </button>
            <h1>Entre Em Uma Guilda</h1>
        </div>

        <div>
            <div className="inputContainer">
                <input 
                type="search" 
                id="search" 
                className="inputSearchGuild" 
                placeholder="Buscar guildas..." 
                value={searchTerm} // Vincula o valor do input ao estado
                onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o estado quando o usuário digita
                />
                <FaSearch />
            </div>

            <div className="divGuildContent">
                <p>Convites restantes: {remainingInvites}</p>
                {filteredGuilds.length > 0 ? (
                    filteredGuilds.map((guild, index) => (
                        <div key={index} className="guildItem" onClick={() => handleGuildClick(guild)}>
                            {guild.imageUrl && (
                                <img src={guild.imageUrl} alt={`${guild.name} Logo`} className="guildLogo" />
                            )}
                            <h3>{guild.name}</h3>
                            <h4>
                            <FaCrown /> {guild.Capitao}
                            </h4>
                            <h5>0/0</h5>
                            <img src={getJogoLogo(guild.jogo)} alt={guild.jogo || 'Jogo desconhecido'} className="gameLogoGuild"/>
                        </div>
                    ))
                ) : (
                    <p className="noGuildsMessage">Nenhuma guilda encontrada</p>
                )}

                {showModal && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        {selectedGuild && (
                        <div>
                            <section className="secAlignOneGuildSelected">
                                <img src={selectedGuild.imageUrl} alt={`${selectedGuild.name} Logo`} />
                                <h3> {selectedGuild.name} </h3>
                            </section>

                            <section className="secAlignTwoGuildSelected">
                                <div className="alignGuildSelectPlayerOfCap">
                                    <h3> <FaCrown style={{ color: 'gold' }} /> {selectedGuild.Capitao} </h3>
                                    {Object.keys(selectedGuild.Players).map((key, index) => (
                                        <div key={index} className="playerItem">
                                            <h4> <FaUser /> {selectedGuild.Players[key]} </h4>
                                        </div>
                                    ))}
                                </div>

                                <div className="guildSelectedTextArea">
                                    <div className="guildDescriptionDiv">
                                        {selectedGuild.description}
                                    </div>
                                </div>
                            </section>
                            
                            <section className="secAlignThreeGuildSelected">
                                <h2>Enviar Convite Para Essa Guilda</h2>

                                <div className="modalButtons">
                                    <button onClick={handleSendInvite} disabled={remainingInvites === 0}>Enviar</button>
                                    <button onClick={handleCloseModal}>Cancelar</button>
                                </div>                
                                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                            </section>                   
                        </div>
                        )}                
                </div>
            </div>
            )}
            </div>
        </div>
    </div>    
    )
}