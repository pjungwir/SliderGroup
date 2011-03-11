/**
 * slider_group.js
 * by Paul A. Jungwirth
 *
 * Groups jQuery-UI sliders so they always add up to the same value.
 *
 * Usage:
 *
 * $(function() {
 *     SliderGroup(".slider", 0, 100).init();
 * });
 *
 */
function SliderGroup(selector, min, max, debug) {
    this.selector = selector;
    this.sliders;   // an array of jquery's objects
    this.len = 0;   // length of this.sliders
    this.min = min;
    this.max = max;
    this.debug = debug;
    this.sliding = false;   // prevent infinite recursion from slide events
    // this.other_slider    // use this if one of the choices is "Other."
    this.last_moved = 0;

    this.log = function(msg) {
        if (this.debug) $('#debug').append(msg + "<br>");
    }

    this.set_slider_value = function(slider, v) {
        slider.slider("value", v);
        slider.data('counter').html(v);
    }

    // moving is the index of the slider that is being moved.
    this.distribute_points = function(moving, new_v) {
        var moved_slider = this.sliders[moving];
        var old_v = moved_slider.data('counter').html();
        moved_slider.data('counter').html(new_v);
        var diff = new_v - old_v;
        var ds = (diff > 0) ? -1 : 1;

        this.log(diff + " " + ds);
        while (diff != 0) {
            for (var i = ((this.last_moved + 1) % len); i < this.len; i++) {
                if (diff == 0) break;
                this.last_moved = i;
                var sl = this.sliders[i];
                if (sl == moved_slider) continue;
                var v = sl.slider('value');
                if ((ds > 0 && v < this.max) ||
                    (ds < 0 && v > this.min)) {
                    this.set_slider_value(sl, v + ds);
                    // sl.slider('value', v + ds);
                    diff += ds;
                }
            }
            this.log(diff);
        }
    }

    this.init = function() {
        var jsliders = $(this.selector);
        this.sliders = [];
        this.len = jsliders.size();
        var the_group = this;   // used in the closures.

        // Each slider should have an associated counter div,
        // located immediately after its own div.
        // Store a reference to it on each slider,
        // and use it to initialize its slider's starting value.
        jsliders.each(function(i, el) {
            var slider = $(this);
            var counter = slider.next();
            slider.data('counter', counter);
            the_group.sliders.push(slider);
            
            $(this).slider({min: this.min, max: this.max, value: counter.html(),
                slide:function(ev, ui) {
                    if (!sliding) {
                        sliding = true;
                        the_group.distribute_points(i, ui.value);
                        sliding = false;
                    }
                }
            });
        });
        return this;
    }

    return this;
}
