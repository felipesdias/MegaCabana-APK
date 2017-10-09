<template>
  <div>
    <q-toolbar color="black" class="titulo"> 
      <q-toolbar-title>
        Jogos {{tipo}}
      </q-toolbar-title>
    </q-toolbar>

    <div class="row justify-center">
      <q-spinner :size="50" color="blue" v-if="carregando" />
    </div>

    <div class="contente column">
      <q-btn 
        v-for="(item, index) in jogos" 
        class="boxJogo" 
        push 
        @click="redireciona (item.id)"
        :color="getColor (index)" 
        :key="item.id"
      >
        {{item.nome}}
      </q-btn>
    </div>
  </div>
</template>

<script>
import { Toast, QBtn, QToolbar, QToolbarTitle, QSpinner } from 'quasar'

export default {
  components: {
    QBtn, QToolbar, QToolbarTitle, QSpinner
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
    getColor (id) {
      return (id % 2 === 0) ? 'primary' : 'secondary'
    },
    redireciona (id) {
      return setTimeout(() => {
        this.$router.push('/jogo/' + id)
      }, 250)
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
    padding: 15px 0px;
    margin-bottom: 10px;
  }
</style>
