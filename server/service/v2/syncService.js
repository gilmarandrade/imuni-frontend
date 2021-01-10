const { calcularEscalas } = require('../../config/helpers');
const sheetsApi = require('../../config/sheetsApi');

module.exports = app => {

/**
 * Sincronização completa da unidade (todos os vigilantes e todas as respostas)
 * @param {*} idUnidade 
 */
const fullSyncUnidade = async (idUnidade) => {
    const unidade = await app.server.service.v2.unidadeService.getById(idUnidade);
    
    if(unidade) {
        console.log(`[Sync] ${unidade.nome} STARTING SYNC `);
        console.log(unidade);
        const sheets = await prepareDataToSync(unidade);
        
        for(let i = 0; i < sheets.length; i++) {
            if(sheets[i].sheetName.startsWith("Vigilante")) {
                // TODO e se a planilha estiver vazia?
                const idVigilante = await syncVigilante(unidade, sheets[i].sheetName);
                console.log('idVigilante', idVigilante);
                const rows = await syncIdososBySheetName(unidade, sheets[i].sheetName, idVigilante);
                // if(rows == 0) {// se não encontrou nenhuma linha, tenta mais uma vez
                //     await syncIdososBySheetName(unidade, sheets[i].sheetName, idVigilante);
                // }
            }
        }
        
        await syncAtendimentos(unidade);
        console.log(`[Sync] ${unidade.nome} ENDED SYNC `);
    } else {
        throw 'Ocorreu um erro ao sincronizar a unidade, tente novamente';
    }
}

/**
 * Sincronização parcial da unidade
 * 
 * Atualiza pelo menos os 10 ultimos idosos de um ou todos os vigilantes e pelo menos os 10 ultimos atendimentos,
 * além de inserir no banco novos registros que por ventura tenham sido adicionados nas planilhas desde a sincronização anterior.
 * 
 * Obs: por se tratar de uma sincronização rápida, não apaga registros removidos, nem atualiza registros mais antigos que os 10 ultimos das planilhas.
 * Por isso podem surgir inconsistencias no banco em relação as planilhas. 
 * Por isso, o reset e resincronização completa do banco é efetuado uma vez por dia a partir das 22:00.
 * @param {*} idUnidade 
 * @param {*} nomeVigilante 
 */
const partialSyncUnidade = async (idUnidade, nomeVigilante) => {
    const unidade = await app.server.service.v2.unidadeService.findById(idUnidade);
    
    if(unidade) {
        console.log(`[Sync] ${unidade.nome} STARTING SYNC `);
        console.log(unidade);

        // const sheets = await prepareDataToSync(unidade);
        const sheet = unidade.vigilantes.find(element => element.nome == nomeVigilante);//FIXIT  não funciona caso tenha mais de um vigilante chamado A Substituir...
        if(sheet) {// se existe o node do vigilante, atualiza apenas os idosos do vigilante
            const sheets = [];
            sheets.push({ sheetName: sheet.sheetName });

            //TODO sheet contem apenas um valor, não sendo necessario um loop
            for(let i = 0; i < sheets.length; i++) {
                if(sheets[i].sheetName.startsWith("Vigilante")) {
                    const countIdosos = await app.server.service.v2.idosoService.countByVigilante(unidade.collectionPrefix, nomeVigilante);
                    console.log('countIdosos ', countIdosos)
                    const rows = await syncIdososBySheetName(unidade, sheets[i].sheetName, null, countIdosos);
                    if(rows == 0) {// se não encontrou nenhuma linha, tenta mais uma vez
                        await syncIdososBySheetName(unidade, sheets[i].sheetName, null, countIdosos);
                    }
                }
            }
        } else {//se o nome do vigilante não foi econtrado, atualiza os idosos de todos os vigilantes
            console.log(`[Sync] vigilante ${nomeVigilante} não encontrado. Sincronizando todos os vigilantes...`)
            const sheets = await prepareDataToSync(unidade);
            
            for(let i = 0; i < sheets.length; i++) {
                if(sheets[i].sheetName.startsWith("Vigilante")) {
                    const sheet = unidade.vigilantes.find(element => element.sheetName == sheets[i].sheetName);
                    const countIdosos = await app.server.service.v2.idosoService.countByVigilante(unidade.collectionPrefix, sheet.nome);
                    const rows = await syncIdososBySheetName(unidade, sheets[i].sheetName, null, countIdosos);
                    if(rows == 0) {// se não encontrou nenhuma linha, tenta mais uma vez
                        await syncIdososBySheetName(unidade, sheets[i].sheetName, null, countIdosos);
                    }
                }
            }
            
        }

        const countAtendimentos = await app.server.service.v2.atendimentoService.count(unidade.collectionPrefix);
        await syncAtendimentos(unidade, countAtendimentos);

        console.log(`[Sync] ${unidade.nome} ENDED SYNC `);
    } else {
        throw 'Ocorreu um erro ao sincronizar a unidade, tente novamente';
    }
}

/**
 * Apaga os bancos de dados da unidade
 * @param {*} data 
 */
const resetUnidade = async (idUnidade) => {
    const unidade = await app.server.service.v2.unidadeService.findById(idUnidade);
    
    if(unidade) {
        console.log(`[Sync] ${unidade.nome} RESETING `);
        console.log(unidade);

        unidade.vigilantes = [];
        unidade.lastSyncDate = null;

        await app.server.service.v2.unidadeService.replaceOne(unidade);

        await app.server.service.v2.idosoService.deleteAll(unidade);

        await app.server.service.v2.atendimentoService.deleteAll(unidade);
    } else {
        throw 'Ocorreu um erro ao sincronizar a unidade, tente novamente';
    }
}


/**
 * Encontra o sheetName (nome das abas) que devem ser lidas na planilha
 * Procura essa informação da API do google Sheet (a api não conta o número de linhas preenchidas, e sim o numero máximo de linhas no grid, então é uma estimativa com folga)
 * @param {*} unidade 
 */
const prepareDataToSync = async (unidade) => {
    const sheetsToSync = [];
    try {
        const spreadSheetProperties = await sheetsApi.getProperties(unidade.idPlanilhaGerenciamento);

        for(let i = 0; i < spreadSheetProperties.sheets.length; i++) {
            const sheetName = spreadSheetProperties.sheets[i].properties.title;
            if(sheetName.startsWith("Vigilante ") || sheetName.startsWith("Respostas")){
                sheetsToSync.push({
                    sheetName, 
                    rowCount: spreadSheetProperties.sheets[i].properties.gridProperties.rowCount,// não utilizado
                })
            }
        }
        
    } catch(err) {
        console.log(err);
    } finally {
        console.log(sheetsToSync);
        console.log(`[Sync] ${sheetsToSync.length} sheets found`);
        return sheetsToSync;
    }
}

/**
 * Armazena o usuário vigilante de uma planilha
 */
const syncVigilante = async (unidade, sheetName) => {
    console.log('get nome vigilante')
    const firstIndex = 2;
    const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'${sheetName}'!A${firstIndex}`);
    if(rows.length && rows[0].length) {
        const usuariosDaUnidade = await app.server.service.v2.usuarioService.findByUnidade(unidade._id);

        // console.log('usuariosDaUnidade', usuariosDaUnidade)
        const jaExiste = usuariosDaUnidade.find(usuario => {return usuario.unidadeId == unidade._id.toString() && usuario.name == rows[0][0].trim() && usuario.role == 'VIGILANTE'});
        
        // console.log('usuarios da Unidade ja existe', jaExiste)

        if(!jaExiste) {
            return await app.server.service.v2.usuarioService.insertOne({
                name: rows[0][0].trim(),
                role: 'VIGILANTE',
                unidadeId: unidade._id,
                status: 'INCOMPLETO',
                _isDeleted: false,
            });
        }

        return jaExiste._id;
    }
}

/**
 * Atualiza pelo menos os 10 ultimos registros já cadastrados no banco, e insere os novos registros (se houver)
 */
const syncIdososBySheetName = async (unidade, sheetName, vigilanteId, total) => {
    const idososPorVigilantes = [];
    // let indexIdosos = 1; //unidade.sync[vigilanteIndex].indexed;
    // let rowsInserted = null;//@deprecated
    const lastIndexSynced = total && (total - 10 >= 1) ? total - 10 : 1;// coloca uma margem de segurança, para atualizar os 10 ultimos 
    const firstIndex = lastIndexSynced + 1;//2
    const lastIndex = '';//limit ? lastIndexSynced + limit : '';//''
    let vigilanteNome = '';
    console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} '${sheetName}'!A${firstIndex}:N${lastIndex}`);
    const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'${sheetName}'!A${firstIndex}:N${lastIndex}`);
    rows.forEach((item, index) => {
        if(item[1]) {//se o idoso tem nome
            vigilanteNome = item[0];
            idososPorVigilantes.push({
                // row: `${unidade.collectionPrefix}-'${sheetName}'!A${firstIndex + index}:N${firstIndex + index}`,
                dataNascimento: '',
                nome: item[1].trim(),
                // nomeLower: item[1].toLowerCase(),
                telefone1: item[2],
                telefone2: item[3],
                agenteSaude: item[4],
                anotacoes: item[13],
                unidadeId: unidade._id,
                vigilanteId: vigilanteId,
                _isDeleted: false,
                // TODO deprecated?
                // stats: {
                //     qtdAtendimentosEfetuados: 0,
                //     qtdAtendimentosNaoEfetuados: 0,
                //     ultimoAtendimento: null,
                //     ultimaEscala: null,
                // },
                // score: 0,
                // epidemiologia: null,
            });
        }
    });
    if(idososPorVigilantes.length) {
        console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` '${sheetName}'!A${firstIndex}:N${lastIndexSynced + idososPorVigilantes.length}`);

        //insere os idosos no banco
        // let j = 0;
        // for(; j < idososPorVigilantes.length; j++) {
        //     const resultInsertMany = await app.server.service.v2.idosoService.updateOne(unidade.collectionPrefix, idososPorVigilantes[j]);
        // }
        
        await app.server.service.v2.idosoService.bulkUpdateOne(idososPorVigilantes);
    } else {
        console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 rows found!`);
    }
            
            
    
    // // unidade.sync[vigilanteIndex].indexed = indexIdosos;//talvez essa indexação parcial seja necessária no futuro, mas atualmente, todas as sincronizações são totais, não sendo necessário armazenar essas informações
    // //atualiza lista de vigilantes da unidade
    // const vigilanteIndex = +sheetName.slice(-1);
    // if(unidade.vigilantes[vigilanteIndex - 1]) {
    //     unidade.vigilantes[vigilanteIndex - 1].nome = vigilanteNome;
    // } else {
    //     //atualmente, o campo usuarioId não está sendo utilizado
    //     unidade.vigilantes[vigilanteIndex - 1] = { sheetName: `${sheetName}`, nome: vigilanteNome };
    // }
    // // console.log(unidade);
    // const result = await app.server.service.v2.unidadeService.replaceOne(unidade);
    // // console.log(result.result.n)
    console.log(`[Sync] idososCollection updated`)
    // return rowsInserted;
    return idososPorVigilantes.length;
}

/**
 * Atualiza pelo menos os 10 ultimos registros já cadastrados no banco, e insere os novos registros (se houver)
 */
const syncAtendimentos = async (unidade, total) => {
    // let indexRespostas = 1; // unidade.sync[0].indexed;
    const lastIndexSynced = total && (total - 10 >= 1) ? total - 10 : 1;// coloca uma margem de segurança, para atualizar os 10 ultimos 
    const firstIndex = lastIndexSynced + 1;
    const lastIndex = '';//limit ? lastIndexSynced + limit : '';

    console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Respostas'!A${firstIndex}:AI${lastIndex}`);
    const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Respostas'!A${firstIndex}:AI${lastIndex}`);
    const respostasArray = [];
    rows.forEach((item, index) => {
        // para converter a data de Iso para locale use : console.log(testDate.toLocaleString());
        const resp = {
            // row: `${unidade.collectionPrefix}-'Respostas'!A${firstIndex + index}:AI${firstIndex + index}`,
            // vigilanteNome: item[1],
            raw: {},

            // dadosIniciais: {
            //     nome: item[2],
            //     nomeLower: item[2].toLowerCase(),
            //     atendeu: item[3] === 'Sim',
            // },
            // idade: item[4] === undefined ? null : +item[4],
            // fonte: item[5] ? item[5] : '',
            // sintomasIdoso: {
            //     apresentaSinomasGripeCOVID: item[6] !== undefined && item[6] !== 'Não',
            //     sintomas: item[6] === undefined || item[6] === 'Não' ? [] : item[6].split(',').map(s => s.trim()),
            //     outrosSintomas: item[7] === undefined || item[7] === 'Não' ? [] : item[7].split(',').map(s => s.trim()),
            //     detalhesAdicionais: item[8],
            //     haQuantosDiasIniciaram:  item[9] === undefined ? null : +item[9],
            //     contatoComCasoConfirmado: item[10] === 'Sim',
            // },
            // comorbidades: {
            //     condicoesSaude: item[11] === undefined || item[11] === 'Não' ? [] : item[11].split(',').map(s => s.trim()),
            //     medicacaoDiaria: {
            //         deveTomar: item[12] !== undefined && item[12].startsWith('Sim'),
            //         medicacoes: item[12] === undefined || item[12] === 'Não' || item[12] === 'Sim' ? [] : item[12].substring(4).split(',').map(s => s.trim()),
            //         acessoMedicacao: item[13] === 'Sim, consigo adquirí-las',
            //     }
            // },
            // primeiroAtendimento: item[14] === 'Primeiro atendimento',
            // epidemiologia: {
            //     higienizacaoMaos: item[15] === 'Sim',
            //     isolamento: {
            //         saiDeCasa: item[16] === 'Sim',
            //         frequencia: item[17] ? item[17] : '',
            //         paraOnde: item[18] ? item[18].split(',').map(s => s.trim()) : [],
            //     },
            //     recebeApoioFamiliarOuAmigo: item[19] === 'Sim',
            //     visitas: {
            //         recebeVisitas: item[20] !== undefined && item[20] !== 'O idoso não recebe visitas',
            //         tomamCuidadosPrevencao: item[20] === 'Sim, e as visitas estão tomando os cuidados de prevenção',
            //     },
            //     qtdComodosCasa:  item[21] === undefined ? null : +item[21],
            //     realizaAtividadePrazerosa: item[22] === 'Sim',
            // },
            // qtdAcompanhantesDomicilio: item[23] === 'Somente o idoso' ? 0 : ( item[23] === undefined ? null : +item[23]),
            // sintomasDomicilio: item[24] === undefined || item[24] === 'Não' || item[24].trim() === '' ? [] : item[24].split(',').map(s => s.trim()),
            // habitosDomiciliaresAcompanhantes: {
            //     saiDeCasa: item[25] === 'Sim',
            //     higienizacaoMaos: item[26] === 'Sim',
            //     compartilhamentoUtensilios: item[27] === 'Sim',
            //     usoMascara: item[28] === 'Sim',
            // },
            // vulnerabilidades: {
            //     convivioFamilia: item[29] ? item[29] : '',
            //     alimentar: item[30] === 'Sim',
            //     financeira: item[31] === 'Sim',
            //     violencia: item[32] === 'Sim',
            //     observacoes: item[33] ? item[33] : '',
            // },
            // duracaoChamada: item[34] ? item[34] : '',
        }


        resp.raw.S01 = {
            Q01: {
              question: '[S01Q01] I_id',
              response: '5fd119cec807a433447f9160'
            },
            Q02: {
              question: '[S01Q02] V_id',
              response: '5fd1161fc807a433447f915e'
            },
            Q03: {
              question: '[S01Q03] U_id',
              response: '5fd1065e72a8ca29ec2d700a'
            },
        };

        resp.raw.S02 = {
            Q01: {
                question: '[S02Q01] Atendeu aos telefonemas',
                response: item[3]
            },
        };

        if(item[3] === 'Sim') { // se a ligação foi atendida 
            resp.raw.S03 = {
                Q01: {
                    question: '[S03Q01] Idade do idoso?',
                    response: item[4]
                },
            };
    
            resp.raw.S04 = {
                Q01: {
                    question: '[S04Q01] Quem responderá o questionário?',
                    response: item[5]
                },
            };
    
            resp.raw.S05 = {
                Q01: {
                    question: '[S05Q01] O idoso apresenta sintomas de gripe/COVID?',
                    response: item[6].split(',').map(s => s.trim())
                },
            };
            
            if(item[7]) { // apresenta também outros sintomas?
                resp.raw.S05.Q02 = {
                    question: '[S05Q02] Apresenta também outros sintomas?',
                    response: item[7].split(',').map(s => s.trim())
                };
            }
            
            if(item[8]) { // detalhes adicionas a respeito dos sintomas
                resp.raw.S05.Q03 = {
                    question: '[S05Q03] Detalhes adicionais a respeito dos sintomas',
                    response: item[8]
                };
            }

            if(item[9]) { // se estiver apresentando sintomas, há quantos dias iniciaram?
                resp.raw.S05.Q04 = {
                    question: '[S05Q04] Se estiver apresentando sintomas, há quantos dias eles iniciaram?',
                    response: item[9]
                };
            }

            resp.raw.S05.Q05 = {
                question: '[S05Q05] Esteve em contato com algum caso confirmado de coronavírus?',
                response: item[10]
            };
    

            resp.raw.S06 = {
                Q01: {
                    question: '[S06Q01] Tem alguma condição de saúde?',
                    response: item[11].split(',').map(s => s.trim())
                },
                Q02: {
                    question: '[S06Q02] Tem alguma medicação que toma todos os dias?',
                    response: item[12].startsWith('Sim') ? 'Sim' : 'Não'
                },
            };
            
            if(item[12].startsWith('Sim')) { // se toma medicações diariamente
                resp.raw.S06.Q03 = {
                    question: '[S06Q03] Se toma mediação diariamente, quais são?',
                    response: item[12] === 'Sim' ? '' : item[12].substring(4).split(',').map(s => s.trim())
                };
            }
            
            resp.raw.S06.Q04 = {
                question: '[S06Q04] Se toma medicações diariamente, está conseguindo adquiri-las?',
                response: item[13]
            };


            resp.raw.S07 = {
                Q01: {
                    question: '[S07Q01] Esta ligação é o primeiro atendimento ou se trata de um acompanhamento?',
                    response: item[14]
                },
            };
    
            if(item[14] === 'Primeiro atendimento') { // Se é o primeiro atendimento
                resp.raw.S08 = {
                    Q01: {
                        question: '[S08Q01] Tem feito a higienização frequente das mãos com água e sabão ou álcool gel?',
                        response: item[15]
                    },
                    Q02: {
                        question: '[S08Q02] O idoso tem saído de casa?',
                        response: item[16]
                    },
                };

                if(item[17]) { // se sai de casa
                    resp.raw.S08.Q03 = {
                        question: '[S08Q03] Caso o idoso esteja saindo de casa, qual a frequência?',
                        response: item[17]
                    };
                }

                if(item[18]) { // se sai de casa, pra onde?
                    resp.raw.S08.Q04 = {
                        question: '[S08Q04] Caso o idoso esteja saindo de casa, para onde?',
                        response: item[18] ? item[18].split(',').map(s => s.trim()) : []
                    };
                }

                if(item[19]) { // tem apoio familiar ou amigo?
                    resp.raw.S08.Q05 = {
                        question: '[S08Q05] Há um familiar ou amigo que o idoso possa contar quando necessita de ajuda?',
                        response: item[19]
                    };
                }

                resp.raw.S08.Q06 ={
                    question: '[S08Q06] Caso esteja recebendo visitas na sua casa, essas visitas estão tomando os cuidados de prevenção?',
                    response: item[20]
                };

                resp.raw.S08.Q07 = {
                    question: '[S08Q07] Qual número de cômodos a casa do idoso possui?',
                    response: item[21]
                };

                if(item[22]) { // realiza atividade prazerosa
                    resp.raw.S08.Q08 = {
                        question: '[S08Q08] Dentro de casa, tem realizado alguma atividade prazerosa?',
                        response: item[22]
                    };
                }
            }
    
            resp.raw.S09 = {
                Q01: {
                    question: '[S09Q01] Quantas pessoas moram na casa do idoso?',
                    response: item[23]
                },
            };
    
            if(item[23] !== 'Somente o idoso') { // Se não mora sozinho
                resp.raw.S10 = {
                    Q01: {
                        question: '[S10Q01] Na casa do idoso, alguém apresenta sintomas de gripe/COVID?',
                        response: item[24].split(',').map(s => s.trim())
                    },
                };
        
                resp.raw.S11 = {
                    Q01: {
                        question: '[S11Q01] As pessoas que moram com o idoso têm saído de casa?',
                        response: item[25]
                    },
                };
                
                if(item[26]) { // higienização das mãos
                    resp.raw.S11.Q02 = {
                        question: '[S11Q02] As pessoas que moram com o idoso têm feito a higienização frequente das mãos com água e sabão ou álcool gel?',
                        response: item[26]
                    };
                }
                
                if(item[27]) { // compartilha utensílios
                    resp.raw.S11.Q03 = {
                        question: '[S11Q03] O idoso costuma compartilhar utensílios com as pessoas da sua casa? Ex: copos, talheres.',
                        response: item[27]
                    };
                }

                if(item[28]) { // usam mascara
                    resp.raw.S11.Q04 = {
                        question: '[S11Q04] Todos em casa usam máscara ao falar com o idoso?',
                        response: item[28] 
                    };
                }

            }
    
            resp.raw.S12 = {
                Q01: {
                    question: '[S12Q01] Após a sondagem, como você identifica o convívio do idoso com sua família?',
                    response: item[29]
                },
                Q02: {
                    question: '[S12Q02] Após a sondagem, você identificou algum sinal de vulnerabilidade alimentar?',
                    response: item[30]
                },
                Q03: {
                    question: '[S12Q03] Após a sondagem, você identificou algum sinal de vulnerabilidade financeira ou abuso financeiro por parte de terceiros?',
                    response: item[31]
                },
                Q04: {
                    question: '[S12Q04] Após a sondagem, você identificou algum sinal de violência sofrida pelo idoso, seja ela física ou psicológica?',
                    response: item[32]
                },
            };

            if(item[33]) { // observações
                resp.raw.S12.Q05 = {
                    question: '[S12Q05] Observações e outras informações importantes',
                    response: item[33]
                };
            }
    
            if(item[34]) { // duração da chamada
                resp.raw.S13 = {
                    Q01: {
                        question: '[S13Q01] Tempo de duração da chamada',
                        response: item[34]
                    },
                };
            }
        }

        //TODO criar uma função para conversao de datas string da planilha para Date
        // 13/05/2020 13:10:19
        var parts = item[0].split(' ');
        var data = parts[0].split('/');
        var hora = parts[1].split(':');

        resp.authsecret = '';
        resp.timestamp = new Date(`${data[2]}-${data[1]}-${data[0]}T${hora[0]}:${hora[1]}:${hora[2]}`);
        resp.responseId = '';
        resp.idosoId = '5fd119cec807a433447f9160'; // TODO
        resp.vigilanteId = '5fd1161fc807a433447f915e'; // TODO
        resp.unidadeId = '5fd1065e72a8ca29ec2d700a'; // TODO
        resp.atendeu = item[3] === 'Sim';
        resp.fonte = item[5];
        resp.tipo = item[14];
        resp.idadeIdoso = item[4] === undefined ? null : +item[4];
        resp.duracaoChamada = item[34];
        resp._isDeleted = false;
        // criterios // TODO
        // escalas // TODO

        respostasArray.push(resp);

    });

    await app.server.service.v2.atendimentoService.insertOne(respostasArray[18]);

    // const atendimentosArray = respostasArray.map(resposta => {
    //     return {
    //         fichaVigilancia: resposta,
    //         escalas : calcularEscalas(resposta),
    //     }
    // });

    // // indexRespostas = lastIndexSynced + atendimentosArray.length;
    // if(atendimentosArray.length) {
    //     console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Respostas'!A${firstIndex}:AI${lastIndexSynced + atendimentosArray.length}`);
        
    //     // let i = null;
    //     // for(; i < atendimentosArray.length; i++) {
    //     //     const resultUpsert = await app.server.service.v2.atendimentoService.replaceOne(unidade.collectionPrefix, atendimentosArray[i]);
    //     // }
    //     await app.server.service.v2.atendimentoService.bulkReplaceOne(unidade.collectionPrefix, atendimentosArray);
    //     console.log(`[Sync] atendimentosCollection updated`);

    //     await app.server.service.v2.atendimentoService.aggregateEscalas(unidade.collectionPrefix);
    //     console.log(`[Sync] ultimasEscalasCollection updated`);

    //     await app.server.service.v2.atendimentoService.aggregateUltimosAtendimentos(unidade.collectionPrefix);
    //     console.log(`[Sync] ultimosAtendimentosCollection updated`);

    //     // unidade.sync[0].indexed = indexRespostas;
    //     unidade.lastSyncDate = new Date();
    //     await app.server.service.v2.unidadeService.replaceOne(unidade);
    // } else {
    //     console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 0 rows found`);
    //     unidade.lastSyncDate = new Date();
    //     await app.server.service.v2.unidadeService.replaceOne(unidade);
    // }
}

    return { fullSyncUnidade, resetUnidade, partialSyncUnidade }
}