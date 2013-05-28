(function(){
  window.Backbone.UI.Checkbox = Backbone.View.extend({

    options : {
      tagName : 'a',

      // The property of the model describing the label that 
      // should be placed next to the checkbox
      labelContent : null,

      // enables / disables the checkbox
      disabled : false
    },

    initialize : function() {
      this.mixin([Backbone.UI.HasModel, Backbone.UI.HasGlyph]);
      _(this).bindAll('render');

      $(this.el).click(_(this._onClick).bind(this));
      $(this.el).attr({href : '#'});
      $(this.el).addClass('checkbox');
      if(this.options.name){
        $(this.el).addClass(this.options.name);
      }
    },

    render : function() {
      this._observeModel(this.render);

      $(this.el).empty();

      this.checked = this.resolveContent() !== null ? this.resolveContent() : this.checked;
      var mark = $.el.div({className : 'checkmark'});
      if(this.checked) {
        mark.appendChild($.el.div({className : 'checkmark_fill'}));
      }

      var labelText = this.resolveContent(this.model, this.options.labelContent) || 
        this.options.labelContent;

      this._label = $.el.div({className : 'label'}, labelText);
      $('a',this._label).click(function(e){
        e.stopPropagation(); 
      });

      var glyphRightCss = this.resolveGlyph(this.model, this.options.glyphRightCss);
      var contentEl = this.insertGlyphLayout(null, glyphRightCss, this.el);

      contentEl.appendChild(mark);
      contentEl.appendChild(this._label);

      this.el.appendChild($.el.br({style : 'clear:both'}));

      return this;
    },

    _onClick : function() {
      if (this.options.disabled) {
        return false;
      }

      this.checked = !this.checked;
      if(_(this.model).exists() && _(this.options.content).exists()) {
        _(this.model).setProperty(this.options.content, this.checked);
      }
      else {
        this.render();
      }

      return false;
    }
  });
}());
