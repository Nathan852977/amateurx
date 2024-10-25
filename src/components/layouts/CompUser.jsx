  import React, { useEffect, useState } from "react"
  import "../../CSS/CompUser.css"
  import { db } from "../UI/firebase.js";
  import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
  import axios from 'axios';
  import { fetchUserName, getUsername, getUserUid, getUserGames } from "../UI/InfoUser.js";


  export default function CompUser() {

    const [activeTab, setActiveTab] = useState("Solo");
    const [competicoes, setCompeticoes] = useState([]);
    const [filteredCompeticoes, setFilteredCompeticoes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSquadFullScreen, setIsSquadFullScreen] = useState(false);
    const [nickname, setNickname] = useState("");
    const [pixKey, setPixKey] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userUid, setUserUid] = useState("");
    const [userName, setUserName] = useState("");
    const [isJogo, setIsJogo] = useState("");
    const [isInCompetition, setIsInCompetition] = useState(false);
    const [isGuildCaptain, setIsGuildCaptain] = useState(false);
    const [guildName, setGuildName] = useState("");
    const [guildCaptainName, setGuildCaptainName] = useState("");
    const [hasGuild, setHasGuild] = useState(false);
    const [soloErrorMessage, setSoloErrorMessage] = useState("");
    const [squadErrorMessage, setSquadErrorMessage] = useState("");
    const valorEntrada = filteredCompeticoes[currentIndex]?.valorEntrada || 0;
    
    useEffect(() => {
      const loadUserData = async () => {
        await fetchUserName();
        const name = getUsername();
        const uid = getUserUid();
        const jogo = getUserGames();
        setIsJogo(jogo);
        setUserName(name);
        setUserUid(uid);
    
        // Verifica se o usuário já está em uma competição com pagamentoStatus "pago"
        const userCompetitionRef = collection(db, "users", uid, "competitions");
        const querySnapshot = await getDocs(userCompetitionRef);
    
        const isUserInPaidCompetition = querySnapshot.docs.some((doc) => {
          const data = doc.data();
          return data.pagamentoStatus === "pago";
        });
    
        setIsInCompetition(isUserInPaidCompetition);
        if (isUserInPaidCompetition) {
          setSoloErrorMessage("Você já está inscrito em uma competição individual e não pode participar de outra.");
        } else {
          setSoloErrorMessage("");
        }
      };
    
      loadUserData();
    }, []);
      
    useEffect(() => {
      // Verifica se o usuário tem uma guilda e se é o capitão
      const verifyGuild = async () => {
        if (!userUid || activeTab !== "Squad") return;
  
        const userDocRef = doc(db, "users", userUid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const guildName = userData.guild; // Aqui pegamos o nome da guilda do campo "guild"
          
          if (guildName) {
            setGuildName(guildName);
            setHasGuild(true);
        
            // Agora, com o nome da guilda, fazemos a verificação do capitão.
            const guildDetailsRef = doc(db, "Guilds", guildName);
            const guildDetailsSnap = await getDoc(guildDetailsRef);
        
            if (guildDetailsSnap.exists()) {
              const guildDetails = guildDetailsSnap.data();
              const captainName = guildDetails.Capitao;
              setGuildCaptainName(captainName);
        
              if (captainName === userName) {
                setIsGuildCaptain(true);
                setSquadErrorMessage(""); // Limpa a mensagem de erro se o usuário for o capitão
              } else {
                setIsGuildCaptain(false);
                setSquadErrorMessage(`Você não é o capitão de ${guildName}. Fale com ${captainName}.`);
              }
            }
          } else {
            setHasGuild(false);
            setSquadErrorMessage("Você não tem um grupo.");
          }
        } else {
          setHasGuild(false);
          setSquadErrorMessage("Erro ao carregar os dados do usuário.");
        }
      };
  
      verifyGuild();
    }, [userUid, userName, activeTab]);
      
      // Filtra as competições com base nas verificações
      useEffect(() => {
        if (activeTab === "Squad" && hasGuild !== null && isGuildCaptain !== null) {
          if (!hasGuild) {
            setFilteredCompeticoes([]);
          } else if (hasGuild && !isGuildCaptain) {
            setFilteredCompeticoes([]);
          } else if (hasGuild && isGuildCaptain) {
            const filtered = competicoes.filter(
              (comp) =>
                comp.compStatus.toLowerCase() === "visible" &&
                comp.jogo.toLowerCase() === isJogo.toLowerCase() &&
                comp.estiloCompeticao.toLowerCase() === "squad"
            );
            setFilteredCompeticoes(filtered);
            setErrorMessage("");
          }
        } else if (activeTab !== "Squad") {
          const filtered = competicoes.filter(
            (comp) =>
              comp.compStatus.toLowerCase() === "visible" &&
              comp.jogo.toLowerCase() === isJogo.toLowerCase() &&
              comp.estiloCompeticao.toLowerCase() === activeTab.toLowerCase()
          );
          setFilteredCompeticoes(filtered);
          setErrorMessage("");
        }
        setCurrentIndex(0); // Reseta o índice ao aplicar um novo filtro
      }, [activeTab, competicoes, isJogo, hasGuild, isGuildCaptain]);
      

    const handleSubmit = async (e) => {
      e.preventDefault();
      
        if (!nickname || !pixKey || !termsAccepted) {
          setErrorMessage("Por favor, preencha todos os campos e aceite os termos.");
          return;
        }
      
        try {
          // Buscando o access_token do Firestore
          const tokenDoc = await getDoc(doc(db, "security", "mercadoPago"));
          if (!tokenDoc.exists()) {
            setErrorMessage("Token de acesso do Mercado Pago não encontrado.");
            return;
          }
          const accessToken = tokenDoc.data().token;
      
          // Faz a requisição para o Mercado Pago para criar a preferência de pagamento
          const response = await axios.post(
            'https://api.mercadopago.com/v1/payments',
            {
              transaction_amount: parseFloat(valorEntrada),
              description: `Username: ${userName}, NickName: ${nickname}, Competição: ${filteredCompeticoes[currentIndex]?.nome || "Nome da Competição"}`,
              payment_method_id: 'pix',
              payer: {
                email: 'nathanandrade8577@gmail.com', // Pode ajustar esse email dinamicamente se necessário
              },
              date_of_expiration: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
              metadata: {
                userUid: userUid,
                competitionName: filteredCompeticoes[currentIndex]?.nome || "Nome da Competição",
              },
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
      
          const ticketUrl = response.data.point_of_interaction.transaction_data.ticket_url;
          window.open(ticketUrl, '_blank');
      
          // Salva o status de pagamento no Firestore
          await setDoc(
            doc(db, "comp", filteredCompeticoes[currentIndex].id, "PlayersVerification", userName),
            {
              userName: userName,
              userUid: userUid,
              nickname: nickname,
              chavePix: pixKey,
              pagamentoStatus: 'em andamento',
            }
          );
      
          await setDoc(
            doc(db, "users", userUid, "competitions", filteredCompeticoes[currentIndex].id),
            {
              pagamentoStatus: 'em andamento',
            }
          );
        } catch (error) {
          console.error('Erro ao criar a preferência de pagamento:', error);
          setErrorMessage("Erro ao processar o pagamento. Tente novamente mais tarde.");
        }
      };
        
    // Função para alternar entre as categorias
    const handleTabChange = (tab) => {
      setActiveTab(tab);
      setCurrentIndex(0); // Reseta o índice ao trocar de categoria
    };

    // Função para buscar competições do Firestore
    const fetchCompeticoes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "comp"));
        const comps = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompeticoes(comps);
      } catch (error) {
        console.error("Erro ao buscar competições: ", error);
      }
    };

    // Chama a função para buscar competições ao montar o componente
    useEffect(() => {
      fetchCompeticoes();
    }, []);
    
    // Função para navegar para a próxima competição
    const nextComp = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === filteredCompeticoes.length - 1 ? 0 : prevIndex + 1
      );
    };

    // Função para navegar para a competição anterior
    const prevComp = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? filteredCompeticoes.length - 1 : prevIndex - 1
      );
    };

    // Função para alternar a tela cheia
    const toggleFullScreen = () => {
    console.log("toggleFullScreen chamado. ActiveTab:", activeTab);
  
      if (!isInCompetition) {
        if (activeTab === "Squad") {
          setIsSquadFullScreen(true);
        } else {
          setIsFullScreen(true);
        }
        setErrorMessage("");
      } else {
        setErrorMessage("Você já está inscrito em uma competição e não pode participar de outra.");
      }
    };
  
    const closeFullScreen = () => {
      setIsFullScreen(false);
      setIsSquadFullScreen(false);
      setErrorMessage("");
    };
  
      

      return (
      <div className="divAllCompUser">
          <div className="divAnchorComp">
              <a href="#" className={activeTab === "Solo" ? "anchorCompActive" : "anchorCompDesable"} onClick={() => handleTabChange("Solo")}> Solo </a>
              <a href="#" className={activeTab === "Squad" ? "anchorCompActive" : "anchorCompDesable"} onClick={() => handleTabChange("Squad")}> Grupo </a>
          </div>

          <div className="divContentCompAdmin">
            <div className="divChildContentCompAdmin">
              {filteredCompeticoes.length > 0 ? (
                <div className="compAdminCard">
                  <button onClick={prevComp} className="carouselButton leftButton">{"<"}</button>
                  <div key={filteredCompeticoes[currentIndex].id} className="cardContentCompAdmin">
                    <p className="textStyleNumberPlayerComp"> {filteredCompeticoes[currentIndex].participantes} / {activeTab === "Solo"
                    ? filteredCompeticoes[currentIndex].numPlayers
                    : filteredCompeticoes[currentIndex].quantidadeGrupos}
                    </p>
                    {activeTab === "Solo" && soloErrorMessage && (
                      <p className="errorMessage">{soloErrorMessage}</p> // Exibe a mensagem de erro para Solo
                    )}
                    {activeTab === "Squad" && squadErrorMessage && (
                      <p className="errorMessage">{squadErrorMessage}</p> // Exibe a mensagem de erro para Squad
                    )}
                    <img src={filteredCompeticoes[currentIndex].imgCompeticao} alt={filteredCompeticoes[currentIndex].nome} onClick={toggleFullScreen} />
                  </div>
                  <button onClick={nextComp} className="carouselButton rightButton">{">"}</button>
                </div>
                ) : (
                  <p className="textStyleDontEquipe">
                    {activeTab === "Solo" ? soloErrorMessage || "Nenhuma competição encontrada para Solo" : 
                    squadErrorMessage || "Nenhuma competição encontrada para Grupo"}
                  </p>
              )}
            </div>
          </div>

          {isSquadFullScreen && (
            <div className="fullScreenDiv">
              <button onClick={closeFullScreen} className="btnBackDivCreateComp">Fechar</button>
              <h1>{filteredCompeticoes[currentIndex].nome}</h1>
              <div className="squadDetails">
                <h2>Detalhes da Competição em Grupo</h2>
                <p>Nome da Guilda: {guildName}</p>
                <p>Capitão: {guildCaptainName}</p>
                <p>Regras: {filteredCompeticoes[currentIndex].descricaoRegras}</p>
                <p>Quantidade de Grupos: {filteredCompeticoes[currentIndex].quantidadeGrupos}</p>
              </div>
            </div>
          )}

          {isFullScreen && (
          <div className="fullScreenDiv">
              <button onClick={closeFullScreen} className="btnBackDivCreateComp">Fechar</button>
              <h1> {filteredCompeticoes[currentIndex].nome} </h1>

              <form onSubmit={handleSubmit} className="formInscricao">
                  <div className="formDivContentTwo">
                      <input
                          type="text"
                          id="nickname"
                          name="nickname"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Digite seu Nickname"
                          required
                      />
                  </div>
                  <div className="formDivContentTwo">   
                      <input
                          type="text"
                          id="pixKey"
                          name="pixKey"
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder="Digite sua chave PIX"
                          required
                      />
                  </div>

                  <div className="formDivContentTwo">
                      <div className="formDivSelectedPhoto">
                          <section>
                            <p>{filteredCompeticoes[currentIndex].descricaoRegras}</p>
                          </section>
                          <div>
                              <input
                                  type="checkbox"
                                  id="terms"
                                  name="terms"
                                  checked={termsAccepted}
                                  onChange={(e) => setTermsAccepted(e.target.checked)}
                                  required
                              />
                              <label htmlFor="terms">Eu aceito os termos e condições </label>
                          </div>                    
                      </div>
                  </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button type="submit" className="btnInscritionComp" disabled={!nickname || !pixKey || !termsAccepted} onClick={handleSubmit}>
                  Inscrever-se
              </button>
          </form>
          </div>
          )}
      </div>
      )
  }