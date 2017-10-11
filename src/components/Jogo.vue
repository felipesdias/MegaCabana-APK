<template>
  <div>
    <q-toolbar color="black" class="titulo">
      <q-icon name="keyboard_backspace" @click="$router.go(-1)"></q-icon>
      <q-toolbar-title>
        {{jogo.nome}}
      </q-toolbar-title>
      <q-icon @click="desloga" v-show="$store.state.ADM" name="exit_to_app"></q-icon>
      <q-icon @click="login" v-show="!$store.state.ADM" name="account_circle"></q-icon>
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

    <div v-show="$store.state.ADM" class="row justify-around" style="margin: 10px">
      <q-btn
        push
        small
        @click="addJogo"
      >
        Adicionar Jogador
      </q-btn>

      <q-btn
        push
        small
        @click="addSorteio"
      >
        Adicionar Sorteio
      </q-btn>
    </div>

    <q-slide-transition>
      <div v-show="abrirResult" style="margin: 10px; box-shadow: rgba(0, 0, 0, 0.28) 0px 0px 0px 1px;">
        <table class="q-table full-width compact horizontal-separator" style="padding: 0px 10px">
          <thead>
            <tr v-for="item in jogo.sorteios" :key="item.id">
              <th style="border-left: 0px!important">
                {{parseData(item.data)}}
              </th>
              <th style="border-left: 0px!important" class="text-right" v-for="i in 6" :key="i">
                {{item['_' + (i-1)]}}
              </th>
            </tr>
          </thead>
        </table>
      </div>
    </q-slide-transition>

    <table class="q-table compact full-width vertical-separator" style="box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.28);">
      <thead>
        <tr style="background: #fc9c00">
          <th style="width: 29px" class="separator" @click="ordenacao.n = !ordenacao.n; ordena('numero', ordenacao.n)">
            Nº
          </th>
          <th class="separator text-center" @click="ordenacao.nome = !ordenacao.nome; ordena('nome', ordenacao.nome)">
            NOME {{(aberto) ? '/JOGO' : ''}}
          </th>
          <th style="width: 41px" class="separator bordaFim" @click="ordenacao.acertos = !ordenacao.acertos; ordena('acertos', ordenacao.acertos)">
            TOT
          </th>
        </tr>
      </thead>


      <tbody v-touch-hold="() => {editaJogador (item)}" v-for="(item, index) in jogos" :key="item.id" class="separator">
        <tr :class="{trocaFundo: (index%2 == 0), trocaFundo2: (index%2 == 1)}" @click="item.mostra = !item.mostra">
          <td class="text-center"> {{item.numero}} </td>
          <td> {{item.nome}} </td>
          <td class="text-center bordaFim"> {{item.acertos}} </td>
        </tr>
        <tr v-show="item.mostra" style="height: 23px">
          <td :class="{trocaFundo: (index%2 == 0), trocaFundo2: (index%2 == 1)}"></td>
          <td :class="{trocaFundo: (index%2 == 0), trocaFundo2: (index%2 == 1), separator: false}" style="padding-left: 0px;"> 
            <div class="row" style="font-size: 13px;">
              <div class="col text-right" v-for="i in jogo.qt_numeros" :key="i" :class="{acertou: resultados[item['_' + (i-1)]]}">
                {{item['_' + (i-1)]}}
              </div>
            </div>
          </td>
          <td class="bordaFim" :class="{trocaFundo: (index%2 == 0), trocaFundo2: (index%2 == 1)}"></td>
        </tr>
      </tbody>
    </table>

    <div class="row justify-center">
      <q-spinner :size="50" color="blue" v-if="carregando"/>
    </div>

    <q-datetime @blur="addSorteio2" v-model="dataSorteio" ref="pergData" type="date" style="display: none"/>

  </div>
</template>

<script>
import { TouchHold, LocalStorage, Dialog, Toast, QToolbar, QToolbarTitle, QSpinner, QDatetime, QIcon, QSearch, QSlideTransition, QBtn, QPopover, date } from 'quasar'

export default {
  components: {
    QToolbar, QToolbarTitle, QSpinner, QDatetime, QIcon, QSearch, QSlideTransition, QBtn, QPopover
  },
  directives: {
    TouchHold
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
      abrirResult: false,
      dataSorteio: new Date(),
      dadosSorteio: {}
    }
  },
  watch: {
    '$route': function () {
      this.jogo_id = this.$route.params.jogo_id
      this.getJogo(this.jogo_id)
    }
  },
  methods: {
    editaJogador (item) {
      let self = this
      let numeros = {}
      for (let i = 0; i < this.jogo.qt_numeros; i++) {
        numeros['_' + i] = {
          type: 'number',
          label: '' + (i + 1) + 'º número',
          model: item['_' + i]
        }
      }
      Dialog.create({
        title: 'Editar jogador',
        form: {
          numero: {
            type: 'number',
            label: 'Número',
            model: item.numero
          },
          nome: {
            type: 'text',
            label: 'Nome do jogador',
            model: item.nome
          },
          ...numeros
        },
        buttons: [
          {
            label: 'Cancelar',
            style: 'padding: 0; padding-left: 9px; padding-right: 9px;'
          },
          {
            label: 'Excluir',
            color: 'negative',
            style: 'padding: 0; padding-left: 9px; padding-right: 9px;',
            handler (data) {
              self.API.delete('/deletaJogada/' + item.id)
                .then((response) => {
                  self.getJogo(self.jogo.id, false)
                  Toast.create.positive('Jogador apagado com sucesso!')
                })
                .catch((error) => {
                  if (error.response.status === 422) {
                    Toast.create(error.response.data.errors.message[0])
                  }
                  else {
                    Toast.create.negative('Falha ao apagar jogador')
                  }
                })
            }
          },
          {
            label: 'Salvar',
            color: 'positive',
            style: 'padding: 0; padding-left: 9px; padding-right: 9px;',
            handler (data) {
              data['id'] = item.id
              data['jogo_id'] = self.jogo.id
              self.API.post('/attJogada', data)
                .then((response) => {
                  self.getJogo(self.jogo.id, false)
                  Toast.create.positive('Jogador atualizado com sucesso!')
                })
                .catch((error) => {
                  if (error.response.status === 422) {
                    Toast.create(error.response.data.errors.message[0])
                  }
                  else {
                    Toast.create.negative('Falha ao atualizar jogador')
                  }
                })
            }
          }
        ]
      })
    },
    addJogo () {
      let numeros = {}
      let self = this
      for (let i = 0; i < this.jogo.qt_numeros; i++) {
        numeros['_' + i] = {
          type: 'number',
          label: '' + (i + 1) + 'º número',
          model: null
        }
      }
      Dialog.create({
        title: 'Novo jogador',
        message: 'Informe os dados do jogo:',
        form: {
          numero: {
            type: 'number',
            label: 'Número',
            model: null
          },
          nome: {
            type: 'text',
            label: 'Nome do jogador',
            model: ''
          },
          ...numeros
        },
        buttons: [
          {
            label: 'Cancelar'
          },
          {
            label: 'Criar',
            color: 'positive',
            handler (data) {
              data['jogo_id'] = self.jogo.id
              self.API.post('/addJogador', data)
                .then((response) => {
                  self.getJogo(self.jogo.id, false)
                  Toast.create.positive('Jogador adicionado com sucesso!')
                })
                .catch((error) => {
                  if (error.response.status === 422) {
                    Toast.create(error.response.data.errors.message[0])
                  }
                  else {
                    Toast.create.negative('Falha ao adicionar jogador')
                  }
                })
            }
          }
        ]
      })
    },
    addSorteio2 () {
      console.log(this.dataSorteio)
      console.log(date.formatDate(this.dataSorteio, 'YYYY/MM/DD'))
      this.dadosSorteio['data'] = date.formatDate(this.dataSorteio, 'YYYY/MM/DD')
      this.dadosSorteio['jogo_id'] = this.jogo.id
      this.API.post('/addSorteio', this.dadosSorteio)
        .then((response) => {
          this.getJogo(this.jogo.id)
          this.abrirResult = true
          Toast.create.positive('Sorteio adicionado com sucesso!')
        })
        .catch((error) => {
          if (error.response.status === 422) {
            Toast.create(error.response.data.errors.message[0])
          }
          else {
            Toast.create.negative('Falha ao adicionar sorteio')
          }
        })
    },
    addSorteio () {
      let numeros = {}
      let self = this
      for (let i = 0; i < 6; i++) {
        numeros['_' + i] = {
          type: 'number',
          label: '' + (i + 1) + 'º número',
          model: null
        }
      }
      Dialog.create({
        title: 'Novo sorteio',
        message: 'Informe os dados do sorteio:',
        form: numeros,
        buttons: [
          {
            label: 'Cancelar'
          },
          {
            label: 'Criar',
            color: 'positive',
            handler (data) {
              self.dadosSorteio = data
              self.$refs.pergData.open()
            }
          }
        ]
      })
    },
    desloga () {
      this.$store.commit('desloga')
    },
    parseData (data) {
      let aux = data.split('-')
      return aux[2] + '/' + aux[1] + '/' + aux[0].slice(2, 4)
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
    getJogo (id, orden = true) {
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

        if (orden) {
          dados.jogadas.sort((a, b) => {
            return b.acertos - a.acertos
          })
        }
        else {
          dados.jogadas.sort((a, b) => {
            return b.numero - a.numero
          })
        }

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
    },
    login () {
      if (LocalStorage.get.item('logado')) {
        Toast.create.positive('Modo Administrador!')
        this.$store.commit('loga')
        return
      }

      let self = this
      Dialog.create({
        title: 'Autenticação',
        message: 'Digite a senha:',
        form: {
          senha: {
            type: 'password',
            label: 'Senha',
            model: ''
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler (data) {
              if (data.senha === 'd36g483') {
                Toast.create.positive('Modo Administrador!')
                self.$store.commit('loga')
                LocalStorage.set('logado', true)
              }
              else {
                Toast.create.negative('Senha incorreta!')
              }
            }
          }
        ]
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
    box-shadow: 0px -1px 0px #d88a00;
  }

  .acertou {
    color: red;
    text-decoration: line-through;
  }

  .trocaFundo {
    background: #f8cd99;
  }

  .trocaFundo2 {
    background: #ffffff;
  }

  table th, td {
    border-left: 1px solid #fc9c00!important;
  }

  .bordaFim {
    border-right: 1px solid #fc9c00!important;
  }
</style>
