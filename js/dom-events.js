//for various requests that I dont want bound to the ember crud
var AjaxRequest = {
    req: function(searchTerms, urlString, timeOut){
        if (!timeOut) timeOut=1200000;
        var promise = $.Deferred();
        $.ajax(urlString, {
            type: 'POST',
            data: searchTerms,
            dataType: "JSON",
            timeout: timeOut,
            success: function(result){
                promise.resolve(result);
            },
            error: function(){
                var error = "Ajax Error";
                promise.reject(error);
            }
        });
        return promise;
    }   
}




function siteNoty(s, t, p, time, m, th){
   if (!time) time = 4000;
   if (!m) m = false;
   if (!th) th="defaultTheme"; 
   return noty({text: s, layout: p, type: t, theme: th, timeout: time, modal: m});
}

function getCanvasData(id, type){
   var elem = document.getElementById(id) ? document.getElementById(id) : document.getElementById('editedImage');
   var ctx = elem.getContext('2d') ? elem.getContext('2d') : null;
   if(!ctx) return false;
   var w = $('#'+id).attr("width"), h = $('#'+id).attr("height");
   ctx.getImageData(0,0,parseFloat(w),parseFloat(h));
   if (type == 'jpg') type = 'jpeg';
   return elem.toDataURL('image/'+type || 'image/png');
}

//This kinda works. SUPER FUNCTION? -> not needed anymore!
function refreshArr(model){
   console.log(model);
}


function pixastic(image, options){
   if (!options) options = null;
   var el = image.el ?  image.el : $('#editedImage');
   if (!el.attr('src')) return alert('No Image');
   var src = image.src ? image.src : $('#main_image_path').val();
   var type = image.type ? image.type.toLowerCase() : $('#main_image_type').val().toLowerCase();
   type = type.replace(".", "");
   var fn = image.fn ? image.fn.toString() : "";
   var id = el.attr('id');
   if (fn == "") return false;
   el.pixastic(fn, options);
   var canvasData = getCanvasData(id, type);
   image.canvasData = canvasData;
   if ($('canvas#'+id).length > 0) {
      var par = el.parent();
      $('canvas#'+id).remove();
      $('#editImage').attr('src', canvasData).parent().parent().append('<img src="'+canvasData+'" id="'+id+'" />');
   }
   return image;   
}

function getImgArgs(elem) {
   return {el: $('#editedImage'), src: $('#main_image_path').val(), type: $('#main_image_type').val(), fn: elem.data('func')};
}

function resetImage(currentImage) {
  if(currentImage){
    $('#editImage').attr('src', currentImage.imagepath ? currentImage.imagepath : $('#main_image_path').val());
    $('#editedImage').attr('src', currentImage.imagepath ? currentImage.imagepath : $('#main_image_path').val());
  }
}


function resetSliders(el){
   var fields = el.parent().parent().attr('id');
   $('#'+fields+' .bslider').each(function() {
      $(this).slider('setValue', $(this).data('slider-value'), true);
   });
}

function getImgOptions(el) {
   var options = {};
   var fields = el.parent().parent().attr('id');
   $('#'+fields+' input').each(function() {
      var t = $(this);
      options[""+t.data('param')+""] = t.val() ? t.val() : 0; 
   });
   return options;
}


function imageProcess(el){
   var image = getImgArgs(el);
   var options = getImgOptions(el);
   if (!options) options = {};
   var newEl = pixastic(image, options);
   if (newEl) {
      if (options != null) resetSliders(el);
   }
}


function cropDestroy() {
   $('.img-container img').cropper("disable");
   $('.commitCrop').addClass('disabled');
   if($('#btnCommitCrop').is(':visible')){
        $('#chooseMainImage').trigger('click');
    }
}

function enableCropper() {
   $('.img-container img').cropper("enable");
}

var crop_api = null;
function initCropper(params) {
   if (!params) params = null;
   var $image = $('.img-container img');
   var ratio, minW, minH, maxW, maxH, resize;
   if (params != null){
      var ratio = params.ratio ? params.ratio : "auto";
      var minW = parseInt(params.minW) ? parseInt(params.minW) : 0;
      var minH = parseInt(params.minH) ? parseInt(params.minH) : 0;
      var maxH = parseInt(params.maxH) ? parseInt(params.maxH) : "Infinity";
      var maxW = parseInt(params.maxW) ? parseInt(params.maxW) : "Infinity";
      var resize = params.resize ? params.resize : true;
   }
   $image.cropper({
      minWidth: minW,
      minHeight: minH,
      maxWidth: maxW,
      maxHeight: maxH,
      resizeable: resize,   
      aspectRatio : ratio,
      preview: ".img-preview",
      done: function(data){
         $r = data.width / data.height;
         if (crop_api) {
             if (crop_api.r != $r) {
               crop_api.r = $r
               previewAdj(crop_api);
             }          
         }
         crop_api = {x1: data.x1, x2: data.x2, y1: data.y1, y2: data.y2, h: data.height, w: data.width, r: $r};
         $('.commitCrop').removeClass('disabled');
      }
   });
   return true;
}

function previewAdj(crop_obj) {
   var curW = $('.img-preview').width(),
   curH = parseInt(curW / crop_obj.r);
   $('.img-preview').css({"height": curH+"px"});
}

function objectInArr(arr, object, param, sVal) {
   var i = null;
   $.each(arr, function(index, value){
      if (value[''+param+""] == sVal) {
        i = index;
      }
   });
   return i;
}

function toolBarEvents() {
   
}

function bindDOMEvents() {
   $('#chooseMainImage').trigger('click');
   // $('img.lazy').lazyload();
   $('.bslider').slider();
   
}

//DOM BINDING
$(function(){
   bindDOMEvents();
   $('.imageFunc').on('click', function(e){
      $('.killCrop').trigger('click');
      imageProcess($(this));
   });
   $('#crudLinks a').on('click', function(e) {
      var id = $(this).parent().parent().attr('id');
      $('a[href="#'+id+'"]').trigger('click');
      $('.trayToggle i').trigger('click');
   });
});