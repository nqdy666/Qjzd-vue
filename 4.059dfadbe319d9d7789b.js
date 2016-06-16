webpackJsonp([4,9],Array(26).concat([
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
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
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
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(60)
	__vue_script__ = __webpack_require__(62)
	__vue_template__ = __webpack_require__(63)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\components\\nvAlert.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(61);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(27)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-77a6254e&file=nvAlert.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./nvAlert.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-77a6254e&file=nvAlert.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./nvAlert.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(26)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**弱提示样式*/\n.wx_loading {\n  position: fixed;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  z-index: 9999;\n  background-color: transparent;\n  text-align: center; }\n  .wx_loading .wx_alert_inner {\n    display: inline-block;\n    margin: 0 auto;\n    text-align: center;\n    background-color: rgba(49, 49, 49, 0.8);\n    color: #ffffff;\n    border-radius: 3px;\n    font-size: 14px;\n    padding: 18px 25px;\n    line-height: 27px;\n    vertical-align: middle;\n    margin-top: 50%; }\n", "", {"version":3,"sources":["/./src/components/nvAlert.vue.style"],"names":[],"mappings":"AAAA,iBAAiB;AACjB,UAAU;AACV;EACE,gBAAgB;EAChB,OAAO;EACP,QAAQ;EACR,UAAU;EACV,SAAS;EACT,cAAc;EACd,8BAA8B;EAC9B,mBAAmB,EAAE;EACrB;IACE,sBAAsB;IACtB,eAAe;IACf,mBAAmB;IACnB,wCAAwC;IACxC,eAAe;IACf,mBAAmB;IACnB,gBAAgB;IAChB,mBAAmB;IACnB,kBAAkB;IAClB,uBAAuB;IACvB,gBAAgB,EAAE","file":"nvAlert.vue","sourcesContent":["@charset \"UTF-8\";\n/**弱提示样式*/\n.wx_loading {\n  position: fixed;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  z-index: 9999;\n  background-color: transparent;\n  text-align: center; }\n  .wx_loading .wx_alert_inner {\n    display: inline-block;\n    margin: 0 auto;\n    text-align: center;\n    background-color: rgba(49, 49, 49, 0.8);\n    color: #ffffff;\n    border-radius: 3px;\n    font-size: 14px;\n    padding: 18px 25px;\n    line-height: 27px;\n    vertical-align: middle;\n    margin-top: 50%; }\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 62 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// <template>
	//     <div id="wxAlert" class="wx_loading" v-show="show">
	//         <div class="wx_alert_inner" id="wx_alert_inner" v-text="content"></div>
	//     </div>
	// </template>
	// <script>
	exports.default = {
	    replace: true,
	    props: ['content', 'show']
	};
	// </script>
	// <style lang="sass">
	// /**弱提示样式*/
	// .wx_loading {
	//     position: fixed;
	//     top: 0;
	//     left: 0;
	//     bottom: 0;
	//     right: 0;
	//     z-index: 9999;
	//     background-color: rgba(0, 0, 0, 0);
	//     text-align: center;
	//     .wx_alert_inner {
	//         display: inline-block;
	//         margin: 0 auto;
	//         text-align: center;
	//         background-color: rgba(49, 49, 49, 0.8);
	//         color: #ffffff;
	//         border-radius: 3px;
	//         font-size: 14px;
	//         padding: 18px 25px;
	//         line-height: 27px;
	//         vertical-align: middle;
	//         margin-top: 50%;
	//     }
	// }
	// </style>
	/* generated by vue-loader */

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = "\n    <div id=\"wxAlert\" class=\"wx_loading\" v-show=\"show\">\n        <div class=\"wx_alert_inner\" id=\"wx_alert_inner\" v-text=\"content\"></div>\n    </div>\n";

/***/ },
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(74)
	__vue_script__ = __webpack_require__(76)
	__vue_template__ = __webpack_require__(77)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "D:\\FrontWorkspaces\\Qjzd-vue\\src\\views\\new.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(75);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(27)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-49d05b57&file=new.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./new.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?sourceMap!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-49d05b57&file=new.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./new.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(26)();
	// imports
	
	
	// module
	exports.push([module.id, ".add-container {\n  margin-top: 50px;\n  background-color: #fff; }\n  .add-container .line {\n    padding: 10px 15px;\n    border-bottom: solid 1px #d4d4d4; }\n    .add-container .line .add-btn {\n      color: #fff;\n      background-color: #80bd01;\n      padding: 5px 15px;\n      border-radius: 5px; }\n    .add-container .line .add-tab {\n      display: inline-block;\n      width: calc(100% - 140px);\n      min-width: 50%;\n      font-size: 16px;\n      background: transparent; }\n      .add-container .line .add-tab :after {\n        content: 'xe60e'; }\n    .add-container .line .add-title {\n      font-size: 16px;\n      border: none;\n      width: 100%;\n      background: transparent;\n      height: 25px; }\n    .add-container .line .err {\n      border: solid 1px red; }\n  .add-container .add-content {\n    margin: 15px 2%;\n    width: 96%;\n    border-color: #d4d4d4;\n    color: #000; }\n  .add-container .err {\n    border: solid 1px red; }\n", "", {"version":3,"sources":["/./src/views/new.vue.style"],"names":[],"mappings":"AAAA;EACE,iBAAiB;EACjB,uBAAuB,EAAE;EACzB;IACE,mBAAmB;IACnB,iCAAiC,EAAE;IACnC;MACE,YAAY;MACZ,0BAA0B;MAC1B,kBAAkB;MAClB,mBAAmB,EAAE;IACvB;MACE,sBAAsB;MACtB,0BAA0B;MAC1B,eAAe;MACf,gBAAgB;MAChB,wBAAwB,EAAE;MAC1B;QACE,iBAAiB,EAAE;IACvB;MACE,gBAAgB;MAChB,aAAa;MACb,YAAY;MACZ,wBAAwB;MACxB,aAAa,EAAE;IACjB;MACE,sBAAsB,EAAE;EAC5B;IACE,gBAAgB;IAChB,WAAW;IACX,sBAAsB;IACtB,YAAY,EAAE;EAChB;IACE,sBAAsB,EAAE","file":"new.vue","sourcesContent":[".add-container {\n  margin-top: 50px;\n  background-color: #fff; }\n  .add-container .line {\n    padding: 10px 15px;\n    border-bottom: solid 1px #d4d4d4; }\n    .add-container .line .add-btn {\n      color: #fff;\n      background-color: #80bd01;\n      padding: 5px 15px;\n      border-radius: 5px; }\n    .add-container .line .add-tab {\n      display: inline-block;\n      width: calc(100% - 140px);\n      min-width: 50%;\n      font-size: 16px;\n      background: transparent; }\n      .add-container .line .add-tab :after {\n        content: 'xe60e'; }\n    .add-container .line .add-title {\n      font-size: 16px;\n      border: none;\n      width: 100%;\n      background: transparent;\n      height: 25px; }\n    .add-container .line .err {\n      border: solid 1px red; }\n  .add-container .add-content {\n    margin: 15px 2%;\n    width: 96%;\n    border-color: #d4d4d4;\n    color: #000; }\n  .add-container .err {\n    border: solid 1px red; }\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// <template>
	//     <nv-head page-type="主题"
	//         :show-menu="false"
	//         fix-head="true"></nv-head>
	//     <div class="add-container">
	//         <div class="line">选择分类：
	//             <select class="add-tab" v-model="topic.tab">
	//                 <option value="share">分享</option>
	//                 <option value="coder">码农</option>
	//                 <option value="shoot">摄影</option>
	//                 <option value="bike">单车</option>
	//                 <option value="talk">聊聊</option>
	//                 <option value="love">爱情</option>
	//             </select>
	//             <a class="add-btn" @click="addTopic">发布</a>
	//         </div>
	//         <div class="line">
	//             <input class="add-title" v-model="topic.title"
	//                     type="text" :class="{'err':err=='title'}"
	//                     placeholder="标题，字数10字以上" max-length="100"/>
	//         </div>
	//         <textarea v-model="topic.content" rows="35" class="add-content"
	//             :class="{'err':err=='content'}"
	//             v-model="content"
	//             placeholder='回复支持Markdown语法,请注意标记代码'>
	//         </textarea>
	//     </div>
	// </template>
	//
	// <script>
	exports.default = {
	    data: function data() {
	        var self = this;
	        return {
	            topic: {
	                tab: 'share',
	                title: '',
	                content: '',
	                accesstoken: localStorage.token
	            },
	            err: '',
	            authorTxt: '<br/><br/><a class="from" href="https://github.com/shinygang/Vue-cnodejs">I‘m webapp-cnodejs-vue</a>',
	            alert: {
	                txt: '',
	                show: false,
	                hideFn: function hideFn() {
	                    var timer = void 0;
	                    clearTimeout(timer);
	                    timer = setTimeout(function () {
	                        self.alert.show = false;
	                    }, 1000);
	                }
	            }
	        };
	    },
	
	    methods: {
	        addTopic: function addTopic() {
	            var self = this,
	                title = $.trim(self.topic.title),
	                contents = $.trim(self.topic.content);
	            if (!title || title.length < 10) {
	                self.err = 'title';
	                return false;
	            }
	            if (!contents) {
	                self.err = 'content';
	                return false;
	            }
	            self.topic.content = self.topic.content + self.authorTxt;
	            $.ajax({
	                type: 'POST',
	                url: 'https://qjzd.net/api/v1/topics',
	                data: self.topic,
	                dataType: 'json',
	                success: function success(res) {
	                    if (res.success) {
	                        self.$route.router.go({ name: 'home' });
	                    }
	                },
	                error: function error(res) {
	                    var error = JSON.parse(res.responseText);
	                    self.alert.txt = error.error_msg;
	                    self.alert.show = true;
	                    self.alert.hideFn();
	                    return false;
	                }
	            });
	        }
	    },
	    components: {
	        "nvHead": __webpack_require__(38),
	        "nvAlert": __webpack_require__(59)
	    }
	};
	// </script>
	//
	// <style lang="sass">
	//     .add-container{
	//         margin-top: 50px;
	//         background-color: #fff;
	//
	//         .line{
	//             padding: 10px 15px;
	//             border-bottom: solid 1px #d4d4d4;
	//
	//             .add-btn{
	//                 color: #fff;
	//                 background-color: #80bd01;
	//                 padding: 5px 15px;
	//                 border-radius: 5px;
	//             }
	//
	//             .add-tab{
	//                 display: inline-block;
	//                 width: calc(100% - 140px);
	//                 min-width: 50%;
	//                 font-size: 16px;
	//                 background: transparent;
	//                 :after{
	//                     content:'xe60e';
	//                 };
	//             }
	//
	//             .add-title{
	//                 font-size: 16px;
	//                 border: none;
	//                 width: 100%;
	//                 background: transparent;
	//                 height: 25px;
	//             }
	//             .err {
	//                 border: solid 1px red;
	//             }
	//         }
	//         .add-content {
	//             margin: 15px 2%;
	//             width: 96%;
	//             border-color: #d4d4d4;
	//             color: #000;
	//         }
	//         .err {
	//             border: solid 1px red;
	//         }
	//     }
	//
	// </style>
	/* generated by vue-loader */
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = "\n    <nv-head page-type=\"主题\"\n        :show-menu=\"false\"\n        fix-head=\"true\"></nv-head>\n    <div class=\"add-container\">\n        <div class=\"line\">选择分类：\n            <select class=\"add-tab\" v-model=\"topic.tab\">\n                <option value=\"share\">分享</option>\n                <option value=\"coder\">码农</option>\n                <option value=\"shoot\">摄影</option>\n                <option value=\"bike\">单车</option>\n                <option value=\"talk\">聊聊</option>\n                <option value=\"love\">爱情</option>\n            </select>\n            <a class=\"add-btn\" @click=\"addTopic\">发布</a>\n        </div>\n        <div class=\"line\">\n            <input class=\"add-title\" v-model=\"topic.title\"\n                    type=\"text\" :class=\"{'err':err=='title'}\"\n                    placeholder=\"标题，字数10字以上\" max-length=\"100\"/>\n        </div>\n        <textarea v-model=\"topic.content\" rows=\"35\" class=\"add-content\"\n            :class=\"{'err':err=='content'}\"\n            v-model=\"content\"\n            placeholder='回复支持Markdown语法,请注意标记代码'>\n        </textarea>\n    </div>\n";

/***/ }
]));
//# sourceMappingURL=4.059dfadbe319d9d7789b.js.map