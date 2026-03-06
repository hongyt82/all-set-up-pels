<%@page import="javax.websocket.Session"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<style>
		.util-area {
			position: initial;
		}
		.real-skin .main-content {
			height: 100%;
		}
		.iframeStyle2 {
		    border: 0;
		    overflow: auto;
		    height: calc(100% - 40px);
		    width: calc(100% - 250px);
		}
	</style>
	<body class="no-skin real-skin" style="overflow:hidden;min-height:600px;">
		<!-- #section:basics/navbar.layout -->
		<div id="navbar" class="navbar navbar-default">
			<script type="text/javascript">
				try{ace.settings.check('navbar' , 'fixed')}catch(e){}
			</script>
			<div class="navbar-container" id="navbar-container">
				<div class="navbar-header pull-left">
					<ul class="gnb">
						<li class="active"><a href="Main.html" target="mainFrame0">한빛6호기 정주기시험 모바일절차서시스템</a></li>
						<li><a href="#"></a></li>
					</ul>
				</div>
				<div class="navbar-buttons pull-right" role="navigation">
					<ul class="nav ace-nav">
						<!-- #section:basics/navbar.user_menu -->
						<li>							
							<span class="user-info name">
								홍길동 님
								<i class="ace-icon fas fa-user-circle"></i>
							</span>			
						</li>
						<li class="divider"></li>
						<li>
							<span class="user-info team">
								발전1팀
							</span>
						</li>
						<li>
							<a href="#">
								<i class="ace-icon fas fa-th"></i>
								Sitemap
							</a>
						</li>
						<li>
							<a href="#">
								<i class="ace-icon fa fa-cog"></i>
								Settings
							</a>
						</li>						
						<li>
							<a href="#">
								<i class="ace-icon fa fa-power-off"></i>
								Logout
							</a>
						</li>
						<!-- /section:basics/navbar.user_menu -->
					</ul>
				</div>
			</div><!-- /.navbar-container -->
		</div>
		<!-- /section:basics/navbar.layout -->
		
		<!-- /section:basics/navbar.layout -->
		<div class="main-container" id="main-container">
			<script type="text/javascript">
				try{ace.settings.check('main-container' , 'fixed')}catch(e){}
			</script>
			<!-- #section:basics/sidebar -->
			<div id="sidebar" class="sidebar">
				<script type="text/javascript">
					try{ace.settings.check('sidebar' , 'fixed')}catch(e){}
				</script>
				<!-- #section:basics/sidebar-shortcuts -->
				<div class="sidebar-shortcuts">
					<ul class="nav">
						<li class="active">
							<a href="#" class="menu-toggle" title="메뉴">
								<i class="menu-icon fa fa-bars"></i>
							</a>
						</li>
						<li>
							<a href="#" class="favorite" title="즐겨찾기">
								<i class="menu-icon far fa-star"></i>
							</a>
						</li>
					</ul>
					<ul class="nav bottom">
						<li>
							<a href="#" title="공지사항">
								<i class="menu-icon fas fa-bell"></i>
							</a>
							<a href="#" title="일반게시판">
								<i class="fas fa-chalkboard"></i>
							</a>
							<a href="#" title="Q&A">
								<i class="menu-icon fas fa-comments"></i>
							</a>
						</li>
					</ul>
				</div>
				<!-- /.sidebar-shortcuts -->			
				<!-- #section:basics/content.searchbox -->
				<!-- <div class="nav-search" id="nav-search" style="z-index:100;">
					<form class="form-search">
						<span class="input-icon">
							<input type="text" placeholder="Search ..." class="nav-search-input" id="nav-search-input" autocomplete="off" />
							<i class="ace-icon fa fa-search nav-search-icon"></i>
						</span>
					</form>
				</div> --><!-- /.nav-search -->
				<div class="menu-option">
					<div class="menu-search">
						<span class="input-icon ">
							<input type="text" placeholder="Menu Search" class="nav-search-input" id="nav-search-input" />
							<i class="ace-icon fa fa-search nav-search-icon"></i>
						</span>
					</div>
					
					<div class="menu-view">
						<a href="#" class="collapse" title="메뉴 모두 접기"></a>
						<a href="#" class="expand" title="메뉴 모두 보기"></a>
					</div>
				</div>
							
				<ul class="nav nav-list">
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">일정관리</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
						<ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(11, 'Month_Search', 'Month_Search.do','월별 시험계획표');">
                                    	월별 시험계획표
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(12, 'Schedule_Search', 'Schedule_Search.do','정주기시험 일정');">
										정주기시험 일정
								</a>
                                <b class="arrow"></b>
                            </li>
						</ul>
					</li>
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">시험(점검)관리</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(31, 'Exam_Search', 'Exam_Search.do','시험(점검)준비');">
                                    	시험(점검) 준비
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(32, 'Exam_Monitoring', 'Exam_Monitoring.do','시험(점검)수행 ');">
                                    	시험(점검) 수행
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
					</li>
                    <li class="">
                        <a href="#" class="dropdown-toggle">
                            <span class="menu-text">결과관리</span>
                            <b class="arrow fa fa-angle-down"></b>
                        </a>
                        <b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(41, 'Outcome_Search', 'Outcome_Search.do','결과관리_정주기시험');">
                                    	정주기시험
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                               <a href="javascript:addTab(42, 'Outcome_Atct_Search', 'Outcome_Atct_Search.do','결과관리_점검지');">
                                    	점검지
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(43, 'Outcome_Etc_Search', 'Outcome_Etc_Search.do','결과관리_일반양식');">
                                    	일반양식
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(44, 'Outcome_Job_Search', 'Outcome_Job_Search.do','결과관리_작업전회의');">
                                    	작업전회의 이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(45, '', '','결과관리_불만족보고서 ');">
                                    	불만족보고서 이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
		                        <a href="#" class="dropdown-toggle">
		                            <span class="menu-text">경향분석</span>
		                            <b class="arrow fa fa-angle-down"></b>
		                        </a>
		                        <b class="arrow"></b>
		                        <ul class="submenu" style="padding-left:27px;">
		                        	<li class="">
		                                <a href="javascript:addTab(45, 'Outcome_History_Search', 'Outcome_History_Search.do','시험(점검)자료 이력정보');">
		                                    	시험(점검)자료 이력정보
		                                </a>
		                                <b class="arrow"></b>
		                            </li>
		                        </ul>
                            </li>
                        </ul>
                    </li>
                    <li class="">
                        <a href="#" class="dropdown-toggle">
                            <span class="menu-text">절차서(서식)관리</span>
                            <b class="arrow fa fa-angle-down"></b>
                        </a>
                        <b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(21, 'Proc_Search_P', 'Proc_Search.do?PRCDOC_CFY=P','정주기시험 서식');">
										정주기시험
								</a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(22, 'Proc_Search_M', 'Proc_Search.do?PRCDOC_CFY=M','점검지 서식');">
										점검지
								</a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(23, 'Job_Form_Search', 'Form_Etc_Search.do?FRM_CFY=JOB','작업전회의 서식');">
                                    	작업전회의
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <!-- 
                            <li class="">
                                <a href="javascript:addTab(24, 'General_Form_Search', 'Etc_Form_Search.do?FRM_CFY=OZR','일반양식(서식)');">
                                    	일반양식(서식)
                                </a>
                                <b class="arrow"></b>
                            </li>
                             -->
                            <li class="">
                                <a href="javascript:addTab(25, 'General_Pdf_Search', 'Form_Etc_Search.do?FRM_CFY=PDF','일반양식(필기)');">
                                    	일반양식(필기)
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
                    </li>
                    <li class="">
                        <a href="#" class="dropdown-toggle">
                            <span class="menu-text">시스템관리</span>
                            <b class="arrow fa fa-angle-down"></b>
                        </a>
                        <b class="arrow"></b>
                        <ul class="submenu">
                        <!-- 
                            <li class="">
                                <a href="javascript:addTab(51, 'Proc_Search', 'Proc_Search.do','절차서관리');">
                                   	 절차서관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                             -->
                            <li class="">
                                <a href="javascript:alert('개발중입니다.')" target="mainFrame0">
                                   	 사용자관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:alert('개발중입니다.')" target="mainFrame0">
                                    	통계관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:alert('개발중입니다.')" target="mainFrame0">
                                    	송수신이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:alert('개발중입니다.')" target="mainFrame0">
                                    	고장신고 및 개선의견
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
                    </li>
				</ul><!-- /.nav-list -->				
				
				<!-- /.nav-list -->
				<!-- #section:basics/sidebar -->
			</div>	
			<div class="main-content" id="iframeArea">
				<!-- #section:basics/content.util-area -->
				<div class="util-area">
					<ul class="openpage" id="tapMenuUl">
						<li class="active">
							<a href="#"><i class="ace-icon fa fa-home home-icon"></i></a>
						</li>
					</ul><!-- /.openpage -->
					<ul class="page-util">
						<li class="btn-arrow">
							<a href="#" class="active"><i class="fas fa-caret-left"></i></a>
							<a href="#"><i class="fas fa-caret-right"></i></a>
						</li>
						<li>
							<a href="#" class="시스템 이동"><i class="fas fa-share-square"></i></a>
						</li>
						<li>
							<a href="#" class="도움말"><i class="fas fa-question-circle"></i></a>
						</li>
						<li>
							<a href="#" class="favorite" title="즐겨찾기"><i class="fas fa-star"></i></a>
						</li>
					</ul>
				</div>
				<!-- /section:basics/content.util-area -->
				<iframe src="Main.do" name="mainFrame0" id="mainFrame0" class="iframeStyle2" style="visibility:visible;display:block;"></iframe>
			</div>		
			
		</div>
		<!-- #section:basics/footer.layout -->
		<div class="footer">
			<div class="copyrights pull-left">Copyright 2020 Korea Hydro & Nuclear Power Co,.Ltd. All Rights Reserved</div>
			<div class="support pull-right">
				<span><a href="#">개인정보처리방침</a></span> 
				<span>업무문의</span> 
				<span>시스템문의</span>  
				<span>ICT융합처 기술PI부</span>  
				<span>장국영 0800-1234</span> 
			</div>
		</div>
		<!-- /section:basics/footer.layout -->
		
		<!-- basic scripts -->
		<!--[if !IE]> -->
		<script type="text/javascript">
			window.jQuery || document.write("<script src='/resources/assets/js/jquery.min.js'>"+"<"+"/script>");
		</script>

		<!-- <![endif]-->

		<!--[if IE]>
		<script type="text/javascript">
		 window.jQuery || document.write("<script src='../assets/js/jquery1x.min.js'>"+"<"+"/script>");
		</script>
		<![endif]-->
		<script type="text/javascript">
			if('ontouchstart' in document.documentElement) document.write("<script src='/resources/assets/js/jquery.mobile.custom.min.js'>"+"<"+"/script>");
		</script>
		<script src="/resources/assets/js/bootstrap.min.js"></script>

		<!--[if lte IE 8]>
		  <script src="../assets/js/excanvas.min.js"></script>
		<![endif]-->
		<script src="/resources/assets/js/jquery-ui.custom.min.js"></script>
		<script src="/resources/assets/js/jquery.ui.touch-punch.min.js"></script>
		<script src="/resources/assets/js/jquery.easypiechart.min.js"></script>
		<script src="/resources/assets/js/jquery.sparkline.min.js"></script>
		<script src="/resources/assets/js/flot/jquery.flot.min.js"></script>
		<script src="/resources/assets/js/flot/jquery.flot.pie.min.js"></script>
		<script src="/resources/assets/js/flot/jquery.flot.resize.min.js"></script>

		<!-- ace scripts -->
		<script src="/resources/assets/js/ace-elements.min.js"></script>
		<script src="/resources/assets/js/ace.min.js"></script>
		<script>
		function menuExpand(dom) {
			
			$(".submenu").removeClass("nav-hide");
			$(".submenu").addClass("nav-show");
			$(".submenu").css("display", "block");
			$(".collapse").removeClass("active");
			$(dom).addClass("active");
			$("#sidebarDIV").find("b").removeClass("fa-angle-down");
			$("#sidebarDIV").find("b").addClass("fa-angle-right");
			
		}
		
		function menuCollapse(dom) {
			$(".submenu").removeClass("nav-show");
			$(".submenu").addClass("nav-hide");
			$(".submenu").css("display", "none");
			$(".expand").removeClass("active");
			
			$(dom).addClass("active");
			
			$("#sidebarDIV").find("b").removeClass("fa-angle-right");
			$("#sidebarDIV").find("b").addClass("fa-angle-down");
		}
		
	
		function menuClose(obj) {
	
			if ($(obj).parent().hasClass("active")) {
				$(obj).parent().removeClass("active");
				$(".menu-container").hide();
				$(".sidebar").css("width", "0px");
				$("#frameArea").find("iframe").css("height", "100vh");
				$("#frameArea").find("iframe").css("width", "87%");
			} else {
				$(obj).parent().addClass("active")
				$(".menu-container").show();
				$(".sidebar").css("width", "250px");
				$("#frameArea").find("iframe").css("height", "100vh");
				$("#frameArea").find("iframe").css("width", "87%"); 
			}
		}
		
		var strTemp = "";
		
		function menuExpand(dom) {
			
			$(".submenu").removeClass("nav-hide");
			$(".submenu").addClass("nav-show");
			$(".submenu").css("display", "block");
			$(".collapse").removeClass("active");
			$(dom).addClass("active");
			$("#sidebarDIV").find("b").removeClass("fa-angle-down");
			$("#sidebarDIV").find("b").addClass("fa-angle-right");
			
		}
		
		function menuCollapse(dom) {
			$(".submenu").removeClass("nav-show");
			$(".submenu").addClass("nav-hide");
			$(".submenu").css("display", "none");
			$(".expand").removeClass("active");
			
			$(dom).addClass("active");
			
			$("#sidebarDIV").find("b").removeClass("fa-angle-right");
			$("#sidebarDIV").find("b").addClass("fa-angle-down");
		}
		
	
		function menuClose(obj) {
	
			if ($(obj).parent().hasClass("active")) {
				$(obj).parent().removeClass("active");
				$(".menu-container").hide();
				$(".sidebar").css("width", "0px");
				$("#main-container").find("iframe").css("height", "100%");
				$("#main-container").find("iframe").removeClass("mconw_s");
				$("#main-container").find("iframe").addClass("mconw_l");
				$(".util-area").find("#tapMenuul").addClass("openpage_left");
				$("#main-container").find("iframe").css("margin-left", "50px");
				$(".openpage").css("width","calc(100% - 210px)");
				$(".wmsshome").css("margin-left","40px");
			} else {
				$(obj).parent().addClass("active")
				$(".menu-container").show();
				$(".sidebar").css("width", "250px");
				$("#main-container").find("iframe").css("height", "100%");
				$("#main-container").find("iframe").removeClass("mconw_l");
				$("#main-container").find("iframe").addClass("mconw_s");
				$(".util-area").find("#tapMenuul").removeClass("openpage_left");
				$("#main-container").find("iframe").css("margin-left", "0px");
				$(".openpage").css("width","calc(100% - 420px)");
				$(".wmsshome").css("margin-left","0px");
			}
		}
		
		var cnt = 0;
		var totalWidth = 0;
		var TotMenu = 99;
		
		function viewTab(No)
		{
	   		for (let i = 0; i < TotMenu; i++) {
	   			$("#mainFrame" + i).css("display", "none");
	   			$("#mainFrame" + i).css("visibility", "hidden");
	   			$("#tabMenu" + i).css("background-color", "lightgray")
			}
	   		
			$("#mainFrame" + No).css("display", "block");
	   		$("#mainFrame" + No).css("visibility", "visible");
	   		$("#tabMenu" + No).css("background-color", "white")
		}
		
		function tabClose(No) {
			var objTab = document.getElementById("tabMenu"+ No);
			if (objTab == undefined || objTab == null) return;
			var tmp = strTemp.replace("tabMenu" + No + "|", "");
	//		tmp.replace("t", "");
			strTemp = tmp;
			objTab.parentNode.removeChild(document.getElementById("tabMenu"+ No));
			$("#mainFrame" + No).remove();
			//배열의 공백 제거
			const tmpArr = tmp.split("|").filter(i => i.length !== 0);
			
			var tNo = 0; 
			//alert("tmp[" + tmp + "]				length[" + tmpArr.length + "]           strTemp" + strTemp);
			if(tmpArr.length > 0){
				tNo = tmpArr.length - 1;
				//if(tNo == 0) tNo = 1;
				var viewNo = tmpArr[tNo].replace("tabMenu", "");
				viewTab(viewNo);
			} else {
				viewTab(0);
			}
		}
		
		var windowWidth = 0;
		var openpageWidth = 0;
		
		function dateInit(){
			windowWidth = $(window).width();
			
			openpageWidth = $('.openpage').width();
		}
		
		function addTab(No, ScreenName, Url, Title){
			strTemp +=  "tabMenu" + No + "|";
	   		//alert(strTemp);
			for(i=0; i<TotMenu; i++)
			{
	   			$("#mainFrame" + i).css("display", "none");
	   			$("#mainFrame" + i).css("visibility", "hidden");
	   			$("#tabMenu" + i).css("background-color", "lightgray")
			}
	   		
			if($("." + ScreenName).hasClass(ScreenName) === false){
				cnt++;
			
				var oTapMenu = document.getElementById("tapMenuUl");
		   		var oLi = document.createElement("li");
		   		oLi.setAttribute("id", "tabMenu"+ No);
		   		oLi.setAttribute("class", "active");
		   		oLi.setAttribute("style", "background-color:white;");
	
				var oTapIframe = document.getElementById("iframeArea");
		   		var oIframe = document.createElement("iframe");
		   		oIframe.setAttribute("id", "mainFrame"+ No);
		   		oIframe.setAttribute("class", "iframeStyle2");
		   		oTapIframe.appendChild(oIframe);
	
				var inner = "";
				var Para = "'" + No + "','" + ScreenName + "','" + Url + "','" + Title + "'";
		   		inner = "<a href=\'javascript:viewTab(" + No + ");\' class=\'" + ScreenName + "\'>" + Title + "</a><a class=\'btn-close\' onclick=\'javascript:tabClose(" + No + ")\'><i class=\'fas fa-times\'></i></a>";
		   		oLi.innerHTML = inner;
		   		oTapMenu.appendChild(oLi);
		   		
		   		$("#mainFrame" + No).css("display", "block");
		   		$("#mainFrame" + No).css("visibility", "visible");
				$("#mainFrame" + No).attr('src', Url);
				
				var tmpWidth = document.getElementById("tabMenu" + No).offsetWidth;
				var nowLeft = "245";
				//alert(openpageWidth);
				totalWidth = 0;			
				for(i=1; i<TotMenu; i++)
				{
					if(document.getElementById("tabMenu" + i) != null) {
						var tmpWidth = document.getElementById("tabMenu" + i).offsetWidth;
						totalWidth += tmpWidth + 1.5;
					}
				}
				
				//alert(totalWidth+","+openpageWidth);
				if (totalWidth < openpageWidth) {
					console.log(totalWidth);
				} 
				else {
					//alert(totalWidth);
					tmpLeft = totalWidth - openpageWidth;
					tmpLeft = tmpLeft * -1;
					//alert(tmpLeft);
					//var tmpArr = strTemp.split("|");
					//var tab1Width = document.getElementById(tmpArr[0]).offsetWidth;
					//var tab2Width = document.getElementById(tmpArr[1]).offsetWidth;
	
					//if (tab1Width > tmpWidth ) {
					//	tmpLeft = nowLeft - tab1Width - 30;
					//	//console.log("tmpLeft = nowLeft - tab1Width = " + nowLeft + " = " + tab1Width);
					//} else {
					//	if ( tab1Width + tab2Width > tmpWidth)   {
					//		tmpLeft = nowLeft - (tab1Width+tab2Width) -30;
					//	} else {
					//		tmpLeft = nowLeft - tmpWidth -30;
					//	}
					//}
					$(".openpage").css("left", tmpLeft+"px");
				}
				
			}
			else {
	   			$("#mainFrame" + No).css("display", "block");
		   		$("#mainFrame" + No).css("visibility", "visible");
	   			$("#tabMenu" + No).css("background-color", "white")
			}
			
	
			function tabLeft(){
				if(totalWidth > openpageWidth){
					$(".openpage").css("left", "0px");
				}
			}
			
			function tabRight(){
				if(totalWidth > openpageWidth){
					$(".openpage").css("left", tmpLeft+"px");
				}
			}
			
			function tabCloseAll(){
				$(".iframeStyle2").remove();
				$(".openpage").find(".active").remove();
				$("#mainFrame0").css("display", "block");
				$("#mainFrame0").css("visibility", "visible");
				$(".openpage").css("left", "10px");
				wmssMain();
				totalWidth = 0;
				cnt = 0;
				//openpageWidth = 0;
			}
			
		    function asd(){
	
		    	if($('.util-area').css('display') == 'none'){
	
					$('.active').css('float', 'none')
					
					$('.openpage').css('background', '#9494a4')
					$('.openpage').css('position', 'absolute')
					$('.openpage').css('left', '32em')
					$('.openpage').css('z-index', 999)
					
					$('.topmenuPane').css('display','block');
					
				}  else {
	
					$('.active').css('float', 'left')
					$('.openpage').css('background', 'transparent')
					$('.openpage').css('position', 'unset')
					$('.openpage').css('left', '')
					
					$('.util-area').css('display','none');
				}
	
		    }
		    
			var logOn = function(div) {
				var url = "mfmsgwid.do"; //"/mfms/account/easanha.do";
		        var p = new Object();
		        p["userId"] = "";
	
		        $.post(url, $.param(p))
				.done(function(result) {
					if(result == null || result == undefined || result == "") {
						alert("로그인을 실패하였습니다. [result null]");
					} else {
						var msg = $.trim(result);
			        	if(msg == "success"){        		
			        		alert("로그인을 실패하였습니다. [" + msg + "]");
			        	} else {
				        	//window.top.location.href = "mfmsindex.do";
				        	if(div == "1")
				        		window.open("about:blank").location.href = "http://papp2.khnp.se.hn:8101/kterms/account/SSOLogin.do?sabun=" + msg + "&returnUrl=/kterms/board/board.do?id=53392A67DFCA4D40A83E5E424C7B3212&displayName=공지사항";
			        		else if(div == "2")
				        		window.open("about:blank").location.href = "http://papp2.khnp.se.hn:8101/kterms/account/SSOLogin.do?sabun=" + msg + "&returnUrl=/kterms/board/board.do?id=4E7A135F46A24851AF7686A348C1189E&displayName=자료실";
			        		else if(div == "3")
				        		window.open("about:blank").location.href = "http://papp2.khnp.se.hn:8101/kterms/account/SSOLogin.do?sabun=" + msg + "&returnUrl=/kterms/board/board.do?id=C44912A05A1541F695C585E577DE661E&displayName=Q%26A";
			        	}
					}
				})
				.fail(function(e){
					console.log(e);
					PageLoading(false);
				});
			}
		   //	if($("#tapMenu").)	
	
		}	
		
		</script>
	</body>
</html>