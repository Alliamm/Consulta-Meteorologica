
const localSalvo = sessionStorage.getItem('localSelecionado');

const voltar = document.getElementById('voltar');
const mensagem = document.createElement('p');

mensagem.id = 'mensagem';

mensagem.style.textAlign = 'center';
mensagem.style.marginBottom = '20px';

document.querySelector('main').prepend(mensagem);

voltar.addEventListener('click', function() {
    history.back();
});

let local;

try {

    local = JSON.parse(localSalvo);

} catch (erro) {

    mensagem.textContent = 'Erro ao recuperar localização.';

    throw erro;

}

const lat = Number(local.latitude);
const lon = Number(local.longitude);
if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
) {

    mensagem.textContent = 'Coordenadas inválidas.';

    throw new Error('Latitude ou longitude inválida.');

}

const cidade = document.getElementById('cidade');
const regiao = document.getElementById('regiao');

const iconeClima = document.getElementById('iconeClima');
const temperatura = document.getElementById('temperatura');
const descricao = document.getElementById('descricao');
const sensacao = document.getElementById('sensacao');

const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');

const maxima = document.getElementById('maxima');
const minima = document.getElementById('minima');

const umidade = document.getElementById('umidade');
const vento = document.getElementById('vento');
const uv = document.getElementById('uv');
const pressao = document.getElementById('pressao');

const horas = document.getElementById('horas');
const dias = document.getElementById('dias');


function obterDescricao(codigo) {

    switch (codigo) {

        case 0:
            return 'Céu limpo';

        case 1:
            return 'Predominantemente limpo';

        case 2:
            return 'Parcialmente nublado';

        case 3:
            return 'Nublado';

        case 45:
            return 'Nevoeiro';

        case 48:
            return 'Nevoeiro com geada';

        case 51:
            return 'Garoa leve';

        case 53:
            return 'Garoa moderada';

        case 55:
            return 'Garoa intensa';

        case 56:
            return 'Garoa congelante leve';

        case 57:
            return 'Garoa congelante intensa';

        case 61:
            return 'Chuva fraca';

        case 63:
            return 'Chuva moderada';

        case 65:
            return 'Chuva forte';

        case 66:
            return 'Chuva congelante leve';

        case 67:
            return 'Chuva congelante forte';

        case 71:
            return 'Neve fraca';

        case 73:
            return 'Neve moderada';

        case 75:
            return 'Neve forte';

        case 77:
            return 'Grãos de neve';

        case 80:
            return 'Pancadas de chuva fracas';

        case 81:
            return 'Pancadas de chuva moderadas';

        case 82:
            return 'Pancadas de chuva violentas';

        case 85:
            return 'Pancadas de neve fracas';

        case 86:
            return 'Pancadas de neve fortes';

        case 95:
            return 'Tempestade';

        case 96:
            return 'Tempestade com granizo leve';

        case 99:
            return 'Tempestade com granizo forte';

        default:
            return 'Descrição não disponível';

    }

}

function obterIcone(codigo, dia = true) {

    switch (codigo) {

        case 0:
            return dia ? '☀️' : '🌙';

        case 1:
        case 2:
            return '🌤️';

        case 3:
            return '☁️';

        case 45:
        case 48:
            return '🌫️';

        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
            return '🌧️';

        case 71:
        case 73:
        case 75:
        case 77:
            return '❄️';

        case 80:
        case 81:
        case 82:
            return '🌦️';

        case 85:
        case 86:
            return '🌨️';

        case 95:
        case 96:
        case 99:
            return '⛈️';

        default:
            return '🌡️';

    }

}

function preencherLocalizacao() {

    cidade.textContent =
        local.name || 'Local selecionado';

    regiao.textContent = [
        local.admin1,
        local.country
    ].filter(Boolean).join(', ');

    latitude.textContent =
        `Latitude: ${lat}`;

    longitude.textContent =
        `Longitude: ${lon}`;

}

async function consultarClima() {

    try {

        mensagem.textContent = 'Buscando dados meteorológicos...';

        const parametros = new URLSearchParams({

            latitude: lat,

            longitude: lon,

            current:
                'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,is_day',

            hourly:
                'temperature_2m,weather_code,precipitation_probability',

            daily:
                'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',

            forecast_days: 7,

            timezone: 'auto'

        });


        const resposta = await fetch(
            `https://api.open-meteo.com/v1/forecast?${parametros}`
        );


        if (!resposta.ok) {

            throw new Error(`Erro HTTP: ${resposta.status}`);

        }


        const dados = await resposta.json();

        console.log('Dados meteorológicos:', dados);


        // Preencher informações da página

        preencherLocalizacao();

        preencherClimaAtual(dados);

        preencherPrevisaoHoras(dados);

        preencherPrevisaoDias(dados);


        mensagem.textContent =
            `Última atualização: ${dados.current.time.replace('T', ' ')} (${dados.timezone})`;


    } catch (erro) {

        console.error('Erro ao consultar clima:', erro);

        mensagem.textContent =
            'Não foi possível buscar os dados meteorológicos.';

    }

}

function preencherClimaAtual(dados) {

    const atual = dados.current;

    const diario = dados.daily;


    temperatura.textContent =
        `${Math.round(atual.temperature_2m)}°C`;


    descricao.textContent =
        obterDescricao(atual.weather_code);


    iconeClima.textContent =
        obterIcone(atual.weather_code, atual.is_day === 1);


    sensacao.textContent =
        `Sensação térmica: ${Math.round(atual.apparent_temperature)}°C`;


    umidade.textContent =
        `${atual.relative_humidity_2m}%`;


    vento.textContent =
        `${atual.wind_speed_10m} km/h`;


    pressao.textContent =
        `${atual.surface_pressure} hPa`;


    uv.textContent =
        diario.uv_index_max[0];


    maxima.textContent =
        `${diario.temperature_2m_max[0]}°C`;


    minima.textContent =
        `${diario.temperature_2m_min[0]}°C`;

}


function preencherPrevisaoHoras(dados) {

    const previsao = dados.hourly;

    horas.innerHTML = '';

    const agora = dados.current.time;

    let inicio = previsao.time.findIndex(
        horario => horario >= agora
    );

    if (inicio === -1) {

        inicio = 0;

    }

    for (
        let i = inicio;
        i < inicio + 8 && i < previsao.time.length;
        i++
    ) {

        const card = document.createElement('div');

        card.classList.add('card-hora');


        const titulo = document.createElement('h3');

        titulo.textContent =
            previsao.time[i].split('T')[1];


        const icone = document.createElement('span');

        icone.textContent =
            obterIcone(previsao.weather_code[i]);


        const temp = document.createElement('p');

        temp.textContent =
            `${Math.round(previsao.temperature_2m[i])}°C`;


        const chuva = document.createElement('small');

        chuva.textContent =
            `Chuva: ${previsao.precipitation_probability[i] ?? '--'}%`;


        card.append(
            titulo,
            icone,
            temp,
            chuva
        );


        horas.appendChild(card);

    }

}

function preencherPrevisaoDias(dados) {

    const previsao = dados.daily;

    dias.innerHTML = '';


    for (let i = 0; i < previsao.time.length; i++) {

        const data = new Date(
            `${previsao.time[i]}T12:00:00`
        );


        const diaFormatado = data.toLocaleDateString(
            'pt-BR',
            {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit'
            }
        );


        const card = document.createElement('div');

        card.classList.add('card-dia');


        const titulo = document.createElement('h3');

        titulo.textContent = diaFormatado;


        const icone = document.createElement('span');

        icone.textContent =
            obterIcone(previsao.weather_code[i]);


        const descricaoDia = document.createElement('p');

        descricaoDia.textContent =
            obterDescricao(previsao.weather_code[i]);


        const tempMax = document.createElement('p');

        tempMax.textContent =
            `Máxima: ${Math.round(previsao.temperature_2m_max[i])}°C`;


        const tempMin = document.createElement('p');

        tempMin.textContent =
            `Mínima: ${Math.round(previsao.temperature_2m_min[i])}°C`;


        card.append(
            titulo,
            icone,
            descricaoDia,
            tempMax,
            tempMin
        );


        dias.appendChild(card);

    }

}

consultarClima();
