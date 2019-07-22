var Modal = new Class({
    Implements: [Events, Options],
    options: {
        title: null,
        foot: null,
        width: 400,
        height: 'auto',
        speed: 500,
        maskOpacity: 0.3,
        maskColor: '#000000',
        classPrefix: 'modal',
        onHide: $empty,
        onShow: $empty,
        onStart: $empty
    },
    initialize: function(options){
        this.setOptions(options);
        this.isShowing = false;

        this.mask = new Element('div', {
            'id': 'modal-mask',
            'class': this.options.classPrefix + '-mask',
            'styles': {
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'opacity': 0,
                'z-index': 9999,
                'background-color': this.options.maskColor
            },
            'events': {
                'click': this.hide.bindWithEvent(this)
            }
        });

        this.pop = new Element('div', {
            'id': 'modal-pop',
            'class': this.options.classPrefix + '-pop',
            'styles': {
                'position': 'absolute',
                'visibility': 'hidden',
                'overflow': 'hidden',
//                'width': this.options.width,
                'height': 'auto',
                'left': '50%',
                'z-index': 10000
            }
        });

        this.menu = new Element('div', {
            'class': this.options.classPrefix + '-menu',
            'styles': {
                'float': 'right',
                'height': 8
            }
        }).adopt(new Element('a', {
                'href': '#',
                'text': 'X',
                'events': {
                    'click': this.hide.bindWithEvent(this)
                }
        }));
        this.head = new Element('div', {
            'id': 'modal-head',
            'class': this.options.classPrefix + '-head'
        });
        this.body = new Element('div', {
            'id': 'modal-body',
            'class': this.options.classPrefix + '-body'
        });
        this.foot = new Element('div', {
            'id': 'modal-foot',
            'class': this.options.classPrefix + '-foot'
        });
        this.pop.adopt(this.menu, this.head, this.body, this.foot);

//        this.fx = {
//            mask: this.mask.effect('opacity', {duration: this.options.speed}),
//            slide: this.pop.effect('top', {duration: this.options.speed})
//        };

        this.fx = {
            mask: new Fx.Tween(this.mask, {property: 'opacity', duration: this.options.speed}),
            slide: new Fx.Tween(this.pop, {property: 'top', duration:this.options.speed})
        };


        window.addEvents({
            'keyup': this.hide.bindWithEvent(this),
            'resize': this.update.bindWithEvent(this),
            'scroll': this.update.bindWithEvent(this)
        });
        this.fireEvent('onStart');
    },
    show: function(el, options){
        this.head.empty();
        this.body.empty();
        this.foot.empty();

        switch($type(el)) {
            case 'element':
//                this.body.adopt(el.clone().cloneEvents(el));
                this.body.adopt(el);
                break;
            case 'string':
                this.body.set('html', el);
                break;
            default:
                return false;
                break;
        }

        options = $merge(this.options, options);

        this.pop.setStyle('width', options.width);
        this.body.setStyle('height', options.height);
        this.head.set('html', options.title || '');
        this.foot.set('html', options.foot || '');

        if(! this.isShowing){
            $$('object', 'select').setStyle('visibility', 'hidden');
            $$('body').adopt(this.mask, this.pop);

            this.pop.setStyles({
                'top': window.getScroll().y - this.pop.getSize().y,
                'visibility': 'visible',
                'marginLeft': -(this.pop.getSize().x/2)
            });
            this.mask.setStyles({
                'top': -window.getScroll().y,
                'height': window.getScrollSize().y + window.getScroll().y,
                //'height': window.getSize().y,
                'width': window.getSize().x
            });

            this.fx.mask.start(this.options.maskOpacity);
            this.fx.slide.start(window.getScroll().y + (window.getSize().y/2 - this.pop.getSize().y/2));

            this.isShowing = true;

            this.fireEvent('onShow');
        }
    },
    hide: function(e){
        var event = new Event(e).stop();
        if((event.key && event.key != 'esc') || ! this.isShowing) return false;

        $$('object', 'select').setStyle('visibility', 'visible');

        this.fx.slide.cancel();
        this.fx.slide.start(-this.pop.getSize().y).chain(function(){
            this.pop.setStyle('visibility', 'hidden').dispose();

            this.fx.mask.start(0).chain(function(){
                this.mask.dispose();
                this.isShowing = false;
                this.fireEvent('onHide');
            }.bind(this));
        }.bind(this));
    },
    update: function(e){
        if(e) e = new Event(e).stop();
        if(this.isShowing){
            this.fx.slide.cancel();
            var size = window.getSize();
            var scrollSize = window.getScrollSize();
            this.mask.setStyles({
//                'height': (size.y > scrollSize.y) ? size.y : scrollSize.y,
//                'width': size.x
                'height': window.getScrollSize().y + window.getScroll().y,
                'top': -window.getScroll().y
            });
            this.fx.slide.start(window.getScroll().y + (window.getSize().y/2 - this.pop.getSize().y/2))
        }
    }
});
