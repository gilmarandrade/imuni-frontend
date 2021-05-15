<template>
 <div class="unidades">
    <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Unidades'}]" />
        <div class="row mb-3">
          <div class="col">
            <h1>Unidades</h1>
          </div>
          <div class="col text-right">
            <b-dropdown id="dropdown-1" text="Adicionar" variant="primary" class="pull-right mr-2" right>
              <b-dropdown-item href="/adicionarUnidade">
                <strong>Adicionar unidade</strong>
                <p>Crie uma nova unidade do zero</p>
              </b-dropdown-item>
              <b-dropdown-item href="/importarUnidade">
                <strong>Importar unidade</strong>
                <p>Importe uma unidade a partir de uma planilha do google sheets</p>
              </b-dropdown-item>
            </b-dropdown>
            <b-dropdown right no-caret variant="light" title="Opções">
              <template #button-content>
                  <font-awesome-icon :icon="['fas', 'ellipsis-v']"  />
              </template>
              <b-dropdown-item :href="`${baseApiUrl}/v2/exportacao/idosos`">Exportar todos os idosos (csv)</b-dropdown-item>
              <b-dropdown-item :href="`${baseApiUrl}/v2/exportacao/atendimentos`">Exportar todos os atendimentos (csv)</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>

        <ul class="grid-list row">
            <li v-for="unidade in unidades" :key="unidade._id" class="col-sm-6 col-md-4 col-lg-3" :class="{ 'ativo' : unidade.status == 'ATIVO' }">
              <router-link :to="'/unidades/'+unidade._id" class="item" title="clique para ver detalhes">
                <!-- <div v-if="unidade.lastSyncDate" class="sync-state">
                  <popper
                      trigger="hover"
                      :options="{
                        placement: 'top'
                      }">
                      <div class="popper">
                          {{ unidade.autoSync ? 'Sincronização automática ativada': 'Sincronização automática desativada' }}
                      </div>

                      <span slot="reference">
                          <font-awesome-icon :icon="['fas', 'sync']" /> {{ formatDate(unidade.lastSyncDate) }}
                      </span>
                  </popper>
                </div> -->
                <h2>{{ unidade.nome }}</h2>
                <p>Distrito {{ unidade.distrito }}</p>
              </router-link>
            </li>
        </ul>
        <div v-if="!unidades" class="text-muted">
          Não há unidades cadastradas
        </div>
 </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import Breadcrumb from '@/components/includes/Breadcrumb';
import axios from 'axios';

export default {
    name: 'Unidades',
    components: { Breadcrumb },
    computed: {
      baseApiUrl() { return baseApiUrl },
    },
    data: function() {
        return {
            unidades: [],
        }
    },
    methods: {
        loadUnidades() {
            const url = `${baseApiUrl}/v2/unidades`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidades = res.data
                console.log(this.unidades)
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
    },
    mounted() {
      this.loadUnidades();
    }
}
</script>

<style>
  .grid-list {
    list-style-type: none;
    padding: 0;
  }

  .grid-list .item {
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 90px;
    padding: 0 20px;
    margin-bottom: 30px;
    color: black;
    text-decoration: none;
  }

  .grid-list .item:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .grid-list .ativo .item {
    border: 3px solid #27AE60;
  }

  .grid-list .item .sync-state {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.54);
  }

  .grid-list .ativo .item .sync-state {
    color: #27AE60;
  }

  .grid-list .item h2 {
    margin: 0;
    font-weight: 600;
    font-size: 18px;
  }

  .grid-list .item p {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.54);
  }

  .grid-list .item.button {
    border-style: dashed;
    color: rgba(0, 0, 0, 0.54);
  }
</style>