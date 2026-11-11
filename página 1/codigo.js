
const formulario = document.getElementById('formulario');

// Referências aos elementos da página
const nome = document.getElementById('name');
const botao = document.getElementById('buscar');
const mensagem = document.getElementById('mensagem');
const resultado = document.getElementById('resultado');
const placeholder = document.getElementById('placeholder');
const favoritosLista = document.getElementById('favoritos');

	let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
	function salvarFavoritos() {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
}
	function estaFavoritado(local) {
    	return favoritos.some(fav => fav.id === local.id);
}
	function alternarFavorito(local) {
    if (estaFavoritado(local)) {
        favoritos = favoritos.filter(fav => fav.id !== local.id);
    } else {
        favoritos.push(local);
    }
    salvarFavoritos();
    mostrarFavoritos();
    mostrarResultados();
}
	function mostrarFavoritos() {
		
    	favoritosLista.textContent = '';
    	favoritos.forEach(local => {
        const item = document.createElement('li');
        const partes = [
            local.name,
            local.admin2,
            local.admin1,
            local.country
        ].filter(Boolean);
        item.textContent = partes.join(', ');
        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = '❌ Remover';

        botaoRemover.addEventListener('click', () => {
            alternarFavorito(local);
        });
        item.appendChild(botaoRemover);
        favoritosLista.appendChild(item);
    });
}
	let locaisEncontrados = [];
	function mostrarResultados() {
    resultado.textContent = '';

    locaisEncontrados.forEach(local => {

        const item = document.createElement('li');

        const partes = [
            local.name,
            local.admin2,
            local.admin1,
            local.country
        ].filter(Boolean);

        const texto = document.createElement('span');
        texto.textContent = partes.join(', ');

        const botaoFavoritar = document.createElement('button');

        botaoFavoritar.textContent = estaFavoritado(local)
            ? '⭐'
            : '☆';

        botaoFavoritar.addEventListener('click', (evento) => {
            evento.stopPropagation();
            alternarFavorito(local);
        });

        item.appendChild(texto);
        item.appendChild(botaoFavoritar);

        resultado.appendChild(item);

        item.addEventListener('click', function(evento) {
            evento.preventDefault();

            sessionStorage.setItem('localSelecionado', JSON.stringify(local));

            window.location.href = '../página2/resultadotempo.html';
        });

    });
}

	mostrarFavoritos();
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();
    const termo = nome.value.trim();
    if (termo === '') {
        alert('Por favor, digite um nome de localidade válido.');
        return;
    }
    resultado.textContent = '';
    placeholder.style.display = 'none';
    mensagem.textContent = 'Buscando localidades...';
    botao.disabled = true;
    const parametros = new URLSearchParams({
        name: termo,
        count: 10,
        language: 'pt',
        format: 'json'
    });
    fetch(`https://geocoding-api.open-meteo.com/v1/search?${parametros}`)
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }
            return resposta.json();
        })
        .then(function(dados) {
    		locaisEncontrados = dados.results || [];
            sessionStorage.setItem('ultimaPesquisa', termo);
            sessionStorage.setItem('locaisEncontrados', JSON.stringify(locaisEncontrados));

    		console.log(dados);
    		mensagem.textContent = locaisEncontrados.length === 0
        ? 'Nenhuma localidade encontrada.'
        : `${locaisEncontrados.length} ocorrências encontradas.`;
    	mostrarResultados();
        })
        .catch(function(erro) {
            mensagem.textContent = 'Não foi possível buscar os dados.';
            console.error(erro);
        })
        .finally(function() {
            botao.disabled = false;
        });
});

