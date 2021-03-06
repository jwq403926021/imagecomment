/*
 * Image Comment Web Tool
 * Author : Carl
 * Dependence : jquery , jcanvas , canvas2image
 *
 * Please feel free contribute your code here.
 * */

function ImageComment(options){
    this.default={
        canvasWrapper:"canvasWrapper",
        loadImageInput:"libtn",
        confirmbtn:"confirmbtn",
        circleBtn:"ucbtn",
        rectBtn:"urbtn",
        textBtn:"utbtn",
        clearCanvasBtn:"ccbtn",
        exportBtn:"eibtn"
    };
    this.options=$.extend({},this.default,options);

    this.mainCanvas=null;
    this.selectedLayer=null;
};

ImageComment.prototype={
    exportImage:function(){
        Canvas2Image.saveAsJPEG($(this.mainCanvas)[0]);
    },
    clearCanvas:function() {
        if(this.selectedLayer){
            $(this.mainCanvas).removeLayer(this.selectedLayer).drawLayers();
        }else{
            $(this.mainCanvas).removeLayers().drawLayers();
        }
        this.selectedLayer=null;
    },
    switchActive:function(name){
        var _this=this;
        $(this.mainCanvas).getLayers(function(layer) {
            var option={};
            var _colorAttr="";

            if(layer.type=="text"){
                _colorAttr="fillStyle";
            }else{
                _colorAttr="strokeStyle";
            }

            if(layer.name==name){
                option[_colorAttr]="#9e9e9e";
                $(_this.mainCanvas).setLayer(layer.name, option).drawLayers();
            }else{
                option[_colorAttr]="#da0000";
                $(_this.mainCanvas).setLayer(layer.name, option).drawLayers();
            }
        });
    },
    loadImage:function(e){
        var _this=this;
        this.clearCanvas();

        var a=document.createElement("img");
        a.src=$('#'+this.options.loadImageInput).val();

        a.onload=function(){
            if(_this.mainCanvas){
                _this.mainCanvas.remove();
            }
            _this.mainCanvas = document.createElement("canvas");
            _this.mainCanvas.setAttribute("width", this.width);
            _this.mainCanvas.setAttribute("height", this.height);
            document.getElementById(_this.options.canvasWrapper).appendChild(_this.mainCanvas);

            $(_this.mainCanvas).drawImage({
                layer:true,
                fromCenter: false,
                source: a,
                x: 0, y: 0
            });
        }
    },
    useRectangle:function(){
        var _this=this;
        $(this.mainCanvas).on("mousedown",function(ev){
            var _downX=ev.offsetX+4;
            var _downY=ev.offsetY+4;
            var _name=new Date().getTime()+"_rect";

            $(this).addLayer({
                name:_name,
                type: 'rectangle',
                strokeStyle: '#da0000',
                strokeWidth: 4,
                x: _downX, y: _downY,
                width: 0, height: 0,
                click:function(layer){
                    _this.selectedLayer=layer.name;
                    _this.switchActive(layer.name);
                }
            });

            $(this).on("mousemove",function(ev){
                _this._move(ev,_downX,_downY,_name);
            })
        })

        $(_this.mainCanvas).on("mouseup",function(ev){
            $(this).off("mousedown mousemove mouseup");
            _this.selectedLayer=null;
        })
    },
    useCircle:function(){
        var _this=this;
        $(this.mainCanvas).on("mousedown",function(ev){
            var _downX=ev.offsetX+4;
            var _downY=ev.offsetY+4;
            var _name=new Date().getTime()+"_circle";

            $(this).addLayer({
                name:_name,
                type: 'ellipse',
                strokeStyle: '#da0000',
                strokeWidth: 4,
                x: _downX, y: _downY,
                width: 0, height: 0,
                click:function(layer){
                    _this.selectedLayer=layer.name;
                    _this.switchActive(layer.name);
                }
            });

            $(this).on("mousemove",function(ev){
                _this._move(ev,_downX,_downY,_name);
            })
        })

        $(_this.mainCanvas).on("mouseup",function(ev){
            $(this).off("mousedown mousemove mouseup");
            _this.selectedLayer=null;
        })
    },
    useText:function(){
        var _this=this;
        var _tempRect,_finalWidth,_finalX,_finalY;

        $(this.mainCanvas).on("mousedown",function(ev){
            var _downX=_finalX=ev.offsetX+2;
            var _downY=_finalY=ev.offsetY+2;
            var _name=_tempRect=new Date().getTime()+"_tempRect";

            $(this).addLayer({
                name:_name,
                type: 'rectangle',
                strokeStyle: '#da0000',
                strokeWidth: 1,
                x: _downX, y: _downY,
                width: 0, height: 0
            });

            $(this).on("mousemove",function(ev){
                var temp=_this._move(ev,_downX,_downY,_name);
                _finalWidth=temp.width;
            })
        })

        $(_this.mainCanvas).on("mouseup",function(ev){
            _this._createOverlay(_finalX,_finalY,_finalWidth);
            $(this).off("mousedown mousemove mouseup");
            $(this).removeLayer(_tempRect);
            _this.selectedLayer=null;
        })
    },
    _drawText:function(_finalX,_finalY,_finalWidth,text){
        var _this=this;
        $(".overlayWrap").remove();

        $(_this.mainCanvas).addLayer({
            name:new Date().getTime()+"_text",
            type: 'text',
            fillStyle: '#36c',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, sans-serif',
            text: text,
            draggable: true,
            x: _finalX,
            y: _finalY,
            align:"left",
            fromCenter: false,
            maxWidth:_finalWidth,
            click:function(layer){
                _this.selectedLayer=layer.name;
                _this.switchActive(layer.name);
            }
        }).drawLayers();
    },
    _createOverlay:function(_finalX,_finalY,_finalWidth){
        var _this=this;
        var _htmlStr='<div class="overlayWrap">'+
            '<p style="margin: 5px 0 10px 0;">Please input the comment:</p>'+
            '<div>'+
            '<textarea></textarea>'+
            '</div>'+
            '<button>Submit</button>'+
            '</div>';
        document.body.appendChild($(_htmlStr)[0]);
        console.log($(_htmlStr)[0]);
        $(".overlayWrap button").on('click',function(){
            _this._drawText(_finalX,_finalY,_finalWidth,$(".overlayWrap textarea").val());
        });
    },
    _move:function(event,x,y,_name){
        var currentWidth=event.offsetX-x-3;
        var currentHeight=event.offsetY-y-3;

        var currentX=x+currentWidth/2;
        var currentY=y+currentHeight/2;

        $(this.mainCanvas).setLayer(_name, {
            x:currentX , y: currentY,
            width: currentWidth, height: currentHeight
        }).drawLayers();

        return {x:currentX , y: currentY,width: currentWidth, height: currentHeight};
    },
    _init:function(){
        var _this=this;
        $('#'+this.options.confirmbtn).on("click",function(event){
            _this.loadImage();
        });
        $('#'+this.options.circleBtn).on("click",function(){
            _this.useCircle()
        });
        $('#'+this.options.rectBtn).on("click",function(){
            _this.useRectangle()
        });
        $('#'+this.options.textBtn).on("click",function(){
            _this.useText()
        });
        $('#'+this.options.clearCanvasBtn).on("click",function(){
            _this.clearCanvas()
        });
        $('#'+this.options.exportBtn).on("click",function(){
            _this.exportImage()
        });
    }
};