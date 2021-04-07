<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <Editor :data="sampleData" />
  </div>
</template>

<script>
import Editor from './components/Editor.vue'

export default {
  name: 'App',
  components: {
    Editor
  },
  data: function() {
    return {
      sampleData:  {
        "url": "https://audio.cursor72.ru/media/test/one.mp3",
        "positiveAnswer": {
          "url": "https://audio.cursor72.ru/media/test/one_yes.mp3",
          "positiveAnswer": {
            "url": "https://audio.cursor72.ru/media/test/two_yes.mp3",
            "positiveAnswer": null,
            "negativeAnswer": null,
            "noAnswer": null,
            "secToEnd":0
          },
          "negativeAnswer":{
            "url": "https://audio.cursor72.ru/media/test/two_no.mp3",
            "positiveAnswer": null,
            "negativeAnswer": null,
            "noAnswer": null,
            "secToEnd":0
          },
          "noAnswer":{
            "url": "https://audio.cursor72.ru/media/test/two_no.mp3",
            "positiveAnswer": null,
            "negativeAnswer": null,
            "noAnswer": null,
            "secToEnd":0
          },
          "secToEnd":0
        },
        "negativeAnswer":{
          "url": "https://audio.cursor72.ru/media/test/one_no.mp3",
          "positiveAnswer": null,
          "negativeAnswer": null,
          "noAnswer": null,
          "secToEnd":0
        },
        "noAnswer":{
          "url": "https://audio.cursor72.ru/media/test/one_stop.mp3",
          "positiveAnswer": null,
          "negativeAnswer": null,
          "noAnswer": null,
          "secToEnd":0
        },
        "secToEnd":20
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
