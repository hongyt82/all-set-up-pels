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
						<li class="active"><a href="Main.html" target="mainFrame0">원전 절차수행기록 디지털시스템(PELS)</a></li>
						<li><a href="#"></a></li>
					</ul>
				</div>
				<div class="navbar-buttons pull-right" role="navigation">
					<ul class="nav ace-nav">
						<!-- #section:basics/navbar.user_menu -->
						<li>							
							<span class="user-info name">
								${LOGIN_USER_NM} 님
								<i class="ace-icon fas fa-user-circle"></i>
							</span>			
						</li>
						<li class="divider"></li>
						<li>
							<span class="user-info team">
								${LOGIN_USER_JJTXT1} ${LOGIN_USER_JJTXT2} ${LOGIN_USER_JJTXT3} ${LOGIN_USER_JJTXT4} ${LOGIN_USER_JJTXT5} ${GRADE}
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
							<a href="/PELS_Login.do">
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
							<span class="menu-text">나의문서</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(1, 'Exam_Search_R', 'Exam_Search.do?PRSTS_CFY=R','나의문서 대기중');">
                                    준비 및 수행중
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <!-- 
                            <li class="">
                                <a href="javascript:addTab(2, 'Outcome_Search_F', 'Outcome_Search.do?PRCDOC_CFY=P&PRSTS_CFY=F','나의문서 진행중')">
                                    진행중
                                </a>
                                <b class="arrow"></b>
                            </li>
                             -->
                            <li class="">
                                <a href="javascript:addTab(3, 'Exam_Search_C', 'Exam_Search.do?PRSTS_CFY=C','나의문서 완료')">
                                    점검완료
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(4, 'Outcome_Etc_Search', 'Outcome_Etc_Search.do','기타양식');">
                                    기타양식(PDF 등록)
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(4, 'Outcome_Etc_Search', 'Outcome_Etc_Search.do','기타양식');">
                                    기타양식(PDF 점검현황)
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
					</li>
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">고리원자력본부</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(11, 'Outcome_Search_2110', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2110','고리1발전소');">
                                   	1발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(12, 'Outcome_Search_2120', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2120','고리2발전소');">
                                   	2발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(13, 'Outcome_Search_2130', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2130','고리3발전소');">
                                   	3발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
					</li>
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">월성원자력본부</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(21, 'Outcome_Search_2210', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2210','월성1발전소');">
                                    1발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(22, 'Outcome_Search_2220', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2220','월성2발전소');">
                                   	2발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(23, 'Outcome_Search_2230', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2230','월성3발전소');">
                                   	3발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
					</li>
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">한빛원자력본부</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(31, 'Outcome_Search_2310', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2310','한빛1발전소');">
                                    1발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(32, 'Outcome_Search_2320', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2320','한빛2발전소');">
                                    2발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(33, 'Outcome_Search_2330', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2330','한빛3발전소');">
                                    3발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
					</li>                   
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">한울원자력본부</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(41, 'Outcome_Search_2410', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2410','한울1발전소');">
                                    1발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(42, 'Outcome_Search_2420', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2420','한울2발전소');">
                                    2발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(43, 'Outcome_Search_2430', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2430','한울3발전소');">
                                    3발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(71, 'Outcome_Search_2710', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2710','신한울1발전소');">
                                    신한울1발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
					</li>                   
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">새울원자력본부</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="javascript:addTab(81, 'Outcome_Search_2810', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2810','새울1발전소');">
                                   	1발전소
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(82, 'Outcome_Search_2820', 'Outcome_Search.do?PRCDOC_CFY=P&PPCD=2820','새울2발전소');">
                                   	2발전소
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
                            <li class="">
                                <a href="javascript:addTab(91, 'Grade_Search', 'Grade_Search.do','권한관리');">
                                    	권한관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="javascript:addTab(92, 'Message_Search', 'Message_Search.do','알림창 이력');">
                                    	알림창 이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
		                         <a href="#" class="dropdown-toggle">
		                            <span class="menu-text">통계관리</span>
		                            <b class="arrow fa fa-angle-down"></b>
		                        </a>
                               <b class="arrow"></b>
		                       <ul class="submenu">
		                            <li class="">
		                                <a href="javascript:addTab(93, 'StatsConnect_Search', 'StatsConnect_Search.do','접속자 통계');">
		                                    	- 접속자 통계
		                                </a>
		                                <b class="arrow"></b>
		                            </li>
		                            <li class="">
		                                <a href="javascript:addTab(94, 'StatsExam_Search', 'StatsExam_Search.do','정주기시험 통계');">
		                                    	- 정주기시험 통계
		                                </a>
		                                <b class="arrow"></b>
		                            </li>
		                       </ul>
                            </li>
                            <li class="">
		                         <a href="#" class="dropdown-toggle">
		                            <span class="menu-text">테이블 현황관리</span>
		                            <b class="arrow fa fa-angle-down"></b>
		                        </a>
                               <b class="arrow"></b>
		                       <ul class="submenu">
		                            <li class="">
		                                <a href="javascript:addTab(95, 'Table_Search', 'Table_Search.do','테이블 구조조회');">
		                                    	- 테이블 구조조회
		                                </a>
		                                <b class="arrow"></b>
		                            </li>
		                            <li class="">
		                                <a href="javascript:addTab(96, 'Table_Data_Search', 'Table_Data_Search.do','테이블별 데이터 현황');">
		                                    	- 테이블별 데이터 현황
		                                </a>
		                                <b class="arrow"></b>
		                            </li>
		                       </ul>
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
							<a href="javascript:viewTab(0);"><i class="ace-icon fa fa-home home-icon"></i></a>
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
				<span>한철수 0910-2329</span> 
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