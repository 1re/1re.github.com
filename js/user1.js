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
