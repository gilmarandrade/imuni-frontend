<template>
    <div>
       <PageTitle icon="" main="Planilha Idosos" sub="unidade xxxx" />
       <b-card no-body>
          <b-tabs card>
            <b-tab title="Idosos" active>
              <IdososPage />
            </b-tab>
            <b-tab title="Idosos por Vulnerabilidade">
              <IdososPorVulnerabilidadePage />
            </b-tab>
            <b-tab title="Idosos por Risco">
              <IdososPorRiscoPage />
            </b-tab>
            <b-tab title="Idosos com Escalas">
              <IdososComEscalaPage />
            </b-tab>
            <b-tab title="Idosos em ordem Alfabética">
              <IdososOrdemAlfabeticaPage />
            </b-tab>
          </b-tabs>
        </b-card>
    </div>
</template>

<script>
import PageTitle from '../../template/PageTitle'
import IdososPage from './IdososPage'
import IdososPorVulnerabilidadePage from './IdososPorVulnerabilidadePage'
import IdososPorRiscoPage from './IdososPorRiscoPage'
import IdososComEscalaPage from './IdososComEscalaPage'
import IdososOrdemAlfabeticaPage from './IdososOrdemAlfabeticaPage'

export default {
    name: 'IdososSpreadsheet',
    components: { PageTitle, IdososPage, IdososPorVulnerabilidadePage, IdososPorRiscoPage, IdososComEscalaPage, IdososOrdemAlfabeticaPage },
}
</script>

<style>

</style>