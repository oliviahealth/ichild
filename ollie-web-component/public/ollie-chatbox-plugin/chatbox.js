
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
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
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                if (!is_function(callback)) {
                    return noop;
                }
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
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.57.0' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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

    /* src/App.svelte generated by Svelte v3.57.0 */

    const { Error: Error_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (57:12) {#if loadingMsg}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Ollie is typing...";
    			attr_dev(div, "id", "loading-msg");
    			add_location(div, file, 57, 16, 3620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(57:12) {#if loadingMsg}",
    		ctx
    	});

    	return block;
    }

    // (70:24) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t_value = /*msg*/ ctx[9].msg + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "id", "message-text");
    			add_location(div, file, 70, 24, 4348);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messageState*/ 4 && t_value !== (t_value = /*msg*/ ctx[9].msg + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(70:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:20) {#if msg.ollie}
    function create_if_block(ctx) {
    	let div;
    	let raw_value = /*msg*/ ctx[9].msg + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "message-text");
    			add_location(div, file, 68, 24, 4247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messageState*/ 4 && raw_value !== (raw_value = /*msg*/ ctx[9].msg + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(68:20) {#if msg.ollie}",
    		ctx
    	});

    	return block;
    }

    // (60:12) {#each [...messageState].reverse() as msg}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_class_value;
    	let t0;
    	let t1;
    	let div_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*msg*/ ctx[9].ollie) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			attr_dev(img, "id", "avatar");

    			if (!src_url_equal(img.src, img_src_value = /*msg*/ ctx[9].ollie
    			? "http://oliviahealth.org/wp-content/uploads/2023/03/olliehead.png"
    			: "http://oliviahealth.org/wp-content/uploads/2023/01/white-thick-logo.png")) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", "avatar");
    			attr_dev(img, "class", img_class_value = /*msg*/ ctx[9].ollie ? "" : "my-avatar");
    			add_location(img, file, 61, 20, 3840);
    			attr_dev(div, "id", "message");
    			attr_dev(div, "class", div_class_value = /*msg*/ ctx[9].ollie ? "msg-left" : "msg-right");
    			add_location(div, file, 60, 16, 3756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			if_block.m(div, null);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messageState*/ 4 && !src_url_equal(img.src, img_src_value = /*msg*/ ctx[9].ollie
    			? "http://oliviahealth.org/wp-content/uploads/2023/03/olliehead.png"
    			: "http://oliviahealth.org/wp-content/uploads/2023/01/white-thick-logo.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*messageState*/ 4 && img_class_value !== (img_class_value = /*msg*/ ctx[9].ollie ? "" : "my-avatar")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t1);
    				}
    			}

    			if (dirty & /*messageState*/ 4 && div_class_value !== (div_class_value = /*msg*/ ctx[9].ollie ? "msg-left" : "msg-right")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(60:12) {#each [...messageState].reverse() as msg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div0;
    	let p;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div3;
    	let textarea_1;
    	let textarea_1_rows_value;
    	let t4;
    	let div2;
    	let svg;
    	let path;
    	let t5;
    	let div5;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;
    	let if_block = /*loadingMsg*/ ctx[3] && create_if_block_1(ctx);
    	let each_value = [.../*messageState*/ ctx[2]].reverse();
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Ollie";
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			textarea_1 = element("textarea");
    			t4 = space();
    			div2 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t5 = space();
    			div5 = element("div");
    			img = element("img");
    			this.c = noop;
    			add_location(p, file, 54, 33, 3521);
    			attr_dev(div0, "id", "chatBox-header");
    			add_location(div0, file, 54, 8, 3496);
    			attr_dev(div1, "id", "chatBox-content");
    			add_location(div1, file, 55, 8, 3548);
    			attr_dev(textarea_1, "id", "chatbox-textarea");
    			attr_dev(textarea_1, "rows", textarea_1_rows_value = Math.min(/*textRows*/ ctx[1], 4));
    			attr_dev(textarea_1, "placeholder", "Type message...");
    			add_location(textarea_1, file, 76, 12, 4518);
    			attr_dev(path, "d", "M48 448l416-192L48 64v149.333L346 256 48 298.667z");
    			add_location(path, file, 111, 24, 6109);
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "fill", "currentColor");
    			attr_dev(svg, "stroke-width", "0");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "max-height", "100%");
    			add_location(svg, file, 110, 20, 5966);
    			attr_dev(div2, "class", "send-button");
    			add_location(div2, file, 96, 12, 5370);
    			attr_dev(div3, "id", "chatBox-message");
    			add_location(div3, file, 75, 8, 4479);
    			attr_dev(div4, "id", "chatBox");
    			attr_dev(div4, "class", "fixed-position show");
    			add_location(div4, file, 53, 4, 3441);
    			attr_dev(img, "id", "button");
    			attr_dev(img, "class", "fixed-position clicked");
    			if (!src_url_equal(img.src, img_src_value = "http://oliviahealth.org/wp-content/uploads/2023/03/olliehead.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Chat Button");
    			add_location(img, file, 118, 8, 6323);
    			add_location(div5, file, 117, 4, 6309);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, p);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, textarea_1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, svg);
    			append_dev(svg, path);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "keydown", /*keydown_handler*/ ctx[6], false, false, false, false),
    					listen_dev(div2, "click", /*click_handler*/ ctx[7], false, false, false, false),
    					listen_dev(img, "click", /*click_handler_1*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loadingMsg*/ ctx[3]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*messageState*/ 4) {
    				each_value = [.../*messageState*/ ctx[2]].reverse();
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*textRows*/ 2 && textarea_1_rows_value !== (textarea_1_rows_value = Math.min(/*textRows*/ ctx[1], 4))) {
    				attr_dev(textarea_1, "rows", textarea_1_rows_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('my-card', slots, []);

    	async function sendUserQuery(query) {
    		const queryResponse = await fetch('', {
    			method: "POST",
    			body: new URLSearchParams({ "data": query })
    		}).catch(err => {
    			sendMessage("Sorry, I am unable to connect to a network. Please check your internet connection.");
    			throw new Error(`Ollie Chatbox Error: ${err}`);
    		});

    		const queryData = await queryResponse.json();

    		const foundData = queryData.confidences.reduce(
    			(acc, curr, index) => {
    				if (curr > 0.3) {
    					acc.push({
    						confidence: curr,
    						name: queryData.names[index].replace(/(<([^>]+)>)/ig, ''), // sanitizing api responses in-case db gets compromised
    						description: queryData.descriptions[index].replace(/(<([^>]+)>)/ig, ''),
    						address: queryData.address[index * 2 + 1].replace(/(<([^>]+)>)/ig, ''),
    						encodedAddress: queryData.address[index * 2].replace(/(<([^>]+)>)/ig, ''),
    						phone: queryData.phone[index].replace(/(<([^>]+)>)/ig, '')
    					});
    				}

    				return acc;
    			},
    			[]
    		).sort((a, b) => a.confidence - b.confidence);

    		if (foundData.length) {
    			sendMessage([
    				"<p>I've found " + foundData.length + (foundData.length > 1
    				? " possible matches for you,"
    				: " possible match for you, "),
    				" Hover over a facility name for a description</p><br/>",
    				...foundData.map((d, i) => `<p><b>${i + 1}. <a title="${d.description}" style="color:white;text-decoration:none;">${d.name}</a></b></p>
                       <a href="tel:${d.phone.replace(/\(|\)|-/g, '')}" style="color:white;"><div style="display: flex; align-items: center; gap: 5px;"><svg viewBox="0 0 512 512" width="10px" height="10px" stroke="currentColor" fill="currentColor" stroke-width="0" ><path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z" /></svg><p><small>${d.phone}</small></p></div></a>
                       <a target="_blank" href="${d.encodedAddress}" style="color:white;"><div style="display: flex; align-items: center; gap: 5px;"><svg viewBox="0 0 512 512" width="10px" height="10px" stroke="currentColor" fill="currentColor" stroke-width="0"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" /></svg><p><small>${d.address}</small></p></div></a>
                       ${i != foundData.length - 1 ? "<br/>" : ""}`)
    			].join(""));
    		} else {
    			sendMessage(queryData.notFoundMessage ?? queryData.winnername);
    		}
    	}

    	function sendMessage(msg) {
    		$$invalidate(3, loadingMsg = true);

    		setTimeout(
    			() => {
    				$$invalidate(2, messageState = [...messageState, { msg: `<p>${msg}</p>`, ollie: true }]);
    				$$invalidate(3, loadingMsg = false);
    			},
    			750
    		);
    	}

    	let numBtnPresses = 0;
    	let textRows = 1;
    	let messageState = [];
    	let loadingMsg = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<my-card> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => {
    		const text = e.target?.value;

    		if (text) {
    			$$invalidate(1, textRows = Math.ceil(text.length / 20));

    			if (e.keyCode === 13 && !e.shiftKey) {
    				e.preventDefault();
    				$$invalidate(2, messageState = [...messageState, { msg: text, ollie: false }]);
    				sendUserQuery(text);
    				$$invalidate(1, textRows = 1);
    				e.target.value = "";
    			}
    		}
    	};

    	const click_handler = () => {
    		const element = document.querySelector("my-card").shadowRoot;
    		const textarea = element.querySelector("textarea");
    		const text = textarea?.value;

    		if (text) {
    			$$invalidate(2, messageState = [...messageState, { msg: text, ollie: false }]);
    			sendUserQuery(text);
    			textarea.value = "";
    			$$invalidate(1, textRows = 1);
    		}
    	};

    	const click_handler_1 = e => {
    		e.preventDefault();
    		e.stopPropagation();
    		const element = document.querySelector("my-card").shadowRoot;
    		const chatbox = element.getElementById("chatBox");
    		const ollieBtn = element.getElementById("button");
    		const txtarea = element.getElementById("chatbox-textarea");
    		ollieBtn.classList.toggle("clicked");
    		chatbox.classList.toggle("show");
    		txtarea.focus();

    		if (numBtnPresses === 0) {
    			sendMessage("<p>Hi! I'm Ollie, your virtual assistant for the OliviaHealth network. How can I help you?</p>");
    			$$invalidate(0, numBtnPresses = numBtnPresses + 1);
    		}
    	};

    	$$self.$capture_state = () => ({
    		sendUserQuery,
    		sendMessage,
    		numBtnPresses,
    		textRows,
    		messageState,
    		loadingMsg
    	});

    	$$self.$inject_state = $$props => {
    		if ('numBtnPresses' in $$props) $$invalidate(0, numBtnPresses = $$props.numBtnPresses);
    		if ('textRows' in $$props) $$invalidate(1, textRows = $$props.textRows);
    		if ('messageState' in $$props) $$invalidate(2, messageState = $$props.messageState);
    		if ('loadingMsg' in $$props) $$invalidate(3, loadingMsg = $$props.loadingMsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		numBtnPresses,
    		textRows,
    		messageState,
    		loadingMsg,
    		sendUserQuery,
    		sendMessage,
    		keydown_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteElement {
    	constructor(options) {
    		super();
    		const style = document.createElement('style');
    		style.textContent = `img{width:100vw}.send-button{color:white;height:25px;width:25px}.send-button:hover{color:whitesmoke;cursor:pointer}#loading-msg{padding:5px 10px 5px 10px;font-size:12px;color:lightgray;font-family:"Comic Sans MS"}.fixed-position{position:fixed;bottom:20px;right:20px}#avatar{width:35px;height:35px}.my-avatar{background-color:#3b3a70;width:35px;min-width:35px;border-radius:50%;object-fit:contain}.msg-right{flex-direction:row-reverse;align-self:end}.msg-left{align-self:start}.msg-right>div{background:#d3d3d3;color:black}.msg-left>div{background:#5b59d3;color:white}#message-text{font-family:"Comic Sans MS";font-size:16px;margin:0;padding:8px;border-radius:6px}p{font-size:small;margin:0px;padding:0px}#message{max-width:80%;display:flex;align-items:end;gap:8px;padding:16px 8px}#chatBox{z-index:9999;overflow:hidden;height:70%;width:400px;border-radius:16px;transition:transform 200ms;position:fixed;bottom:90px;right:90px;transform-origin:bottom right;display:flex;flex-direction:column;justify-content:space-between;box-shadow:8px 8px 32px rgba(1, 1, 1, 0.5)}#chatBox-header{position:relative;color:#9593ff;font-family:"Comic Sans MS";font-weight:600;font-size:24px;padding:8px;background-color:rgb(255, 255, 255);border-top-right-radius:inherit;border-top-left-radius:inherit;box-shadow:0px 1.6px 3.2px 0px rgba(1, 1, 1, 0.2)}#chatBox-header>p{padding:0;font-size:24px;margin:0 0 0 10px}#chatBox-content{display:flex;flex-direction:column-reverse;overflow-y:auto;overflow-x:hidden;word-wrap:anywhere}#chatBox-message{display:flex;justify-content:space-around;padding:8px 0px 8px 8px;background:#9593f8;border-bottom-right-radius:inherit;border-bottom-left-radius:inherit}#chatBox-message>textarea{font-family:'Comic Sans MS';border-radius:16px;padding:2px 10px 0px 10px;width:70%;background:white;outline:none;border:none;resize:none;scrollbar-width:none;box-shadow:1.6px -1.6px 3.2px 0px rgba(1, 1, 1, 0.2)}#chatBox-content{background-color:rgb(246, 246, 246);flex:1}.show{transform:translate(120px, 175px) scale(0)}#button{z-index:10;aspect-ratio:1 / 1;width:70px;color:black;border-radius:50%;cursor:pointer;box-shadow:0px 0px 5px #3b3a70;transition:transform 400ms}.clicked{transform:rotate(360deg);fill:black}@media(max-width:480px){#chatBox{overflow:hidden;width:80%;border-radius:16px;transition:transform 200ms;position:fixed;right:40px;transform-origin:bottom right;display:flex;flex-direction:column;justify-content:space-between;box-shadow:8px 8px 32px rgba(1, 1, 1, 0.5)}}`;
    		this.shadowRoot.appendChild(style);

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}
    		}
    	}
    }

    customElements.define("my-card", App);

    const app = new App({
    	target: document.body,

    });

    return app;

})();
//# sourceMappingURL=chatbox.js.map
