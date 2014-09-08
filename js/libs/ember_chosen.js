App.Chosen = Ember.Select.extend({

  multiple: false,
  width: '100%',
  disableSearchThreshold: 10,
  searchContains: true,
  attributeBindings:['multiple', 'width', 'disableSearchThreshold', 'searchContains'],

  didInsertElement: function(){
    this._super();

    var options = {
      multiple: this.get('multiple'),
      width: this.get('width'),
      disable_search_threshold: this.get('disableSearchThreshold'),
      search_contains: this.get('searchContains')
    };

    options.clean_search_text = this.cleanSearchText;
    options.calling_context = this;

    if(this.get('multiple')){
      options.placeholder_text_multiple = this.get('prompt');
    } else {
      options.placeholder_text_single = this.get('prompt');
    }

    this.$().chosen(options);
    this.$().next('.chosen-container');
    // observes for new changes on options to trigger an update on Chosen
    return this.addObserver(this.get("optionLabelPath").replace(/^content/, "content.@each"), function() {
      return this.rerenderChosen();
    });

  },

  _closeChosen: function(){
    // trigger escape to close chosen
    this.$().next('.chosen-container-active').find('input').trigger({type:'keyup', which:27});
  },

  cleanSearchText: function(option, context){
    return option.text;
  },

  rerenderChosen: function(){
    // Don't trigger Chosen update until after DOM elements have finished rendering.
    Ember.run.scheduleOnce('afterRender', this, function(){
      this.$().trigger('chosen:updated');
      
    });
  }

});