	$(document).ready(function() {
		var nicesx = $("body").niceScroll({touchbehavior:false,cursorcolor:"#0000FF",cursoropacitymax:0.6,cursorwidth:8});
	});
	
	$(function () {
		$.scrollUp({
			'scrollName': 'scrollUp', // Element ID
			'topDistance': '300', // Distance from top before showing element (px)
			'topSpeed': 300, // Speed back to top (ms)
			'animation': 'fade', // Fade, slide, none
			'animationInSpeed': 200, // Animation in speed (ms)
			'animationOutSpeed': 200, // Animation out speed (ms)
			'scrollText': '', // Text for element
			'activeOverlay': false // Set CSS color to display scrollUp active point, e.g '#00FFFF'
		});
	});

	$(function(){
		var nav = $(".nav-icons ul"),
			list = $('ul#search-list'),
			search_engine = $('span#search-name'),
			search_word = $('input#search-word'),
			search_btn = $('button#search-btn'),
			edit_btn = $('#edit-btn'),
			finish_btn = $('#finish-btn'),
			links = $('.links-container .links');
		var fixed_links,
			user_links,
			search_engines_list,
			editing_id = -1;
		nav.click(function(e){
			e.preventDefault();
			if (e.target.tagName == 'LI' && ! $(e.target).hasClass('current')){
				nav.children('.current').removeClass('current');
				$(e.target).addClass('current');
				changeSearchType();
				search_word.focus();
			}
		});
		list.click(function(e){
			e.preventDefault();
			if (e.target.tagName == 'A'){
				var target = $(e.target),
					type = nav.children('.current').data('type');
				search_engine.text(target.text());
				search_engine.data("url",target.attr("href"));
				localStorage.setItem(type + ".sel", target.parent().index());
				search_word.focus();
			}
		});
		search_word.keypress(function(e){
			if (e.keyCode == 13){
				e.stopPropagation();
				e.preventDefault();
				search_btn.click();
			}
		});
		search_btn.click(function(e){
			var url = search_engine.data("url");
			url += encodeURIComponent(search_word.val());
			window.location.href = url;
		});
		edit_btn.click(function(e){
			e.preventDefault();
			e.stopPropagation();
			links.addClass('edit');
			finish_btn.css('display','');
			edit_btn.css('display','none');
		});
		finish_btn.click(function(e){
			e.preventDefault();
			e.stopPropagation();
			links.removeClass('edit');
			edit_btn.css('display','');
			finish_btn.css('display','none');
		});
		function showEditBox(title, button, name, url){
			$('#modalEdit-label').text(title);
			$('#modal-button').text(button);
			$('#model-name').val(name);
			$('#model-url').val(url);
			$('#modalEdit').modal({backdrop:'static'});
		};
		links.click(function(e){
			var tar = $(e.target);
			if (e.target.tagName == 'EM'){
				e.preventDefault();
				if (tar.hasClass("edit")){
					editing_id = tar.parent().data('id');
					showEditBox('修改','保存修改',user_links[editing_id].name,user_links[editing_id].url);  
				}
				else if (tar.hasClass("delete")){
					var id = tar.parent().data('id');
					if (confirm('确定要删除[' + user_links[id].name + "]吗?\n\n删除后无法撤销。")){
						user_links.splice(id, 1);
						saveUserUrls();
						showAllLinks();
					}
				}
			} else if (e.target.tagName == 'A' && tar.parents('.add-new').length > 0){
				e.preventDefault();
				editing_id= -1;
				showEditBox('添加','保存添加','','');
			}
		});
		$('#modal-button').click(function(e){
			var name_str = $('#model-name').val(),
				url_str = $('#model-url').val();
			if (name_str.length == 0 || url_str.length == 0)
				return;
			if (editing_id > -1 && user_links[editing_id].name == name_str && user_links[editing_id].url == url_str)
				return;
			if (url_str.toLowerCase().indexOf('http://') != 0)
				url_str = 'http://' + url_str;
			var item = {'name':name_str,'url':url_str};
			if (editing_id == -1){
				user_links.push(item);
			} else {
				user_links.splice(editing_id, 1, item);
			}
			saveUserUrls();
			showAllLinks();
			$('#modalEdit').modal('hide');
			editing_id = -1;
		});
		function parseJson(s) {
			if (/^(?:[[\]{},:+\-.\w$\s\u0100-\uffff]|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')+$/.test(s)){
				return eval('0,' + s);
			}
		};
		if ( ! window.localStorage){
			localStorage = function() {
				var obj = document.documentElement;
				obj.addBehavior("#default#userData");
				var d = new Date;
				d.setMonth(d.getMonth() + 12 * 10); /* 10年 */
				obj.expires = d.toUTCString();
				var sStoreName = 'userdata001';
				function F(f) {
					return function() {
						obj.load(sStoreName);
						f.apply(null, arguments);
						obj.save(sStoreName);
					};
				}
				return {
					setItem: F(function(key, value) {
						obj.setAttribute(key, value);
					}),
					getItem: function(key) {
						obj.load(sStoreName);
						return obj.getAttribute(key);
					},
					removeItem: F(function(key) {
						obj.removeAttribute(key);
					})
				};
			}();
		}
		var toJson = function() {
			function fe(s) {
				return function(c) {
					return s + c.charCodeAt(0).toString(16);
				};
			}
			var es = [
			/(?=["\\])/g, '\\',
			/\n/g, '\\n',
			/\r/g, '\\r',
			/\t/g, '\\t',
			/[\x00-\x0f]/g, fe('\\x0'),
			/[\x10-\x1f\x7f-\xff]/g, fe('\\x'),
			/[\u0100-\u0fff]/g, fe('\\u0'),
			/[\u1000-\u4dff\u9fa6-\uffff]/g, fe('\\u')
			];
			function encode_str(s) {
				for (var i = 0; i < es.length; i += 2)
					s = s.replace(es[i], es[i + 1]);
				return '"' + s + '"';
			}


		function changeSearchType(){
			var type = nav.children('.current').data('type');
			list.children().remove();
			for (var i in search_engines_list[type]){
				var tpl = '<li><a href="#URL#">#NAME#</a></li>';
				tpl = tpl.replace(/#URL#/g, search_engines_list[type][i]["url"]);
				tpl = tpl.replace(/#NAME#/g, search_engines_list[type][i]["name"]);
				list.append(tpl);
			}
			var sel = localStorage.getItem(type + ".sel");
			if (sel === null || sel >= search_engines_list[type].length) sel = 0;
			search_engine.text(search_engines_list[type][sel]["name"]);
			search_engine.data("url",search_engines_list[type][sel]["url"]);
		};
		$.get('../jsondata/search.zh_cn.json',
				{},
				function(data, status, xhr){
					search_engines_list = parseJson(data);
					changeSearchType();
				},
				"html"
		);
	});
