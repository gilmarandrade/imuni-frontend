<template>
 <div class="unidades">
        <h1>Unidades</h1>
        <ul class="grid-list row">
            <li v-for="unidade in unidades" :key="unidade._id" :class="{ 'ativo' : unidade.autoSync }" class="col-sm-6 col-md-4 col-lg-3">
              <router-link :to="'/unidades/'+unidade._id" class="item" title="clique para ver detalhes">
                <div v-if="unidade.lastSyncDate" class="sync-state">
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
                </div>
                <h2>{{ unidade.nome }}</h2>
                <p>Distrito {{ unidade.distrito }}</p>
              </router-link>
            </li>
            <li class="col-sm-6 col-md-4 col-lg-3">
              <router-link to="/adicionarUnidade" class="item button">
                <h2><font-awesome-icon :icon="['fas', 'plus']" /> Adicionar unidade</h2>
              </router-link>
            </li>
        </ul>
 </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';

export default {
    name: 'Unidades',
    components: { 'popper': Popper },
    data: function() {
        return {
            unidades: [],
        }
    },
    methods: {
        loadUnidades() {
            const url = `${baseApiUrl}/unidades`;
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