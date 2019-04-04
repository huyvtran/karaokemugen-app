(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{513:function(e,t,n){"use strict";n.r(t);var a=n(20),r=n(21),i=n(23),o=n(22),s=n(24),l=n(0),u=n.n(l),p=n(49),c=n.n(p),f=n(25),d=n(15),h=n(521),g=n(61),m=n(516),y=n(506),v=n(27),x=function(e){function t(e){var n;return Object(a.a)(this,t),(n=Object(i.a)(this,Object(o.a)(t).call(this,e))).columns=[{title:"Language",dataIndex:"language",key:"language",render:function(e){return e.toUpperCase()}},{title:"Series/Singer",dataIndex:"serie",key:"serie",render:function(e,t){return e||t.singer}},{title:"Type",dataIndex:"songtype",key:"songtype",render:function(e,t){return e.replace("TYPE_","")+" "+t.songorder}},{title:"Title",dataIndex:"title",key:"title"},{title:"Action",key:"action",render:function(e,t){return u.a.createElement("span",null,u.a.createElement(y.a,{to:"/karas/".concat(t.kara_id)},u.a.createElement(d.a,{type:"edit"})))}}],n.state={karas:[],kara:{},currentPage:localStorage.getItem("karaPage")||1,filter:localStorage.getItem("karaFilter")||""},n}return Object(s.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){this.refresh()}},{key:"refresh",value:function(){var e=this;this.props.loading(!0),c.a.get("/api/karas",{params:{filter:this.state.filter}}).then(function(t){e.props.loading(!1),e.setState({karas:t.data.content})}).catch(function(t){e.props.loading(!1),e.props.errorMessage("".concat(t.response.status,": ").concat(t.response.statusText,". ").concat(t.response.data))})}},{key:"changePage",value:function(e){this.setState({currentPage:e}),localStorage.setItem("karaPage",e)}},{key:"changeFilter",value:function(e){this.setState({filter:e.target.value}),localStorage.setItem("karaFilter",this.state.filter)}},{key:"render",value:function(){var e=this;return u.a.createElement(h.a.Content,{style:{padding:"25px 50px",textAlign:"center"}},u.a.createElement(h.a,null,u.a.createElement(h.a.Header,null,u.a.createElement(g.a.Search,{placeholder:this.state.filter||"Search filter",onChange:function(t){return e.changeFilter(t)},enterButton:"Search",onSearch:this.refresh.bind(this)})),u.a.createElement(h.a.Content,null,u.a.createElement(m.a,{dataSource:this.state.karas,columns:this.columns,rowKey:"kara_id",pagination:{current:this.state.currentPage,defaultPageSize:100,pageSize:100,pageSizeOptions:["10","25","50","100","500"],showTotal:function(e,t){var n=t[1],a=t[0];return"Showing ".concat(a,"-").concat(n," of ").concat(e," songs")},total:this.state.karas.length,showSizeChanger:!0,showQuickJumper:!0,onChange:function(t){return e.changePage(t)}}}))))}}]),t}(l.Component);t.default=Object(f.b)(function(e){return{loadingActive:e.navigation.loading}},function(e){return{loading:function(t){return e(Object(v.i)(t))},errorMessage:function(t){return e(Object(v.g)(t))},warnMessage:function(t){return e(Object(v.j)(t))}}})(x)},61:function(e,t,n){"use strict";var a=n(2),r=n.n(a),i=n(8),o=n.n(i),s=n(5),l=n.n(s),u=n(13),p=n.n(u),c=n(4),f=n.n(c),d=n(7),h=n.n(d),g=n(0),m=n(11),y=n(14),v=n.n(y),x=n(70);var b=function(e){function t(){l()(this,t);var e=f()(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments));return e.handleKeyDown=function(t){var n=e.props,a=n.onPressEnter,r=n.onKeyDown;13===t.keyCode&&a&&a(t),r&&r(t)},e.saveInput=function(t){e.input=t},e}return h()(t,e),p()(t,[{key:"focus",value:function(){this.input.focus()}},{key:"blur",value:function(){this.input.blur()}},{key:"select",value:function(){this.input.select()}},{key:"getInputClassName",value:function(){var e,t=this.props,n=t.prefixCls,a=t.size,r=t.disabled;return v()(n,(e={},o()(e,n+"-sm","small"===a),o()(e,n+"-lg","large"===a),o()(e,n+"-disabled",r),e))}},{key:"renderLabeledInput",value:function(e){var t,n=this.props;if(!n.addonBefore&&!n.addonAfter)return e;var a=n.prefixCls+"-group",r=a+"-addon",i=n.addonBefore?g.createElement("span",{className:r},n.addonBefore):null,s=n.addonAfter?g.createElement("span",{className:r},n.addonAfter):null,l=v()(n.prefixCls+"-wrapper",o()({},a,i||s)),u=v()(n.prefixCls+"-group-wrapper",(t={},o()(t,n.prefixCls+"-group-wrapper-sm","small"===n.size),o()(t,n.prefixCls+"-group-wrapper-lg","large"===n.size),t));return g.createElement("span",{className:u,style:n.style},g.createElement("span",{className:l},i,g.cloneElement(e,{style:null}),s))}},{key:"renderLabeledIcon",value:function(e){var t,n=this.props;if(!("prefix"in n||"suffix"in n))return e;var a=n.prefix?g.createElement("span",{className:n.prefixCls+"-prefix"},n.prefix):null,r=n.suffix?g.createElement("span",{className:n.prefixCls+"-suffix"},n.suffix):null,i=v()(n.className,n.prefixCls+"-affix-wrapper",(t={},o()(t,n.prefixCls+"-affix-wrapper-sm","small"===n.size),o()(t,n.prefixCls+"-affix-wrapper-lg","large"===n.size),t));return g.createElement("span",{className:i,style:n.style},a,g.cloneElement(e,{style:null,className:this.getInputClassName()}),r)}},{key:"renderInput",value:function(){var e=this.props,t=e.value,n=e.className,a=Object(x.a)(this.props,["prefixCls","onPressEnter","addonBefore","addonAfter","prefix","suffix"]);return"value"in this.props&&(a.value=function(e){return"undefined"===typeof e||null===e?"":e}(t),delete a.defaultValue),this.renderLabeledIcon(g.createElement("input",r()({},a,{className:v()(this.getInputClassName(),n),onKeyDown:this.handleKeyDown,ref:this.saveInput})))}},{key:"render",value:function(){return this.renderLabeledInput(this.renderInput())}}]),t}(g.Component),w=b;b.defaultProps={prefixCls:"ant-input",type:"text",disabled:!1},b.propTypes={type:m.string,id:m.oneOfType([m.string,m.number]),size:m.oneOf(["small","default","large"]),maxLength:m.oneOfType([m.string,m.number]),disabled:m.bool,value:m.any,defaultValue:m.any,className:m.string,addonBefore:m.node,addonAfter:m.node,prefixCls:m.string,onPressEnter:m.func,onKeyDown:m.func,onKeyUp:m.func,onFocus:m.func,onBlur:m.func,prefix:m.node,suffix:m.node};var k=function(e){var t,n=e.prefixCls,a=void 0===n?"ant-input-group":n,r=e.className,i=void 0===r?"":r,s=v()(a,(t={},o()(t,a+"-lg","large"===e.size),o()(t,a+"-sm","small"===e.size),o()(t,a+"-compact",e.compact),t),i);return g.createElement("span",{className:s,style:e.style,onMouseEnter:e.onMouseEnter,onMouseLeave:e.onMouseLeave,onFocus:e.onFocus,onBlur:e.onBlur},e.children)},C=n(15),E=n(54),S=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(a=Object.getOwnPropertySymbols(e);r<a.length;r++)t.indexOf(a[r])<0&&(n[a[r]]=e[a[r]])}return n},z=function(e){function t(){l()(this,t);var e=f()(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments));return e.onSearch=function(t){var n=e.props.onSearch;n&&n(e.input.input.value,t),e.input.focus()},e.saveInput=function(t){e.input=t},e}return h()(t,e),p()(t,[{key:"focus",value:function(){this.input.focus()}},{key:"blur",value:function(){this.input.blur()}},{key:"getButtonOrIcon",value:function(){var e=this.props,t=e.enterButton,n=e.prefixCls,a=e.size,r=e.disabled,i=t,o=void 0;return o=t?i.type===E.a||"button"===i.type?g.cloneElement(i,i.type===E.a?{className:n+"-button",size:a}:{}):g.createElement(E.a,{className:n+"-button",type:"primary",size:a,disabled:r,key:"enterButton"},!0===t?g.createElement(C.a,{type:"search"}):t):g.createElement(C.a,{className:n+"-icon",type:"search",key:"searchIcon"}),g.cloneElement(o,{onClick:this.onSearch})}},{key:"render",value:function(){var e,t=this.props,n=t.className,a=t.prefixCls,i=t.inputPrefixCls,s=t.size,l=t.suffix,u=t.enterButton,p=S(t,["className","prefixCls","inputPrefixCls","size","suffix","enterButton"]);delete p.onSearch;var c=this.getButtonOrIcon(),f=l?[l,c]:c,d=v()(a,n,(e={},o()(e,a+"-enter-button",!!u),o()(e,a+"-"+s,!!s),e));return g.createElement(w,r()({onPressEnter:this.onSearch},p,{size:s,className:d,prefixCls:i,suffix:f,ref:this.saveInput}))}}]),t}(g.Component),A=z;z.defaultProps={inputPrefixCls:"ant-input",prefixCls:"ant-input-search",enterButton:!1};var P="\n  min-height:0 !important;\n  max-height:none !important;\n  height:0 !important;\n  visibility:hidden !important;\n  overflow:hidden !important;\n  position:absolute !important;\n  z-index:-1000 !important;\n  top:0 !important;\n  right:0 !important\n",N=["letter-spacing","line-height","padding-top","padding-bottom","font-family","font-weight","font-size","text-rendering","text-transform","width","text-indent","padding-left","padding-right","border-width","box-sizing"],O={},I=void 0;function T(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null;I||(I=document.createElement("textarea"),document.body.appendChild(I)),e.getAttribute("wrap")?I.setAttribute("wrap",e.getAttribute("wrap")):I.removeAttribute("wrap");var r=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=e.getAttribute("id")||e.getAttribute("data-reactid")||e.getAttribute("name");if(t&&O[n])return O[n];var a=window.getComputedStyle(e),r=a.getPropertyValue("box-sizing")||a.getPropertyValue("-moz-box-sizing")||a.getPropertyValue("-webkit-box-sizing"),i=parseFloat(a.getPropertyValue("padding-bottom"))+parseFloat(a.getPropertyValue("padding-top")),o=parseFloat(a.getPropertyValue("border-bottom-width"))+parseFloat(a.getPropertyValue("border-top-width")),s={sizingStyle:N.map(function(e){return e+":"+a.getPropertyValue(e)}).join(";"),paddingSize:i,borderSize:o,boxSizing:r};return t&&n&&(O[n]=s),s}(e,t),i=r.paddingSize,o=r.borderSize,s=r.boxSizing,l=r.sizingStyle;I.setAttribute("style",l+";"+P),I.value=e.value||e.placeholder||"";var u=Number.MIN_SAFE_INTEGER,p=Number.MAX_SAFE_INTEGER,c=I.scrollHeight,f=void 0;if("border-box"===s?c+=o:"content-box"===s&&(c-=i),null!==n||null!==a){I.value=" ";var d=I.scrollHeight-i;null!==n&&(u=d*n,"border-box"===s&&(u=u+i+o),c=Math.max(u,c)),null!==a&&(p=d*a,"border-box"===s&&(p=p+i+o),f=c>p?"":"hidden",c=Math.min(p,c))}return a||(f="hidden"),{height:c,minHeight:u,maxHeight:p,overflowY:f}}var F=function(e){function t(){l()(this,t);var e=f()(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments));return e.state={textareaStyles:{}},e.resizeTextarea=function(){var t=e.props.autosize;if(t&&e.textAreaRef){var n=t?t.minRows:null,a=t?t.maxRows:null,r=T(e.textAreaRef,!1,n,a);e.setState({textareaStyles:r})}},e.handleTextareaChange=function(t){"value"in e.props||e.resizeTextarea();var n=e.props.onChange;n&&n(t)},e.handleKeyDown=function(t){var n=e.props,a=n.onPressEnter,r=n.onKeyDown;13===t.keyCode&&a&&a(t),r&&r(t)},e.saveTextAreaRef=function(t){e.textAreaRef=t},e}return h()(t,e),p()(t,[{key:"componentDidMount",value:function(){this.resizeTextarea()}},{key:"componentWillReceiveProps",value:function(e){var t,n;this.props.value!==e.value&&(this.nextFrameActionId&&(n=this.nextFrameActionId,window.cancelAnimationFrame?window.cancelAnimationFrame(n):window.clearTimeout(n)),this.nextFrameActionId=(t=this.resizeTextarea,window.requestAnimationFrame?window.requestAnimationFrame(t):window.setTimeout(t,1)))}},{key:"focus",value:function(){this.textAreaRef.focus()}},{key:"blur",value:function(){this.textAreaRef.blur()}},{key:"getTextAreaClassName",value:function(){var e=this.props,t=e.prefixCls,n=e.className,a=e.disabled;return v()(t,n,o()({},t+"-disabled",a))}},{key:"render",value:function(){var e=this.props,t=Object(x.a)(e,["prefixCls","onPressEnter","autosize"]),n=r()({},e.style,this.state.textareaStyles);return"value"in t&&(t.value=t.value||""),g.createElement("textarea",r()({},t,{className:this.getTextAreaClassName(),style:n,onKeyDown:this.handleKeyDown,onChange:this.handleTextareaChange,ref:this.saveTextAreaRef}))}}]),t}(g.Component),j=F;F.defaultProps={prefixCls:"ant-input"},w.Group=k,w.Search=A,w.TextArea=j;t.a=w}}]);
//# sourceMappingURL=15.768fe024.chunk.js.map