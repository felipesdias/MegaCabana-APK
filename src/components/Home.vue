<template>
  <div>
    <q-toolbar color="black" class="titulo"> 
      <q-toolbar-title>
        Cervejeiros da Cabana
      </q-toolbar-title>
      <q-btn class="on-right" @click.prevent="desloga" v-show="$store.state.ADM" icon="exit_to_app"></q-btn>
      <q-btn @click.prevent="login" v-show="!$store.state.ADM" icon="account_circle"></q-btn>
    </q-toolbar>

    <div class="column">
      <q-btn @click.prevent="redireciona('semanais')" class="botao" color="primary" push>
        Jogos Semanais
      </q-btn>
      <q-btn @click.prevent="redireciona('mensais')" class="botao" color="secondary" push>
        Jogos Mensais
      </q-btn>
    </div>
  </div>
</template>

<script>
import { QBtn, QToolbar, QToolbarTitle, Dialog, Toast, QIcon, LocalStorage } from 'quasar'

export default {
  components: {
    QBtn, QToolbar, QToolbarTitle, QIcon
  },
  data () {
    return {
    }
  },
  methods: {
    redireciona (tipo) {
      this.$router.push('/jogos/' + tipo)
    },
    desloga () {
      this.$store.commit('desloga')
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
  
  .botao {
    margin: 10px;
  }

  .fundo {
    background-image: url('~assets/background.png'); 
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
</style>
