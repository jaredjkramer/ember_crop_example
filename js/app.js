/* // GetURLParameter();
///crop/crop.php?imageFile=BMW_M6.jpg&stockNumber=jghkhjkgkjghjhkg&w=460&h=242&cid=AH0WAh7E
//need to fire the main image -> choose event

*/

(function($) {
	$.QueryString = (function(a) {
		if (a == "") return {};
			var b = {};
			for (var i = 0; i < a.length; ++i)
			{
				var p=a[i].split('=');
				if (p.length != 2) continue;
				b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
			}
			return b;
	})(window.location.search.substr(1).split('&'))
})(jQuery);

//constants
var uploadRoot = $.QueryString['stockNumber'] ?  'uploads/'+$.QueryString['stockNumber']+'/' : 'uploads/',
	imagepath = $.QueryString['imageFile'] ? uploadRoot +$.QueryString['imageFile'] : uploadRoot+"image.jpg",
	thumbpath = imagepath,
	uploadtype = null,
	imageW = $.QueryString['w'] ? $.QueryString['w'] : 1024,
	imageH = $.QueryString['h'] ? $.QueryString['h'] : 768,
	xojoid = $.QueryString['cid'] ? $.QueryString['cid'] : null,
	curTime = new Date().getTime();
	ext = imagepath.substr(imagepath.lastIndexOf("."));
	uploadtype = ext; 

//Routes
App.IndexRoute = Ember.Route.extend({});


//Controller
App.IndexController = Ember.ObjectController.extend(Ember.Evented, {
  needs: ['application'],
  initCrop: false,
  cropLive: false,
  renderTime: function() {
  	return new Date().getTime();
  },
  currentMainImage: {id: curTime, thumbpath: thumbpath, imagepath: imagepath, uploadtype: uploadtype, imagetype: ext},
  mainImageSize: {height: imageH, width: imageW},
  imageDirty: false,
  fireXojoEvent : function(uploadData) {
  	if(xojoid) window.parent.Xojo.triggerServerEvent(xojoid, 'Finished', [uploaddata]);
  },
  createCropName: function(img) {
  	var path = img.imagepath, curTime = this.renderTime(), ext = path.substr(path.lastIndexOf(".")), filename = path.substr(path.lastIndexOf("/") + 1);
    path = path.replace(filename,"");
    return path+filename.replace(ext, "")+"_"+curTime+"_CROP"+ext; 
  },
  actions: {
  	commitImage: function(img){
  		if(this.currentImage != null){
	  		var upload = this.store.createRecord('upload', {}),
	        uploaddata = $('#editedImage').attr('src'),
	        newname = this.createHeaderName(img), controller = this;
	        if (uploaddata.indexOf('uploads/') !== -1) return alert("Image not edited");
	        upload.set('uploaddata', $('#editedImage').attr('src')).set('uploadname', img.id).set('uploadpath', newname).set('uploadtype', img.uploadtype).set('uploadthumb', img.thumbpath)
	        .set('uploadoperation', 'cropper').set('uploadwidth', this.mainImageSize.width).set('uploadheight', this.mainImageSize.height);
	        upload.save().then(function(){
	           this.fireXojoEvent(upload);
	        });	
  		}else {
  			siteNoty("<strong>Error:</strong> No Image selected", "error", "center");
  		}
  		return true;
  	},
  	chooseImage: function(image) {
         if (this.initCrop) $('.img-container img').cropper('disable');
         $('#editImage').attr('src', this.currentMainImage.imagepath+'?t='+this.renderTime());
         $('#editedImage').attr('src', this.currentMainImage.imagepath+'?t='+this.renderTime());
         if (this.initCrop === false && this.currentMainImage != {}) {
            var params = {ratio : (this.mainImageSize.width / this.mainImageSize.height), minH: this.mainImageSize.height, minW: this.mainImageSize.width, resize: false};
            this.cropLive = this.initCrop = initCropper(params);   
         }else if(this.currentMainImage) $('.img-container img').cropper('enable');
  	},
  	resetImg: function() {
  		resetImage(this.currentMainImage);
  		cropDestroy(this.currentMainImage);
  	}
  }
});

//Views
App.IndexView = Ember.View.extend({
	needs:['controller'],
	cropLive: false,
	initCrop: false,
	attributeBindings: ["data-id", "data-large", "data-original"],
	refreshImages: function() {
     	this.rerender();
   	}.observes('controller.renderTime'),
	didInsertElement: function() {
		this._super;
		Ember.run.scheduleOnce('afterRender', this, 'fireDOM');
	},
	fireDOM: function() {
		bindDOMEvents();
		$('#imageCropPanel').trigger('click');
	},
	updateCrop: function() {
		if (this.initCrop === true) {
      		$('.selectCrop').removeClass('active');
      		$('.img-preview img').attr('src', this.controller.currentImage.imagepath);
      		this.disableCrop();
     	}
	}.observes('controller.currentImage'),
	enableCrop: function() {
		$('.img-container img').cropper('enable', function() {   
        	$('.commitCrop').removeClass('disabled');
        	$('.selectCrop').addClass('active');
      	});
      	this.cropLive = true;
	},
	disableCrop: function() {
		$('.img-container img').cropper('disable');
     	$('.commitCrop').addClass('disabled').removeClass('active');
     	this.cropLive = false;   
	}, actions: {
		openTray: function() {
	        var el = $('.imageTrayBottom');
	        el.css({'height': el.height()}).animate({'height':'toggle'}, 'slow', 'easeOutBounce');
	      },
	      killCrop: function() {
	        if (this.initCrop) {
	           this.disableCrop();
	           //$('.selectCrop').removeClass('disabled');
	        }else {
	        	//this.enableCrop();
	        }
	      },
	      toggleImageTool: function(func) {
	      	if(func != 'cropping'){
	      		this.disableCrop();
	      	}else {
	      		if(!$('#btnCommitCrop').is(':visible')){
	      			if(!this.cropLive) this.enableCrop();
	      		}
	      	}
	      	console.log("accordion click event " + func);
	      },
	      selectCrop: function(image) {
	        var active = $('.selectCrop').hasClass('active');
	        if(this.initCrop === false) {
	        	initCropper();
	            this.initCrop = true;
	            this.cropLive = true;
	        } else if (this.initCrop === true && this.cropLive === false) {
	           this.enableCrop();
	        } else {
	            this.disableCrop();
	        }
	      },
	      commitCrop: function(image) {
	         this.disableCrop();
	         var imageObj = getImgArgs($('#btnCommitCrop')),
	         options = {};
	         if (crop_api) {
	            options.rect = {left: crop_api.x1, top: crop_api.y1, width:crop_api.w, height:crop_api.h};
	            var newEl = pixastic(imageObj, options);
	         }
	         this.cropLive = false;     
	      }
	}

});


//Model
App.Upload = Ember.Model.extend({
   uploadname: Ember.attr(),
   uploadpath: Ember.attr(),
   uploadtype: Ember.attr(),
   uploaddata: Ember.attr(),
   uploadthumb: Ember.attr(),
   uploadoperation: Ember.attr(),
   uploadheight: Ember.attr(),
   uploadwidth: Ember.attr()
});

//Application Adapters
var appurl = 'api/api.php/';
App.Upload.adapter = Ember.RESTAdapter.create();
App.Upload.url = appurl+'uploads';
App.Upload.collectionKey = 'upload';
