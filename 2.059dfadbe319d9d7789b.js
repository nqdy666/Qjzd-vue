webpackJsonp([2,9],Array(26).concat([
/* 26 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(35)
	__vue_template__ = __webpack_require__(56)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\views\\list.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _stringify = __webpack_require__(36);
	
	var _stringify2 = _interopRequireDefault(_stringify);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// <template>
	//     <!-- 全局header -->
	//     <nv-head :page-type="searchKey.tab | getTitleStr"
	//             fix-head="true"
	//             :need-add="true"
	//             :show-menu.sync="showMenu">
	//     </nv-head>
	//
	//     <section id="page">
	//         <!-- 首页列表 -->
	//         <ul class="posts-list">
	//             <li v-for="item in topics"
	//                     v-link="{name:'topic',params:{id:item.id}}">
	//
	//                 <h3 v-text="item.title"
	//                         :class="item.tab | getTabClassName item.good item.top"
	//                         :title="item.tab | getTabStr item.good item.top">
	//                 </h3>
	//                 <div class="content">
	//                     <img class="avatar" :src="item.author.avatar_url" />
	//                     <div class="info">
	//                         <p>
	//                             <span class="name">
	//                                 {{item.author.loginname}}
	//                             </span>
	//                             <span class="status" v-if="item.reply_count > 0">
	//                                 <b>{{item.reply_count}}</b>
	//                                 /{{item.visit_count}}
	//                             </span>
	//                         </p>
	//                         <p>
	//                             <time>
	//                                 {{item.create_at | getLastTimeStr true}}
	//                             </time>
	//                             <time>
	//                                 {{item.last_reply_at | getLastTimeStr true}}
	//                             </time>
	//                         </p>
	//                     </div>
	//                 </div>
	//             </li>
	//         </ul>
	//     </section>
	//     <nv-top></nv-top>
	// </template>
	//
	// <script>
	exports.default = {
	    data: function data() {
	        return {
	            showMenu: false,
	            scroll: true,
	            topics: [],
	            searchKey: {
	                page: 1,
	                limit: 20,
	                tab: 'all',
	                mdrender: true
	            },
	            searchDataStr: ''
	        };
	    },
	
	    route: {
	        data: function data(transition) {
	            var _this = this;
	
	            var query = transition.to.query,
	                tab = query.tab || 'all';
	
	            //记录首次加载的查询条件
	            if (this.searchDataStr == "") {
	                this.searchDataStr = (0, _stringify2.default)(this.searchKey);
	            }
	            //如果从左侧切换分类，则清空查询条件
	            if (transition.from.name === "list") {
	                //this.searchKey.page = 1;
	                this.searchKey.limit = 20;
	                this.searchKey = JSON.parse(this.searchDataStr);
	            }
	
	            //如果从详情返回并且typeid一样才去sessionStorge
	            if (sessionStorage.searchKey && transition.from.name === "topic" && sessionStorage.tab == tab) {
	                this.topics = JSON.parse(sessionStorage.topics);
	                this.searchKey = JSON.parse(sessionStorage.searchKey);
	                this.$nextTick(function () {
	                    return $(window).scrollTop(sessionStorage.scrollTop);
	                });
	            } else {
	                //页面初次加载获取的数据
	                this.searchKey.tab = query.tab;
	                this.getTopics();
	            }
	            this.showMenu = false;
	
	            //滚动加载
	            $(window).on('scroll', function () {
	                _this.getScrollData();
	            });
	        },
	        deactivate: function deactivate(transition) {
	            $(window).off('scroll');
	            if (transition.to.name === "topic") {
	                sessionStorage.scrollTop = $(window).scrollTop();
	                sessionStorage.topics = (0, _stringify2.default)(this.topics);
	                sessionStorage.searchKey = (0, _stringify2.default)(this.searchKey);
	                sessionStorage.tab = transition.from.query.tab || 'all';
	            } else {
	                sessionStorage.removeItem("topics");
	                sessionStorage.removeItem("searchKey");
	                sessionStorage.removeItem("tab");
	            }
	            transition.next();
	        }
	    },
	    methods: {
	        getTopics: function getTopics(searchKey) {
	            var _this2 = this;
	
	            var params = $.param(this.searchKey);
	            $.get('https://qjzd.net/api/v1/topics?' + params, function (d) {
	                _this2.scroll = true;
	                if (d && d.data) {
	                    _this2.topics = d.data;
	                    // if(this.searchKey.page == 0){
	                    //     this.topics = d.data;
	                    // }
	                    // else{
	                    //     this.topics = this.topics.concat(d.data);
	                    // }
	                }
	            });
	        },
	
	        //滚动加载数据
	        getScrollData: function getScrollData() {
	            if (this.scroll) {
	                var totalheight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
	                if ($(document).height() <= totalheight + 200) {
	                    this.scroll = false;
	                    this.searchKey.limit += 20;
	                    this.getTopics();
	                }
	            }
	        }
	    },
	    components: {
	        "nvHead": __webpack_require__(38),
	        "nvTop": __webpack_require__(51)
	    }
	};
	// </script>
	//
	/* generated by vue-loader */
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(37), __esModule: true };

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var core = __webpack_require__(11);
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return (core.JSON && core.JSON.stringify || JSON.stringify).apply(JSON, arguments);
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(39)
	__vue_template__ = __webpack_require__(50)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\components\\header.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _utils = __webpack_require__(19);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//加载公用函数
	
	exports.default = {
	    replace: true,
	    props: ['pageType', 'fixHead', 'showMenu', 'messageCount', 'needAdd'],
	    data: function data() {
	        return {
	            nickname: '',
	            profileimgurl: ''
	        };
	    },
	
	    methods: {
	        openMenu: function openMenu() {
	            $("html, body, #page").addClass("scroll-hide");
	            this.showMenu = !this.showMenu;
	        },
	        showMenus: function showMenus() {
	            this.showMenu = !this.showMenu;
	            $("html, body, #page").removeClass("scroll-hide");
	        }
	    },
	    components: {
	        'nvMenu': __webpack_require__(40)
	    }
	};
	// </script>
	//
	/* generated by vue-loader */
	// <template>
	//     <div class="page-cover"
	//             v-if="showMenu&&fixHead"
	//             @click="showMenus">
	//     </div>
	//     <header :class="{'show':showMenu&&fixHead,'fix-header':fixHead,'no-fix':!fixHead}" id="hd">
	//         <div class="nv-toolbar">
	//             <div class="toolbar-nav"
	//                     @click="openMenu"
	//                     v-if="fixHead">
	//             </div>
	//             <span v-text="pageType"></span>
	//             <i class="num" v-if="messageCount > 0"> {{messageCount}}</i>
	//             <i v-if="needAdd" v-show="!messageCount || messageCount <= 0"
	//                 class="iconfont add-icon" v-link="{name:'add'}">&#xe60f;</i>
	//         </div>
	//     </header>
	//     <nv-menu :show-menu="showMenu"
	//             :page-type="pageType"
	//             :nick-name="nickname"
	//             :profile-url="profileimgurl"
	//             v-if="fixHead" ></nv-menu>
	// </template>
	//
	// <script>
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(41)
	__vue_script__ = __webpack_require__(43)
	__vue_template__ = __webpack_require__(49)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\components\\menu.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(42);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(27)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-1b617f4a&file=menu.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./menu.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-1b617f4a&file=menu.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./menu.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(26)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/*侧边栏*/\n.nav-list {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: -200px;\n  width: 200px;\n  background-color: #fff;\n  color: #313131;\n  -webkit-transition: all .3s ease;\n  transition: all .3s ease;\n  z-index: 99; }\n  .nav-list.show {\n    -webkit-transform: translateX(200px);\n            transform: translateX(200px); }\n\n/*侧边栏列表*/\n.list-ul {\n  margin: 0 24px;\n  border-top: 1px solid #d4d4d4;\n  overflow: hidden;\n  padding-top: 9%; }\n  .list-ul li {\n    font-size: 14px;\n    font-weight: 200;\n    padding: 9% 0;\n    text-align: left;\n    text-indent: 1px;\n    line-height: 15px;\n    color: #7f8c8d; }\n    .list-ul li:last-child {\n      margin-bottom: 50px; }\n    .list-ul li:before {\n      color: #2c3e50; }\n  .list-ul .line {\n    border-top: 1px solid #d4d4d4; }\n  .list-ul a {\n    display: block;\n    color: #313131; }\n", "", {"version":3,"sources":["/./src/components/menu.vue.style"],"names":[],"mappings":"AAAA,iBAAiB;AACjB,OAAO;AACP;EACE,gBAAgB;EAChB,OAAO;EACP,UAAU;EACV,aAAa;EACb,aAAa;EACb,uBAAuB;EACvB,eAAe;EACf,iCAAyB;EAAzB,yBAAyB;EACzB,YAAY,EAAE;EACd;IACE,qCAA6B;YAA7B,6BAA6B,EAAE;;AAEnC,SAAS;AACT;EACE,eAAe;EACf,8BAA8B;EAC9B,iBAAiB;EACjB,gBAAgB,EAAE;EAClB;IACE,gBAAgB;IAChB,iBAAiB;IACjB,cAAc;IACd,iBAAiB;IACjB,iBAAiB;IACjB,kBAAkB;IAClB,eAAe,EAAE;IACjB;MACE,oBAAoB,EAAE;IACxB;MACE,eAAe,EAAE;EACrB;IACE,8BAA8B,EAAE;EAClC;IACE,eAAe;IACf,eAAe,EAAE","file":"menu.vue","sourcesContent":["@charset \"UTF-8\";\n/*侧边栏*/\n.nav-list {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: -200px;\n  width: 200px;\n  background-color: #fff;\n  color: #313131;\n  transition: all .3s ease;\n  z-index: 99; }\n  .nav-list.show {\n    transform: translateX(200px); }\n\n/*侧边栏列表*/\n.list-ul {\n  margin: 0 24px;\n  border-top: 1px solid #d4d4d4;\n  overflow: hidden;\n  padding-top: 9%; }\n  .list-ul li {\n    font-size: 14px;\n    font-weight: 200;\n    padding: 9% 0;\n    text-align: left;\n    text-indent: 1px;\n    line-height: 15px;\n    color: #7f8c8d; }\n    .list-ul li:last-child {\n      margin-bottom: 50px; }\n    .list-ul li:before {\n      color: #2c3e50; }\n  .list-ul .line {\n    border-top: 1px solid #d4d4d4; }\n  .list-ul a {\n    display: block;\n    color: #313131; }\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// <template>
	//     <section id="sideBar" class="nav-list" :class="{'show':showMenu}">
	//         <user-info></user-info>
	//         <ul class="list-ul">
	//             <li class="icon-quanbu iconfont" v-link="{'name':'list',query:{tab:'all'}}">全部</li>
	//             <li class="icon-hao iconfont" v-link="{name:'list',query:{tab:'good'}}">精华</li>
	//             <li class="icon-fenxiang iconfont" v-link="{name:'list',query:{tab:'share'}}">分享</li>
	//             <li class="icon-wenda iconfont" v-link="{name:'list',query:{tab:'coder'}}">码农</li>
	//             <li class="icon-zhaopin iconfont" v-link="{name:'list',query:{tab:'shoot'}}">摄影</li>
	//             <li class="icon-wenda iconfont" v-link="{name:'list',query:{tab:'bike'}}">单车</li>
	//             <li class="icon-zhaopin iconfont" v-link="{name:'list',query:{tab:'talk'}}">聊聊</li>
	//             <li class="icon-wenda iconfont" v-link="{name:'list',query:{tab:'love'}}">爱情</li>
	//             <li class="icon-xiaoxi iconfont line" v-link="{name:'message'}" class="line">消息</li>
	//             <li class="icon-about iconfont" v-link="{name:'about'}">关于</li>
	//         </ul>
	//     </section>
	// </template>
	// <script>
	exports.default = {
	    replace: true,
	    props: ['showMenu', 'pageType', 'nickName', 'profileUrl'],
	    components: {
	        'userInfo': __webpack_require__(44)
	    }
	};
	// </script>
	//
	// <style lang="sass">
	// /*侧边栏*/
	// .nav-list {
	//     position: fixed;
	//     top: 0;
	//     bottom: 0;
	//     left: -200px;
	//     width: 200px;
	//     background-color: #fff;
	//     color: #313131;
	//     transition: all .3s ease;
	//     z-index: 99;
	//     &.show{
	//         transform: translateX(200px);
	//     }
	// }
	//
	// /*侧边栏列表*/
	// .list-ul {
	//     margin: 0 24px;
	//     border-top: 1px solid #d4d4d4;
	//     overflow: hidden;
	//     padding-top: 9%;
	//     li {
	//         font-size: 14px;
	//         font-weight: 200;
	//         padding: 9% 0;
	//         text-align: left;
	//         text-indent: 1px;
	//         line-height: 15px;
	//         color: #7f8c8d;
	//         &:last-child {
	//             margin-bottom: 50px;
	//         }
	//         &:before{
	//             color: #2c3e50;
	//         }
	//     }
	//
	//     .line{
	//         border-top: 1px solid #d4d4d4;
	//     }
	//     a {
	//         display: block;
	//         color: #313131;
	//     }
	// }
	// </style>
	/* generated by vue-loader */

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(45)
	__vue_script__ = __webpack_require__(47)
	__vue_template__ = __webpack_require__(48)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\components\\user-info.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(46);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(27)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-de64edd6&file=user-info.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./user-info.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-de64edd6&file=user-info.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./user-info.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(26)();
	// imports
	
	
	// module
	exports.push([module.id, "\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"user-info.vue","sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 47 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// <template>
	//     <div class="user-info">
	//         <!-- 未登录 -->
	//         <ul class="login-no" v-if="!loginname">
	//             <li class="login" @click="goEnter"><a >登录</a></li>
	//         </ul>
	//         <!-- 已登录 -->
	//         <div class="login-yes" v-if="loginname" @click="goUser">
	//             <div class="avertar"><img v-if="avatar_url" :src="avatar_url"></div>
	//             <div class="info">
	//                 <p v-if="loginname" v-text="loginname"></p>
	//             </div>
	//         </div>
	//     </div>
	// </template>
	// <script>
	exports.default = {
	    replace: true,
	    data: function data() {
	        return {
	            loginname: localStorage.loginname || "",
	            avatar_url: localStorage.avatar_url || ""
	        };
	    },
	
	    methods: {
	        goEnter: function goEnter() {
	            var link = '/login?redirect=' + encodeURIComponent(this.$route.path);
	            this.$route.router.go(link);
	        },
	        goUser: function goUser() {
	            this.$route.router.go({ name: 'user', params: { loginname: localStorage.loginname } });
	        }
	    }
	};
	// </script>
	//
	// <style lang="sass">
	//
	// </style>
	/* generated by vue-loader */

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = "\n    <div class=\"user-info\">\n        <!-- 未登录 -->\n        <ul class=\"login-no\" v-if=\"!loginname\">\n            <li class=\"login\" @click=\"goEnter\"><a >登录</a></li>\n        </ul>\n        <!-- 已登录 -->\n        <div class=\"login-yes\" v-if=\"loginname\" @click=\"goUser\">\n            <div class=\"avertar\"><img v-if=\"avatar_url\" :src=\"avatar_url\"></div>\n            <div class=\"info\">\n                <p v-if=\"loginname\" v-text=\"loginname\"></p>\n            </div>\n        </div>\n    </div>\n";

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = "\n    <section id=\"sideBar\" class=\"nav-list\" :class=\"{'show':showMenu}\">\n        <user-info></user-info>\n        <ul class=\"list-ul\">\n            <li class=\"icon-quanbu iconfont\" v-link=\"{'name':'list',query:{tab:'all'}}\">全部</li>\n            <li class=\"icon-hao iconfont\" v-link=\"{name:'list',query:{tab:'good'}}\">精华</li>\n            <li class=\"icon-fenxiang iconfont\" v-link=\"{name:'list',query:{tab:'share'}}\">分享</li>\n            <li class=\"icon-wenda iconfont\" v-link=\"{name:'list',query:{tab:'coder'}}\">码农</li>\n            <li class=\"icon-zhaopin iconfont\" v-link=\"{name:'list',query:{tab:'shoot'}}\">摄影</li>\n            <li class=\"icon-wenda iconfont\" v-link=\"{name:'list',query:{tab:'bike'}}\">单车</li>\n            <li class=\"icon-zhaopin iconfont\" v-link=\"{name:'list',query:{tab:'talk'}}\">聊聊</li>\n            <li class=\"icon-wenda iconfont\" v-link=\"{name:'list',query:{tab:'love'}}\">爱情</li>\n            <li class=\"icon-xiaoxi iconfont line\" v-link=\"{name:'message'}\" class=\"line\">消息</li>\n            <li class=\"icon-about iconfont\" v-link=\"{name:'about'}\">关于</li>\n        </ul>\n    </section>\n";

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = "\n    <div class=\"page-cover\"\n            v-if=\"showMenu&&fixHead\"\n            @click=\"showMenus\">\n    </div>\n    <header :class=\"{'show':showMenu&&fixHead,'fix-header':fixHead,'no-fix':!fixHead}\" id=\"hd\">\n        <div class=\"nv-toolbar\">\n            <div class=\"toolbar-nav\"\n                    @click=\"openMenu\"\n                    v-if=\"fixHead\">\n            </div>\n            <span v-text=\"pageType\"></span>\n            <i class=\"num\" v-if=\"messageCount > 0\"> {{messageCount}}</i>\n            <i v-if=\"needAdd\" v-show=\"!messageCount || messageCount <= 0\"\n                class=\"iconfont add-icon\" v-link=\"{name:'add'}\">&#xe60f;</i>\n        </div>\n    </header>\n    <nv-menu :show-menu=\"showMenu\"\n            :page-type=\"pageType\"\n            :nick-name=\"nickname\"\n            :profile-url=\"profileimgurl\"\n            v-if=\"fixHead\" ></nv-menu>\n";

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(52)
	__vue_script__ = __webpack_require__(54)
	__vue_template__ = __webpack_require__(55)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\components\\backtotop.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(53);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(27)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-55dbde98&file=backtotop.vue!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./backtotop.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-55dbde98&file=backtotop.vue!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./backtotop.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(26)();
	// imports
	
	
	// module
	exports.push([module.id, "\n    .icon-top {\n        position: fixed;\n        right: 10px;\n        bottom: 80px;\n        font-size: 50px;\n        z-index: 9999;\n        color: #42b983;\n    }\n", "", {"version":3,"sources":["/./src/components/backtotop.vue.style"],"names":[],"mappings":";IA8BA;QACA,gBAAA;QACA,YAAA;QACA,aAAA;QACA,gBAAA;QACA,cAAA;QACA,eAAA;KACA","file":"backtotop.vue","sourcesContent":["<template>\n<div class=\"iconfont icon-top\" v-show=\"show\" @click=\"goTop\">&#xe611;</div>\n</template>\n<script>\n    export default {\n        replace:true,\n        data (){\n            return {\n                show: false,\n            }\n        },\n        ready (){\n            $(window).on('scroll', () => {\n                if($(window).scrollTop() > 100){\n                    this.show = true;\n                }\n            });\n        },\n        beforeDestory (){\n            $(window).off('scroll');\n        },\n        methods:{\n            goTop (){\n                $(window).scrollTop(0);\n                this.show = false;\n            }\n        }\n    }\n</script>\n<style>\n    .icon-top {\n        position: fixed;\n        right: 10px;\n        bottom: 80px;\n        font-size: 50px;\n        z-index: 9999;\n        color: #42b983;\n    }\n</style>"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// <template>
	// <div class="iconfont icon-top" v-show="show" @click="goTop">&#xe611;</div>
	// </template>
	// <script>
	exports.default = {
	    replace: true,
	    data: function data() {
	        return {
	            show: false
	        };
	    },
	    ready: function ready() {
	        var _this = this;
	
	        $(window).on('scroll', function () {
	            if ($(window).scrollTop() > 100) {
	                _this.show = true;
	            }
	        });
	    },
	    beforeDestory: function beforeDestory() {
	        $(window).off('scroll');
	    },
	
	    methods: {
	        goTop: function goTop() {
	            $(window).scrollTop(0);
	            this.show = false;
	        }
	    }
	};
	// </script>
	// <style>
	//     .icon-top {
	//         position: fixed;
	//         right: 10px;
	//         bottom: 80px;
	//         font-size: 50px;
	//         z-index: 9999;
	//         color: #42b983;
	//     }
	// </style>
	/* generated by vue-loader */
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"iconfont icon-top\" v-show=\"show\" @click=\"goTop\">&#xe611;</div>\n";

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = "\n    <!-- 全局header -->\n    <nv-head :page-type=\"searchKey.tab | getTitleStr\"\n            fix-head=\"true\"\n            :need-add=\"true\"\n            :show-menu.sync=\"showMenu\">\n    </nv-head>\n    \n    <section id=\"page\">\n        <!-- 首页列表 -->\n        <ul class=\"posts-list\">\n            <li v-for=\"item in topics\"\n                    v-link=\"{name:'topic',params:{id:item.id}}\">\n\n                <h3 v-text=\"item.title\"\n                        :class=\"item.tab | getTabClassName item.good item.top\"\n                        :title=\"item.tab | getTabStr item.good item.top\">\n                </h3>\n                <div class=\"content\">\n                    <img class=\"avatar\" :src=\"item.author.avatar_url\" />\n                    <div class=\"info\">\n                        <p>\n                            <span class=\"name\">\n                                {{item.author.loginname}}\n                            </span>\n                            <span class=\"status\" v-if=\"item.reply_count > 0\">\n                                <b>{{item.reply_count}}</b>\n                                /{{item.visit_count}}\n                            </span>\n                        </p>\n                        <p>\n                            <time>\n                                {{item.create_at | getLastTimeStr true}}\n                            </time>\n                            <time>\n                                {{item.last_reply_at | getLastTimeStr true}}\n                            </time>\n                        </p>\n                    </div>\n                </div>\n            </li>\n        </ul>\n    </section>\n    <nv-top></nv-top>\n";

/***/ }
]));
//# sourceMappingURL=2.059dfadbe319d9d7789b.js.map