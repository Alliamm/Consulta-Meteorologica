const localSalvo = sessionStorage.getItem('localSelecionado');

const local = JSON.parse(localSalvo);

console.log(local);
const voltar = document.getElementById('voltar');
voltar.addEventListener('click', function() {
    history.back();
});