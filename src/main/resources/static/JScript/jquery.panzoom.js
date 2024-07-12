(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function(jQuery) {
            return factory(global, jQuery);
        });
    } else if (typeof exports === 'object') {
        factory(global, require('jquery'));
    } else {
        factory(global, global.jQuery);
    }
}(typeof window !== 'undefined' ? window : this, function(window, $) {
    'use strict';
    var document = window.document;
    var datakey = '__pz__';
    var slice = Array.prototype.slice;
    var rIE11 = /trident\/7./i;
    var supportsInputEvent = (function() {
            if (rIE11.test(navigator.userAgent)) {
                return false;
            }
            var input = document.createElement('input');
            input.setAttribute('oninput', 'return');
            return typeof input.oninput === 'function';
        }
    )();
    var rupper = /([A-Z])/g;
    var rsvg = /^http:[\w\.\/]+svg$/;
    var floating = '(\\-?\\d[\\d\\.e-]*)';
    var commaSpace = '\\,?\\s*';
    var rmatrix = new RegExp('^matrix\\(' + floating + commaSpace + floating + commaSpace + floating + commaSpace + floating + commaSpace + floating + commaSpace + floating + '\\)$');
    function matrixEquals(first, second) {
        var i = first.length;
        while (--i) {
            if (Math.round(+first[i]) !== Math.round(+second[i])) {
                return false;
            }
        }
        return true;
    }
    function createResetOptions(opts) {
        var options = {
            range: true,
            animate: true
        };
        if (typeof opts === 'boolean') {
            options.animate = opts;
        } else {
            $.extend(options, opts);
        }
        return options;
    }
    function Matrix(a, b, c, d, e, f, g, h, i) {
        if ($.type(a) === 'array') {
            this.elements = [+a[0], +a[2], +a[4], +a[1], +a[3], +a[5], 0, 0, 1];
        } else {
            this.elements = [a, b, c, d, e, f, g || 0, h || 0, i || 1];
        }
    }
    Matrix.prototype = {
        x: function(matrix) {
            var isVector = matrix instanceof Vector;
            var a = this.elements
                , b = matrix.elements;
            if (isVector && b.length === 3) {
                return new Vector(a[0] * b[0] + a[1] * b[1] + a[2] * b[2],a[3] * b[0] + a[4] * b[1] + a[5] * b[2],a[6] * b[0] + a[7] * b[1] + a[8] * b[2]);
            } else if (b.length === a.length) {
                return new Matrix(a[0] * b[0] + a[1] * b[3] + a[2] * b[6],a[0] * b[1] + a[1] * b[4] + a[2] * b[7],a[0] * b[2] + a[1] * b[5] + a[2] * b[8],a[3] * b[0] + a[4] * b[3] + a[5] * b[6],a[3] * b[1] + a[4] * b[4] + a[5] * b[7],a[3] * b[2] + a[4] * b[5] + a[5] * b[8],a[6] * b[0] + a[7] * b[3] + a[8] * b[6],a[6] * b[1] + a[7] * b[4] + a[8] * b[7],a[6] * b[2] + a[7] * b[5] + a[8] * b[8]);
            }
            return false;
        },
        inverse: function() {
            var d = 1 / this.determinant()
                , a = this.elements;
            return new Matrix(d * (a[8] * a[4] - a[7] * a[5]),d * (-(a[8] * a[1] - a[7] * a[2])),d * (a[5] * a[1] - a[4] * a[2]),d * (-(a[8] * a[3] - a[6] * a[5])),d * (a[8] * a[0] - a[6] * a[2]),d * (-(a[5] * a[0] - a[3] * a[2])),d * (a[7] * a[3] - a[6] * a[4]),d * (-(a[7] * a[0] - a[6] * a[1])),d * (a[4] * a[0] - a[3] * a[1]));
        },
        determinant: function() {
            var a = this.elements;
            return a[0] * (a[8] * a[4] - a[7] * a[5]) - a[3] * (a[8] * a[1] - a[7] * a[2]) + a[6] * (a[5] * a[1] - a[4] * a[2]);
        }
    };
    function Vector(x, y, z) {
        this.elements = [x, y, z];
    }
    Vector.prototype.e = Matrix.prototype.e = function(i) {
        return this.elements[i];
    }
    ;
    function Panzoom(elem, options) {
        if (!(this instanceof Panzoom)) {
            return new Panzoom(elem,options);
        }
        if (elem.nodeType !== 1) {
            $.error('Panzoom called on non-Element node');
        }
        if (!$.contains(document, elem)) {
            $.error('Panzoom element must be attached to the document');
        }
        var d = $.data(elem, datakey);
        if (d) {
            return d;
        }
        this.options = options = $.extend({}, Panzoom.defaults, options);
        this.elem = elem;
        var $elem = this.$elem = $(elem);
        this.$set = options.$set && options.$set.length ? options.$set : $elem;
        this.$doc = $(elem.ownerDocument || document);
        this.$parent = $elem.parent();
        this.isSVG = rsvg.test(elem.namespaceURI) && elem.nodeName.toLowerCase() !== 'svg';
        this.panning = false;
        this._buildTransform();
        this._transform = !this.isSVG && $.cssProps.transform.replace(rupper, '-$1').toLowerCase();
        this._buildTransition();
        this.resetDimensions();
        var $empty = $();
        var self = this;
        $.each(['$zoomIn', '$zoomOut', '$zoomRange', '$reset'], function(i, name) {
            self[name] = options[name] || $empty;
        });
        this.enable();
        this.scale = this.getMatrix()[0];
        this._checkPanWhenZoomed();
        $.data(elem, datakey, this);
    }
    Panzoom.rmatrix = rmatrix;
    Panzoom.defaults = {
        eventNamespace: '.panzoom',
        transition: true,
        cursor: 'move',
        disablePan: false,
        disableZoom: false,
        disableXAxis: false,
        disableYAxis: false,
        which: 1,
        increment: 0.3,
        exponential: true,
        panOnlyWhenZoomed: false,
        minScale: 0.3,
        maxScale: 6,
        rangeStep: 0.05,
        duration: 200,
        easing: 'ease-in-out',
        contain: false
    };
    Panzoom.prototype = {
        constructor: Panzoom,
        instance: function() {
            return this;
        },
        enable: function() {
            this._initStyle();
            this._bind();
            this.disabled = false;
        },
        disable: function() {
            this.disabled = true;
            this._resetStyle();
            this._unbind();
        },
        isDisabled: function() {
            return this.disabled;
        },
        destroy: function() {
            this.disable();
            $.removeData(this.elem, datakey);
        },
        resetDimensions: function() {
            this.container = this.$parent[0].getBoundingClientRect();
            var elem = this.elem;
            var dims = elem.getBoundingClientRect();
            var absScale = Math.abs(this.scale);
            this.dimensions = {
                width: dims.width,
                height: dims.height,
                left: $.css(elem, 'left', true) || 0,
                top: $.css(elem, 'top', true) || 0,
                border: {
                    top: $.css(elem, 'borderTopWidth', true) * absScale || 0,
                    bottom: $.css(elem, 'borderBottomWidth', true) * absScale || 0,
                    left: $.css(elem, 'borderLeftWidth', true) * absScale || 0,
                    right: $.css(elem, 'borderRightWidth', true) * absScale || 0
                },
                margin: {
                    top: $.css(elem, 'marginTop', true) * absScale || 0,
                    left: $.css(elem, 'marginLeft', true) * absScale || 0
                }
            };
        },
        reset: function(options) {
            options = createResetOptions(options);
            var matrix = this.setMatrix(this._origTransform, options);
            if (!options.silent) {
                this._trigger('reset', matrix);
            }
        },
        resetZoom: function(options) {
            options = createResetOptions(options);
            var origMatrix = this.getMatrix(this._origTransform);
            options.dValue = origMatrix[3];
            this.zoom(origMatrix[0], options);
        },
        resetPan: function(options) {
            var origMatrix = this.getMatrix(this._origTransform);
            this.pan(origMatrix[4], origMatrix[5], createResetOptions(options));
        },
        setTransform: function(transform) {
            var method = this.isSVG ? (transform === 'none' ? 'removeAttr' : 'attr') : 'style';
            var $set = this.$set;
            var i = $set.length;
            while (i--) {
                $[method]($set[i], 'transform', transform);
            }
        },
        getTransform: function(transform) {
            var $set = this.$set;
            var transformElem = $set[0];
            if (transform) {
                this.setTransform(transform);
            } else {
                transform = $[this.isSVG ? 'attr' : 'style'](transformElem, 'transform');
            }
            if (transform !== 'none' && !rmatrix.test(transform)) {
                this.setTransform(transform = $.css(transformElem, 'transform'));
            }
            return transform || 'none';
        },
        getMatrix: function(transform) {
            var matrix = rmatrix.exec(transform || this.getTransform());
            if (matrix) {
                matrix.shift();
            }
            return matrix || [1, 0, 0, 1, 0, 0];
        },
        setMatrix: function(matrix, options) {
            if (this.disabled) {
                return;
            }
            if (!options) {
                options = {};
            }
            if (typeof matrix === 'string') {
                matrix = this.getMatrix(matrix);
            }
            var scale = +matrix[0];
            var contain = typeof options.contain !== 'undefined' ? options.contain : this.options.contain;
            if (contain) {
                var dims = options.dims;
                if (!dims) {
                    this.resetDimensions();
                    dims = this.dimensions;
                }
                var container = this.container;
                var width = dims.width;
                var height = dims.height;
                var conWidth = container.width;
                var conHeight = container.height;
                var zoomAspectW = conWidth / width;
                var zoomAspectH = conHeight / height;
                var marginW = ((width - conWidth) / 2);
                var marginH = ((height - conHeight) / 2);
                if (contain === 'invert' || contain === 'automatic' && zoomAspectW < 1.01) {
                    matrix[4] = Math.max(Math.min(matrix[4], marginW), -marginW);
                } else {
                    matrix[4] = Math.min(Math.max(matrix[4], marginW), -marginW);
                }
                if (contain === 'invert' || (contain === 'automatic' && zoomAspectH < 1.01)) {
                    matrix[5] = Math.max(Math.min(matrix[5], marginH), -marginH);
                } else {
                    matrix[5] = Math.min(Math.max(matrix[5], marginH), -marginH);
                }
            }
            if (options.animate !== 'skip') {
                this.transition(!options.animate);
            }
            if (options.range) {
                this.$zoomRange.val(scale);
            }
            if (this.options.disableXAxis || this.options.disableYAxis) {
                var originalMatrix = this.getMatrix();
                if (this.options.disableXAxis) {
                    matrix[4] = originalMatrix[4];
                }
                if (this.options.disableYAxis) {
                    matrix[5] = originalMatrix[5];
                }
            }
            this.setTransform('matrix(' + matrix.join(',') + ')');
            this.scale = scale;
            this._checkPanWhenZoomed(scale);
            if (!options.silent) {
                this._trigger('change', matrix);
            }
            return matrix;
        },
        isPanning: function() {
            return this.panning;
        },
        transition: function(off) {
            if (!this._transition) {
                return;
            }
            var transition = off || !this.options.transition ? 'none' : this._transition;
            var $set = this.$set;
            var i = $set.length;
            while (i--) {
                if ($.style($set[i], 'transition') !== transition) {
                    $.style($set[i], 'transition', transition);
                }
            }
        },
        pan: function(x, y, options) {
            if (this.options.disablePan) {
                return;
            }
            if (!options) {
                options = {};
            }
            var matrix = options.matrix;
            if (!matrix) {
                matrix = this.getMatrix();
            }
            if (options.relative) {
                x += +matrix[4];
                y += +matrix[5];
            }
            matrix[4] = x;
            matrix[5] = y;
            this.setMatrix(matrix, options);
            if (!options.silent) {
                this._trigger('pan', matrix[4], matrix[5]);
            }
        },
        zoom: function(scale, opts) {
            if (typeof scale === 'object') {
                opts = scale;
                scale = null;
            } else if (!opts) {
                opts = {};
            }
            var options = $.extend({}, this.options, opts);
            if (options.disableZoom) {
                return;
            }
            var animate = false;
            var matrix = options.matrix || this.getMatrix();
            var startScale = +matrix[0];
            if (typeof scale !== 'number') {
                if (options.exponential && startScale - options.increment >= 1) {
                    scale = Math[scale ? 'sqrt' : 'pow'](startScale, 2);
                } else {
                    scale = startScale + (options.increment * (scale ? -1 : 1));
                }
                animate = true;
            }
            if (scale > options.maxScale) {
                scale = options.maxScale;
            } else if (scale < options.minScale) {
                scale = options.minScale;
            }
            var focal = options.focal;
            if (focal && !options.disablePan) {
                this.resetDimensions();
                var dims = options.dims = this.dimensions;
                var clientX = focal.clientX;
                var clientY = focal.clientY;
                if (!this.isSVG) {
                    clientX -= (dims.width / startScale) / 2;
                    clientY -= (dims.height / startScale) / 2;
                }
                var clientV = new Vector(clientX,clientY,1);
                var surfaceM = new Matrix(matrix);
                var o = this.parentOffset || this.$parent.offset();
                var offsetM = new Matrix(1,0,o.left - this.$doc.scrollLeft(),0,1,o.top - this.$doc.scrollTop());
                var surfaceV = surfaceM.inverse().x(offsetM.inverse().x(clientV));
                var scaleBy = scale / matrix[0];
                surfaceM = surfaceM.x(new Matrix([scaleBy, 0, 0, scaleBy, 0, 0]));
                clientV = offsetM.x(surfaceM.x(surfaceV));
                matrix[4] = +matrix[4] + (clientX - clientV.e(0));
                matrix[5] = +matrix[5] + (clientY - clientV.e(1));
            }
            matrix[0] = scale;
            matrix[3] = typeof options.dValue === 'number' ? options.dValue : scale;
            this.setMatrix(matrix, {
                animate: typeof options.animate === 'boolean' ? options.animate : animate,
                range: !options.noSetRange
            });
            if (!options.silent) {
                this._trigger('zoom', matrix[0], options);
            }
        },
        option: function(key, value) {
            var options;
            if (!key) {
                return $.extend({}, this.options);
            }
            if (typeof key === 'string') {
                if (arguments.length === 1) {
                    return this.options[key] !== undefined ? this.options[key] : null;
                }
                options = {};
                options[key] = value;
            } else {
                options = key;
            }
            this._setOptions(options);
        },
        _setOptions: function(options) {
            $.each(options, $.proxy(function(key, value) {
                switch (key) {
                    case 'disablePan':
                        this._resetStyle();
                    case '$zoomIn':
                    case '$zoomOut':
                    case '$zoomRange':
                    case '$reset':
                    case 'disableZoom':
                    case 'onStart':
                    case 'onChange':
                    case 'onZoom':
                    case 'onPan':
                    case 'onEnd':
                    case 'onReset':
                    case 'eventNamespace':
                        this._unbind();
                }
                this.options[key] = value;
                switch (key) {
                    case 'disablePan':
                        this._initStyle();
                    case '$zoomIn':
                    case '$zoomOut':
                    case '$zoomRange':
                    case '$reset':
                        this[key] = value;
                    case 'disableZoom':
                    case 'onStart':
                    case 'onChange':
                    case 'onZoom':
                    case 'onPan':
                    case 'onEnd':
                    case 'onReset':
                    case 'eventNamespace':
                        this._bind();
                        break;
                    case 'cursor':
                        $.style(this.elem, 'cursor', value);
                        break;
                    case 'minScale':
                        this.$zoomRange.attr('min', value);
                        break;
                    case 'maxScale':
                        this.$zoomRange.attr('max', value);
                        break;
                    case 'rangeStep':
                        this.$zoomRange.attr('step', value);
                        break;
                    case 'startTransform':
                        this._buildTransform();
                        break;
                    case 'duration':
                    case 'easing':
                        this._buildTransition();
                    case 'transition':
                        this.transition();
                        break;
                    case 'panOnlyWhenZoomed':
                        this._checkPanWhenZoomed();
                        break;
                    case '$set':
                        if (value instanceof $ && value.length) {
                            this.$set = value;
                            this._initStyle();
                            this._buildTransform();
                        }
                }
            }, this));
        },
        _checkPanWhenZoomed: function(scale) {
            if (!scale) {
                scale = this.getMatrix()[0];
            }
            var options = this.options;
            if (options.panOnlyWhenZoomed) {
                var toDisable = scale === options.minScale;
                if (options.disablePan !== toDisable) {
                    this.option('disablePan', toDisable);
                }
            }
        },
        _initStyle: function() {
            var styles = {
                'transform-origin': this.isSVG ? '0 0' : '50% 50%'
            };
            if (!this.options.disablePan) {
                styles.cursor = this.options.cursor;
            }
            this.$set.css(styles);
            var $parent = this.$parent;
            if ($parent.length && !$.nodeName($parent[0], 'body')) {
                styles = {
                    overflow: 'hidden'
                };
                if ($parent.css('position') === 'static') {
                    styles.position = 'relative';
                }
                $parent.css(styles);
            }
        },
        _resetStyle: function() {
            this.$elem.css({
                'cursor': '',
                'transition': ''
            });
            this.$parent.css({
                'overflow': '',
                'position': ''
            });
        },
        _bind: function() {
            var self = this;
            var options = this.options;
            var ns = options.eventNamespace;
            var str_start = 'touchstart' + ns + ' mousedown' + ns;
            var str_click = 'touchend' + ns + ' click' + ns;
            var events = {};
            var $reset = this.$reset;
            var $zoomRange = this.$zoomRange;
            $.each(['Start', 'Change', 'Zoom', 'Pan', 'End', 'Reset'], function() {
                var m = options['on' + this];
                if ($.isFunction(m)) {
                    events['panzoom' + this.toLowerCase() + ns] = m;
                }
            });
            if (!options.disablePan || !options.disableZoom) {
                events[str_start] = function(e) {
                    var touches;
                    if (e.type === 'touchstart' ? (touches = e.touches || e.originalEvent.touches) && ((touches.length === 1 && !options.disablePan) || touches.length === 2) : !options.disablePan && e.which === options.which) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._startMove(e, touches);
                    }
                }
                ;
                if (options.which === 3) {
                    events.contextmenu = false;
                }
            }
            this.$elem.on(events);
            if ($reset.length) {
                $reset.on(str_click, function(e) {
                    e.preventDefault();
                    self.reset();
                });
            }
            if ($zoomRange.length) {
                $zoomRange.attr({
                    step: options.rangeStep === Panzoom.defaults.rangeStep && $zoomRange.attr('step') || options.rangeStep,
                    min: options.minScale,
                    max: options.maxScale
                }).prop({
                    value: this.getMatrix()[0]
                });
            }
            if (options.disableZoom) {
                return;
            }
            var $zoomIn = this.$zoomIn;
            var $zoomOut = this.$zoomOut;
            if ($zoomIn.length && $zoomOut.length) {
                $zoomIn.on(str_click, function(e) {
                    e.preventDefault();
                    self.zoom();
                });
                $zoomOut.on(str_click, function(e) {
                    e.preventDefault();
                    self.zoom(true);
                });
            }
            if ($zoomRange.length) {
                events = {};
                events['mousedown' + ns] = function() {
                    self.transition(true);
                }
                ;
                events[(supportsInputEvent ? 'input' : 'change') + ns] = function() {
                    self.zoom(+this.value, {
                        noSetRange: true
                    });
                }
                ;
                $zoomRange.on(events);
            }
        },
        _unbind: function() {
            this.$elem.add(this.$zoomIn).add(this.$zoomOut).add(this.$reset).off(this.options.eventNamespace);
        },
        _buildTransform: function() {
            return this._origTransform = this.getTransform(this.options.startTransform);
        },
        _buildTransition: function() {
            if (this._transform) {
                var options = this.options;
                this._transition = this._transform + ' ' + options.duration + 'ms ' + options.easing;
            }
        },
        _getDistance: function(touches) {
            var touch1 = touches[0];
            var touch2 = touches[1];
            return Math.sqrt(Math.pow(Math.abs(touch2.clientX - touch1.clientX), 2) + Math.pow(Math.abs(touch2.clientY - touch1.clientY), 2));
        },
        _getMiddle: function(touches) {
            var touch1 = touches[0];
            var touch2 = touches[1];
            return {
                clientX: ((touch2.clientX - touch1.clientX) / 2) + touch1.clientX,
                clientY: ((touch2.clientY - touch1.clientY) / 2) + touch1.clientY
            };
        },
        _trigger: function(event) {
            if (typeof event === 'string') {
                event = 'panzoom' + event;
            }
            this.$elem.triggerHandler(event, [this].concat(slice.call(arguments, 1)));
        },
        _startMove: function(event, touches) {
            var move, moveEvent, endEvent, startDistance, startScale, startMiddle, startPageX, startPageY, touch;
            var self = this;
            var options = this.options;
            var ns = options.eventNamespace;
            var matrix = this.getMatrix();
            var original = matrix.slice(0);
            var origPageX = +original[4];
            var origPageY = +original[5];
            var panOptions = {
                matrix: matrix,
                animate: 'skip'
            };
            if (event.type === 'touchstart') {
                moveEvent = 'touchmove';
                endEvent = 'touchend';
            } else {
                moveEvent = 'mousemove';
                endEvent = 'mouseup';
            }
            moveEvent += ns;
            endEvent += ns;
            this.transition(true);
            this.panning = true;
            this._trigger('start', event, touches);
            if (touches && touches.length === 2) {
                startDistance = this._getDistance(touches);
                startScale = +matrix[0];
                startMiddle = this._getMiddle(touches);
                move = function(e) {
                    e.preventDefault();
                    touches = e.touches || e.originalEvent.touches;
                    var middle = self._getMiddle(touches);
                    var diff = self._getDistance(touches) - startDistance;
                    self.zoom(diff * (options.increment / 100) + startScale, {
                        focal: middle,
                        matrix: matrix,
                        animate: false
                    });
                    self.pan(+matrix[4] + middle.clientX - startMiddle.clientX, +matrix[5] + middle.clientY - startMiddle.clientY, panOptions);
                    startMiddle = middle;
                }
                ;
            } else {
                if (touches && (touch = touches[0])) {
                    startPageX = touch.pageX;
                    startPageY = touch.pageY;
                } else {
                    startPageX = event.pageX;
                    startPageY = event.pageY;
                }
                move = function(e) {
                    e.preventDefault();
                    touches = e.touches || e.originalEvent.touches;
                    var coords;
                    if (touches) {
                        coords = touches[0] || {
                            pageX: 0,
                            pageY: 0
                        };
                    } else {
                        coords = e;
                    }
                    self.pan(origPageX + coords.pageX - startPageX, origPageY + coords.pageY - startPageY, panOptions);
                }
                ;
            }
            $(document).off(ns).on(moveEvent, move).on(endEvent, function(e) {
                e.preventDefault();
                $(this).off(ns);
                self.panning = false;
                e.type = 'panzoomend';
                self._trigger(e, matrix, !matrixEquals(matrix, original));
            });
        }
    };
    $.Panzoom = Panzoom;
    $.fn.panzoom = function(options) {
        var instance, args, m, ret;
        if (typeof options === 'string') {
            ret = [];
            args = slice.call(arguments, 1);
            this.each(function() {
                instance = $.data(this, datakey);
                if (!instance) {
                    ret.push(undefined);
                } else if (options.charAt(0) !== '_' && typeof (m = instance[options]) === 'function' && (m = m.apply(instance, args)) !== undefined) {
                    ret.push(m);
                }
            });
            return ret.length ? (ret.length === 1 ? ret[0] : ret) : this;
        }
        return this.each(function() {
            new Panzoom(this,options);
        });
    }
    ;
    return Panzoom;
}));
