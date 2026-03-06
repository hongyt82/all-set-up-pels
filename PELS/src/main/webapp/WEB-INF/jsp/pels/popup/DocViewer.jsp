<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	let filePath
	let fileName
	let callParentLocation
	let URL = 'http://wmss.khnp.se.hn'
	$(document).ready(function () {
			fnGetLDMFile();
	})
	
	function fnGetLDMFile () {
		const action = URL + '/Doc_LDM_Search_PELS.do' 
		const params = { 'DOC_TYP': '${DOC_TYP}', 'DOC_UNQ_ID': '${DOC_UNQ_ID}', 'DOC_PART_CD': '${DOC_PART_CD}'  }
		alert(params);
		$.ajax({
			type: 'POST',
			url: action,
			data: params,
			dataType: 'JSON',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function (resultData) {
				const docList = JSON.parse(resultData.docList)
				const docCnt = docList.length
				console.log('docCnt >>> ' + docCnt)
				let fileList = '<tr>'
					fileList += '<th style="text-align: center;">순번</th>'
					fileList += '<th style="text-align: center;">파일명</th>'
					fileList += '</tr>'
					
				for (let i = 0; i < docCnt; i++) {
					const docTyp = docList[i].DOC_TYP
					const docUnqId = docList[i].DOC_UNQ_ID
					const docRvsnNo = docList[i].DOC_RVSN_NO
					const docPartCd = docList[i].DOC_PART_CD
					const fileIDX = docList[i].FILE_IDX
					
					fileList += '<tr>'
					fileList +=	'<td>'+(i+1)+'</td>'
					fileList +=	'<td style="text-align: left;"><a href="javascript:fnShowPDF(\''+callDiv+'\', \''+docTyp+'\', \''+docUnqId+'\', \''+docRvsnNo+'\', \''+docPartCd+'\', \''+fileIDX+'\')">'+docList[i].FILENAME+'</a></td>'
					fileList += '</tr>'
				}
				
				//$('#tblDocList').html(fileList);
				fnShowPDF('Draw', docList[0].DOC_TYP, docList[0].DOC_UNQ_ID, docList[0].DOC_RVSN_NO, docList[0].DOC_PART_CD, docList[0].FILE_IDX)
			},
			error: function () {
				console.log('Error occured!!')
			}
		})		
				
	}
	
	function fnShowPDF (docDiv, docTyp, docUnqId, docRvsnNo, docPartCd, fileIDX, filePath, fileName) {
		//alert("docDiv="+docDiv + " / " + "docTyp="+docTyp + " / " + "docUnqId="+docUnqId + " / " +  "docRvsnNo="+docRvsnNo + " / " + "docPartCd="+docPartCd);
		const params = { 'DOC_DIV': docDiv, 'DOC_TYP': docTyp, 'DOC_UNQ_ID': docUnqId, 'DOC_RVSN_NO': docRvsnNo, 'DOC_PART_CD': docPartCd, 'FILE_IDX': fileIDX, 'FILE_PATH': filePath, 'FILE_NAME': fileName }
		console.log(params)
		$.ajax({
			type: 'POST',
			url: URL + '/ComStreamDocs.do',
			data: params,
			dataType: 'JSON',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function (resultData) {
				if(resultData.msg == 'SUCCESS') {					
					setStreamDoc(resultData.docID);
				} else {
					alert(resultData.contents);
				}
			},
			error: function () {
				console.log('Error occured!!')
			}
		})
	}
	
	//도면뷰
	function setStreamDoc (streamdocsID) {
		let src = "";
        if (streamdocsID == "FAIL") {
            src = PDF_IP+"/streamdocs/view/error-pages/500"
        } else {
        	// streamdocsID = http://bdcsas.khnp.se.hn:8080/archive?get&pVersion=0045&contRep=ZDMS_2017&docId=0017A477380E1EDC8DDFC169DD38DC00&compId=ISO%25EC%259A%25B4%25EC%25A0%2584-35-122A%20%25EC%2588%2598%25EB%25AC%25B8%20%25EB%25B0%258F%20%25EB%25B0%25A9%25EB%25A5%2598%25EC%2584%25A4%25EB%25B9%2584%20%25EC%259A%25B4%25EC%25A0%2584%20%25EA%25B0%259C%25EC%25A0%2595%25EC%259D%25B4%25EB%25A0%25A5%25EC%2584%259C_08.hwp&accessMode=r&authId=CN%3DPRD,OU%3DI0020127726,OU%3DSAPWebAS,O%3DSAPTrustCommunity,C%3DDE&expiration=20221208084441&secKey=MIIBUgYJKoZIhvcNAQcCoIIBQzCCAT8CAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGCAR4wggEaAgEBMG8wZDELMAkGA1UEBhMCREUxHDAaBgNVBAoTE1NBUCBUcnVzdCBDb21tdW5pdHkxEzARBgNVBAsTClNBUCBXZWIgQVMxFDASBgNVBAsTC0kwMDIwMTI3NzI2MQwwCgYDVQQDEwNQUkQCByAUBSkjJAEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIyMTIwODA2NDQ0M1owIwYJKoZIhvcNAQkEMRYEFEEde5C5DkqNbHXkS4BpSma2G7K6MAkGByqGSM44BAMELzAtAhUAgfI4dic97Ux1cDg5EJENJWNGfaICFCJ1voB0xDdMFbEg0UO222ZOhngi
            src = PDF_IP+"/streamdocs/view/sd;streamdocsId="+streamdocsID
        }
        
        //src = src.replace('bdcsas.khnp.se.hn:8080', '10.53.2.201:30013/ws')
        //console.log('src 2 >>> ' + src) // http://10.53.0.21/streamdocs/view/sd;streamdocsId=72059261319621637
        //$('#docSrc').html(src)
        $('#ifr_pdfviewer').attr('src', src);
	}
	
	function closePop () {
		let actionUrl = '';
		
		let form = document.getElementById('form')

		switch (callDiv) {
			case "DRAW_P":
				actionUrl = 'Draw_Search.do'
				break;
			case "DRAW_M":
				actionUrl = 'Draw_Search_M.do?USER_ID=${USER_ID}&PPCD=${PPCD}'
				break;
			case "DRAW_MY":
				actionUrl = 'Draw_My_Search_M.do?USER_ID=${USER_ID}&PPCD=${PPCD}'
				break;
			case "PROC_P":
				actionUrl = 'Proc_Search.do'
				break;
			case "PROC_M":
				actionUrl = 'Proc_Search_M.do?USER_ID=${USER_ID}&PPCD=${PPCD}'
				break;
			default:
				break;
		}
		
		form.action = actionUrl
		form.submit();	
	}
	
</script>
<style>
	body {overflow:hidden; background: #fff;}
	.Outline .Title {font-size: 1.5rem; font-weight: 600;}
	.Outline .Value {font-size: 1.5rem; ;}

	.pdfdiv	{height: calc(100% - 7.5rem); position: relative; top: 0; float: left;}
	.pdf-searchmenu {width: 28%; overflow: auto; -ms-overflow-style: none; border: 1px solid #bfd4f1; margin: 0;}
	.pdf-searchmenu::-webkit-scrollbar {display: none;}
	.pdf-view {width: 68%; border: 1px solid #bfd4f1; margin: 0;}
	
	.pdf-view-full {width: 98%; border: 1px solid #bfd4f1; margin: 0 1%;}
	
	.tblDocList {text-align: center; width: 100%; white-space: nowrap;}
	.tblDocList th {background: #f7f7f7; border: 1px solid #ddd; position: sticky; top: 0;}
	.tblDocList th:first-child {border-left: none;}
	.tblDocList th:last-child {border-right: none;}
	.tblDocList td {background: #fff; border: 1px solid #ddd; padding: 0 1rem;}
	.tblDocList td:first-child {border-left: none;}
	.tblDocList td:last-child {border-right: none;}
	.tblDocList tr ~ tr:active td {background: #ddd;}
		
	.pdf-view iframe {width: calc(100% - 1rem); height: calc(100% - 1rem); margin: 0.5rem; display: block;}
	</style>
	<body>
	<form id="form" name="form" method="post">
		<input type="hidden" name="PAGE" value="${PAGE}">
		<input type="hidden" name="FAVOR_YN" value="${FAVOR_YN}">
		<input type="hidden" name="DOC_UNQ_ID" value="${S_DOC_UNQ_ID}">
		<input type="hidden" name="DOC_NM_TITL" value="${S_DOC_NM_TITL}">
		<input type="hidden" name="M_SEARCHTXT" value="${M_SEARCHTXT}">

		<table border="0" cellpadding="0" cellspacing="0" class="Outline" style="width:100%; height:100vh;">
		<tr>
		<td>
		<table border="1" cellpadding="0" cellspacing="0" class="Outline" style="width: calc(100% - 20px); height: calc(100% - 20px); margin:10px; border: 2px solid #428bca;">
		<tr height="10px">
		<td colspan=2>
				<table border="0" cellpadding="0" cellspacing="0" class="Outline" style="width:100%;">
					<colgroup>
						<c:if test="${CALL_P_NM ne 'DRAW_MY'}">
						<col class="Title" style="width:3rem;"/>
						<col style="width:5rem;"/>
						</c:if>
						<col class="Title" style="width:3rem;"/>
						<col style="width:20rem;"/>
						<col style="width:50px;"/>
					</colgroup>  <!-- value width 설정 -->       
					<tr>
						<c:if test="${CALL_P_NM ne 'DRAW_MY'}">
							<td class="Title" align=right>도면번호: &nbsp;</td>                
							<td class="Value"><b id="DOC_UNQ_ID"></b></td>
						</c:if>
						<td class="Title" align="right">제목: &nbsp;</td>
						<td class="Value"><b id="DOC_NM_TITL"></b></td> 
						<span id="docSrc"></span>
                        <td align="right">
						<a class="SearchButton" href="#" style="background:#666; display: block; width: 50px; height: 26px; ; margin-right:10px;  text-align: center;" onclick="closePop();"><span class='Text' style="font-size: 1.25rem; line-height: 26px; color: #fff;">닫기</span></a>
						</td>
					</tr>           
				</table> 
		</td>
		</tr>
		<tr>
		<c:if test="${CALL_P_NM ne 'DRAW_MY'}">
		<td width="2px;" style="vertical-align:top;">
			<table id="tblDocList" class="tblDocList">
			</table>
		</td>
		</c:if>
		<td>
		</form>
		<iframe src="" frameborder="0" width="100%" height="100%" scrolling="auto" align="center" name="ifr_pdfviewer" id="ifr_pdfviewer" allowfullscreen></iframe>
		</td>
		</tr>
		</table>
		</td>
		</tr>
		</table>
</body>
