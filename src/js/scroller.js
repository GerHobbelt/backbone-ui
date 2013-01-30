(function(){

  window.Backbone.UI.Scroller = Backbone.View.extend({
    options : {
      className : 'scroller',

      // The content to be scrolled.  This element should be 
      // of a fixed height.
      content : null,

      // The amount to scroll on each wheel click
      scrollAmount : 5,

      // A callback to invoke when scrolling occurs
      onScroll : null
    },

    initialize : function() {
      Backbone.UI.DragSession.enableBasicDragSupport();
      setInterval(_(this.update).bind(this), 40);
    },

    render : function () {
      $(this.el).empty();
      $(this.el).addClass('scroller');

      this._scrollContent = this.options.content; 
      $(this._scrollContent).addClass('content');

      this._knob = $.el.div({className : 'knob'},
        $.el.div({className : 'knob_top'}),
        $.el.div({className : 'knob_middle'}),
        $.el.div({className : 'knob_bottom'}));

      this._tray = $.el.div({className : 'tray'});
      this._tray.appendChild(this._knob);

      // for firefox on windows we need to wrap the scroller content in an overflow
      // auto div to avoid a rendering bug that causes artifacts on the screen when
      // the hidden content is scrolled...wsb
      this._scrollContentWrapper = $.el.div({className : 'content_wrapper'});
      this._scrollContentWrapper.appendChild(this._scrollContent);

      this.el.appendChild(this._tray);
      this.el.appendChild(this._scrollContentWrapper);

      // FF workaround: Set tabIndex so the user can click on the div to give
      // it focus (which allows us to capture the up/down/pageup/pagedown
      // keys).  (And setting it to -1 keeps it out of the tab-navigation
      // chain)
      this.el.tabIndex = -1;

      // observe events
      $(this._knob).bind('mousedown', _.bind(this._onKnobMouseDown, this));
      $(this._tray).bind('click', _.bind(this._onTrayClick, this));
      $(this.el).bind('mousewheel', _.bind(this._onMouseWheel, this));

      // touch events if appropriates
      if(Backbone.UI.IS_MOBILE) {
        $(this._scrollContent).css({
          overflow : 'scroll',
          '-webkit-overflow-scrolling' : 'touch'
        });
      }
      $(this.el).addClass('disabled');

      return this;
    },
    
    // Returns the scroll position as a ratio of position relative to
    // overall content size. 0 = at top, 1 = at bottom.
    scrollRatio: function() {
      return this.scrollPosition()/(this._totalHeight - this._visibleHeight);
    },

    setScrollRatio: function(ratio) {
      var overflow = (this._totalHeight - this._visibleHeight);
      ratio = Math.max(0, Math.min(overflow > 0 ? 1 : 0, ratio));
      var contentPos = ratio*overflow;

      this._scrollContent.scrollTop = Math.round(contentPos);

      if(this.options.onScroll) this.options.onScroll();

      // FF workaround: with position relative set on the container (needed to
      // float the scrollbar properly), scrolling performance suh-hucks!
      // However updating the knob position in a timeout dramatically improves
      // matters. Don't ask me why!
      setTimeout(_.bind(this._updateKnobPosition, this), 10);
      this._updateKnobPosition();
    },

    // Scrolls the content by the given amount
    scrollBy: function(amount) {
      this.setScrollPosition(this.scrollPosition() + amount);
    },

    // Returns the actual scroll position
    scrollPosition: function() {
      return this._scrollContent.scrollTop;
    },

    setScrollPosition: function(top) {
      this.update();
      var h = this._totalHeight - this._visibleHeight;
      this.setScrollRatio(h ? top/h : 0);
      this.update();
    },

    // Scrolls to the end of the content
    scrollToEnd : function(){
      this.setScrollRatio(1);
    },
    
    // updates and resizes the scrollbar if changes to the scroll 
    update: function() {
      if(!$(this.el).is(":visible")) return;

      var visibleHeight = this._scrollContent.offsetHeight;
      var totalHeight = this._scrollContent.scrollHeight;

      this.maxY = $(this._tray).height() - $(this._knob).height();

      // if either the offset or scroll height has changed
      if(this._visibleHeight !== visibleHeight || this._totalHeight !== totalHeight) {
        this._disabled = totalHeight <= visibleHeight + 2;
        $(this.el).toggleClass('disabled', this._disabled || Backbone.UI.IS_MOBILE);
        this._visibleHeight = visibleHeight;
        this._totalHeight = totalHeight;

        // if there's nothing to scroll, we disable the scroll bar
        if(this._totalHeight >= this._visibleHeight) {
          this._updateKnobSize();
          this.minY = 0;
        }
      }
      this._updateKnobPosition();
      this._updateKnobSize();
    },

    // Set the position of the knob to reflect the current scroll position
    _updateKnobPosition: function() {
      var r = this.scrollRatio();
      var y = this.minY + (this.maxY-this.minY) * r;
      if (!isNaN(y)) this._knob.style.top = y + 'px';
    },
    
    _updateKnobSize : function(){
      var knobSize = $(this._tray).height() * (this._visibleHeight/this._totalHeight);
      knobSize = knobSize > 20 ? knobSize : 20;
      $(this._knob).css({height : knobSize + 'px'});
    },

    _knobRatio: function(top) {
      top = top || this._knob.offsetTop;
      top = Math.max(this.minY, Math.min(this.maxY, top));
      return (top-this.minY) / (this.maxY - this.minY);
    },
    
    _onTrayClick: function(e) {
      e = e || event;
      if(e.target === this._tray) {
        var y = (e.layerY || e.y);
        if(!y) y = (e.originalEvent.layerY || e.originalEvent.y);
        y = y - this._knob.offsetHeight/2;
        this.setScrollRatio(this._knobRatio(y));
      }
      e.stopPropagation();
    },

    _onKnobMouseDown : function(e) {
      this.el.focus();
      var ds = new Backbone.UI.DragSession({
        dragEvent : e, 
        scope : this.el.ownerDocument,

        onStart : _.bind(function(ds) {
          // Cache starting position of the knob
          ds.pos = this._knob.offsetTop;
          ds.scroller = this;
          $(this.el).addClass('dragging');
        }, this),

        onMove : _.bind(function(ds) {
          var ratio = this._knobRatio(ds.pos + ds.dy);
          this.setScrollRatio(ratio);
        }, this),

        onStop : _.bind(function(ds) {
          $(this.el).removeClass('dragging');
        }, this)
      });
      e.stopPropagation();
    },
    
    _onMouseWheel: function(e, delta, deltaX, deltaY) {
      if(!this._disabled) {
        var step = this.options.scrollAmount;
        this.setScrollPosition(this.scrollPosition() - delta*step);
        e.preventDefault();
        return false;
      }
    }

  });
}());



