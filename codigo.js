const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');
const botao = document.getElementById('buscar');
const mensagem = document.getElementById('mensagem');
const resultado = document.getElementById('resultado');
const formulario = document.getElementById('formulario');
const descricoesClima = {
			0: 'Céu limpo',
			1: 'Predominantemente limpo',
			2: 'Parcialmente nublado',
			3: 'Nublado',
			45: 'Nevoeiro',
			48: 'Nevoeiro com geada',
			51: 'Garoa leve',
			53: 'Garoa moderada',
			55: 'Garoa intensa',
			56: 'Garoa congelante leve',
			57: 'Garoa congelante intensa',
			61: 'Chuva fraca',
			63: 'Chuva moderada',
			65: 'Chuva forte',
			66: 'Chuva congelante leve',
			67: 'Chuva congelante forte',
			71: 'Neve fraca',
			73: 'Neve moderada',
			75: 'Neve forte',
			77: 'Grãos de neve',
			80: 'Pancadas de chuva fracas',
			81: 'Pancadas de chuva moderadas',
			82: 'Pancadas de chuva violentas',
			85: 'Pancadas de neve fracas',
			86: 'Pancadas de neve fortes',
			95: 'Tempestade',
			96: 'Tempestade com granizo leve',
			99: 'Tempestade com granizo forte'
		};
        formulario.addEventListener('submit', function(evento) {
			// Impede o envio padrão do formulário (recarregar a página)
			evento.preventDefault();

			// Converte o texto dos inputs em números decimais
			const lat = parseFloat(latitude.value);
			const lon = parseFloat(longitude.value);
			// Valida se são números e se estão dentro dos limites geográficos
			if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
				alert('Informe uma latitude (-90 a 90) e uma longitude (-180 a 180) válidas.');
				return;
			}

			// Limpa resultados anteriores e evita cliques repetidos durante a busca
			resultado.textContent = '';
			mensagem.textContent = 'Buscando dados do clima...';
			botao.disabled = true;

			// "current" lista as variáveis desejadas para as condições atuais;
			// timezone "auto" devolve o horário no fuso da localização informada
			const parametros = new URLSearchParams({
				latitude: lat,
				longitude: lon,
				current: 'temperature_2m,relative_humidity_2m,weather_code',
				timezone: 'auto'
			});

			// Envia a requisição GET para a API de previsão do tempo
			fetch(`https://api.open-meteo.com/v1/forecast?${parametros}`)
				.then(function(resposta) {
					// O fetch não rejeita erros HTTP automaticamente
					if (!resposta.ok) {
						throw new Error(`Erro HTTP: ${resposta.status}`);
					}
					return resposta.json();
				})
				.then(function(dados) {
					console.log(dados);
					// "current" traz os valores; "current_units" traz as unidades (°C, %, ...)
					const atual = dados.current;
					const unidades = dados.current_units;

					mensagem.textContent = `Dados de ${atual.time} (${dados.timezone})`;

					// Textos que serão exibidos, um por item da lista
					const itens = [
						`Temperatura: ${atual.temperature_2m} ${unidades.temperature_2m}`,
						`Umidade relativa: ${atual.relative_humidity_2m} ${unidades.relative_humidity_2m}`,
						`Código do clima (WMO): ${atual.weather_code}`,
						`Clima: ${descricoesClima[atual.weather_code] || 'Descrição não disponível'}`
					];

					// Cria um <li> para cada texto e o adiciona à lista
					itens.forEach(function(texto) {
						const item = document.createElement('li');
						item.textContent = texto;
						resultado.appendChild(item);
					});
				})
				.catch(function(erro) {
					mensagem.textContent = 'Não foi possível buscar os dados.';
					console.error(erro);
				})
				// Executa sempre, com sucesso ou erro: reabilita o botão
				.finally(function() {
					botao.disabled = false;
				});
		});