<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			const ATFL_GRUP_NM = '${ATFL_GRUP_NM}';
			const UNQ_NO 	   = '${UNQ_NO}';
			const ATFL_ID      = '${ATFL_ID}';
			console.log("ATFL_GRUP_NM:" + ATFL_GRUP_NM);
			console.log("UNQ_NO:" + UNQ_NO);
			console.log("ATFL_ID:" + ATFL_ID);
		})
	</script>
	<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text">서식 내용</span>	
		</div>      
		<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>         
	</div>
	<!-- <iframe src="/PdfView.do?ATFL_GRUP_NM=${ATFL_GRUP_NM}&UNQ_NO=${UNQ_NO}&ATFL_ID=${ATFL_ID}" frameborder="0" width="100%" height="100%" scrolling="auto" align="center" name="ifr_pdfviewer" id="ifr_pdfviewer" allowfullscreen></iframe> -->
</body>
</html>