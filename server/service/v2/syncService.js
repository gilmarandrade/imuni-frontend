// const { calcularEscalas } = require('../../config/helpers');
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
        // console.log('get nome vigilante')
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
     * Apaga os registros importados anterioremente, insere pelo menos os 10 ultimos registros já cadastrados no banco, e insere os novos registros (se houver)
     */
    const syncAtendimentos = async (unidade, total) => {
        await app.server.service.v2.atendimentoService.deleteImportedByUnidade(unidade._id);

        // let indexRespostas = 1; // unidade.sync[0].indexed;
        const lastIndexSynced = total && (total - 10 >= 1) ? total - 10 : 1;// coloca uma margem de segurança, para atualizar os 10 ultimos 
        const firstIndex = lastIndexSynced + 1;
        const lastIndex = '';//limit ? lastIndexSynced + limit : '';

        console.log(`[Sync] Reading spreadsheet ${unidade.idPlanilhaGerenciamento} 'Respostas'!A${firstIndex}:AI${lastIndex}`);
        const rows = await sheetsApi.read(unidade.idPlanilhaGerenciamento, `'Respostas'!A${firstIndex}:AI${lastIndex}`);
        // const respostasArray = [];
        for(let i = 0; i < rows.length; i++) {

            // encontra o id do idoso
            const idos = await app.server.service.v2.idosoService.getByNome(rows[i][2], unidade._id);
            const idosoId = idos ? idos._id.toString() : null;
            if(!idosoId) {
                console.error('ATENDIMENTO SEM IDOSO! ', rows[i], unidade._id, idos)
            }
                
            // encontra o id do vigilante, se não existir cria um novo vigilante
            const vig = await app.server.service.v2.usuarioService.findVigilanteByNome(rows[i][1], unidade._id);
            let vigilanteId = vig ? vig._id.toString() : null;
            if(!vigilanteId) {
                vigilanteId = await app.server.service.v2.usuarioService.insertOne({
                    name: rows[i][1].trim(),
                    role: 'VIGILANTE',
                    unidadeId: unidade._id,
                    status: 'INCOMPLETO',
                    _isDeleted: false,
                });
                console.error('ATENDIMENTO SEM VIGILANTE! ', rows[i], unidade._id, vig);
            } 

            const atendimento = {
                origin: 'IMPORTED',
                raw: {},
            }

            // Respostas originais do google form
            atendimento.raw.S01 = {
                Q01: {
                question: '[S01Q01] I_id',
                response: idosoId
                },
                Q02: {
                question: '[S01Q02] V_id',
                response: vigilanteId.toString()
                },
                Q03: {
                question: '[S01Q03] U_id',
                response: unidade._id.toString()
                },
            };
    
            atendimento.raw.S02 = {
                Q01: {
                    question: '[S02Q01] Atendeu aos telefonemas',
                    response: rows[i][3]
                },
            };
        
            if(rows[i][3] === 'Sim') { // se a ligação foi atendida 
                atendimento.raw.S03 = {
                    Q01: {
                        question: '[S03Q01] Idade do idoso?',
                        response: rows[i][4]
                    },
                };
        
                atendimento.raw.S04 = {
                    Q01: {
                        question: '[S04Q01] Quem responderá o questionário?',
                        response: rows[i][5]
                    },
                };
        
                atendimento.raw.S05 = {
                    Q01: {
                        question: '[S05Q01] O idoso apresenta sintomas de gripe/COVID?',
                        response: rows[i][6].split(',').map(s => s.trim())
                    },
                };
                
                if(rows[i][7]) { // apresenta também outros sintomas?
                    atendimento.raw.S05.Q02 = {
                        question: '[S05Q02] Apresenta também outros sintomas?',
                        response: rows[i][7].split(',').map(s => s.trim())
                    };
                }
                
                if(rows[i][8]) { // detalhes adicionas a respeito dos sintomas
                    atendimento.raw.S05.Q03 = {
                        question: '[S05Q03] Detalhes adicionais a respeito dos sintomas',
                        response: rows[i][8]
                    };
                }
    
                if(rows[i][9]) { // se estiver apresentando sintomas, há quantos dias iniciaram?
                    atendimento.raw.S05.Q04 = {
                        question: '[S05Q04] Se estiver apresentando sintomas, há quantos dias eles iniciaram?',
                        response: rows[i][9]
                    };
                }
    
                atendimento.raw.S05.Q05 = {
                    question: '[S05Q05] Esteve em contato com algum caso confirmado de coronavírus?',
                    response: rows[i][10]
                };
        
    
                atendimento.raw.S06 = {
                    Q01: {
                        question: '[S06Q01] Tem alguma condição de saúde?',
                        response: rows[i][11].split(',').map(s => s.trim())
                    },
                    Q02: {
                        question: '[S06Q02] Tem alguma medicação que toma todos os dias?',
                        response: rows[i][12].startsWith('Sim') ? 'Sim' : 'Não'
                    },
                };
                
                if(rows[i][12].startsWith('Sim')) { // se toma medicações diariamente
                    atendimento.raw.S06.Q03 = {
                        question: '[S06Q03] Se toma mediação diariamente, quais são?',
                        response: rows[i][12] === 'Sim' ? '' : rows[i][12].substring(4).split(',').map(s => s.trim())
                    };
                }
                
                atendimento.raw.S06.Q04 = {
                    question: '[S06Q04] Se toma medicações diariamente, está conseguindo adquiri-las?',
                    response: rows[i][13]
                };
    
    
                atendimento.raw.S07 = {
                    Q01: {
                        question: '[S07Q01] Esta ligação é o primeiro atendimento ou se trata de um acompanhamento?',
                        response: rows[i][14]
                    },
                };
        
                if(rows[i][14] === 'Primeiro atendimento') { // Se é o primeiro atendimento
                    atendimento.raw.S08 = {
                        Q01: {
                            question: '[S08Q01] Tem feito a higienização frequente das mãos com água e sabão ou álcool gel?',
                            response: rows[i][15]
                        },
                        Q02: {
                            question: '[S08Q02] O idoso tem saído de casa?',
                            response: rows[i][16]
                        },
                    };
    
                    if(rows[i][17]) { // se sai de casa
                        atendimento.raw.S08.Q03 = {
                            question: '[S08Q03] Caso o idoso esteja saindo de casa, qual a frequência?',
                            response: rows[i][17]
                        };
                    }
    
                    if(rows[i][18]) { // se sai de casa, pra onde?
                        atendimento.raw.S08.Q04 = {
                            question: '[S08Q04] Caso o idoso esteja saindo de casa, para onde?',
                            response: rows[i][18] ? rows[i][18].split(',').map(s => s.trim()) : []
                        };
                    }
    
                    if(rows[i][19]) { // tem apoio familiar ou amigo?
                        atendimento.raw.S08.Q05 = {
                            question: '[S08Q05] Há um familiar ou amigo que o idoso possa contar quando necessita de ajuda?',
                            response: rows[i][19]
                        };
                    }
    
                    atendimento.raw.S08.Q06 ={
                        question: '[S08Q06] Caso esteja recebendo visitas na sua casa, essas visitas estão tomando os cuidados de prevenção?',
                        response: rows[i][20]
                    };
    
                    atendimento.raw.S08.Q07 = {
                        question: '[S08Q07] Qual número de cômodos a casa do idoso possui?',
                        response: rows[i][21]
                    };
    
                    if(rows[i][22]) { // realiza atividade prazerosa
                        atendimento.raw.S08.Q08 = {
                            question: '[S08Q08] Dentro de casa, tem realizado alguma atividade prazerosa?',
                            response: rows[i][22]
                        };
                    }
                }
        
                atendimento.raw.S09 = {
                    Q01: {
                        question: '[S09Q01] Quantas pessoas moram na casa do idoso?',
                        response: rows[i][23]
                    },
                };
        
                if(rows[i][23] !== 'Somente o idoso') { // Se não mora sozinho
                    atendimento.raw.S10 = {
                        Q01: {
                            question: '[S10Q01] Na casa do idoso, alguém apresenta sintomas de gripe/COVID?',
                            response: rows[i][24].split(',').map(s => s.trim())
                        },
                    };
            
                    atendimento.raw.S11 = {
                        Q01: {
                            question: '[S11Q01] As pessoas que moram com o idoso têm saído de casa?',
                            response: rows[i][25]
                        },
                    };
                    
                    if(rows[i][26]) { // higienização das mãos
                        atendimento.raw.S11.Q02 = {
                            question: '[S11Q02] As pessoas que moram com o idoso têm feito a higienização frequente das mãos com água e sabão ou álcool gel?',
                            response: rows[i][26]
                        };
                    }
                    
                    if(rows[i][27]) { // compartilha utensílios
                        atendimento.raw.S11.Q03 = {
                            question: '[S11Q03] O idoso costuma compartilhar utensílios com as pessoas da sua casa? Ex: copos, talheres.',
                            response: rows[i][27]
                        };
                    }
    
                    if(rows[i][28]) { // usam mascara
                        atendimento.raw.S11.Q04 = {
                            question: '[S11Q04] Todos em casa usam máscara ao falar com o idoso?',
                            response: rows[i][28] 
                        };
                    }
    
                }
        
                atendimento.raw.S12 = {
                    Q01: {
                        question: '[S12Q01] Após a sondagem, como você identifica o convívio do idoso com sua família?',
                        response: rows[i][29]
                    },
                    Q02: {
                        question: '[S12Q02] Após a sondagem, você identificou algum sinal de vulnerabilidade alimentar?',
                        response: rows[i][30]
                    },
                    Q03: {
                        question: '[S12Q03] Após a sondagem, você identificou algum sinal de vulnerabilidade financeira ou abuso financeiro por parte de terceiros?',
                        response: rows[i][31]
                    },
                    Q04: {
                        question: '[S12Q04] Após a sondagem, você identificou algum sinal de violência sofrida pelo idoso, seja ela física ou psicológica?',
                        response: rows[i][32]
                    },
                };
    
                if(rows[i][33]) { // observações
                    atendimento.raw.S12.Q05 = {
                        question: '[S12Q05] Observações e outras informações importantes',
                        response: rows[i][33]
                    };
                }
        
                if(rows[i][34]) { // duração da chamada
                    atendimento.raw.S13 = {
                        Q01: {
                            question: '[S13Q01] Tempo de duração da chamada',
                            response: rows[i][34]
                        },
                    };
                }
            }
        
            //TODO criar uma função para conversao de datas string da planilha para Date
            // 13/05/2020 13:10:19
            var parts = rows[i][0].split(' ');
            var data = parts[0].split('/');
            var hora = parts[1].split(':');
        
            atendimento.authsecret = '';
            // para converter a data de Iso para locale use : console.log(testDate.toLocaleString());
            atendimento.timestamp = new Date(`${data[2]}-${data[1]}-${data[0]}T${hora[0]}:${hora[1]}:${hora[2]}`);
            atendimento.responseId = '';
                
            // atendimento.idosoId = idosoId;
            // atendimento.vigilanteId = vigilanteId;
            // atendimento.unidadeId = unidade._id; // TODO ao importar uma unidade, o nome deve ser extraido da planilha? se não não será possível encontrar o id da unidade?
            // atendimento.atendeu = rows[i][3] === 'Sim';
            // atendimento.fonte = rows[i][5];
            // atendimento.tipo = rows[i][14];
            // atendimento.idadeIdoso = rows[i][4] === undefined ? null : +rows[i][4];
            // atendimento.duracaoChamada = rows[i][34];
            // atendimento._isDeleted = false;
            // // criterios // TODO
            // // escalas // TODO
        
            // respostasArray.push(resp);
            await app.server.service.v2.atendimentoService.convertAtendimento(atendimento);
        
        }

        // await app.server.service.v2.atendimentoService.insertOne(respostasArray[18]);

        // const atendimentosArray = respostasArray.map(resposta => {
        //     return {
        //         fichaVigilancia: resposta,
        //         escalas : calcularEscalas(resposta),
        //     }
        // });

        // // indexRespostas = lastIndexSynced + atendimentosArray.length;
        // if(atendimentosArray.length) {
            console.log('[Sync] Readed spreadsheet ', unidade.idPlanilhaGerenciamento , ` 'Respostas'!A${firstIndex}:AI${lastIndexSynced + rows.length}`);
            
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