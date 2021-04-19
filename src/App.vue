<template>
  <div id="app">
    <Editor 
    :data="sampleData"
    :files="getFiles()"
    @save="save($event)"
    />
  </div>
</template>

<script>
import Editor from './components/Editor.vue'

// const path = '/media/'
// const quest = 'test/'

export default {
  name: 'App',
  components: {
    Editor
  },
  created: function(){
    // const data_samples = document.getElementsByTagName('body')[0].getAttribute('data-samples')
    // const data_json = document.getElementsByTagName('body')[0].getAttribute('data-json')
    // console.log(data_json)
    // if (data_json) {
    //   this.sampleData = JSON.parse(data_json)
    // }
  },
  data: function() {
    return {
      files:["one.mp3","one_no.mp3","one_stop.mp3","one_yes.mp3","quest.json","two_no.mp3","two_yes.mp3"],
      sampleData:  {
        version: 1,
        data: [
          {
              "uid":"f28f1573-63b5-48f4-960f-1c9aee4ed3ea",
              "url":"/media/test/two_yes.mp3",
              "positiveAnswer":null,
              "negativeAnswer":null,
              "noAnswer":null,
              "secToEnd":0
          },
          {
              "uid":"627edae8-7ea0-44c9-8cd5-76118c85b9a8",
              "url":"/media/test/two_no.mp3",
              "positiveAnswer":null,
              "negativeAnswer":null,
              "noAnswer":null,
              "secToEnd":0
          },
          {
              "uid":"685e7feb-ca8b-4a87-9379-2a13a28e251a",
              "url":"/media/test/two_no.mp3",
              "positiveAnswer":null,
              "negativeAnswer":null,
              "noAnswer":null,
              "secToEnd":0
          },
          {
              "uid":"e8637c75-9a51-4621-b9ed-138b883943a5",
              "url":"/media/test/one_yes.mp3",
              "positiveAnswer":"f28f1573-63b5-48f4-960f-1c9aee4ed3ea",
              "negativeAnswer":"627edae8-7ea0-44c9-8cd5-76118c85b9a8",
              "noAnswer":"685e7feb-ca8b-4a87-9379-2a13a28e251a",
              "secToEnd":0
          },
          {
              "uid":"809b070c-b5fa-4c4e-8cb1-9ced719b0b6d",
              "url":"/media/test/one_no.mp3",
              "positiveAnswer":null,
              "negativeAnswer":null,
              "noAnswer":null,
              "secToEnd":0
          },
          {
              "uid":"c3234ab1-8997-4a7e-8740-7022b3b447e3",
              "url":"/media/test/one_stop.mp3",
              "positiveAnswer":null,
              "negativeAnswer":null,
              "noAnswer":null,
              "secToEnd":0
          },
          {
              "uid":"5c3ee3ad-fe6f-41ae-a009-0d358e8689b7",
              "url":"/media/test/one.mp3",
              "positiveAnswer":"e8637c75-9a51-4621-b9ed-138b883943a5",
              "negativeAnswer":"809b070c-b5fa-4c4e-8cb1-9ced719b0b6d",
              "noAnswer":"c3234ab1-8997-4a7e-8740-7022b3b447e3",
              "secToEnd":20
          }
        ]
      },
      fileFormats:['mp3',]
    }
  },
  methods: {
    getFiles(){
      return this.filterFiles()
    },
    filterFiles(){
      let self = this
      return this.files.filter(function(filename) {
        const _filename = filename.split('.')
        return self.fileFormats.indexOf(_filename[_filename.length - 1]) != -1;
      })
    },
    save(data){
      console.log('save')
      console.log(data)
      this.saveData(data, 'sample.json')
    },
    saveData(data, fileName) {
      var a = document.createElement("a")
      document.body.appendChild(a)
      a.style = "display: none"
      var json = JSON.stringify(data),
          blob = new Blob([json], {type: "octet/stream"}),
          url = window.URL.createObjectURL(blob)
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
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
}
</style>
