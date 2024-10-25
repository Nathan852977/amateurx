import React, { useEffect, useState } from "react"
import "../../CSS/CompAdmin.css"
import { FaCamera} from "react-icons/fa";
import { db, storage } from "../UI/firebase.js";
import { collection, setDoc, getDocs, doc  } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { fetchUserName, getUsername } from "../UI/InfoUser.js";

export default function CompAdmin({ onSelectComp }) {

    const [selectedImage, setSelectedImage] = useState(null);
    const [isDivVisible, setIsDivVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState("Solo");
    const [competicoes, setCompeticoes] = useState([]);
    const [filteredCompeticoes, setFilteredCompeticoes] = useState([]);
    const [selectedComp, setSelectedComp] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSquadSelected, setIsSquadSelected] = useState(false);
    const [userName, setUserName] = useState(""); 
    const [formValues, setFormValues] = useState({
      jogo: "",
      horarioCompeticao: "",
      estiloCompeticao: "",
      tipoTorneio: "",
      imgCompeticao: null,
      descricaoRegras: "",
      numPlayers: "",
      valorEntrada: "",
      valorRecompensa: ""
    });

    useEffect(() => {
      const loadUserData = async () => {
        await fetchUserName(); // Busca o nome e UID do usuário
        const name = getUsername(); // Obtém o nome do usuário
        setUserName(name); // Atualiza o estado com o nome do usuário
      };
  
      loadUserData();
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

     // Função para alternar entre as categorias
     const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentIndex(0);
    };  

    const handleSelectComp = (comp) => {
      console.log('Competição selecionada:', comp);
      onSelectComp(comp); // Certifique-se de que estamos chamando a função prop aqui
    };
  
    
    

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
    
    useEffect(() => {
      const filtered = competicoes.filter(
        (comp) => comp.estiloCompeticao === activeTab
      );
      setFilteredCompeticoes(filtered);
      setCurrentIndex(0); // Reset o índice ao aplicar um novo filtro
    }, [activeTab, competicoes]);
    
    useEffect(() => {
      fetchCompeticoes();
    }, []);
         
    const handleInputChange = (e) => {
      const { name, value } = e.target;

      // Verifica se o estilo da competição é "Squad"
  if (name === "estiloCompeticao") {
    setIsSquadSelected(value === "Squad");
  }
    
      // Verificação para os campos de valor (valorEntrada e valorRecompensa)
      if (name === "valorEntrada" || name === "valorRecompensa") {
        // Regex para validar formato: números inteiros ou com duas casas decimais.
        const regex = /^\d+(\.\d{1,2})?$/;
    
        // Substitui vírgula por ponto para facilitar a validação
        const formattedValue = value.replace(",", ".");
    
        if (regex.test(formattedValue) || formattedValue === "") {
          setFormValues({ ...formValues, [name]: formattedValue });
          setErrorMessage(""); // Limpa a mensagem de erro ao inserir um valor válido
        } else {
          setErrorMessage("Por favor, insira um valor válido em reais (ex: 1,00 ou 10,00).");
        }
      } else {
        setFormValues({ ...formValues, [name]: value });
      }
    };
     
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          if (img.width === 1080 && img.height === 1920) {
            setFormValues({ ...formValues, imgCompeticao: file });
            const reader = new FileReader();
            reader.onloadend = () => {
            setSelectedImage(reader.result);
          };
          reader.readAsDataURL(file);
          } else {
            setErrorMessage("A imagem deve ter a resolução 1080x1920.");
          }
        };
      }
    };

    const CreateComp = async (e) => {
      e.preventDefault();
      if (!formValues.imgCompeticao) {
        setErrorMessage("Por favor, escolha uma imagem para a competição.");
        return;
      }
    
      try {
        setErrorMessage("");
    
        // Upload da imagem para o Firebase Storage
        const storageRef = ref(storage, `competicoes/${formValues.imgCompeticao.name}`);
        await uploadBytes(storageRef, formValues.imgCompeticao);
        const imageUrl = await getDownloadURL(storageRef);
    
        // Formatar a data para usar no ID do documento
        const date = new Date(formValues.horarioCompeticao);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}_${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
        // Criar o identificador personalizado para o nome do documento
        const docId = `${formValues.nomeCompeticao.replace(/ /g, '_')}_${formattedDate}`;
    
        // Adicionando a competição ao Firestore com um ID personalizado
        await setDoc(doc(db, "comp", docId), {
          nome: formValues.nomeCompeticao,
          ...formValues,
          horarioCompeticao: formValues.horarioCompeticao,
          numPlayers: parseInt(formValues.numPlayers, 10),
          valorEntrada: parseFloat(formValues.valorEntrada),
          valorRecompensa: parseFloat(formValues.valorRecompensa),
          imgCompeticao: imageUrl, // Armazenando a URL da imagem no Firestore
          participantes: 0,
          compStatus: "visible",
          admin: userName,
        });
    
        setErrorMessage("Competição criada com sucesso!");
        handleCloseDiv();
      } catch (error) {
        console.error("Erro ao criar competição: ", error);
        setErrorMessage("Falha ao criar competição. Tente novamente.");
      }
    };   
      
    const handleShowDiv = () => {
      setIsDivVisible(true);
    };
  
    const handleCloseDiv = () => {
      setIsDivVisible(false);
      setSelectedImage(null);
      setFormValues({
        jogo: "",
        horarioCompeticao: "",
        previsaoTermino: "",
        estiloCompeticao: "",
        tipoTorneio: "",
        imgCompeticao: null,
        descricaoRegras: "",
        numPlayers: ""
      });
    };    

    return (
    <div className="divAllCompAdmin">
        <div className="divAnchorComp">
          <a href="#" className={activeTab === "Solo" ? "anchorCompActive" : "anchorCompDesable"} onClick={() => handleTabChange("Solo")}> Solo </a>
          <a href="#" className={activeTab === "Squad" ? "anchorCompActive" : "anchorCompDesable"} onClick={() => handleTabChange("Squad")}> Grupo </a>
        </div>

        <div className="divContentCompAdmin">
          <div className="divChildContentCompAdmin">
            {filteredCompeticoes.length > 0 ? (
              <div className="compAdminCard">
                <button onClick={prevComp} className="carouselButton leftButton">{"<"}</button>
                <div key={filteredCompeticoes[currentIndex].id} onClick={() => handleSelectComp(filteredCompeticoes[currentIndex])} className="cardContentCompAdmin">
                <p className="textStyleNumberPlayerComp"> {filteredCompeticoes[currentIndex].participantes} / {activeTab === "Solo"
                  ? filteredCompeticoes[currentIndex].numPlayers
                  : filteredCompeticoes[currentIndex].quantidadeGrupos}
                </p>
                <img src={filteredCompeticoes[currentIndex].imgCompeticao} alt={filteredCompeticoes[currentIndex].nome}/>
              </div>
              <button onClick={nextComp} className="carouselButton rightButton">{">"}</button>
              </div>
            ) : (
            <p className="textStyleDontEquipe">Nenhuma competição encontrada para {activeTab} </p>
            )}
            <button onClick={handleShowDiv} className="buttonAddDivCreateComp"> + </button>
          </div>
        </div>

        {isDivVisible && (
        <div className="divAllContentCreateComp">
          <button onClick={handleCloseDiv} className="btnBackDivCreateComp">Fechar</button>
          <section>
            <h1> Criar Competiçao </h1>
              <form onSubmit={CreateComp}>

                <div className="formDivContentTwo">
                  <select name="jogo" value={formValues.jogo} onChange={handleInputChange} required>
                    <option value="">Selecione um jogo</option>
                    <option value="Valorant">valorant</option>
                    <option value="FreeFire">freefire</option>
                  </select>

                  <input 
                    type="text" 
                    name="nomeCompeticao"
                    placeholder="Nome da Competição"
                    value={formValues.nomeCompeticao}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="formDivContentTwo">
                  <select name="estiloCompeticao" value={formValues.estiloCompeticao} onChange={handleInputChange} required>
                    <option value="">Selecione o estilo</option>
                    <option value="Solo">Solo</option>
                    <option value="Squad">Squad</option>
                  </select>

                  <select name="tipoTorneio" value={formValues.tipoTorneio} onChange={handleInputChange} required>
                    <option value="">Selecione o tipo de torneio</option>
                    <option value="Fase de Grupos">Fase de Grupos</option>
                    <option value="Oitavas">Oitavas</option>
                    <option value="Quartas">Quartas</option>
                    <option value="Semi">Semi</option>
                    <option value="Final">Final</option>
                    <option value="Pontos Corridos">Pontos Corridos</option>
                    <option value="Mata Mata">Mata Mata</option>
                  </select>
                </div>

                <div className="formDivContentTwo">
                    <input
                    type="datetime-local"
                    name="horarioCompeticao"
                    value={formValues.horarioCompeticao}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    max={`${new Date().getFullYear()}-12-31T23:59`}
                    required
                    />
                  <input
                    type="number"
                    name="numPlayers"
                    placeholder="Quantos Players?"
                    value={formValues.numPlayers}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="formDivContentTwo">
                  <input
                    type="text"
                    name="valorEntrada"
                    placeholder="Valor de Entrada (R$)"
                    value={formValues.valorEntrada}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="valorRecompensa"
                    placeholder="Valor de Recompensa (R$)"
                    value={formValues.valorRecompensa}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {isSquadSelected && (
                  <div className="formDivContentTwo">
                    <input
                      type="number"
                      name="quantidadeGrupos"
                      placeholder="Quantidade de grupos"
                      value={formValues.quantidadeGrupos || ""}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>
                )}

                <div className="formDivContentTwo">
                  <div className="formDivSelectedPhoto">
                    {!selectedImage ? (
                    <>
                      <input type="file" name="imgCompeticao" onChange={handleImageChange} id="imgCompeticao" style={{ display: "none" }} />
                      <label htmlFor="imgCompeticao" className="camera-icon">
                        <FaCamera /> Escolher Imagem
                      </label>
                    </>
                    ) : (
                    <img src={selectedImage} alt="Imagem da Competição" style={{ width: "100%", height: "100%" }} />
                    )}
                  </div>
                  <div className="formDivSelectedPhoto">
                    <textarea name="descricaoRegras" value={formValues.descricaoRegras} onChange={handleInputChange} required /> 
                  </div>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button className="btnCreateComp"> Criar Competiçao</button>
              </form>
          </section>
        </div>
        )}
    </div>
    )
}