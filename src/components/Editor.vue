<template>
  <div data-demo-id="draggableConnectors">


        <div class="jtk-demo-main">
            <!-- demo -->
            <div class="jtk-demo-canvas canvas-wide drag-drop-demo jtk-surface jtk-surface-nopan" id="canvas">
                <div class="window" id="dragDropWindow1">
                    one
                    <br/>
                    <br/>
                    <a href="#" class="cmdLink hide" rel="dragDropWindow1">toggle connections</a>
                    <br/>
                    <a href="#" class="cmdLink drag" rel="dragDropWindow1">disable dragging</a>
                    <br/>
                    <a href="#" class="cmdLink detach" rel="dragDropWindow1">detach all</a>
                    <br/>
                    <div id="dragDropWindow1Yes">Да</div>
                    <br/>
                    <div id="dragDropWindow1No">Нет</div>
                    
                </div>
                <div class="window" id="dragDropWindow2">
                    two
                    <input type="text" value="two"/>

                    <div id="dragDropWindow2Yes">Да</div>
                    <br/>
                    <div id="dragDropWindow2No">Нет</div>
                </div>


                <div v-for="item in items" :key="item.uid" class="window" :id="item.uid">
                    
                    <input type="text" v-model="item.url"/>

                    <div :id="item.uid + 'Yes'">Да</div>
                    <br/>
                    <div :id="item.uid + 'No'">Нет</div>
                </div>




                <div id="list"></div>
            </div>
			<!-- /demo -->
        </div>


        <!-- JS -->
        <!-- <script src="../../dist/js/jsplumb.js"></script> -->
        <!-- /JS -->

		<!--  demo code -->
		<!-- <script src="demo.js"></script> -->

    </div>
</template>

<script>
import { jsPlumb , jsPlumbUtil }  from 'jsplumb'

export default {
  name: 'Editor',
  props: {
    data: Object
  },
  data: function() {
    return {
        instance: null,
        items:[],
        itemEmpty:{
            uid: null,
            url: '',
            positiveAnswer: null,
            negativeAnswer: null,
            noAnswer: null,
            secToEnd: null
        },
        dropOptions: {
            tolerance: "touch",
            hoverClass: "dropHover",
            activeClass: "dragActive"
        },
        sourceColor:"#00f",
        sourceEndpoint: {
            endpoint: "Rectangle",
            paintStyle: { width: 25, height: 21, fill: this.sourceColor },
            isSource: true,
            reattach: true,
            scope: "blue",
            connectorStyle: {
                gradient: {stops: [
                    [0, this.sourceColor],
                    [0.5, "#09098e"],
                    [1, this.sourceColor]
                ]},
                strokeWidth: 5,
                stroke: this.sourceColor,
                dashstyle: "2 2"
            },
            beforeDrop: function (params) {
                return confirm("Connect " + params.sourceId + " to " + params.targetId + "?");
            },
            dropOptions: this.dropOptions
        },
        
    }
  },
  created: function(){

      this.createItem(this.data)

      console.log(this.items)

    var listDiv = document.getElementById("list"),

        showConnectionInfo = function (s) {
            listDiv.innerHTML = s;
            listDiv.style.display = "block";
        },
        hideConnectionInfo = function () {
            listDiv.style.display = "none";
        },
        connections = [],
        updateConnections = function (conn, remove) {
            if (!remove) connections.push(conn);
            else {
                var idx = -1;
                for (var i = 0; i < connections.length; i++) {
                    if (connections[i] == conn) {
                        idx = i;
                        break;
                    }
                }
                if (idx != -1) connections.splice(idx, 1);
            }
            if (connections.length > 0) {
                var s = "<span><strong>Connections</strong></span><br/><br/><table><tr><th>Scope</th><th>Source</th><th>Target</th></tr>";
                for (var j = 0; j < connections.length; j++) {
                    s = s + "<tr><td>" + connections[j].scope + "</td>" + "<td>" + connections[j].sourceId + "</td><td>" + connections[j].targetId + "</td></tr>";
                }
                showConnectionInfo(s);
            } else
                hideConnectionInfo();
        };
    
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
                [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
            ],
            Container: "canvas"
        });

        self.instance = instance
        self.qwe = instance

        // suspend drawing and initialise.
        self.instance.batch(function () {

            // bind to connection/connectionDetached events, and update the list of connections on screen.
            instance.bind("connection", function (info, originalEvent) {
                console.log(originalEvent)
                updateConnections(info.connection);
            });
            instance.bind("connectionDetached", function (info, originalEvent) {
                console.log(originalEvent)
                updateConnections(info.connection, true);
            });

            instance.bind("connectionMoved", function (info, originalEvent) {
                console.log(originalEvent)
                //  only remove here, because a 'connection' event is also fired.
                // in a future release of jsplumb this extra connection event will not
                // be fired.
                updateConnections(info.connection, true);
            });

            instance.bind("click", function (component, originalEvent) {
                console.log(originalEvent)
                alert("click!")
            });

            // configure some drop options for use by all endpoints.
            // var exampleDropOptions = {
            //     tolerance: "touch",
            //     hoverClass: "dropHover",
            //     activeClass: "dragActive"
            // };

            //
            // first example endpoint.  it's a 25x21 rectangle (the size is provided in the 'style' arg to the Endpoint),
            // and it's both a source and target.  the 'scope' of this Endpoint is 'exampleConnection', meaning any connection
            // starting from this Endpoint is of type 'exampleConnection' and can only be dropped on an Endpoint target
            // that declares 'rectangleEndpoint' as its drop scope, and also that
            // only 'exampleConnection' types can be dropped here.
            //
            // the connection style for this endpoint is a Bezier curve (we didn't provide one, so we use the default), with a strokeWidth of
            // 5 pixels, and a gradient.
            //
            // there is a 'beforeDrop' interceptor on this endpoint which is used to allow the user to decide whether
            // or not to allow a particular connection to be established.
            //
            
            
            // var exampleColor = "#00f";
            // var rectangleEndpoint = {
            //     endpoint: "Rectangle",
            //     paintStyle: { width: 25, height: 21, fill: exampleColor },
            //     isSource: true,
            //     reattach: true,
            //     scope: "blue",
            //     connectorStyle: {
            //         gradient: {stops: [
            //             [0, exampleColor],
            //             [0.5, "#09098e"],
            //             [1, exampleColor]
            //         ]},
            //         strokeWidth: 5,
            //         stroke: exampleColor,
            //         dashstyle: "2 2"
            //     },
            //     beforeDrop: function (params) {
            //         return confirm("Connect " + params.sourceId + " to " + params.targetId + "?");
            //     },
            //     dropOptions: this.dropOptions
            // };


            //
            // the second example uses a Dot of radius 15 as the endpoint marker, is both a source and target,
            // and has scope 'exampleConnection2'.
            //
            
            var color2 = "#316b31";
            var targetEndpoint = {
                endpoint: "Rectangle",
                paintStyle: { fill: color2 },
                scope: "blue",
                connectorStyle: { stroke: color2, strokeWidth: 6 },
                connector: ["Bezier", { curviness: 63 } ],
                maxConnections: 3,
                isTarget: true,
                dropOptions: self.dropOptions
            };

            

            // setup some DynamicAnchors for use with the blue endpoints
            // and a function to set as the maxConnections callback.
            // var anchors = [
            //         [1, 0.2, 1, 0],
            //         [0.8, 1, 0, 1],
            //         [0, 0.8, -1, 0],
            //         [0.2, 0, 0, -1]
            //     ],
            // var    maxConnectionsCallback = function (info) {
            //         alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
            //     };

            // var e1 = instance.addEndpoint("dragDropWindow1Yes", { anchor: [1, 0.2, 1, 0] }, self.sourceEndpoint);
            // // you can bind for a maxConnections callback using a standard bind call, but you can also supply 'onMaxConnections' in an Endpoint definition - see exampleEndpoint3 above.
            // e1.bind("maxConnections", maxConnectionsCallback);

            // e1 = instance.addEndpoint("dragDropWindow1No", { anchor: [1, 0.2, 1, 0] }, self.sourceEndpoint);
            // // you can bind for a maxConnections callback using a standard bind call, but you can also supply 'onMaxConnections' in an Endpoint definition - see exampleEndpoint3 above.
            // e1.bind("maxConnections", maxConnectionsCallback);

            var e2 = instance.addEndpoint('dragDropWindow2', { anchor: [0, 0.8, -1, 0] }, targetEndpoint);
            // again we bind manually. it's starting to get tedious.  but now that i've done one of the blue endpoints this way, i have to do them all...
            e2.bind("maxConnections", self.maxConnectionsCallback);
            // instance.addEndpoint('dragDropWindow2', { anchor: "RightMiddle" }, exampleEndpoint2);

            


            // make .window divs draggable
            instance.draggable(jsPlumb.getSelector(".drag-drop-demo .window"));

            // add endpoint of type 3 using a selector.
            // instance.addEndpoint(jsPlumb.getSelector(".drag-drop-demo .window"), exampleEndpoint3);

            var hideLinks = jsPlumb.getSelector(".drag-drop-demo .hide");
            instance.on(hideLinks, "click", function (e) {
                instance.toggleVisible(this.getAttribute("rel"));
                jsPlumbUtil.consume(e);
            });

            var dragLinks = jsPlumb.getSelector(".drag-drop-demo .drag");
            instance.on(dragLinks, "click", function (e) {
                var s = instance.toggleDraggable(this.getAttribute("rel"));
                this.innerHTML = (s ? 'disable dragging' : 'enable dragging');
                jsPlumbUtil.consume(e);
            });

            var detachLinks = jsPlumb.getSelector(".drag-drop-demo .detach");
            instance.on(detachLinks, "click", function (e) {
                instance.deleteConnectionsForElement(this.getAttribute("rel"));
                jsPlumbUtil.consume(e);
            });

            instance.on(document.getElementById("clear"), "click", function (e) {
                instance.detachEveryConnection();
                showConnectionInfo("");
                jsPlumbUtil.consume(e);
            });
        });
        console.log(0)
        self.$nextTick(function () {
            self.createEndpoints()
        })
    });
    console.log(1)
  },
    updated: function() {
        console.log(3)
        this.createEndpoints()
    },
    // mounted: function() {
    //     console.log(2)
    //     this.createEndpoints()
    // },
    methods: {
        createItem(object){
            const uid = object.uid ?? this.generateUID()
            this.items.push({
                uid: uid,
                url: object.url,
                positiveAnswer: object.positiveAnswer ? this.createItem(object.positiveAnswer) : null,
                negativeAnswer: object.negativeAnswer ? this.createItem(object.negativeAnswer) : null,
                noAnswer: object.noAnswer ? this.createItem(object.noAnswer) : null,
                secToEnd: object.secToEnd
            })
            return uid
        },
        createEndpoints(){
            const self = this
            this.items.forEach(function(item) {
                console.log(item)
                console.log(item.uid + "Yes")
                let eYes = self.instance.addEndpoint(item.uid + "Yes", { anchor: [1, 0.2, 1, 0] }, self.sourceEndpoint);
                console.log(eYes)
                eYes.bind("maxConnections", self.maxConnectionsCallback);
                let eNo = self.instance.addEndpoint(item.uid + "No", { anchor: [1, 0.2, 1, 0] }, self.sourceEndpoint);
                eNo.bind("maxConnections", self.maxConnectionsCallback);
            });
        },
        maxConnectionsCallback (info) {
            alert("Cannot drop connection " + info.connection.id + " : maxConnections has been reached on Endpoint " + info.endpoint.id);
        },

            // var e1 = instance.addEndpoint("dragDropWindow1Yes", { anchor: [1, 0.2, 1, 0] }, self.sourceEndpoint);
            // // you can bind for a maxConnections callback using a standard bind call, but you can also supply 'onMaxConnections' in an Endpoint definition - see exampleEndpoint3 above.
            // e1.bind("maxConnections", maxConnectionsCallback);

            // e1 = instance.addEndpoint("dragDropWindow1No", { anchor: [1, 0.2, 1, 0] }, self.sourceEndpoint);
            // // you can bind for a maxConnections callback using a standard bind call, but you can also supply 'onMaxConnections' in an Endpoint definition - see exampleEndpoint3 above.
            // e1.bind("maxConnections", maxConnectionsCallback);


    //   itemEmpty:{
    //         uid: null,
    //         url: '',
    //         positiveAnswer: null,
    //         negativeAnswer: null,
    //         noAnswer: null,
    //         secToEnd: null
    //     },

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
.drag-drop-demo .window {
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


.drag-drop-demo a, .drag-drop-demo a:visited {
    color:#057D9F;
}

.drag-drop-demo a:hover {
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
