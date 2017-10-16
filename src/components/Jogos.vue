<template>
  <div>
    <q-toolbar color="black" class="titulo"> 
      <q-btn icon="keyboard_backspace" @click.prevent="$router.go(-1)"></q-btn>
      <q-toolbar-title>
        Jogos {{tipo}}
      </q-toolbar-title>
      <q-btn @click.prevent="desloga" v-show="$store.state.ADM" icon="exit_to_app"></q-btn>
      <q-btn @click.prevent="login" v-show="!$store.state.ADM" icon="account_circle"></q-btn>
    </q-toolbar>

    <div class="row justify-center">
      <q-spinner :size="50" color="blue" v-if="carregando" />
    </div>

    <div class="contente column">
      <div class="row full-width items-center boxJogo" v-for="(item, index) in jogos" :key="item.id">
        <q-btn 
          class="col"
          style="padding: 15px 0px; margin-right: 15px;"
          push 
          @click.prevent="redireciona (item.id)"
          :color="getColor (index)" 
        >
          {{item.nome}}
        </q-btn>
        <q-btn @click.prevent="deletar (item, index)" v-show="$store.state.ADM" small round color="red" class="float-right" push>
          <q-icon name="delete" />
        </q-btn>
      </div>
    </div>

    <q-btn @click.prevent="criaJogo" v-show="$store.state.ADM" round color="green" push class="absolute-bottom-right" style="margin:10px; font-size: 40px;">
      +
    </q-btn>
    
  </div>
</template>

<script>
import { LocalStorage, Toast, QBtn, QToolbar, QToolbarTitle, QSpinner, QIcon, Dialog } from 'quasar'

export default {
  components: {
    QBtn, QToolbar, QToolbarTitle, QSpinner, QIcon
  },
  data () {
    return {
      jogos: [],
      tipo: this.$route.params.tipo,
      carregando: true
    }
  },
  watch: {
    '$route': function () {
      this.tipo = this.$route.params.tipo
      this.getJogos(this.tipo)
    }
  },
  mounted () {
    this.tipo = this.$route.params.tipo
    this.getJogos(this.tipo)
  },
  methods: {
    deletar (jogo, index) {
      let self = this
      Dialog.create({
        title: 'Excluir jogo',
        message: 'Você tem certeza que deseja excluir o jogo "' + jogo.nome + '" ?',
        buttons: [
          {
            label: 'Cancelar'
          },
          {
            label: 'Excluir',
            handler () {
              self.API.delete('/deletaJogo/' + jogo.id)
                .then((response) => {
                  Toast.create.positive('Jogo excluido com sucesso!')
                  self.jogos.splice(index, 1)
                })
                .catch(() => {
                  Toast.create.negative('Erro ao excluir jogo')
                })
            }
          }
        ]
      })
    },
    criaJogo () {
      let self = this
      let titulo
      let tipo
      if (this.tipo === 'semanais') {
        titulo = 'Jogo semanal'
        tipo = 0
      }
      else {
        titulo = 'Jogo mensal'
        tipo = 1
      }
      Dialog.create({
        title: titulo,
        message: 'Digite o nome:',
        form: {
          nome: {
            type: 'text',
            label: 'Nome do Jogo',
            model: ''
          },
          qt_numeros: {
            type: 'number',
            label: 'Quantidade de números',
            model: 10
          }
        },
        buttons: [
          {
            label: 'Cancelar'
          },
          {
            label: 'Criar',
            color: 'positive',
            handler (data) {
              self.API.post('/criarJogo', {tipo: tipo, nome: data.nome, qt_numeros: data.qt_numeros})
                .then((response) => {
                  Toast.create.positive('Jogo criado com sucesso!')
                  self.jogos.unshift(response.data.data)
                })
                .catch((error) => {
                  if (error.response.status === 422) {
                    Toast.create(error.response.data.errors.message[0])
                  }
                  else {
                    Toast.create.negative('Falha ao criar jogo')
                  }
                })
            }
          }
        ]
      })
    },
    desloga () {
      this.$store.commit('desloga')
    },
    getColor (id) {
      return (id % 2 === 0) ? 'primary' : 'secondary'
    },
    redireciona (id) {
      this.$router.push('/jogo/' + id)
    },
    getJogos (tipo) {
      let num
      if (tipo === 'semanais') {
        num = 0
      }
      else {
        num = 1
      }

      this.carregando = true
      this.API.get('/jogos/' + num).then((response) => {
        this.jogos = response.data.data
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
  }
}
</script>

<style scoped>
  .titulo {
    text-align: center;
    margin-bottom: 10px;
  }

  .contente {
    margin: 0px 10px;
  }

  .boxJogo {
    margin-bottom: 10px;
  }
</style>
