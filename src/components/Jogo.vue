<template>
  <div>
    <q-toolbar color="black" class="titulo"> 
      <q-toolbar-title>
        {{jogo.nome}}
      </q-toolbar-title>
    </q-toolbar>
    
    <q-search :debounce="600" @change="filtra" placeholder="Buscar" v-model="search" style="margin: 0px 15px"/>

    <div class="row justify-around" style="margin: 10px">
      <q-btn
        push
        small
        @click="expansao ()"
      >
        {{aberto ? 'Fechar' : 'Abrir'}} Todos
      </q-btn>

      <q-btn
        push
        small
        @click="abrirResult = !abrirResult"
      >
        Resultados
      </q-btn>
    </div>

    <q-slide-transition>
      <div v-show="abrirResult" style="margin: 10px; box-shadow: rgba(0, 0, 0, 0.28) 0px 0px 0px 1px;">
        <table class="q-table full-width compact" style="padding: 0px 10px">
          <thead>
            <tr v-for="item in jogo.sorteios" :key="item.id">
              <th>
                {{parseData(item.data)}}
              </th>
              <th class="text-right" v-for="i in 6" :key="i">
                {{item['_' + (i-1)]}}
              </th>
            </tr>
          </thead>
        </table>
      </div>
    </q-slide-transition>

    <table class="q-table compact full-width vertical-separator" style="box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.28);">
      <thead>
        <tr>
          <th class="separator" @click="ordenacao.n = !ordenacao.n; ordena('numero', ordenacao.n)">
            Nº
          </th>
          <th class="separator" @click="ordenacao.nome = !ordenacao.nome; ordena('nome', ordenacao.nome)">
            NOME
          </th>
          <th class="separator" @click="ordenacao.acertos = !ordenacao.acertos; ordena('acertos', ordenacao.acertos)">
            TOT
          </th>
        </tr>
      </thead>


      <tbody v-for="(item, index) in jogos" :key="item.id" class="separator">
        <tr :class="{trocaFundo: (index%2 == 0)}" @click="item.mostra = !item.mostra">
          <td> {{item.numero}} </td>
          <td> {{item.nome}} </td>
          <td> {{item.acertos}} </td>
        </tr>
        <td :class="{trocaFundo: (index%2 == 0)}"></td>
        <td :class="{trocaFundo: (index%2 == 0), separator: false}" style="padding-left: 0px;"> 
          <div v-show="item.mostra" class="text-right row justify-around">
            <span v-for="i in jogo.qt_numeros" :key="i" :class="{acertou: resultados[item['_' + i]]}" style="width: 24px">
              {{item['_' + (i-1)]}}
            </span>
          </div>
        </td>
        <td :class="{trocaFundo: (index%2 == 0)}"></td>
      </tbody>
    </table>

    <div class="row justify-center">
      <q-spinner :size="50" color="blue" v-if="carregando"/>
    </div>

  </div>
</template>

<script>
import { Toast, QToolbar, QToolbarTitle, QSpinner, QIcon, QSearch, QSlideTransition, QBtn, QPopover, date } from 'quasar'

export default {
  components: {
    QToolbar, QToolbarTitle, QSpinner, QIcon, QSearch, QSlideTransition, QBtn, QPopover
  },
  data () {
    return {
      jogo: {},
      jogos: [],
      jogo_id: this.$route.params.jogo_id,
      ordenacao: {
        n: true,
        nome: true,
        acertos: true
      },
      carregando: true,
      search: '',
      resultados: Array(61).fill(false),
      aberto: false,
      abrirResult: false
    }
  },
  watch: {
    '$route': function () {
      this.jogo_id = this.$route.params.jogo_id
      this.getJogo(this.jogo_id)
    }
  },
  methods: {
    parseData (data) {
      return date.formatDate(data, 'DD/MM/YY')
    },
    filtra () {
      this.jogos = this.jogo.jogadas.filter((item) => {
        if (item.search.indexOf(this.search.toLocaleLowerCase()) !== -1) {
          return true
        }
        return false
      })
    },
    expansao () {
      this.jogos.forEach((item) => {
        item.mostra = !this.aberto
      })

      this.aberto = !this.aberto
    },
    ordena (field, n) {
      if (n) {
        this.jogos.sort((a, b) => {
          if (a[field] > b[field]) {
            return -1
          }
          if (a[field] < b[field]) {
            return 1
          }
          return 0
        })
      }

      else {
        this.jogos.sort((a, b) => {
          if (a[field] < b[field]) {
            return -1
          }
          if (a[field] > b[field]) {
            return 1
          }
          return 0
        })
      }
    },
    getJogo (id) {
      this.carregando = true
      this.API.get('/jogo/' + id).then((response) => {
        let dados = response.data.data
        this.aberto = false

        dados.sorteios.forEach((item) => {
          for (let i = 0; i < 6; i++) {
            this.resultados[item['_' + i]] = true
          }
        })

        dados.jogadas = dados.jogadas.map((item) => {
          item.search = item.nome.toLocaleLowerCase()
          item.mostra = false
          item.acertos = 0
          for (let i = 0; i < dados.qt_numeros; i++) {
            if (this.resultados[item['_' + i]]) {
              item.acertos++
            }
          }

          return item
        })

        dados.jogadas.sort((a, b) => {
          return b.acertos - a.acertos
        })

        this.jogo = dados
        this.jogos = dados.jogadas
        this.carregando = false
      }).catch(() => {
        window.history.go(-1)
        Toast.create.negative({
          timeout: 3000,
          html: 'Erro de conexão'
        })
      })
    }
  },
  mounted () {
    this.jogo_id = this.$route.params.jogo_id
    this.getJogo(this.jogo_id)
  }
}
</script>

<style scoped>
  .titulo {
    text-align: center;
    margin-bottom: 10px;
  }

  .separator {
    box-shadow: 0px -1px 0px rgba(0, 0, 0, 0.28);
  }

  .acertou {
    color: red;
    text-decoration: line-through;
  }

  .trocaFundo {
    background: #eee;
  }
</style>
