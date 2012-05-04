(function(){
  window.Backbone.UI.TextField = Backbone.View.extend({
    options : {
      // disables the input text
      disabled : false,
      
      // The type of input (text, password, number, email, etc.)
      type : 'text',

      // the value to use for both the name and id attribute 
      // of the underlying input element
      name : null,

      // the tab index to set on the underlying input field
      tabIndex : null,

      // a callback to invoke when a key is pressed within the text field
      onKeyPress : Backbone.UI.noop,

      // if given, the text field will limit it's character count
      maxLength : null
    },

    // public accessors
    input : null,

    initialize : function() {
      this.mixin([Backbone.UI.HasGlyph, Backbone.UI.HasModel]);
      _(this).bindAll('_refreshValue');
    
      $(this.el).addClass('text_field');
      if(this.options.name){
        $(this.el).addClass(this.options.name);
      }

      this.input = $.el.input({maxLength : this.options.maxLength});

      $(this.input).keyup(_.bind(function(e) {
        _.defer(_(this._updateModel).bind(this));
        if(_(this.options.onKeyPress).exists() && _(this.options.onKeyPress).isFunction()) {
          this.options.onKeyPress(e, this);
        }
      }, this));

      this._observeModel(this._refreshValue);
    },

    render : function() {
      var value = (this.input && this.input.value.length) > 0 ? 
        this.input.value : this.resolveContent();

      $(this.el).empty();

      $(this.input).attr({
        type : this.options.type ? this.options.type : 'text',
        name : this.options.name,
        id : this.options.name,
        tabIndex : this.options.tabIndex,
        placeholder : this.options.placeholder,
        value : value});

      // insert glyphs and text_wrapper
      var contentEl = this.insertGlyphLayout(this.options.glyph,this.options.glyphRight,this.el);
      contentEl.appendChild($.el.div({className : 'input_wrapper'}, this.input));

      this.setEnabled(!this.options.disabled);

      return this;
    },

    getValue : function() {
      return this.input.value;
    },

    setValue : function(value) {
      this.input.value = value;
      this._updateModel();
    },

    // sets the enabled state
    setEnabled : function(enabled) {
      if(enabled) { 
        $(this.el).removeClass('disabled');
      } else {
        $(this.el).addClass('disabled');
      }
      this.input.disabled = !enabled;
    },

    _updateModel : function() {
      _(this.model).setProperty(this.options.content, this.input.value);
    },

    _refreshValue : function() {
      var newValue = this.resolveContent();
      if(this.input && this.input.value !== newValue) {
        this.input.value = _(newValue).exists() ? newValue : null;
      }
    }
  });
}());

