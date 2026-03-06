<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta charset="utf-8" />
		<title>K-TERMS</title>
		<meta name="description" content="overview &amp; stats" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
		<link rel="stylesheet" href="/resources/assets/css/bootstrap.min.css" />
		<link rel="stylesheet" href="/resources/assets/css/font-awesome.min.css" />
		<link rel="stylesheet" href="/resources/assets/css/all.css"> <!--load all styles -->
		<link rel="stylesheet" href="/resources/assets/css/ace-fonts.css" />
		<link rel="stylesheet" href="/resources/assets/css/ace.min.css" id="main-ace-style" />		
		<link rel="stylesheet" href="/resources/themes/QuartzLight/QuartzLight.css">
		<link rel="stylesheet" href="/resources/assets/css/ace-skins.min.css" />
		<link rel="stylesheet" href="/resources/assets/css/ace-rtl.min.css" />
		<script src="/resources/assets/js/ace-extra.min.js"></script>
	</head>
	<body class="no-skin real-skin" style="overflow:hidden;min-height:600px;">
		<!-- #section:basics/navbar.layout -->
		<div id="navbar" class="navbar navbar-default">
			<script type="text/javascript">
				try{ace.settings.check('navbar' , 'fixed')}catch(e){}
			</script>
			<div class="navbar-container" id="navbar-container">
				<div class="navbar-header pull-left">
					<ul class="gnb">
						<li class="active"><a href="Main.html" target="mainFrame">한빛6호기 정주기시험 모바일절차서시스템</a></li>
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
					<li class="active open hsub">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">일정관리</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
						<ul class="submenu">
                            <li class="">
                                <a href="시험일정.html" target="mainFrame">
                                    부서별 시험일정
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="시험일정.html" target="mainFrame">
                                    개인별 시험일정
                                </a>
                                <b class="arrow"></b>
                            </li>
						</ul>
					</li>
                    <li class="">
                        <a href="#" class="dropdown-toggle">
                            <span class="menu-text">서식관리</span>
                            <b class="arrow fa fa-angle-down"></b>
                        </a>
                        <b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="서식관리.html" target="mainFrame">
                                    서식관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="시험일정.html" target="mainFrame">
                                    변경이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                        </ul>
                    </li>
					<li class="">
						<a href="#" class="dropdown-toggle">
							<span class="menu-text">시험관리</span>
							<b class="arrow fa fa-angle-down"></b>
						</a>
						<b class="arrow"></b>
                        <ul class="submenu">
                            <li class="">
                                <a href="시험준비.html" target="mainFrame">
                                    시험준비
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="시험수행.html" target="mainFrame">
                                    시험수행 모니터링
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
                                <a href="시험중.html" target="mainFrame">
                                    시험중 관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="시험완료.html" target="mainFrame">
                                    시험완료 관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="불만족이력.html" target="mainFrame">
                                    불만족 이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="경향분석.html" target="mainFrame">
                                    경향분석
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
                                <a href="시험중.html" target="mainFrame">
                                    사용자관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="시험완료.html" target="mainFrame">
                                    통계관리
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="불만족이력.html" target="mainFrame">
                                    송수신이력
                                </a>
                                <b class="arrow"></b>
                            </li>
                            <li class="">
                                <a href="경향분석.html" target="mainFrame">
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
			
			<iframe src="메인화면.html" name="mainFrame"></iframe>
			
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
	</body>
</html>