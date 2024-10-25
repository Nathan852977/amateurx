import React, { useEffect, useState } from "react";
import "../../CSS/CreateGuild.css";
import { FaChevronLeft, FaCamera, FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { fetchUserName, getUsername, getUserGames, getUserUid } from "../UI/InfoUser.js";
import { doc, setDoc, getDoc, updateDoc} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from "../UI/firebase.js";

export default function CreateGuild({ handleBackCreateGuildClick  }) {

    const [selectedImage, setSelectedImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Estado para mensagens de erro
    const [trueMessage, setTrueMessage] = useState(''); // Estado para a mensagem de sucesso
    const [guildName, setGuildName] = useState(''); // Estado para o nome da guilda
    const [guildDescription, setGuildDescription] = useState(''); // Estado para a descrição
    const [userName, setUserName] = useState(''); // Estado para o nome do usuário
    const [jogoSelected, setJogoSelected] = useState("");
    const [userUid, setUserUid] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentSection, setCurrentSection] = useState(0); // Estado para controlar a seção atual

    // Função para ir para a próxima seção
    const handleNext = () => {
        setCurrentSection((prevSection) => (prevSection + 1) % 3); // Alterna entre as 3 seções
    };

    // Função para ir para a seção anterior
    const handlePrev = () => {
        setCurrentSection((prevSection) => (prevSection - 1 + 3) % 3); // Alterna entre as 3 seções
    };

    useEffect(() => {
        const loadUserData = async () => {
            await fetchUserName();  // Busca os dados do Firestore
            const name = getUsername();  // Obtém o nome do usuário
            const gameSelected = getUserGames();  // Obtém os jogos do usuário
            const uid = getUserUid(); // Obtém o UID do usuário
    
            setUserName(name);  // Atualiza o estado do nome
            setJogoSelected(gameSelected);  // Atualiza o estado dos jogos
            setUserUid(uid); // Atualiza o estado com o UID do usuário
    
            // Adicionando console.log para verificar o valor de gameSelected
            console.log('Jogos selecionados:', gameSelected);
        };
    
        loadUserData();
    }, []);
    

    const handleCreateGuildClickTrueTwo = async () => {
        setLoading(true); // Inicia o estado de carregamento
    
        // Validação do nome da guilda
        if (guildName.length < 3 || guildName.length > 16) {
            setErrorMessage('O nome da guilda deve ter entre 3 e 16 caracteres.');
            setLoading(false); // Encerra o estado de carregamento
            return;
        }
    
        // Validação da descrição
        if (guildDescription.trim() === '' || guildDescription.length > 120) {
            setErrorMessage('A descrição não pode ser vazia e deve ter no máximo 120 caracteres.');
            setLoading(false); // Encerra o estado de carregamento
            return;
        }
    
        // Validação da foto
        if (!selectedImage) {
            setErrorMessage('Você deve escolher uma foto para a guilda.');
            setLoading(false); // Encerra o estado de carregamento
            return;
        }
    
        const normalizedGuildName = guildName.trim().replace(/\s+/g, '-').toLowerCase();
    
        try {
            const guildRef = doc(db, "Guilds", normalizedGuildName);
            const guildDoc = await getDoc(guildRef);
    
            if (guildDoc.exists()) {
                setErrorMessage('Já existe uma guilda com este nome. Escolha outro nome.');
                setLoading(false); // Encerra o estado de carregamento
                return;
            }
    
            const storage = getStorage();
            const storageRef = ref(storage, `guildLogos/${normalizedGuildName}.png`);
    
            const response = await fetch(selectedImage);
            const blob = await response.blob();
    
            await uploadBytes(storageRef, blob);
    
            const imageUrl = await getDownloadURL(storageRef);
    
            await setDoc(guildRef, {
                name: guildName,
                description: guildDescription,
                Players: {},
                Capitao: userName,
                jogo: jogoSelected,
                imageUrl: imageUrl,
            });
    
            const userRef = doc(db, 'users', userUid);
            await updateDoc(userRef, {
                guild: normalizedGuildName
            });
    
            setTrueMessage('Guilda criada com sucesso!');
            setLoading(false); // Encerra o estado de carregamento
    
            // Recarregar a página após 2 segundos para mostrar a mensagem de sucesso
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            setErrorMessage('Erro ao criar a guilda. Tente novamente.');
            setLoading(false); // Encerra o estado de carregamento
            console.error("Erro ao adicionar guilda: ", error);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "image/png") {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                if (img.width === 500 && img.height === 500) {
                    setSelectedImage(img.src);
                    setErrorMessage('');
                } else {
                    setErrorMessage('A imagem deve ter exatamente 500x500 pixels.');
                    setSelectedImage(null);
                }
            };
        } else {
            setErrorMessage('A imagem deve estar no formato PNG.');
            setSelectedImage(null);
        }
    };

    return (
        <div className="divCreateGuild">
            <div className="alignOneCreateGuild">
                <button onClick={handleBackCreateGuildClick} className="btnbackCreateGuild">
                    <FaChevronLeft /> Voltar
                </button>
                <h1>Crie Sua Guilda</h1>
            </div>

            <div className="divAlignCreateGuildLarge">
                <section className="secBoxSelectedindex">
                    <h3>Escolha A Foto</h3>
                    <div>
                        {!selectedImage ? (
                            <label htmlFor="file-input" className="camera-icon">
                                <FaCamera className="cameraIcon"/>
                            </label>
                        ) : (
                            <img src={selectedImage} alt="Selecionada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <input id="file-input" type="file" accept="image/png" style={{ display: 'none' }} onChange={handleImageUpload} />
                    </div>
                </section>

                <section className="secBoxSelectedindex">
                    <h3>Escolha o Nome</h3>
                    <div>
                        <input
                            type="text"
                            placeholder="Digite o nome da Guilda"
                            className="guildNameInput"
                            value={guildName}
                            onChange={(e) => setGuildName(e.target.value)}
                        />
                    </div>
                </section>

                <section className="secBoxSelectedindex">
                    <h3>Escolha uma descrição</h3>
                    <div>
                        <textarea
                            placeholder="Digite uma descrição (até 120 caracteres)"
                            className="guildDescriptionTextarea"
                            value={guildDescription}
                            onChange={(e) => setGuildDescription(e.target.value)}
                            maxLength="120"
                        />
                    </div>
                </section>
            </div>

            <div className="divAlignCreateGuildSmall">
                <div className="carouselGuildCreateContainer" style={{ transform: `translateX(-${currentSection * 100}%)` }}>
                    <section className="carouselGuildCreateItem">
                        <h3>Escolha A Foto</h3>
                        <div>
                            {!selectedImage ? (
                                <label htmlFor="file-input" className="cameraIcon">
                                    <FaCamera className="cameraIcon"/>
                                </label>
                            ) : (
                                <img src={selectedImage} alt="Selecionada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <input id="file-input" type="file" accept="image/png" style={{ display: 'none' }} onChange={handleImageUpload} />
                        </div>
                    </section>

                    <section className="carouselGuildCreateItem">
                        <h3>Escolha o Nome</h3>
                        <div>
                            <input
                                type="text"
                                placeholder="Digite o nome da Guilda"
                                className="guildNameInput"
                                value={guildName}
                                onChange={(e) => setGuildName(e.target.value)}
                            />
                        </div>
                    </section>

                    <section className="carouselGuildCreateItem">
                        <h3>Escolha uma descrição</h3>
                        <div>
                            <textarea
                                placeholder="Digite uma descrição (até 120 caracteres)"
                                className="guildDescriptionTextarea"
                                value={guildDescription}
                                onChange={(e) => setGuildDescription(e.target.value)}
                                maxLength="120"
                            />
                        </div>
                    </section>
                </div>

                <div className="divCarouselBtns">
                    <button className="btnCarousel" onClick={handlePrev}> <FaChevronCircleLeft /> </button>
                        <div className="divCaroselSpans">
                            <span className={currentSection === 0 ? 'active' : ''}></span>
                            <span className={currentSection === 1 ? 'active' : ''}></span>
                            <span className={currentSection === 2 ? 'active' : ''}></span>
                        </div>
                    <button className="btnCarousel" onClick={handleNext}> <FaChevronCircleRight /> </button>
                </div>
        </div>

            <div className="alignBtnCreateGuilda">
                {loading && (
                    <div className="loading-dots">
                        Carregando
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </div>
                )}
                {errorMessage && <p className="tagPErrorCreateGuild">{errorMessage}</p>}
                {trueMessage && <p className="tagPSuccessCreateGuild">{trueMessage}</p>}
                <button className="btnCreateGuilda" onClick={handleCreateGuildClickTrueTwo}>
                    Criar Guilda
                </button>
            </div>
        </div>
    );

}