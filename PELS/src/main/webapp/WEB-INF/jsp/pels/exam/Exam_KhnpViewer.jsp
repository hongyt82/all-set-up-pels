<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>

<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%
    response.setHeader("Cache-Control", "no-store");
	response.setHeader("Pragma", "no-cache");
	response.setDateHeader("Expires", 0);
	if(request.getProtocol().equals("HTTP/1.1")) {
		response.setHeader("Cache-Control", "no-cache");
	}

    Date nowDate = new Date();
    
    SimpleDateFormat format = new SimpleDateFormat("yy/MM/dd");
    String SignDate = format.format(nowDate);

%>
<script>

	function fnParent () {
		let form = document.getElementById('form')
		form.action = "Exam_Monitoring.do?PRCDOC_CFY=P"
		form.submit()
	}

	function pageLoad(){
		document.getElementById("iframPdfEditor").src = "<%= request.getContextPath() %>/e-link-v2/viewer?TST_UNQ_KY_VAL=${TST_UNQ_KY_VAL}";
	}
</script>
<body class="no-skin real-skin" onload="javascript:pageLoad();">
<form id="form" name="form" method="post">
<input type="hidden" name="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
<input type="hidden" name="ATFL_PHCL_NM" value="${ATFL_PHCL_NM}">
<input type="hidden" name="FRM_UNQ_KY_VAL" value="${FRM_UNQ_KY_VAL}">

<div class="page-content">
	<div class="page-content-area">
		<!-- #ection:basics/page-header -->
		<div class="page-header">
			<h1>
				<span class="title">점검 결과 보기</span>
				<span>
					<ul class="breadcrumb">
						<li>
							<a href="#">정주기시험</a>
						</li>
						<li class="">정주기시험 준비/수행</li>
						<li class="active">모니터링</li>
					</ul><!-- /.breadcrumb -->
				</span>
			</h1>
		</div><!-- /page-header -->
		
		<div class="PageButtonGroup" style="text-align:right">
			<a class="btn-m" href="javascript:fnParent();"><span class="Text">이전화면</span></a>
		</div>
		<div class="row">
			<div class="col-xs-12">
				<!-- PAGE CONTENT BEGINS -->	
				<div class="RealPanel">
					<div class="Title">
						<div class="TitleArea">
							<span class="SubTitle">점검내용 : ${PRCDOC_NO} [ ${PRCDOC_NM} ] ${TITL_NM}</span>
						</div>
						<div class="ControlArea">
						</div>
					</div>
				</div>
			</div>
		</div>		
		
	</div>
</div>
</form>
<div id="OZViewer" style="width:100%-40px;height:85%; margin: 0px 20px 20px 20px;">
	<iframe id="iframPdfEditor" style="width:100%; height:100%; border:0"></iframe>
</div>
</body>
</html>
