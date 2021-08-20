
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules\svelte-fa\src\fa.svelte generated by Svelte v3.42.1 */

    const file$f = "node_modules\\svelte-fa\\src\\fa.svelte";

    // (104:0) {#if i[4]}
    function create_if_block(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let svg_viewBox_value;

    	function select_block_type(ctx, dirty) {
    		if (typeof /*i*/ ctx[8][4] == 'string') return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			if_block.c();
    			attr_dev(g0, "transform", /*transform*/ ctx[10]);
    			add_location(g0, file$f, 116, 6, 2040);
    			attr_dev(g1, "transform", "translate(256 256)");
    			add_location(g1, file$f, 113, 4, 1988);
    			attr_dev(svg, "id", /*id*/ ctx[1]);
    			attr_dev(svg, "class", /*clazz*/ ctx[0]);
    			attr_dev(svg, "style", /*s*/ ctx[9]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = `0 0 ${/*i*/ ctx[8][0]} ${/*i*/ ctx[8][1]}`);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$f, 104, 2, 1821);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			if_block.m(g0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g0, null);
    				}
    			}

    			if (dirty & /*transform*/ 1024) {
    				attr_dev(g0, "transform", /*transform*/ ctx[10]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(svg, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*clazz*/ 1) {
    				attr_dev(svg, "class", /*clazz*/ ctx[0]);
    			}

    			if (dirty & /*s*/ 512) {
    				attr_dev(svg, "style", /*s*/ ctx[9]);
    			}

    			if (dirty & /*i*/ 256 && svg_viewBox_value !== (svg_viewBox_value = `0 0 ${/*i*/ ctx[8][0]} ${/*i*/ ctx[8][1]}`)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(104:0) {#if i[4]}",
    		ctx
    	});

    	return block;
    }

    // (124:8) {:else}
    function create_else_block(ctx) {
    	let path0;
    	let path0_d_value;
    	let path0_fill_value;
    	let path0_fill_opacity_value;
    	let path1;
    	let path1_d_value;
    	let path1_fill_value;
    	let path1_fill_opacity_value;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", path0_d_value = /*i*/ ctx[8][4][0]);
    			attr_dev(path0, "fill", path0_fill_value = /*secondaryColor*/ ctx[4] || /*color*/ ctx[2] || 'currentColor');

    			attr_dev(path0, "fill-opacity", path0_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*primaryOpacity*/ ctx[5]
    			: /*secondaryOpacity*/ ctx[6]);

    			attr_dev(path0, "transform", "translate(-256 -256)");
    			add_location(path0, file$f, 124, 10, 2274);
    			attr_dev(path1, "d", path1_d_value = /*i*/ ctx[8][4][1]);
    			attr_dev(path1, "fill", path1_fill_value = /*primaryColor*/ ctx[3] || /*color*/ ctx[2] || 'currentColor');

    			attr_dev(path1, "fill-opacity", path1_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*secondaryOpacity*/ ctx[6]
    			: /*primaryOpacity*/ ctx[5]);

    			attr_dev(path1, "transform", "translate(-256 -256)");
    			add_location(path1, file$f, 130, 10, 2517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 256 && path0_d_value !== (path0_d_value = /*i*/ ctx[8][4][0])) {
    				attr_dev(path0, "d", path0_d_value);
    			}

    			if (dirty & /*secondaryColor, color*/ 20 && path0_fill_value !== (path0_fill_value = /*secondaryColor*/ ctx[4] || /*color*/ ctx[2] || 'currentColor')) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*swapOpacity, primaryOpacity, secondaryOpacity*/ 224 && path0_fill_opacity_value !== (path0_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*primaryOpacity*/ ctx[5]
    			: /*secondaryOpacity*/ ctx[6])) {
    				attr_dev(path0, "fill-opacity", path0_fill_opacity_value);
    			}

    			if (dirty & /*i*/ 256 && path1_d_value !== (path1_d_value = /*i*/ ctx[8][4][1])) {
    				attr_dev(path1, "d", path1_d_value);
    			}

    			if (dirty & /*primaryColor, color*/ 12 && path1_fill_value !== (path1_fill_value = /*primaryColor*/ ctx[3] || /*color*/ ctx[2] || 'currentColor')) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*swapOpacity, secondaryOpacity, primaryOpacity*/ 224 && path1_fill_opacity_value !== (path1_fill_opacity_value = /*swapOpacity*/ ctx[7] != false
    			? /*secondaryOpacity*/ ctx[6]
    			: /*primaryOpacity*/ ctx[5])) {
    				attr_dev(path1, "fill-opacity", path1_fill_opacity_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(124:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (118:8) {#if typeof i[4] == 'string'}
    function create_if_block_1(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*i*/ ctx[8][4]);
    			attr_dev(path, "fill", path_fill_value = /*color*/ ctx[2] || /*primaryColor*/ ctx[3] || 'currentColor');
    			attr_dev(path, "transform", "translate(-256 -256)");
    			add_location(path, file$f, 118, 10, 2104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 256 && path_d_value !== (path_d_value = /*i*/ ctx[8][4])) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*color, primaryColor*/ 12 && path_fill_value !== (path_fill_value = /*color*/ ctx[2] || /*primaryColor*/ ctx[3] || 'currentColor')) {
    				attr_dev(path, "fill", path_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(118:8) {#if typeof i[4] == 'string'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[8][4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*i*/ ctx[8][4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fa', slots, []);
    	let { class: clazz = '' } = $$props;
    	let { id = '' } = $$props;
    	let { style = '' } = $$props;
    	let { icon } = $$props;
    	let { fw = false } = $$props;
    	let { flip = false } = $$props;
    	let { pull = '' } = $$props;
    	let { rotate = '' } = $$props;
    	let { size = '' } = $$props;
    	let { color = '' } = $$props;
    	let { primaryColor = '' } = $$props;
    	let { secondaryColor = '' } = $$props;
    	let { primaryOpacity = 1 } = $$props;
    	let { secondaryOpacity = 0.4 } = $$props;
    	let { swapOpacity = false } = $$props;
    	let i;
    	let s;
    	let transform;

    	const writable_props = [
    		'class',
    		'id',
    		'style',
    		'icon',
    		'fw',
    		'flip',
    		'pull',
    		'rotate',
    		'size',
    		'color',
    		'primaryColor',
    		'secondaryColor',
    		'primaryOpacity',
    		'secondaryOpacity',
    		'swapOpacity'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fa> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, clazz = $$props.class);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('style' in $$props) $$invalidate(11, style = $$props.style);
    		if ('icon' in $$props) $$invalidate(12, icon = $$props.icon);
    		if ('fw' in $$props) $$invalidate(13, fw = $$props.fw);
    		if ('flip' in $$props) $$invalidate(14, flip = $$props.flip);
    		if ('pull' in $$props) $$invalidate(15, pull = $$props.pull);
    		if ('rotate' in $$props) $$invalidate(16, rotate = $$props.rotate);
    		if ('size' in $$props) $$invalidate(17, size = $$props.size);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('primaryColor' in $$props) $$invalidate(3, primaryColor = $$props.primaryColor);
    		if ('secondaryColor' in $$props) $$invalidate(4, secondaryColor = $$props.secondaryColor);
    		if ('primaryOpacity' in $$props) $$invalidate(5, primaryOpacity = $$props.primaryOpacity);
    		if ('secondaryOpacity' in $$props) $$invalidate(6, secondaryOpacity = $$props.secondaryOpacity);
    		if ('swapOpacity' in $$props) $$invalidate(7, swapOpacity = $$props.swapOpacity);
    	};

    	$$self.$capture_state = () => ({
    		clazz,
    		id,
    		style,
    		icon,
    		fw,
    		flip,
    		pull,
    		rotate,
    		size,
    		color,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		s,
    		transform
    	});

    	$$self.$inject_state = $$props => {
    		if ('clazz' in $$props) $$invalidate(0, clazz = $$props.clazz);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('style' in $$props) $$invalidate(11, style = $$props.style);
    		if ('icon' in $$props) $$invalidate(12, icon = $$props.icon);
    		if ('fw' in $$props) $$invalidate(13, fw = $$props.fw);
    		if ('flip' in $$props) $$invalidate(14, flip = $$props.flip);
    		if ('pull' in $$props) $$invalidate(15, pull = $$props.pull);
    		if ('rotate' in $$props) $$invalidate(16, rotate = $$props.rotate);
    		if ('size' in $$props) $$invalidate(17, size = $$props.size);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('primaryColor' in $$props) $$invalidate(3, primaryColor = $$props.primaryColor);
    		if ('secondaryColor' in $$props) $$invalidate(4, secondaryColor = $$props.secondaryColor);
    		if ('primaryOpacity' in $$props) $$invalidate(5, primaryOpacity = $$props.primaryOpacity);
    		if ('secondaryOpacity' in $$props) $$invalidate(6, secondaryOpacity = $$props.secondaryOpacity);
    		if ('swapOpacity' in $$props) $$invalidate(7, swapOpacity = $$props.swapOpacity);
    		if ('i' in $$props) $$invalidate(8, i = $$props.i);
    		if ('s' in $$props) $$invalidate(9, s = $$props.s);
    		if ('transform' in $$props) $$invalidate(10, transform = $$props.transform);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 4096) {
    			$$invalidate(8, i = icon && icon.icon || [0, 0, '', [], '']);
    		}

    		if ($$self.$$.dirty & /*fw, pull, size, style*/ 174080) {
    			{
    				let float;
    				let width;
    				const height = '1em';
    				let lineHeight;
    				let fontSize;
    				let textAlign;
    				let verticalAlign = '-.125em';
    				const overflow = 'visible';

    				if (fw) {
    					textAlign = 'center';
    					width = '1.25em';
    				}

    				if (pull) {
    					float = pull;
    				}

    				if (size) {
    					if (size == 'lg') {
    						fontSize = '1.33333em';
    						lineHeight = '.75em';
    						verticalAlign = '-.225em';
    					} else if (size == 'xs') {
    						fontSize = '.75em';
    					} else if (size == 'sm') {
    						fontSize = '.875em';
    					} else {
    						fontSize = size.replace('x', 'em');
    					}
    				}

    				const styleObj = {
    					float,
    					width,
    					height,
    					'line-height': lineHeight,
    					'font-size': fontSize,
    					'text-align': textAlign,
    					'vertical-align': verticalAlign,
    					overflow
    				};

    				let styleStr = '';

    				for (const prop in styleObj) {
    					if (styleObj[prop]) {
    						styleStr += `${prop}:${styleObj[prop]};`;
    					}
    				}

    				$$invalidate(9, s = styleStr + style);
    			}
    		}

    		if ($$self.$$.dirty & /*flip, rotate*/ 81920) {
    			{
    				let t = '';

    				if (flip) {
    					let flipX = 1;
    					let flipY = 1;

    					if (flip == 'horizontal') {
    						flipX = -1;
    					} else if (flip == 'vertical') {
    						flipY = -1;
    					} else {
    						flipX = flipY = -1;
    					}

    					t += ` scale(${flipX} ${flipY})`;
    				}

    				if (rotate) {
    					t += ` rotate(${rotate} 0 0)`;
    				}

    				$$invalidate(10, transform = t);
    			}
    		}
    	};

    	return [
    		clazz,
    		id,
    		color,
    		primaryColor,
    		secondaryColor,
    		primaryOpacity,
    		secondaryOpacity,
    		swapOpacity,
    		i,
    		s,
    		transform,
    		style,
    		icon,
    		fw,
    		flip,
    		pull,
    		rotate,
    		size
    	];
    }

    class Fa extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			class: 0,
    			id: 1,
    			style: 11,
    			icon: 12,
    			fw: 13,
    			flip: 14,
    			pull: 15,
    			rotate: 16,
    			size: 17,
    			color: 2,
    			primaryColor: 3,
    			secondaryColor: 4,
    			primaryOpacity: 5,
    			secondaryOpacity: 6,
    			swapOpacity: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fa",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[12] === undefined && !('icon' in props)) {
    			console.warn("<Fa> was created without expected prop 'icon'");
    		}
    	}

    	get class() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fw() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fw(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pull() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pull(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryColor() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryColor(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swapOpacity() {
    		throw new Error("<Fa>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swapOpacity(value) {
    		throw new Error("<Fa>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const name = "Nikhil Malhotra";
    const email = "nikhil.malhotra42@gmail.com";
    const phonenum = "519-731-3123";
    const github = "https://github.com/NikhilM42";
    const linkedin = "https://www.linkedin.com/in/nikhilm42/";

    const navbarmenu = ["ABOUT" ,"KNOWLEDGE", "CURRENT", "EXPERIENCE", "PROJECTS"];

    const languages = [
      {
        "name":"C++",
        "level":3,
        "comment":"I have never had to use this in a professional setting aside from a Co-op at Blackberry, originally coding in C++ 98. I'm updating this skill by going through a textbook into C++ 11/14. I'll jump into a personal project shortly after, probably something robot related.",
      },
      {
        "name":"Python",
        "level":3,
        "comment":"I started learning Python as I had heard a lot about it by word of mouth. This was quite a fun and straight forward language. It definitly pushes and promotes code coding practices",
      },
      {
        "name":"Javascript",
        "level":3,
        "comment":"I got into Javascript by accident through a co-op where I needed to generate a mvp website. I didn't come back to it until recently when I was exploring the best way to interface with AutoCAD. I'm glad I came back because it looks like I didn't learn enough.",
      },
      {
        "name":"G-Code",
        "level":4,
        "comment":"I ended up learning this at my first role as a Project Engineer. I kept on losing my manufacturing techs as a resource so I ended up having to fix and generate new CNC programs. This language is quite simliar to Assembly and SVG. The language has general codes that all machines understand and machine specific codes that only the machine being worked on will understand.",
      },
      {
        "name":"AutoLISP",
        "level":4,
        "comment":"Why someone thought this language should exist as part of the AutoCAD suite baffles me. It is quite simple but too simple I am quite glad that there are other options as the brackets really got to me after a while of coding in the built in IDE, I got severe VBA PTSD flashbacks.",
      },
      {
        "name":"MATLAB",
        "level":3,
        "comment":"Most of my exposure to this language has been in University, manufacturing doesnt tend to do vector math very often and neither do I. Otherwise I enjoyed working in this language, no crazy quirks and quite powerful",
      },
      {
        "name":"SQL",
        "level":2,
        "comment":"Databases have been quite touch and go for me. I've never had a project that required a heavy use of SQL so my understanding of the limitations of the technology is limited (no pun intended). I'll end up implementing some kind of highscore system on this website to learn this in more depth.",
      },
      {
        "name":"Latex",
        "level":2,
        "comment":"A lot of my classmates back in University were using this language for resume building and research papers. I'll admit I wasnt too confident in myself so I stuck with my trusty Word. Recently I decided why not give it a shot with my latest resumes. I have to admit it is quite fun to watch my content just dance into different formats as I switch different variables. However I am probably going to try for a web based resume now.",
      },
      {
        "name":"HTML",
        "level":3,
        "comment":"Similiar to Javascript I learned when making the mvp website. I know enough to be dangerous at this point."
      },
      {
        "name":"CSS",
        "level":3,
        "comment":"Similiar to Javascript I learned when making the mvp website. I thought I knew enough but I'm now learning the toolsets that make css coding a bit easier."
      }
    ];

    /*!
     * Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     */
    var faEnvelope = {
      prefix: 'far',
      iconName: 'envelope',
      icon: [512, 512, [], "f0e0", "M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z"]
    };

    /*!
     * Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     */
    var faCode = {
      prefix: 'fas',
      iconName: 'code',
      icon: [640, 512, [], "f121", "M278.9 511.5l-61-17.7c-6.4-1.8-10-8.5-8.2-14.9L346.2 8.7c1.8-6.4 8.5-10 14.9-8.2l61 17.7c6.4 1.8 10 8.5 8.2 14.9L293.8 503.3c-1.9 6.4-8.5 10.1-14.9 8.2zm-114-112.2l43.5-46.4c4.6-4.9 4.3-12.7-.8-17.2L117 256l90.6-79.7c5.1-4.5 5.5-12.3.8-17.2l-43.5-46.4c-4.5-4.8-12.1-5.1-17-.5L3.8 247.2c-5.1 4.7-5.1 12.8 0 17.5l144.1 135.1c4.9 4.6 12.5 4.4 17-.5zm327.2.6l144.1-135.1c5.1-4.7 5.1-12.8 0-17.5L492.1 112.1c-4.8-4.5-12.4-4.3-17 .5L431.6 159c-4.6 4.9-4.3 12.7.8 17.2L523 256l-90.6 79.7c-5.1 4.5-5.5 12.3-.8 17.2l43.5 46.4c4.5 4.9 12.1 5.1 17 .6z"]
    };
    var faCrop = {
      prefix: 'fas',
      iconName: 'crop',
      icon: [512, 512, [], "f125", "M488 352h-40V109.25l59.31-59.31c6.25-6.25 6.25-16.38 0-22.63L484.69 4.69c-6.25-6.25-16.38-6.25-22.63 0L402.75 64H192v96h114.75L160 306.75V24c0-13.26-10.75-24-24-24H88C74.75 0 64 10.74 64 24v40H24C10.75 64 0 74.74 0 88v48c0 13.25 10.75 24 24 24h40v264c0 13.25 10.75 24 24 24h232v-96H205.25L352 205.25V488c0 13.25 10.75 24 24 24h48c13.25 0 24-10.75 24-24v-40h40c13.25 0 24-10.75 24-24v-48c0-13.26-10.75-24-24-24z"]
    };
    var faPhone = {
      prefix: 'fas',
      iconName: 'phone',
      icon: [512, 512, [], "f095", "M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"]
    };
    var faTools = {
      prefix: 'fas',
      iconName: 'tools',
      icon: [512, 512, [], "f7d9", "M501.1 395.7L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7zM331.7 225c28.3 0 54.9 11 74.9 31l19.4 19.4c15.8-6.9 30.8-16.5 43.8-29.5 37.1-37.1 49.7-89.3 37.9-136.7-2.2-9-13.5-12.1-20.1-5.5l-74.4 74.4-67.9-11.3L334 98.9l74.4-74.4c6.6-6.6 3.4-17.9-5.7-20.2-47.4-11.7-99.6.9-136.6 37.9-28.5 28.5-41.9 66.1-41.2 103.6l82.1 82.1c8.1-1.9 16.5-2.9 24.7-2.9zm-103.9 82l-56.7-56.7L18.7 402.8c-25 25-25 65.5 0 90.5s65.5 25 90.5 0l123.6-123.6c-7.6-19.9-9.9-41.6-5-62.7zM64 472c-13.2 0-24-10.8-24-24 0-13.3 10.7-24 24-24s24 10.7 24 24c0 13.2-10.7 24-24 24z"]
    };

    /*!
     * Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     */
    var faGithub = {
      prefix: 'fab',
      iconName: 'github',
      icon: [496, 512, [], "f09b", "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"]
    };
    var faLinkedinIn = {
      prefix: 'fab',
      iconName: 'linkedin-in',
      icon: [448, 512, [], "f0e1", "M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"]
    };

    /* src\components\ContactContent.svelte generated by Svelte v3.42.1 */
    const file$e = "src\\components\\ContactContent.svelte";

    function create_fragment$e(ctx) {
    	let div5;
    	let div0;
    	let a0;
    	let fa0;
    	let t0;
    	let a1;
    	let fa1;
    	let t1;
    	let a2;
    	let fa2;
    	let t2;
    	let a3;
    	let fa3;
    	let t3;
    	let div1;
    	let a4;
    	let t4;
    	let a5;
    	let fa4;
    	let t5;
    	let div2;
    	let a6;
    	let t6;
    	let a7;
    	let fa5;
    	let t7;
    	let div3;
    	let a8;
    	let t8;
    	let a9;
    	let fa6;
    	let t9;
    	let div4;
    	let a10;
    	let t10;
    	let a11;
    	let fa7;
    	let div5_class_value;
    	let current;

    	fa0 = new Fa({
    			props: { class: "icon", icon: faEnvelope },
    			$$inline: true
    		});

    	fa1 = new Fa({
    			props: { class: "icon", icon: faPhone },
    			$$inline: true
    		});

    	fa2 = new Fa({
    			props: { class: "icon", icon: faGithub },
    			$$inline: true
    		});

    	fa3 = new Fa({
    			props: { class: "icon", icon: faLinkedinIn },
    			$$inline: true
    		});

    	fa4 = new Fa({
    			props: { class: "icon", icon: faEnvelope },
    			$$inline: true
    		});

    	fa5 = new Fa({
    			props: { class: "icon", icon: faPhone },
    			$$inline: true
    		});

    	fa6 = new Fa({
    			props: { class: "icon", icon: faGithub },
    			$$inline: true
    		});

    	fa7 = new Fa({
    			props: { class: "icon", icon: faLinkedinIn },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			create_component(fa0.$$.fragment);
    			t0 = space();
    			a1 = element("a");
    			create_component(fa1.$$.fragment);
    			t1 = space();
    			a2 = element("a");
    			create_component(fa2.$$.fragment);
    			t2 = space();
    			a3 = element("a");
    			create_component(fa3.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			a4 = element("a");
    			t4 = text(email);
    			a5 = element("a");
    			create_component(fa4.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			a6 = element("a");
    			t6 = text(phonenum);
    			a7 = element("a");
    			create_component(fa5.$$.fragment);
    			t7 = space();
    			div3 = element("div");
    			a8 = element("a");
    			t8 = text(github);
    			a9 = element("a");
    			create_component(fa6.$$.fragment);
    			t9 = space();
    			div4 = element("div");
    			a10 = element("a");
    			t10 = text(linkedin);
    			a11 = element("a");
    			create_component(fa7.$$.fragment);
    			attr_dev(a0, "class", "containIcon");
    			attr_dev(a0, "href", "mailto:" + email);
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$e, 10, 4, 445);
    			attr_dev(a1, "class", "containIcon");
    			attr_dev(a1, "href", "tel:" + phonenum);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$e, 11, 4, 552);
    			attr_dev(a2, "class", "containIcon");
    			attr_dev(a2, "href", github);
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$e, 12, 4, 656);
    			attr_dev(a3, "class", "containIcon");
    			attr_dev(a3, "href", linkedin);
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$e, 13, 4, 753);
    			attr_dev(div0, "class", "minrow svelte-1914pti");
    			add_location(div0, file$e, 9, 2, 419);
    			attr_dev(a4, "class", "text svelte-1914pti");
    			attr_dev(a4, "href", "mailto:" + email);
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$e, 15, 19, 881);
    			attr_dev(a5, "class", "containIcon svelte-1914pti");
    			attr_dev(a5, "href", "mailto:" + email);
    			attr_dev(a5, "target", "_blank");
    			add_location(a5, file$e, 15, 84, 946);
    			attr_dev(div1, "class", "row svelte-1914pti");
    			add_location(div1, file$e, 15, 2, 864);
    			attr_dev(a6, "class", "text svelte-1914pti");
    			attr_dev(a6, "href", "tel:" + phonenum);
    			attr_dev(a6, "target", "_blank");
    			add_location(a6, file$e, 16, 19, 1074);
    			attr_dev(a7, "class", "containIcon svelte-1914pti");
    			attr_dev(a7, "href", "tel:" + phonenum);
    			attr_dev(a7, "target", "_blank");
    			add_location(a7, file$e, 16, 87, 1142);
    			attr_dev(div2, "class", "row svelte-1914pti");
    			add_location(div2, file$e, 16, 2, 1057);
    			attr_dev(a8, "class", "text svelte-1914pti");
    			attr_dev(a8, "href", github);
    			attr_dev(a8, "target", "_blank");
    			add_location(a8, file$e, 17, 19, 1267);
    			attr_dev(a9, "class", "containIcon svelte-1914pti");
    			attr_dev(a9, "href", github);
    			attr_dev(a9, "target", "_blank");
    			add_location(a9, file$e, 17, 77, 1325);
    			attr_dev(div3, "class", "row svelte-1914pti");
    			add_location(div3, file$e, 17, 2, 1250);
    			attr_dev(a10, "class", "text svelte-1914pti");
    			attr_dev(a10, "href", linkedin);
    			attr_dev(a10, "target", "_blank");
    			add_location(a10, file$e, 18, 19, 1443);
    			attr_dev(a11, "class", "containIcon svelte-1914pti");
    			attr_dev(a11, "href", linkedin);
    			attr_dev(a11, "target", "_blank");
    			add_location(a11, file$e, 18, 81, 1505);
    			attr_dev(div4, "class", "row svelte-1914pti");
    			add_location(div4, file$e, 18, 2, 1426);
    			attr_dev(div5, "class", div5_class_value = "contactContent " + (/*maxMode*/ ctx[0] ? "" : "minMode") + " svelte-1914pti");
    			add_location(div5, file$e, 8, 0, 362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, a0);
    			mount_component(fa0, a0, null);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			mount_component(fa1, a1, null);
    			append_dev(div0, t1);
    			append_dev(div0, a2);
    			mount_component(fa2, a2, null);
    			append_dev(div0, t2);
    			append_dev(div0, a3);
    			mount_component(fa3, a3, null);
    			append_dev(div5, t3);
    			append_dev(div5, div1);
    			append_dev(div1, a4);
    			append_dev(a4, t4);
    			append_dev(div1, a5);
    			mount_component(fa4, a5, null);
    			append_dev(div5, t5);
    			append_dev(div5, div2);
    			append_dev(div2, a6);
    			append_dev(a6, t6);
    			append_dev(div2, a7);
    			mount_component(fa5, a7, null);
    			append_dev(div5, t7);
    			append_dev(div5, div3);
    			append_dev(div3, a8);
    			append_dev(a8, t8);
    			append_dev(div3, a9);
    			mount_component(fa6, a9, null);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, a10);
    			append_dev(a10, t10);
    			append_dev(div4, a11);
    			mount_component(fa7, a11, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*maxMode*/ 1 && div5_class_value !== (div5_class_value = "contactContent " + (/*maxMode*/ ctx[0] ? "" : "minMode") + " svelte-1914pti")) {
    				attr_dev(div5, "class", div5_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa0.$$.fragment, local);
    			transition_in(fa1.$$.fragment, local);
    			transition_in(fa2.$$.fragment, local);
    			transition_in(fa3.$$.fragment, local);
    			transition_in(fa4.$$.fragment, local);
    			transition_in(fa5.$$.fragment, local);
    			transition_in(fa6.$$.fragment, local);
    			transition_in(fa7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa0.$$.fragment, local);
    			transition_out(fa1.$$.fragment, local);
    			transition_out(fa2.$$.fragment, local);
    			transition_out(fa3.$$.fragment, local);
    			transition_out(fa4.$$.fragment, local);
    			transition_out(fa5.$$.fragment, local);
    			transition_out(fa6.$$.fragment, local);
    			transition_out(fa7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(fa0);
    			destroy_component(fa1);
    			destroy_component(fa2);
    			destroy_component(fa3);
    			destroy_component(fa4);
    			destroy_component(fa5);
    			destroy_component(fa6);
    			destroy_component(fa7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContactContent', slots, []);
    	let { maxMode = true } = $$props;
    	const writable_props = ['maxMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContactContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('maxMode' in $$props) $$invalidate(0, maxMode = $$props.maxMode);
    	};

    	$$self.$capture_state = () => ({
    		Fa,
    		email,
    		phonenum,
    		github,
    		linkedin,
    		faEnvelope,
    		faPhone,
    		faGithub,
    		faLinkedinIn,
    		maxMode
    	});

    	$$self.$inject_state = $$props => {
    		if ('maxMode' in $$props) $$invalidate(0, maxMode = $$props.maxMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [maxMode];
    }

    class ContactContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { maxMode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactContent",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get maxMode() {
    		throw new Error("<ContactContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxMode(value) {
    		throw new Error("<ContactContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Contact.svelte generated by Svelte v3.42.1 */
    const file$d = "src\\components\\Contact.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let contactcontent;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	contactcontent = new ContactContent({
    			props: { maxMode: /*defaultMode*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${name}`;
    			t1 = space();
    			create_component(contactcontent.$$.fragment);
    			attr_dev(h1, "class", "contactTitle svelte-1s4h7xd");
    			add_location(h1, file$d, 7, 4, 249);
    			attr_dev(div0, "class", "contact_card svelte-1s4h7xd");
    			add_location(div0, file$d, 6, 2, 217);
    			attr_dev(div1, "class", div1_class_value = "left " + (/*defaultMode*/ ctx[0] ? "default" : "notdefault") + " svelte-1s4h7xd");
    			add_location(div1, file$d, 5, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			mount_component(contactcontent, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(h1, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const contactcontent_changes = {};
    			if (dirty & /*defaultMode*/ 1) contactcontent_changes.maxMode = /*defaultMode*/ ctx[0];
    			contactcontent.$set(contactcontent_changes);

    			if (!current || dirty & /*defaultMode*/ 1 && div1_class_value !== (div1_class_value = "left " + (/*defaultMode*/ ctx[0] ? "default" : "notdefault") + " svelte-1s4h7xd")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(contactcontent);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	let { defaultMode = true } = $$props;
    	const writable_props = ['defaultMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('defaultMode' in $$props) $$invalidate(0, defaultMode = $$props.defaultMode);
    	};

    	$$self.$capture_state = () => ({ ContactContent, name, defaultMode });

    	$$self.$inject_state = $$props => {
    		if ('defaultMode' in $$props) $$invalidate(0, defaultMode = $$props.defaultMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [defaultMode, click_handler];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { defaultMode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get defaultMode() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultMode(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Button.svelte generated by Svelte v3.42.1 */

    const file$c = "src\\components\\Button.svelte";

    function create_fragment$c(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("  ");
    			t1 = text(/*buttontext*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*largeMode*/ ctx[1] ? "big" : "small") + " svelte-1lrnin"));
    			add_location(button, file$c, 4, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttontext*/ 1) set_data_dev(t1, /*buttontext*/ ctx[0]);

    			if (dirty & /*largeMode*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*largeMode*/ ctx[1] ? "big" : "small") + " svelte-1lrnin"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { buttontext = "Button" } = $$props;
    	let { largeMode = true } = $$props;
    	const writable_props = ['buttontext', 'largeMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('buttontext' in $$props) $$invalidate(0, buttontext = $$props.buttontext);
    		if ('largeMode' in $$props) $$invalidate(1, largeMode = $$props.largeMode);
    	};

    	$$self.$capture_state = () => ({ buttontext, largeMode });

    	$$self.$inject_state = $$props => {
    		if ('buttontext' in $$props) $$invalidate(0, buttontext = $$props.buttontext);
    		if ('largeMode' in $$props) $$invalidate(1, largeMode = $$props.largeMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [buttontext, largeMode, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { buttontext: 0, largeMode: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get buttontext() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttontext(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get largeMode() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set largeMode(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Navbar.svelte generated by Svelte v3.42.1 */
    const file$b = "src\\components\\Navbar.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:4) {#each navbarmenu as item}
    function create_each_block$2(ctx) {
    	let li;
    	let button;
    	let t;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4]);
    	}

    	button = new Button({
    			props: {
    				buttontext: /*item*/ ctx[4],
    				largeMode: !/*navtop*/ ctx[0]
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(button.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-2h81bv");
    			add_location(li, file$b, 12, 3, 315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(button, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty & /*navtop*/ 1) button_changes.largeMode = !/*navtop*/ ctx[0];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(12:4) {#each navbarmenu as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let nav;
    	let ul;
    	let nav_class_value;
    	let current;
    	let each_value = navbarmenu;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-2h81bv");
    			add_location(ul, file$b, 10, 2, 274);
    			attr_dev(nav, "class", nav_class_value = "right " + (/*navtop*/ ctx[0] ? "top" : "") + " svelte-2h81bv");
    			add_location(nav, file$b, 9, 0, 231);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navbarmenu, navtop, btnClick*/ 3) {
    				each_value = navbarmenu;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*navtop*/ 1 && nav_class_value !== (nav_class_value = "right " + (/*navtop*/ ctx[0] ? "top" : "") + " svelte-2h81bv")) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { navtop = false } = $$props;
    	let { navSelection = "Home" } = $$props;

    	function btnClick(val) {
    		$$invalidate(2, navSelection = val);
    	}

    	const writable_props = ['navtop', 'navSelection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => btnClick({ item });

    	$$self.$$set = $$props => {
    		if ('navtop' in $$props) $$invalidate(0, navtop = $$props.navtop);
    		if ('navSelection' in $$props) $$invalidate(2, navSelection = $$props.navSelection);
    	};

    	$$self.$capture_state = () => ({
    		navbarmenu,
    		Button,
    		navtop,
    		navSelection,
    		btnClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('navtop' in $$props) $$invalidate(0, navtop = $$props.navtop);
    		if ('navSelection' in $$props) $$invalidate(2, navSelection = $$props.navSelection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [navtop, btnClick, navSelection, click_handler];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { navtop: 0, navSelection: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get navtop() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navtop(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get navSelection() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navSelection(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Navigation.svelte generated by Svelte v3.42.1 */
    const file$a = "src\\components\\Navigation.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let contact;
    	let t;
    	let navbar;
    	let updating_navSelection;
    	let main_class_value;
    	let current;

    	contact = new Contact({
    			props: { defaultMode: !/*topMode*/ ctx[1] },
    			$$inline: true
    		});

    	contact.$on("click", /*click_handler*/ ctx[2]);

    	function navbar_navSelection_binding(value) {
    		/*navbar_navSelection_binding*/ ctx[3](value);
    	}

    	let navbar_props = { navtop: /*topMode*/ ctx[1] };

    	if (/*selection*/ ctx[0] !== void 0) {
    		navbar_props.navSelection = /*selection*/ ctx[0];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, 'navSelection', navbar_navSelection_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(contact.$$.fragment);
    			t = space();
    			create_component(navbar.$$.fragment);

    			attr_dev(main, "class", main_class_value = "" + ((/*topMode*/ ctx[1] ? "bar" : "") + " " + (!/*topMode*/ ctx[1] && /*selection*/ ctx[0] !== "Home"
    			? "hide"
    			: "") + " svelte-vi9345"));

    			add_location(main, file$a, 6, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(contact, main, null);
    			append_dev(main, t);
    			mount_component(navbar, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const contact_changes = {};
    			if (dirty & /*topMode*/ 2) contact_changes.defaultMode = !/*topMode*/ ctx[1];
    			contact.$set(contact_changes);
    			const navbar_changes = {};
    			if (dirty & /*topMode*/ 2) navbar_changes.navtop = /*topMode*/ ctx[1];

    			if (!updating_navSelection && dirty & /*selection*/ 1) {
    				updating_navSelection = true;
    				navbar_changes.navSelection = /*selection*/ ctx[0];
    				add_flush_callback(() => updating_navSelection = false);
    			}

    			navbar.$set(navbar_changes);

    			if (!current || dirty & /*topMode, selection*/ 3 && main_class_value !== (main_class_value = "" + ((/*topMode*/ ctx[1] ? "bar" : "") + " " + (!/*topMode*/ ctx[1] && /*selection*/ ctx[0] !== "Home"
    			? "hide"
    			: "") + " svelte-vi9345"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contact.$$.fragment, local);
    			transition_in(navbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contact.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(contact);
    			destroy_component(navbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navigation', slots, []);
    	let { selection = "Home" } = $$props;
    	let { topMode = false } = $$props;
    	const writable_props = ['selection', 'topMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, selection = "Home");

    	function navbar_navSelection_binding(value) {
    		selection = value;
    		$$invalidate(0, selection);
    	}

    	$$self.$$set = $$props => {
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('topMode' in $$props) $$invalidate(1, topMode = $$props.topMode);
    	};

    	$$self.$capture_state = () => ({ Contact, Navbar, selection, topMode });

    	$$self.$inject_state = $$props => {
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('topMode' in $$props) $$invalidate(1, topMode = $$props.topMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selection, topMode, click_handler, navbar_navSelection_binding];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { selection: 0, topMode: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get selection() {
    		throw new Error("<Navigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selection(value) {
    		throw new Error("<Navigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get topMode() {
    		throw new Error("<Navigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set topMode(value) {
    		throw new Error("<Navigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\content\About.svelte generated by Svelte v3.42.1 */

    const file$9 = "src\\components\\content\\About.svelte";

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let h20;
    	let t4;
    	let p0;
    	let t6;
    	let hr0;
    	let t7;
    	let h21;
    	let t9;
    	let p1;
    	let t11;
    	let hr1;
    	let t12;
    	let h22;
    	let t14;
    	let p2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "About Me.";
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "Background";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "I have lived in Canada for a majority of my life. An interest in robots through tv, lego and just a general passion for problem solving lead me towards engineering. By education I am a mechatronics engineer a branch of systems engineering. I am always excited to learn new technical skills. If I feel I need a new skill I will usually start or find a project to learn it.";
    			t6 = space();
    			hr0 = element("hr");
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "At Work";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "At work I enjoy solving problems whether it involves coming up with a solution from scratch or generating improvements to an existing system. My life long career goal is to go beyond a T shaped specialist and become a block of knowledge. I have made this my goal as I have learned that sometimes a problem in one industry has already been solved by another industry and having knowledge of technologies/solutions outside a single industry can lead to some pretty effective solutions.";
    			t11 = space();
    			hr1 = element("hr");
    			t12 = space();
    			h22 = element("h2");
    			h22.textContent = "At Home";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "Despite being an avid problem solver I rarely do engineering projects at home due to some space limitations. My hope is to setup a lab space in the future so I have an excuse to work on some larger hardware based personal projects. I do have some small software projects, but I only recently started tossing them into github and started introducing some quality control into the code.";
    			if (!src_url_equal(img.src, img_src_value = "./img/author.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Nikhil Malhotra");
    			attr_dev(img, "class", "svelte-1djrywj");
    			add_location(img, file$9, 2, 6, 72);
    			attr_dev(div0, "class", "profilecontainer svelte-1djrywj");
    			add_location(div0, file$9, 1, 4, 34);
    			add_location(h1, file$9, 5, 8, 173);
    			add_location(h20, file$9, 6, 8, 201);
    			add_location(p0, file$9, 7, 8, 230);
    			add_location(hr0, file$9, 8, 8, 618);
    			add_location(h21, file$9, 9, 8, 632);
    			add_location(p1, file$9, 10, 8, 658);
    			add_location(hr1, file$9, 11, 8, 1158);
    			add_location(h22, file$9, 12, 8, 1172);
    			add_location(p2, file$9, 13, 8, 1198);
    			attr_dev(div1, "class", "abouttext svelte-1djrywj");
    			add_location(div1, file$9, 4, 4, 140);
    			attr_dev(div2, "class", "aboutcontainer svelte-1djrywj");
    			add_location(div2, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, h20);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			append_dev(div1, t6);
    			append_dev(div1, hr0);
    			append_dev(div1, t7);
    			append_dev(div1, h21);
    			append_dev(div1, t9);
    			append_dev(div1, p1);
    			append_dev(div1, t11);
    			append_dev(div1, hr1);
    			append_dev(div1, t12);
    			append_dev(div1, h22);
    			append_dev(div1, t14);
    			append_dev(div1, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\content\ProgressBar.svelte generated by Svelte v3.42.1 */

    const file$8 = "src\\components\\content\\ProgressBar.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let rect;
    	let rect_fill_value;
    	let path0;
    	let path0_fill_value;
    	let path1;
    	let path1_fill_value;
    	let path2;
    	let path2_fill_value;
    	let polygon;
    	let polygon_fill_value;
    	let path3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			polygon = svg_element("polygon");
    			path3 = svg_element("path");
    			attr_dev(rect, "x", /*shapeOneX*/ ctx[7]);
    			attr_dev(rect, "y", /*shapeOneY*/ ctx[8]);
    			attr_dev(rect, "width", /*squareDim*/ ctx[6]);
    			attr_dev(rect, "height", /*squareDim*/ ctx[6]);

    			attr_dev(rect, "fill", rect_fill_value = /*notch*/ ctx[0] > 1
    			? /*fillColorOne*/ ctx[20]
    			: "transparent");

    			attr_dev(rect, "stroke", /*innerBorder*/ ctx[24]);
    			attr_dev(rect, "stroke-width", "5");
    			add_location(rect, file$8, 85, 2, 2492);
    			attr_dev(path0, "d", "\r\n    M " + /*shapeTwoX*/ ctx[9] + " " + /*shapeTwoY*/ ctx[10] + " \r\n    L " + (/*shapeTwoX*/ ctx[9] + /*shapeTwoSlantWidth*/ ctx[11]) + " " + (/*shapeTwoY*/ ctx[10] - /*shapeTwoSlantHeight*/ ctx[12]) + " \r\n    V " + (/*shapeTwoY*/ ctx[10] - /*shapeTwoSlantHeight*/ ctx[12] + /*segheight*/ ctx[4]) + " \r\n    L " + /*shapeTwoX*/ ctx[9] + " " + (/*shapeTwoY*/ ctx[10] + /*segheight*/ ctx[4]) + " z");

    			attr_dev(path0, "fill", path0_fill_value = /*notch*/ ctx[0] > 1
    			? /*fillColorTwo*/ ctx[21]
    			: "transparent");

    			attr_dev(path0, "stroke", /*innerBorder*/ ctx[24]);
    			attr_dev(path0, "stroke-width", "5");
    			add_location(path0, file$8, 86, 2, 2658);
    			attr_dev(path1, "d", "\r\n    M " + /*shapeThreeX*/ ctx[13] + " " + /*shapeThreeY*/ ctx[14] + " \r\n    L " + (/*shapeThreeX*/ ctx[13] + /*shapeTwoSlantWidth*/ ctx[11]) + " " + (/*shapeThreeY*/ ctx[14] - /*shapeTwoSlantHeight*/ ctx[12]) + " \r\n    V " + (/*shapeThreeY*/ ctx[14] - /*shapeTwoSlantHeight*/ ctx[12] + /*segheight*/ ctx[4]) + " \r\n    L " + /*shapeThreeX*/ ctx[13] + " " + (/*shapeThreeY*/ ctx[14] + /*segheight*/ ctx[4]) + " z");

    			attr_dev(path1, "fill", path1_fill_value = /*notch*/ ctx[0] > 2
    			? /*fillColorThree*/ ctx[19]
    			: "transparent");

    			attr_dev(path1, "stroke", /*innerBorder*/ ctx[24]);
    			attr_dev(path1, "stroke-width", "5");
    			add_location(path1, file$8, 93, 2, 2959);
    			attr_dev(path2, "d", "\r\n    M " + /*shapeFourX*/ ctx[15] + " " + /*shapeFourY*/ ctx[16] + " \r\n    H " + (/*shapeFourX*/ ctx[15] + /*segwidth*/ ctx[3]) + " \r\n    V " + (/*shapeFourY*/ ctx[16] + /*segheight*/ ctx[4]) + " \r\n    H " + /*shapeFourX*/ ctx[15] + " z");

    			attr_dev(path2, "fill", path2_fill_value = /*notch*/ ctx[0] > 3
    			? /*fillColorFour*/ ctx[22]
    			: "transparent");

    			attr_dev(path2, "stroke", /*innerBorder*/ ctx[24]);
    			attr_dev(path2, "stroke-width", "5");
    			add_location(path2, file$8, 100, 2, 3277);
    			attr_dev(polygon, "points", generateStar(/*shapeFiveX*/ ctx[17], /*shapeFiveY*/ ctx[18], /*segheight*/ ctx[4], /*segheight*/ ctx[4] / 2));
    			attr_dev(polygon, "stroke", "white");

    			attr_dev(polygon, "fill", polygon_fill_value = /*notch*/ ctx[0] > 4
    			? /*fillColorFive*/ ctx[23]
    			: "transparent");

    			attr_dev(polygon, "stroke-width", /*gap*/ ctx[5]);
    			add_location(polygon, file$8, 107, 2, 3501);
    			attr_dev(path3, "d", "\r\n    M " + (/*shapeOneX*/ ctx[7] - /*gap*/ ctx[5]) + " " + (/*shapeOneY*/ ctx[8] - /*gap*/ ctx[5]) + " \r\n    H " + (/*squareDim*/ ctx[6] + /*gap*/ ctx[5] * 6) + " \r\n    V " + (/*shapeTwoY*/ ctx[10] - /*gap*/ ctx[5]) + " \r\n    L " + (/*shapeTwoX*/ ctx[9] + /*shapeTwoSlantWidth*/ ctx[11] + /*gap*/ ctx[5]) + " " + (/*shapeTwoY*/ ctx[10] - /*shapeTwoSlantHeight*/ ctx[12] - /*gap*/ ctx[5]) + " \r\n    V " + (/*shapeTwoY*/ ctx[10] - /*shapeTwoSlantHeight*/ ctx[12] + /*segheight*/ ctx[4] - /*gap*/ ctx[5]) + "\r\n    L " + /*shapeFourX*/ ctx[15] + " " + (/*shapeFourY*/ ctx[16] - /*gap*/ ctx[5]) + "\r\n    H " + (/*shapeFourX*/ ctx[15] + /*segwidth*/ ctx[3] + /*gap*/ ctx[5]) + "\r\n    V " + (/*shapeFourY*/ ctx[16] + /*segheight*/ ctx[4] + /*gap*/ ctx[5]) + "\r\n    H " + /*shapeFourX*/ ctx[15] + "\r\n    L " + (/*shapeThreeX*/ ctx[13] - /*gap*/ ctx[5]) + " " + (/*shapeThreeY*/ ctx[14] + /*segheight*/ ctx[4] + /*gap*/ ctx[5]) + "\r\n    V " + (/*shapeThreeY*/ ctx[14] + /*gap*/ ctx[5]) + "\r\n    L " + (/*shapeTwoX*/ ctx[9] + /*gap*/ ctx[5]) + " " + (/*shapeTwoY*/ ctx[10] + /*segheight*/ ctx[4] + /*gap*/ ctx[5]) + "\r\n    V " + (/*shapeOneY*/ ctx[8] + /*squareDim*/ ctx[6] + /*gap*/ ctx[5]) + "\r\n    H " + (/*shapeOneX*/ ctx[7] - /*gap*/ ctx[5]) + "\r\n    z");
    			attr_dev(path3, "fill", "transparent");
    			attr_dev(path3, "stroke", /*outerBorder*/ ctx[25]);
    			attr_dev(path3, "stroke-width", "5");
    			add_location(path3, file$8, 109, 2, 3665);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", /*canvaswidth*/ ctx[1]);
    			attr_dev(svg, "height", /*canvasheight*/ ctx[2]);
    			attr_dev(svg, "viewBox", "0 0 " + /*canvaswidth*/ ctx[1] + " " + /*canvasheight*/ ctx[2]);
    			attr_dev(svg, "class", "svelte-1qroolc");
    			add_location(svg, file$8, 83, 0, 2298);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, polygon);
    			append_dev(svg, path3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*notch*/ 1 && rect_fill_value !== (rect_fill_value = /*notch*/ ctx[0] > 1
    			? /*fillColorOne*/ ctx[20]
    			: "transparent")) {
    				attr_dev(rect, "fill", rect_fill_value);
    			}

    			if (dirty & /*notch*/ 1 && path0_fill_value !== (path0_fill_value = /*notch*/ ctx[0] > 1
    			? /*fillColorTwo*/ ctx[21]
    			: "transparent")) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty & /*notch*/ 1 && path1_fill_value !== (path1_fill_value = /*notch*/ ctx[0] > 2
    			? /*fillColorThree*/ ctx[19]
    			: "transparent")) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty & /*notch*/ 1 && path2_fill_value !== (path2_fill_value = /*notch*/ ctx[0] > 3
    			? /*fillColorFour*/ ctx[22]
    			: "transparent")) {
    				attr_dev(path2, "fill", path2_fill_value);
    			}

    			if (dirty & /*notch*/ 1 && polygon_fill_value !== (polygon_fill_value = /*notch*/ ctx[0] > 4
    			? /*fillColorFive*/ ctx[23]
    			: "transparent")) {
    				attr_dev(polygon, "fill", polygon_fill_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function toRadians(angle) {
    	return angle * (Math.PI / 180);
    }

    function round(val) {
    	return Math.round(val * 100 + Number.EPSILON) / 100;
    }

    function generateStar(x, y, outerRadius, innerRadius) {
    	let result = [];
    	let tempX = 0;
    	let tempY = 0;
    	let offset = 0;
    	let outercounter = -1;
    	let innercounter = -1;
    	let counter = 0;
    	let radius = 0;

    	for (let i = 0; i < 10; i++) {
    		if (i % 2 == 0) {
    			offset = 0;
    			outercounter++;
    			counter = outercounter;
    			radius = outerRadius;
    		} else {
    			offset = 36;
    			innercounter++;
    			counter = innercounter;
    			radius = innerRadius;
    		}

    		tempX = round(x + radius * Math.cos(toRadians(counter * 72 + offset)));
    		tempY = round(y + radius * Math.sin(toRadians(counter * 72 + offset)));
    		result.push(tempX);
    		result.push(tempY);
    	}

    	tempX = round(result[0] + (result[result.length - 2] - result[0]) / 2);
    	tempY = round(result[1] + (result[result.length - 1] - result[1]) / 2);
    	result.unshift(tempY);
    	result.unshift(tempX);
    	return result.join(" ");
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressBar', slots, []);
    	let { notch = 1 } = $$props;
    	let canvaswidth = 1000;
    	let canvasheight = 250;
    	let segwidth = 250;
    	let segheight = 80;
    	let start = 25;
    	let vert = 125;
    	let mid = canvasheight / 2;
    	let gap = 5;
    	let overLapGap = 1.5;
    	let squareDim = 150;
    	let shapeOneX = start;
    	let shapeOneY = (canvasheight - squareDim) * 0.5;
    	let shapeTwoX = shapeOneX + squareDim;
    	let shapeTwoY = shapeOneY + segheight * 0.5;
    	let slantAngle = Math.atan(segheight / (segwidth * overLapGap));
    	let shapeTwoSlantWidth = segwidth * Math.cos(slantAngle);
    	let shapeTwoSlantHeight = segwidth * Math.sin(slantAngle);
    	let shapeThreeX = shapeTwoX + segwidth * overLapGap - shapeTwoSlantWidth;
    	let shapeThreeY = shapeTwoY + shapeTwoSlantHeight;
    	let shapeFourX = shapeTwoX + segwidth * overLapGap;
    	let shapeFourY = shapeTwoY;
    	let shapeFiveX = shapeFourX + segwidth * 1.35;
    	let shapeFiveY = mid;
    	let fillColorThree = "#522e90";
    	let fillColorOne = "#8B6EBC";
    	let fillColorTwo = "#6847A0";
    	let fillColorFour = "#3D1B77";
    	let fillColorFive = "#290A5D";
    	let innerBorder = "#522e9080";
    	let outerBorder = "#00000080";
    	const writable_props = ['notch'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('notch' in $$props) $$invalidate(0, notch = $$props.notch);
    	};

    	$$self.$capture_state = () => ({
    		notch,
    		canvaswidth,
    		canvasheight,
    		segwidth,
    		segheight,
    		start,
    		vert,
    		mid,
    		gap,
    		overLapGap,
    		squareDim,
    		shapeOneX,
    		shapeOneY,
    		shapeTwoX,
    		shapeTwoY,
    		slantAngle,
    		shapeTwoSlantWidth,
    		shapeTwoSlantHeight,
    		shapeThreeX,
    		shapeThreeY,
    		shapeFourX,
    		shapeFourY,
    		shapeFiveX,
    		shapeFiveY,
    		fillColorThree,
    		fillColorOne,
    		fillColorTwo,
    		fillColorFour,
    		fillColorFive,
    		innerBorder,
    		outerBorder,
    		toRadians,
    		round,
    		generateStar
    	});

    	$$self.$inject_state = $$props => {
    		if ('notch' in $$props) $$invalidate(0, notch = $$props.notch);
    		if ('canvaswidth' in $$props) $$invalidate(1, canvaswidth = $$props.canvaswidth);
    		if ('canvasheight' in $$props) $$invalidate(2, canvasheight = $$props.canvasheight);
    		if ('segwidth' in $$props) $$invalidate(3, segwidth = $$props.segwidth);
    		if ('segheight' in $$props) $$invalidate(4, segheight = $$props.segheight);
    		if ('start' in $$props) start = $$props.start;
    		if ('vert' in $$props) vert = $$props.vert;
    		if ('mid' in $$props) mid = $$props.mid;
    		if ('gap' in $$props) $$invalidate(5, gap = $$props.gap);
    		if ('overLapGap' in $$props) overLapGap = $$props.overLapGap;
    		if ('squareDim' in $$props) $$invalidate(6, squareDim = $$props.squareDim);
    		if ('shapeOneX' in $$props) $$invalidate(7, shapeOneX = $$props.shapeOneX);
    		if ('shapeOneY' in $$props) $$invalidate(8, shapeOneY = $$props.shapeOneY);
    		if ('shapeTwoX' in $$props) $$invalidate(9, shapeTwoX = $$props.shapeTwoX);
    		if ('shapeTwoY' in $$props) $$invalidate(10, shapeTwoY = $$props.shapeTwoY);
    		if ('slantAngle' in $$props) slantAngle = $$props.slantAngle;
    		if ('shapeTwoSlantWidth' in $$props) $$invalidate(11, shapeTwoSlantWidth = $$props.shapeTwoSlantWidth);
    		if ('shapeTwoSlantHeight' in $$props) $$invalidate(12, shapeTwoSlantHeight = $$props.shapeTwoSlantHeight);
    		if ('shapeThreeX' in $$props) $$invalidate(13, shapeThreeX = $$props.shapeThreeX);
    		if ('shapeThreeY' in $$props) $$invalidate(14, shapeThreeY = $$props.shapeThreeY);
    		if ('shapeFourX' in $$props) $$invalidate(15, shapeFourX = $$props.shapeFourX);
    		if ('shapeFourY' in $$props) $$invalidate(16, shapeFourY = $$props.shapeFourY);
    		if ('shapeFiveX' in $$props) $$invalidate(17, shapeFiveX = $$props.shapeFiveX);
    		if ('shapeFiveY' in $$props) $$invalidate(18, shapeFiveY = $$props.shapeFiveY);
    		if ('fillColorThree' in $$props) $$invalidate(19, fillColorThree = $$props.fillColorThree);
    		if ('fillColorOne' in $$props) $$invalidate(20, fillColorOne = $$props.fillColorOne);
    		if ('fillColorTwo' in $$props) $$invalidate(21, fillColorTwo = $$props.fillColorTwo);
    		if ('fillColorFour' in $$props) $$invalidate(22, fillColorFour = $$props.fillColorFour);
    		if ('fillColorFive' in $$props) $$invalidate(23, fillColorFive = $$props.fillColorFive);
    		if ('innerBorder' in $$props) $$invalidate(24, innerBorder = $$props.innerBorder);
    		if ('outerBorder' in $$props) $$invalidate(25, outerBorder = $$props.outerBorder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		notch,
    		canvaswidth,
    		canvasheight,
    		segwidth,
    		segheight,
    		gap,
    		squareDim,
    		shapeOneX,
    		shapeOneY,
    		shapeTwoX,
    		shapeTwoY,
    		shapeTwoSlantWidth,
    		shapeTwoSlantHeight,
    		shapeThreeX,
    		shapeThreeY,
    		shapeFourX,
    		shapeFourY,
    		shapeFiveX,
    		shapeFiveY,
    		fillColorThree,
    		fillColorOne,
    		fillColorTwo,
    		fillColorFour,
    		fillColorFive,
    		innerBorder,
    		outerBorder
    	];
    }

    class ProgressBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { notch: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressBar",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get notch() {
    		throw new Error("<ProgressBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notch(value) {
    		throw new Error("<ProgressBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\content\LangBlock.svelte generated by Svelte v3.42.1 */
    const file$7 = "src\\components\\content\\LangBlock.svelte";

    function create_fragment$7(ctx) {
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1;
    	let progressbar;
    	let t2;
    	let div2;
    	let t3;
    	let current;

    	progressbar = new ProgressBar({
    			props: { notch: /*level*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(/*name*/ ctx[0]);
    			create_component(progressbar.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(/*comment*/ ctx[2]);
    			if (!src_url_equal(img.src, img_src_value = /*imgsrc*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 11, 4, 258);
    			add_location(h3, file$7, 12, 26, 311);
    			attr_dev(div0, "class", "progress svelte-1cwv173");
    			add_location(div0, file$7, 12, 4, 289);
    			attr_dev(div1, "class", "cardheader");
    			add_location(div1, file$7, 10, 2, 228);
    			attr_dev(div2, "class", "description");
    			add_location(div2, file$7, 15, 2, 378);
    			attr_dev(div3, "class", "langblock");
    			add_location(div3, file$7, 9, 0, 201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			mount_component(progressbar, div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*imgsrc*/ 8 && !src_url_equal(img.src, img_src_value = /*imgsrc*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    			const progressbar_changes = {};
    			if (dirty & /*level*/ 2) progressbar_changes.notch = /*level*/ ctx[1];
    			progressbar.$set(progressbar_changes);
    			if (!current || dirty & /*comment*/ 4) set_data_dev(t3, /*comment*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(progressbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LangBlock', slots, []);
    	let { name = "Language" } = $$props;
    	let { level = 1 } = $$props;
    	let { comment = "Some Comment" } = $$props;
    	let { imgsrc = "" } = $$props;
    	const writable_props = ['name', 'level', 'comment', 'imgsrc'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LangBlock> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('level' in $$props) $$invalidate(1, level = $$props.level);
    		if ('comment' in $$props) $$invalidate(2, comment = $$props.comment);
    		if ('imgsrc' in $$props) $$invalidate(3, imgsrc = $$props.imgsrc);
    	};

    	$$self.$capture_state = () => ({
    		ProgressBar,
    		name,
    		level,
    		comment,
    		imgsrc
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('level' in $$props) $$invalidate(1, level = $$props.level);
    		if ('comment' in $$props) $$invalidate(2, comment = $$props.comment);
    		if ('imgsrc' in $$props) $$invalidate(3, imgsrc = $$props.imgsrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, level, comment, imgsrc];
    }

    class LangBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 0, level: 1, comment: 2, imgsrc: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LangBlock",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get name() {
    		throw new Error("<LangBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<LangBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		throw new Error("<LangBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set level(value) {
    		throw new Error("<LangBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comment() {
    		throw new Error("<LangBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comment(value) {
    		throw new Error("<LangBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgsrc() {
    		throw new Error("<LangBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgsrc(value) {
    		throw new Error("<LangBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\content\Knowledge.svelte generated by Svelte v3.42.1 */
    const file$6 = "src\\components\\content\\Knowledge.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (27:4) {#each languages as language}
    function create_each_block$1(ctx) {
    	let langblock;
    	let current;

    	langblock = new LangBlock({
    			props: {
    				name: /*language*/ ctx[2].name,
    				level: /*language*/ ctx[2].level,
    				comment: /*language*/ ctx[2].comment
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(langblock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(langblock, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(langblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(langblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(langblock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:4) {#each languages as language}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div9;
    	let div0;
    	let fa0;
    	let t0;
    	let div2;
    	let div1;
    	let h10;
    	let t2;
    	let p0;
    	let t4;
    	let div2_class_value;
    	let t5;
    	let div3;
    	let fa1;
    	let t6;
    	let div5;
    	let div4;
    	let h11;
    	let t8;
    	let p1;
    	let div5_class_value;
    	let t10;
    	let div6;
    	let fa2;
    	let t11;
    	let div8;
    	let div7;
    	let h12;
    	let t13;
    	let p2;
    	let div8_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	fa0 = new Fa({
    			props: { class: "icon", icon: faCode },
    			$$inline: true
    		});

    	let each_value = languages;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	fa1 = new Fa({
    			props: { class: "icon", icon: faTools },
    			$$inline: true
    		});

    	fa2 = new Fa({
    			props: { class: "icon", icon: faCrop },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			create_component(fa0.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Languages";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "All the languages that I know. Maybe....";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div3 = element("div");
    			create_component(fa1.$$.fragment);
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Languages";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "All the languages that I know. Maybe....";
    			t10 = space();
    			div6 = element("div");
    			create_component(fa2.$$.fragment);
    			t11 = space();
    			div8 = element("div");
    			div7 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Languages";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "All the languages that I know. Maybe....";
    			attr_dev(div0, "class", "titlebanner");
    			add_location(div0, file$6, 18, 2, 421);
    			add_location(h10, file$6, 23, 6, 625);
    			add_location(p0, file$6, 24, 6, 651);
    			attr_dev(div1, "class", "titleblock");
    			add_location(div1, file$6, 22, 4, 593);
    			attr_dev(div2, "class", div2_class_value = "languagecontainer " + (/*section*/ ctx[0] === 1 ? "show" : "hide") + " svelte-14rod7f");
    			add_location(div2, file$6, 21, 2, 526);
    			attr_dev(div3, "class", "titlebanner");
    			add_location(div3, file$6, 30, 2, 863);
    			add_location(h11, file$6, 35, 6, 1065);
    			add_location(p1, file$6, 36, 6, 1091);
    			attr_dev(div4, "class", "titleblock");
    			add_location(div4, file$6, 34, 4, 1033);
    			attr_dev(div5, "class", div5_class_value = "toolscontainer " + (/*section*/ ctx[0] === 2 ? "show" : "hide") + " svelte-14rod7f");
    			add_location(div5, file$6, 33, 2, 969);
    			attr_dev(div6, "class", "titlebanner");
    			add_location(div6, file$6, 40, 2, 1170);
    			add_location(h12, file$6, 45, 6, 1376);
    			add_location(p2, file$6, 46, 6, 1402);
    			attr_dev(div7, "class", "titleblock");
    			add_location(div7, file$6, 44, 4, 1344);
    			attr_dev(div8, "class", div8_class_value = "frameworkscontainer " + (/*section*/ ctx[0] === 3 ? "show" : "hide") + " svelte-14rod7f");
    			add_location(div8, file$6, 43, 2, 1275);
    			attr_dev(div9, "class", "knowledgecontainer");
    			add_location(div9, file$6, 17, 0, 385);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			mount_component(fa0, div0, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div2, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div9, t5);
    			append_dev(div9, div3);
    			mount_component(fa1, div3, null);
    			append_dev(div9, t6);
    			append_dev(div9, div5);
    			append_dev(div5, div4);
    			append_dev(div4, h11);
    			append_dev(div4, t8);
    			append_dev(div4, p1);
    			append_dev(div9, t10);
    			append_dev(div9, div6);
    			mount_component(fa2, div6, null);
    			append_dev(div9, t11);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h12);
    			append_dev(div7, t13);
    			append_dev(div7, p2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*toggleSection*/ ctx[1](1), false, false, false),
    					listen_dev(div3, "click", /*toggleSection*/ ctx[1](2), false, false, false),
    					listen_dev(div6, "click", /*toggleSection*/ ctx[1](3), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*languages*/ 0) {
    				each_value = languages;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*section*/ 1 && div2_class_value !== (div2_class_value = "languagecontainer " + (/*section*/ ctx[0] === 1 ? "show" : "hide") + " svelte-14rod7f")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*section*/ 1 && div5_class_value !== (div5_class_value = "toolscontainer " + (/*section*/ ctx[0] === 2 ? "show" : "hide") + " svelte-14rod7f")) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (!current || dirty & /*section*/ 1 && div8_class_value !== (div8_class_value = "frameworkscontainer " + (/*section*/ ctx[0] === 3 ? "show" : "hide") + " svelte-14rod7f")) {
    				attr_dev(div8, "class", div8_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fa0.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(fa1.$$.fragment, local);
    			transition_in(fa2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fa0.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(fa1.$$.fragment, local);
    			transition_out(fa2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_component(fa0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(fa1);
    			destroy_component(fa2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Knowledge', slots, []);
    	let section = 0;

    	const toggleSection = val => {
    		if (val === section) {
    			$$invalidate(0, section = 0);
    		} else {
    			$$invalidate(0, section = val);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Knowledge> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Fa,
    		LangBlock,
    		languages,
    		faCrop,
    		faTools,
    		faCode,
    		section,
    		toggleSection
    	});

    	$$self.$inject_state = $$props => {
    		if ('section' in $$props) $$invalidate(0, section = $$props.section);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [section, toggleSection];
    }

    class Knowledge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Knowledge",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\content\Current.svelte generated by Svelte v3.42.1 */

    const file$5 = "src\\components\\content\\Current.svelte";

    function create_fragment$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Current";
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Current', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Current> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Current extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Current",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\content\Experience.svelte generated by Svelte v3.42.1 */

    const file$4 = "src\\components\\content\\Experience.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Career";
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Experience', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Experience> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Experience extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experience",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\content\Projects.svelte generated by Svelte v3.42.1 */

    const file$3 = "src\\components\\content\\Projects.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Projects";
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\ContentBlock.svelte generated by Svelte v3.42.1 */
    const file$2 = "src\\components\\ContentBlock.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let switch_instance;
    	let div_class_value;
    	let current;
    	var switch_value = /*content*/ ctx[2][/*text*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*show*/ ctx[1] ? "show" : "") + " svelte-bkti9c"));
    			add_location(div, file$2, 16, 0, 481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*content*/ ctx[2][/*text*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty & /*show*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*show*/ ctx[1] ? "show" : "") + " svelte-bkti9c"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContentBlock', slots, []);
    	let { text = "" } = $$props;
    	let { show } = $$props;

    	const content = {
    		"ABOUT": About,
    		"KNOWLEDGE": Knowledge,
    		"CURRENT": Current,
    		"EXPERIENCE": Experience,
    		"PROJECTS": Projects
    	};

    	const writable_props = ['text', 'show'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContentBlock> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    	};

    	$$self.$capture_state = () => ({
    		About,
    		Knowledge,
    		Current,
    		Experience,
    		Projects,
    		text,
    		show,
    		content
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, show, content];
    }

    class ContentBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { text: 0, show: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContentBlock",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*show*/ ctx[1] === undefined && !('show' in props)) {
    			console.warn("<ContentBlock> was created without expected prop 'show'");
    		}
    	}

    	get text() {
    		throw new Error("<ContentBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ContentBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<ContentBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<ContentBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Content.svelte generated by Svelte v3.42.1 */
    const file$1 = "src\\components\\Content.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (10:4) {#each navbarmenu as item}
    function create_each_block(ctx) {
    	let contentblock;
    	let current;

    	contentblock = new ContentBlock({
    			props: {
    				show: /*section*/ ctx[0]['item'] === /*item*/ ctx[2],
    				text: /*item*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contentblock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contentblock, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contentblock_changes = {};
    			if (dirty & /*section*/ 1) contentblock_changes.show = /*section*/ ctx[0]['item'] === /*item*/ ctx[2];
    			contentblock.$set(contentblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contentblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contentblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contentblock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:4) {#each navbarmenu as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let navigation;
    	let updating_selection;
    	let t;
    	let div0;
    	let div1_class_value;
    	let current;

    	function navigation_selection_binding(value) {
    		/*navigation_selection_binding*/ ctx[1](value);
    	}

    	let navigation_props = { topMode: true };

    	if (/*section*/ ctx[0] !== void 0) {
    		navigation_props.selection = /*section*/ ctx[0];
    	}

    	navigation = new Navigation({ props: navigation_props, $$inline: true });
    	binding_callbacks.push(() => bind(navigation, 'selection', navigation_selection_binding));
    	let each_value = navbarmenu;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(navigation.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "blockcontainer svelte-3ayov0");
    			add_location(div0, file$1, 8, 2, 317);
    			attr_dev(div1, "class", div1_class_value = "bottom " + (/*section*/ ctx[0] === "Home" ? "" : "show") + " svelte-3ayov0");
    			add_location(div1, file$1, 6, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(navigation, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navigation_changes = {};

    			if (!updating_selection && dirty & /*section*/ 1) {
    				updating_selection = true;
    				navigation_changes.selection = /*section*/ ctx[0];
    				add_flush_callback(() => updating_selection = false);
    			}

    			navigation.$set(navigation_changes);

    			if (dirty & /*section, navbarmenu*/ 1) {
    				each_value = navbarmenu;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*section*/ 1 && div1_class_value !== (div1_class_value = "bottom " + (/*section*/ ctx[0] === "Home" ? "" : "show") + " svelte-3ayov0")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(navigation);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Content', slots, []);
    	let { section = "Home" } = $$props;
    	const writable_props = ['section'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	function navigation_selection_binding(value) {
    		section = value;
    		$$invalidate(0, section);
    	}

    	$$self.$$set = $$props => {
    		if ('section' in $$props) $$invalidate(0, section = $$props.section);
    	};

    	$$self.$capture_state = () => ({
    		navbarmenu,
    		ContentBlock,
    		Navigation,
    		section
    	});

    	$$self.$inject_state = $$props => {
    		if ('section' in $$props) $$invalidate(0, section = $$props.section);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [section, navigation_selection_binding];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { section: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get section() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let navigation;
    	let updating_selection;
    	let t;
    	let content;
    	let updating_section;
    	let current;

    	function navigation_selection_binding(value) {
    		/*navigation_selection_binding*/ ctx[1](value);
    	}

    	let navigation_props = { topMode: false };

    	if (/*contentSection*/ ctx[0] !== void 0) {
    		navigation_props.selection = /*contentSection*/ ctx[0];
    	}

    	navigation = new Navigation({ props: navigation_props, $$inline: true });
    	binding_callbacks.push(() => bind(navigation, 'selection', navigation_selection_binding));

    	function content_section_binding(value) {
    		/*content_section_binding*/ ctx[2](value);
    	}

    	let content_props = {};

    	if (/*contentSection*/ ctx[0] !== void 0) {
    		content_props.section = /*contentSection*/ ctx[0];
    	}

    	content = new Content({ props: content_props, $$inline: true });
    	binding_callbacks.push(() => bind(content, 'section', content_section_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navigation.$$.fragment);
    			t = space();
    			create_component(content.$$.fragment);
    			attr_dev(main, "class", "svelte-hqspea");
    			add_location(main, file, 5, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navigation, main, null);
    			append_dev(main, t);
    			mount_component(content, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navigation_changes = {};

    			if (!updating_selection && dirty & /*contentSection*/ 1) {
    				updating_selection = true;
    				navigation_changes.selection = /*contentSection*/ ctx[0];
    				add_flush_callback(() => updating_selection = false);
    			}

    			navigation.$set(navigation_changes);
    			const content_changes = {};

    			if (!updating_section && dirty & /*contentSection*/ 1) {
    				updating_section = true;
    				content_changes.section = /*contentSection*/ ctx[0];
    				add_flush_callback(() => updating_section = false);
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navigation);
    			destroy_component(content);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let contentSection = "Home";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navigation_selection_binding(value) {
    		contentSection = value;
    		$$invalidate(0, contentSection);
    	}

    	function content_section_binding(value) {
    		contentSection = value;
    		$$invalidate(0, contentSection);
    	}

    	$$self.$capture_state = () => ({ Navigation, Content, contentSection });

    	$$self.$inject_state = $$props => {
    		if ('contentSection' in $$props) $$invalidate(0, contentSection = $$props.contentSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [contentSection, navigation_selection_binding, content_section_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
