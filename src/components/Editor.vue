<template>
    <div class="main">
        <div class="panel">
            <button v-on:click="save()">Сохранить</button>
        </div>
        <div class="editor" id="canvas">
            <div v-for="item in items" :key="item.uid" class="window" :id="item.uid">
                <input type="text" v-model="item.url"/>
                <br/>
                <div :id="item.uid + 'Yes'">Да</div>
                <br/>
                <div :id="item.uid + 'No'">Нет</div>
                <br/>
                <div :id="item.uid + 'Empty'">Нет ответа</div>
            </div>

            <div id="list"></div>
        </div>
    </div>
</template>

<script>
import { jsPlumb , jsPlumbUtil }  from 'jsplumb'

const SUFFIX_YES = "Yes"
const SUFFIX_NO = "No"
const SUFFIX_EMPTY = "Empty" // No answer

export default {
  name: 'Editor',
  props: {
    data: Object,
    files: Array,
  },
  data: function() {
    const sourceColor = "#00f"
    const targetColor = "#316b31"
    return {
        instance: null,
        items:[],
        itemEmpty:{
            uid: null,
            url: '',
            positiveAnswer: null,
            negativeAnswer: null,
            noAnswer: null,
            secToEnd: null,
            meta:{
                position: {
                    x: 0,
                    y: 0
                }
            }
        },
        dropOptions: {
            tolerance: "touch",
            hoverClass: "dropHover",
            activeClass: "dragActive"
        },
        sourceEndpoint: {
            endpoint: "Rectangle",
            paintStyle: { width: 25, height: 21, fill: sourceColor },
            isSource: true,
            reattach: true,
            scope: "blue",
            connectorStyle: {
                // gradient: {stops: [
                //     [0, sourceColor],
                //     [0.5, "#09098e"],
                //     [1, sourceColor]
                // ]},
                strokeWidth: 5,
                stroke: sourceColor,
                // dashstyle: "2 2"
            },
            beforeDrop: function (params) {
                return confirm("Connect " + params.sourceId + " to " + params.targetId + "?");
            },
            dropOptions: this.dropOptions
        },
        targetEndpoint:{
            endpoint: "Rectangle",
            paintStyle: { fill: targetColor },
            scope: "blue",
            connectorStyle: { stroke: targetColor, strokeWidth: 6 },
            connector: ["Bezier", { curviness: 63 } ],
            maxConnections: 3,
            isTarget: true,
            dropOptions: this.dropOptions
        }
        
    }
  },
  created: function(){

    this.createItems(this.data)
    this.createNewItems()
    const self = this
    jsPlumb.ready(function () {

        var instance = jsPlumb.getInstance({
            DragOptions: { cursor: 'pointer', zIndex: 2000 },
            PaintStyle: { stroke: '#666' },
            EndpointHoverStyle: { fill: "orange" },
            HoverPaintStyle: { stroke: "orange" },
            EndpointStyle: { width: 20, height: 16, stroke: '#666' },
            Endpoint: "Rectangle",
            Anchors: ["TopCenter", "TopCenter"],
            ConnectionOverlays: [
                [ "Arrow", {
                    location: 1,
                    id: "arrow",
                    length: 14,
                    foldback: 0.8
                } ],
                [ "Label", { label: "", id: "label", cssClass: "aLabel" }]
            ],
            Container: "canvas"
        });

        self.instance = instance

        // suspend drawing and initialise.
        self.instance.batch(function () {

            // bind to connection/connectionDetached events, and update the list of connections on screen.
            instance.bind("connection", function (info) {
                self.createConnection(info.connection);
            });
            instance.bind("connectionDetached", function (info, originalEvent) {
                console.log(info, originalEvent)
                //updateConnections(info.connection, true);
            });

            instance.bind("connectionMoved", function (info, originalEvent) {
                console.log(info, originalEvent)
                //  only remove here, because a 'connection' event is also fired.
                // in a future release of jsplumb this extra connection event will not
                // be fired.
                //updateConnections(info.connection, true);
            });

            instance.bind("click", function (component, originalEvent) {
                console.log(component, originalEvent)
                alert("click!")
            });

            // make .window divs draggable
            instance.draggable(jsPlumb.getSelector(".editor .window"));

            instance.on(document.getElementById("clear"), "click", function (e) {
                instance.detachEveryConnection();
                // showConnectionInfo("");
                jsPlumbUtil.consume(e);
            });
        });

        self.$nextTick(function () {
            self.createEndpoints()
            self.initConnections()
        })
    });
  },
    methods: {
        getSourceEndpointWithColor(color){
            let sourceEndpoint = JSON.parse(JSON.stringify(this.sourceEndpoint)) //TODO: lodash?
            sourceEndpoint.connectorStyle.stroke = color
            return sourceEndpoint
        },
        createItems(object){
            if (object) {
                if ('data' in object) {
                    this.items = object.data
                }
            }
        },
        createNewItems() {
            console.log(this.files)
            for (let i = 0; i < this.files.length; i++) {
                let exist = false
                for (let j = 0; j < this.items.length; j++) {
                    const _url = this.items[j].url.split('/')
                    const fname = _url[_url.length - 1]
                    if (this.files[i] == fname) {
                        exist = true
                        break
                    }
                }
                if (!exist) {
                    this.items.push({
                        uid: this.generateUID(),
                        url: this.files[i],
                        positiveAnswer: null,
                        negativeAnswer: null,
                        noAnswer: null,
                        secToEnd: 0
                    })
                }
            }
        },
        _getSourceSampleUid(info){
            let index = info.sourceId.indexOf(SUFFIX_YES)
            if (index > -1) {
                return {id: info.sourceId.slice(0, index), key: 'positiveAnswer'}
            }
            index = info.sourceId.indexOf(SUFFIX_NO)
            if (index > -1) {
                return {id: info.sourceId.slice(0, index), key: 'negativeAnswer'}
            }
            index = info.sourceId.indexOf(SUFFIX_EMPTY)
            if (index > -1) {
                return {id: info.sourceId.slice(0, index), key: 'noAnswer'}
            }
        },
        initConnections(){
            this.items.forEach((item) => {
                if (item.positiveAnswer) {
                    const target = this.gitItemByUid(item.positiveAnswer)
                    this.instance.connect({ 
                        source:item.positiveAnswerEndpoint, 
                        target: target.targetEndpoint ,
                        endpoint:"Rectangle",
                    });
                }
                if (item.negativeAnswer) {
                    const target = this.gitItemByUid(item.negativeAnswer)
                    this.instance.connect({ 
                        source:item.negativeAnswerEndpoint, 
                        target: target.targetEndpoint ,
                        endpoint:"Rectangle",
                    });
                }
                if (item.noAnswer) {
                    const target = this.gitItemByUid(item.noAnswer)
                    this.instance.connect({ 
                        source:item.noAnswerEndpoint, 
                        target: target.targetEndpoint ,
                        endpoint:"Rectangle",
                    });
                }
            });
            
        },


        gitItemByUid(uid){
            var result = null;
            this.items.forEach((item) => {
                if (item.uid == uid) {
                   result = item
                }
            });
            return result
        },

        createConnection(info){
            const srcData = this._getSourceSampleUid(info)
            
            this.items.forEach(function(item) {
                if (srcData.id == item.uid) {
                    item[srcData.key] = info.targetId
                    return
                }
            });
        },
        createEndpoints(){
            const self = this
            this.items.forEach(function(item) {
                item.positiveAnswerEndpoint =  self.instance.addEndpoint(item.uid + SUFFIX_YES, { anchor: [1, 0.2, 1, 0] }, self.getSourceEndpointWithColor('green'));
                item.positiveAnswerEndpoint.bind("maxConnections", self.maxConnectionsCallback);
                
                item.negativeAnswerEndpoint = self.instance.addEndpoint(item.uid + SUFFIX_NO, { anchor: [1, 0.2, 1, 0] }, self.getSourceEndpointWithColor('red'));
                item.negativeAnswerEndpoint.bind("maxConnections", self.maxConnectionsCallback);

                item.noAnswerEndpoint = self.instance.addEndpoint(item.uid + SUFFIX_EMPTY, { anchor: [1, 0.2, 1, 0] }, self.getSourceEndpointWithColor('orange'));
                item.noAnswerEndpoint.bind("maxConnections", self.maxConnectionsCallback);

                item.targetEndpoint = self.instance.addEndpoint(item.uid, { anchor: [0, 0.8, -1, 0] }, self.targetEndpoint);
                item.targetEndpoint.bind("maxConnections", self.maxConnectionsCallback);
            });
        },
        maxConnectionsCallback (info) {
            alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
        },


        generateUID(){
            // http://www.ietf.org/rfc/rfc4122.txt
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;

        },
        save(){
            this.$emit('save', this.items)
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

 
.demo {
    /* for IE10+ touch devices */
    touch-action:none;
}

/** ELEMENT POSITIONS **/
#dragDropWindow1 { top:76px;left:100px; }
#dragDropWindow2 { top:148px; left:600px; }
#dragDropWindow3 { top:340px; left:100px; }
#dragDropWindow4 { top:416px; left:600px; }

/** ELEMENTS **/
.editor .window {
    font-family: serif;
    font-style: italic;
    background-color: white;
    border: 1px solid #346789;
    text-align: center;
    z-index: 24;
    cursor: pointer;
    box-shadow: 2px 2px 19px #aaa;
    -o-box-shadow: 2px 2px 19px #aaa;
    -webkit-box-shadow: 2px 2px 19px #aaa;
    -moz-box-shadow: 2px 2px 19px #aaa;
    -moz-border-radius: 0.5em;
    border-radius: 0.5em;
    position: absolute;
    color: black;
    padding-top: 5px;
    width: 140px;
    height: 120px;
    line-height: 12px;
    -webkit-transition: -webkit-box-shadow 0.15s ease-in;
    -moz-transition: -moz-box-shadow 0.15s ease-in;
    -o-transition: -o-box-shadow 0.15s ease-in;
    transition: box-shadow 0.15s ease-in;
}

.window:hover {
    border:1px solid #123456;
    box-shadow: 2px 2px 19px #444;
    -o-box-shadow: 2px 2px 19px #444;
    -webkit-box-shadow: 2px 2px 19px #444;
    -moz-box-shadow: 2px 2px 19px #fff;
    opacity:0.9;
}

.window input{
    width: 100%;
}


.editor a, .editor a:visited {
    color:#057D9F;
}

.editor a:hover {
    color:orange;
}

/** LINKS IN WINDOWS **/
.drag-locked { border:1px solid red; }
.cmdLink { font-size:0.80em;}

/** DRAG/DROP CLASSES **/
.dragActive { border:2px dotted orange; }
.dropHover { border:1px dotted red; }

/** INFO WINDOW **/
#list {
    text-align: center;
    display: none;
    font-size: 90%;
    position: absolute;
    width: 500px;
    left: 50%;
    margin-left: -250px;
    top: 100px;
    background-color: white;
    padding: 5px;
    border: 1px solid #456;
    opacity: 0.8;
    border-radius: 8px;
    color: #444;
}
#list table { width:100%;}
#list table th, #list strong { color:black; font-size:12px; text-align: center; }

path, .jtk-endpoint { cursor:pointer; }

</style>
