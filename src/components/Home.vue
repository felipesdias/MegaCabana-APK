<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div>
    <q-toolbar color="black" class="titulo"> 
      <q-toolbar-title>
        Amigos da Cabana
      </q-toolbar-title>
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
import { QBtn, QToolbar, QToolbarTitle } from 'quasar'

export default {
  components: {
    QBtn, QToolbar, QToolbarTitle
  },
  data () {
    return {
    }
  },
  methods: {
    redireciona (tipo) {
      return setTimeout(() => {
        this.$router.push('/jogos/' + tipo)
      }, 250)
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
