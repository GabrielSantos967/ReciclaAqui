// Inicializa o mapa centralizado em uma coordenada
var map = L.map('map').setView([-25.433463492103154, -49.27559980258102], 10);

// Adiciona o mapa base do OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Criação dos ícones personalizados para cada tipo de ponto
var TremIcon = L.Icon.extend({
    options: {
        shadowUrl: './icones/sombra.png',   
        iconSize:     [100, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [-5, 68],
        popupAnchor:  [-3, -76]
    }
});

// Definição dos ícones personalizados
var lixeira = new TremIcon({iconUrl: './icones/lixeira.png'});
var pilha = new TremIcon({iconUrl: './icones/pilha.png'});
var pc = new TremIcon({iconUrl: './icones/pc.png'});

// Array para armazenar os marcadores no mapa
var markers = [];

// Função para limpar os marcadores do mapa
function limpar() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Função para adicionar um marcador no mapa
function adicionar(lat, lng, icon) {
    let marker = L.marker([lat, lng], {icon: icon}).addTo(map);
    
    // Evento de clique para obter o endereço
    marker.on('click', function () {
        let url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                let endereco = data.display_name || `Latitude: ${lat}, Longitude: ${lng}`;
                
                navigator.clipboard.writeText(endereco).then(() => {
                    alert("Endereço copiado: " + endereco);
                }).catch(err => console.error('Erro ao copiar', err));
            })
            .catch(error => {
                console.error('Erro ao obter endereço:', error);
                alert("Erro ao obter o endereço.");
            });
    });

    markers.push(marker);
}


// Função para carregar todos os pontos do JSON
function carregarPontos(tipoSelecionado) {
    limpar(); // Remove os marcadores antes de adicionar novos

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            let pontosFiltrados;

            // Se for "todos", carrega tudo, senão, filtra pelo tipo
            if (tipoSelecionado === "todos") {
                pontosFiltrados = data;
            } else {
                pontosFiltrados = data.filter(ponto => ponto.tipo === tipoSelecionado);
            }

            // Adiciona os pontos filtrados ao mapa
            pontosFiltrados.forEach(ponto => {
                let icone;

                if (ponto.tipo === "reciclagem") icone = lixeira;
                else if (ponto.tipo === "pilha") icone = pilha;
                else if (ponto.tipo === "eletronico") icone = pc;

                adicionar(ponto.lat, ponto.lng, icone);
            });
        })
        .catch(error => console.error("Erro ao carregar JSON:", error));
}

// Função acionada ao selecionar um filtro no menu
function pesquisar() {
    let valores = document.getElementById('escolha').value;
    console.log("Opção selecionada:", valores);
    carregarPontos(valores);
}
