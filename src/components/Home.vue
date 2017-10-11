<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div>
    <q-toolbar color="black" class="titulo"> 
      <q-toolbar-title>
        Amigos da Cabana
      </q-toolbar-title>
      <q-icon @click="desloga" v-show="$store.state.ADM" name="exit_to_app"></q-icon>
      <q-icon @click="login" v-show="!$store.state.ADM" name="account_circle"></q-icon>
      
    </q-toolbar>
    <div class="column">
      <q-btn @click="redireciona('semanais')" class="botao" color="primary" push>
        Jogos Semanais
      </q-btn>
      <q-btn @click="redireciona('mensais')" class="botao" color="secondary" push>
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
      return setTimeout(() => {
        this.$router.push('/jogos/' + tipo)
      }, 175)
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
