/*
* golemgallery2.js
*
* Copyright (c) 2012, Klaß&Ihlenfeld Verlag GmbH, Alexander Merz. All rights reserved.
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either
* version 3 of the License, or (at your option) any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
* Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public
* License along with this library; if not, write to the Free Software
* Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
* MA 02110-1301 USA
*/

if(!Golem) {
    var Golem = {};
}

if(!Golem.Gallery2) {

/**
 * Constructor
 *
 * - baseEl     HTMLElement
 *              gallery placeholder element
 * - eventFn    (optional) function
 *              see Golem.Gallery2.init()
 */
Golem.Gallery2 = function(baseEl, eventFn) {

    var that = this;

    this.baseA          = $(baseEl);
    this.baseEl         = null;
    this.baseImageUl    = null;
    this.imageCount     = 0;
    this.isFullscreen   = false;
    this.lastPosition   = [0,0];
    this.preloadPrev    = 1;
    this.preloadNext    = 3;
    this.id             = 'golem-gallery2-' + Golem.Gallery2.idCounter;
    this.pageChangeFn   = null;

    this.template = $('.golem-gallery2-template').
                    clone(true).
                    removeClass('golem-gallery2-template').
                    addClass('golem-gallery2');

    if(eventFn) {
        this.pageChangeFn = eventFn;
    }

    Golem.Gallery2.idCounter++;

    /**
     * Golem.Gallery2.onPageChange()
     * Called on image change
     */
    this.onPageChange = function() {

        if(that.pageChangeFn) {
            that.pageChangeFn.call(window,{
                    baseEl          : that.baseEl[0],
                    id              : that.id,
                    isFullscreen    : that.isFullscreen,
                    newEl           : that.baseImageUl.find('li.golem-gallery2-show')[0]
                });
        }
    }

    /**
     * Golem.Gallery2.rewriteDom()
     *
     * Creates the gallery DOM from template and
     * gallery placeholder
     */
    this.rewriteDom = function() {

        var elUl = that.baseA.find('ul').
                    detach().
                    addClass('golem-gallery2-list');

        that.template.find('.golem-gallery2-list').replaceWith(elUl);
        that.baseA.replaceWith(this.template);

        that.baseEl         = that.template;
        that.baseEl.attr('id', that.id);
        that.baseImageUl    = elUl;
        that.imageCount     = elUl.find('li').length;

    };

    /**
     * Golem.Gallery2.setImgSrc()
     *
     * Rewrites the src attribute of the images
     * based on the attribute named by attr
     *
     * - attr   String
     *          the name of the attribute to use
     */
    this.setImgSrc = function(attr) {
        var showEl = that.baseImageUl.find('li.golem-gallery2-show'),
            startEl = showEl;

        function _set(el) {
            var imgEl = el.find('img');

            if(0 == imgEl.length) return;

            var curSrc = imgEl.attr('src'),
                newSrc = imgEl.attr(attr);

            if('' == curSrc || curSrc != newSrc) {
                imgEl.attr('src', newSrc);
            }
        }

        _set(showEl);

        for(var i = 0; i < that.preloadNext; i++) {
            showEl = showEl.next();
            _set(showEl);
        }

        showEl = startEl;

        for(var i = 0; i < that.preloadPrev; i++) {
            showEl = showEl.prev();
            _set(showEl);
        }

    };

    /**
     * Golem.Gallery2.assignShow()
     *
     * Initial selects an image to show
     * if not selected by gallery placeholder
     *
     * - pos    (optional) string
     *          Be default selects first image in the list
     *          use 'last' as value to select last image
     *          in the list
     */
    this.assignShow = function(pos) {
        var showEl = that.baseImageUl.find('li.golem-gallery2-show');

        if(0 == showEl.length) {
            var el = null;
            if(!pos) {
                el = that.baseImageUl.find('li').first();
            } else if('last' == pos) {
                el = that.baseImageUl.find('li').last();
            }

            if(null != el && 0 < el.length) {
                el.addClass('golem-gallery2-show');
            }
        }

        that.updateUi();
    };

    /**
     * Golem.Gallery2.enableNav()
     *
     * Enables the navigation elements
     * but only if the gallery contains more
     * then one image
     */
    this.enableNav = function() {

        var baseNav = that.baseEl.find('.golem-gallery2-nav');

        if(2 > that.imageCount) {
            baseNav.addClass('golem-gallery2-nav-inactive');
            return;
        }

        baseNav.bind('mouseover', function(){
            $(this).addClass('golem-gallery2-mouseover');
        });

        baseNav.bind('mouseout', function(){
            $(this).removeClass('golem-gallery2-mouseover');
        });

        baseNav.find('.golem-gallery2-nav-prev').bind('click', that.prevImage);
        baseNav.find('.golem-gallery2-nav-next').bind('click', that.nextImage);

        that.baseImageUl.bind('click', that.nextImage);

    };

    /**
     * Golem.Gallery2.toogleTitle()
     *
     * Show/Hide the title bar in fullscreen mode
     */
    this.toggleTitle = function() {

        var hm = that.baseEl.find('.golem-gallery2-footer-hidemode');

        if(0 == hm.length) {
            that.baseEl.find('.golem-gallery2-footer').
                addClass('golem-gallery2-footer-hidemode');
        } else {
            hm.removeClass('golem-gallery2-footer-hidemode');
        }


    };

    /**
     * Golem.Gallery2.prevImage()
     *
     * Shows the previous image
     * or last one, if the current image
     * is the first one
     */
    this.prevImage = function() {


        if(that.imageCount < 2) {
            return false;
        }

        var current = that.baseImageUl.find('.golem-gallery2-show').first();

        if(0 == current.length) {
            that.assignShow();
            return true;
        }

        var prev = current.prev();

        current.removeClass('golem-gallery2-show');

        if(0 == prev.length) {
            that.assignShow('last');
            return true;
        }

        prev.addClass('golem-gallery2-show');
        that.updateUi();

        that.onPageChange();

        return true;
    }

    /**
     * Golem.Gallery2.nextImage()
     *
     * Shows the next image
     * or the first one, if the current
     * is the last in the list
     */
    this.nextImage = function() {

        if(that.imageCount < 2) {
            return false;
        }

        var current = that.baseImageUl.find('.golem-gallery2-show').first();

        if(0 == current.length) {
            that.assignShow();
            return true;
        }

        var next = current.next();

        current.removeClass('golem-gallery2-show');

        if(0 == next.length) {
            that.assignShow();
            return true;
        }

        next.addClass('golem-gallery2-show');
        that.updateUi();

        that.onPageChange();

        return true;
    }

    /**
     * Golem.Gallery2.updateCounter()
     *
     * Updates the current image display
     */
    this.updateCounter = function() {

        that.baseEl.find('.golem-gallery2-nav-count-all').html(that.imageCount);

        var cur = that.baseImageUl.find('.golem-gallery2-show').first(),
            index = that.baseImageUl.find('li').index(cur);
        that.baseEl.find('.golem-gallery2-nav-count-current').html(index + 1);

    };

    /**
     * Golem.Gallery2.updateTitle()
     *
     * Updates the image title line
     */
    this.updateTitle = function() {

        var t = that.baseImageUl.find('.golem-gallery2-show img').attr('title'),
            title = '';

        if(null != t) {
            title = t;
        }

        that.baseEl.find('.golem-gallery2-footer-title').html(title);

    }

    /**
     * Golem.Gallery2.updateUi()
     *
     * Updates UI elements on image change
     * (Title/Counter)
     */
    this.updateUi = function() {

        that.setImgSrc((that.isFullscreen)?'data-src-full':'data-src');

        that.updateCounter();
        that.updateTitle();
    };

    /**
     * Golem.Gallery2.enableFullscreen()
     *
     * Activate Fullscreen buttin
     */
    this.enableFullscreen = function() {
        that.baseEl.find('.golem-gallery2-footer-hide').bind('click', that.toggleTitle);
        that.baseEl.find('.golem-gallery2-footer-fullscreen').bind('click', that.toggleFullscreen);

    }

    /**
     * Golem.Gallery2.toggleFullscreen()
     *
     * Shows/hides Fullscreen mode
     */
    this.toggleFullscreen = function() {

        if(BigScreen.enabled) {
            BigScreen.toggle(that.baseEl[0]);
        }

        if(that.isFullscreen) {
            that.hideFullscreen();
        } else {
            that.showFullscreen();
        }

        that.isFullscreen = !that.isFullscreen;

    }

    /**
     * Golem.Gallery2.showFullscreen()
     *
     * Switch to fullscreen mode
     */
    this.showFullscreen = function(event) {

        that.lastPosition = [window.pageXOffset, window.pageYOffset];
        window.scrollTo(0, 0);

        that.baseEl.addClass('golem-gallery2-fullscreenmode');
        that.baseEl.find('.golem-gallery2-footer-fullscreen img').attr('src', Golem.Gallery2.ICON_SMALL);

        that.setImgSrc('data-src-full');

        $('body').addClass('golem-gallery2-noscroll');

    }

    /**
     * Golem.Gallery2.hideFullscreen()
     *
     * Switch to regular view
     */
    this.hideFullscreen = function() {

        var elFs = $('.golem-gallery2-fullscreenmode');

        that.setImgSrc('data-src');

        elFs.find('.golem-gallery2-footer-fullscreen img').attr('src', Golem.Gallery2.ICON_BIG);
        elFs.removeClass('golem-gallery2-fullscreenmode');

        $('body').removeClass('golem-gallery2-noscroll');

        window.scrollTo(that.lastPosition[0], that.lastPosition[1]);
    }

    /**
     * Golem.Gallery2.bigscreenOnExit()
     *
     * Callback function for BigScreen exit event
     */
    this.bigscreenOnExit = function() {
        if(that.isFullscreen) {
            that.hideFullscreen();
            that.isFullscreen = !that.isFullscreen;
        }
    }

    /**
     * Golem.Gallery2.onKey()
     *
     * Callback function for keybord events
     * The event is only handled, if
     * - the gallery is in fullscreen mode
     * - or ist the first completely visible
     * gallery on screen
     */
    this.onKey = function(event) {

        var win = $(window),
            wst = win.scrollTop(),
            dvb = wst + win.height(),
            et  = that.baseEl.offset().top,
            eb  = et + that.baseEl.height();

        if(that.isFullscreen // full screen
            || // or in whole view
            ((eb >= wst) && (et <= dvb)
                && (eb <= dvb) && (et >= wst)))
        {
            switch(event.keyCode) {
                case 37: // right
                    return that.prevImage();
                    break
                case 39: // left
                    return that.nextImage();
                    break;
                case 27: // esc - ignore if BigScreen does the stuff
                    if(!BigScreen.enabled) {
                        that.bigscreenOnExit();
                    }
                    break;
            }

            return true;
        }

        return false;
    }

    /**
     * Golem.Gallery2.onResize()
     *
     * Callback for resize event
     */
    this.onResize = function(event) {
        // hack for IE10/tablets to force recalc
        that.baseEl.css('display', 'block');
    }

    /**
     * Do all the magic
     */

    this.rewriteDom();
    this.setImgSrc('data-src');
    this.assignShow();
    this.enableNav();
    this.enableFullscreen();

}

/**
 * Golem.Gallery2.init()
 * Looks up in the document and
 * transforms all gallery placeholders
 * into a gallery
 *
 * eventFn - (optional) a function called in
 *          case of an image change
 *
 * The callback function eventFn is called
 * with an object including these properites:
 * - obj.isFullscreen   - boolean
 *                      gallery is (not) in fullscreen mode
 * - obj.newEl          - HTMLElement
 *                      the currently visible HTML Element
 * - obj.baseEl         - HTMLElement
 *                      the gallery HTML Element
 * - obj.id             - string
 *                      the internal gallery id
 */
Golem.Gallery2.init = function(eventFn){
    $('.golem-gallery2-nojs').each(function(){
        var gg2 = new Golem.Gallery2(this, eventFn);
        Golem.Gallery2.galleries.push(gg2);
    });
};

/**
 * Internally used members
 */
Golem.Gallery2.idCounter    = 0;
Golem.Gallery2.current      = null;

/**
 * List of galleries
 */
Golem.Gallery2.galleries    = [];

/**
 * URLs of the images for the fullscreen button
 */
Golem.Gallery2.ICON_SMALL   = '../images/small.png';
Golem.Gallery2.ICON_BIG     = '../images/big.png';

/**
 * Check if browser provides Fullscreen API support
 * Add callback for closing fullscreen event
 */
if (BigScreen.enabled) {
    BigScreen.onexit = function() {
        var GG2g = Golem.Gallery2.galleries;

        for(var i = 0, l = GG2g.length; i < l; i++) {
            GG2g[i].bigscreenOnExit.call(GG2g);
        }
    }
}

/**
 * Add callback for keyboard events
 */
$(document).bind('keyup', function(event) {
    var GG2g = Golem.Gallery2.galleries;

    // special handling in case a gallery is in fullscreen
    for(var i = 0, l = GG2g.length; i < l; i++) {
        if(GG2g[i].isFullscreen) {
            if(GG2g[i].onKey.call(GG2g, event)) {
                return;
            }
        }
    }

    for(var i = 0, l = GG2g.length; i < l; i++) {
        if(GG2g[i].onKey.call(GG2g, event)) {
            break;
        }
    }
});

/**
 * Add callback for resize event
 * Required for IE/resolution changes
 */
$(document).bind('resize', function(event) {
    var GG2g = Golem.Gallery2.galleries;

    for(var i = 0, l = GG2g.length; i < l; i++) {
        if(GG2g[i].onResize.call(GG2g, event)) {
            break;
        }
    }
});


}
