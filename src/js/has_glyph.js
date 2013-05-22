// A mixin for dealing with glyphs in widgets 
(function(){

  var loadGlyph = function(name){
    var className = 'glyph';
    if(name.length === 1) {
      var span = $.el.span({
        className : className,
        style : 'margin: 0 8px 0 0'
      }, name);
      return span;
    }

    else {
      var div = $.el.div({
        className : 'glyph'
      });
      $(div).css({
        background : name,
        width : Backbone.UI.HasGlyph.GLYPH_SIZE + 'px',
        height : Backbone.UI.HasGlyph.GLYPH_SIZE + 'px'
      });
      return div;
    }
  };

  Backbone.UI.HasGlyph = {
    GLYPH_SIZE : 22,

    options : {
      // a CSS background rule describing the glyph to show in a 
      // Backbone.UI.HasGlyph.GLYPH_SIZE size box on the left side 
      // of this widget
      glyph : null,

      // a CSS background rule describing the glyph to show in a 
      // Backbone.UI.HasGlyph.GLYPH_SIZE size box on the right side 
      // of this widget
      glyphRight : null
    },
    
    insertGlyphLayout : function(glyph, glyphRight, parent) {

      var contentWrapper = $.el.div({className : 'glyph_content_wrapper'});
      var rightWrapper = glyphRight ? $.el.div({className : 'glyph_right_wrapper'}) : null;
      var leftWrapper = glyph ? $.el.div({className : 'glyph_left_wrapper'}, contentWrapper) : null;

      if(leftWrapper) {
        leftWrapper.appendTo(parent);
        $(parent).addClass('has_glyph');
        leftWrapper.insertBefore(loadGlyph(glyph), contentWrapper);
      }

      else {
        contentWrapper.appendTo(parent);
        $(parent).addClass('has_glyph_right');
      }

      if(rightWrapper) {
        var contentParent = leftWrapper ? leftWrapper : rightWrapper;
        contentWrapper.appendTo(contentParent);
        if(leftWrapper) leftWrapper.appendTo(rightWrapper);
        rightWrapper.appendTo(parent);
        glyph = loadGlyph(glyphRight);
        $(glyph).addClass('right');
        glyph.appendTo(rightWrapper);
      }
      
      return contentWrapper;
    }
  };
}());
