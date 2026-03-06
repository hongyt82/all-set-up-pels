<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%
	ArrayList formList  = (ArrayList) request.getAttribute("formList");
	String DIV  = (String) request.getAttribute("DIV");
    int size = formList.size();
    String FNAME1 = formList.get(0).toString();
    String FNAME2 = "";
    if(size > 1) {
    	FNAME2 = formList.get(1).toString();
    }
    
%>
<script src="/oz80/ozhviewer/jquery-2.0.3.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/jquery-ui.css" type="text/css"/>
<script src="/oz80/ozhviewer/jquery-ui.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/ui.dynatree.css" type="text/css"/>
<script type="text/javascript" src="/oz80/ozhviewer/jquery.dynatree.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/OZJSViewer.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/web/compatibility.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/build/pdf.js" charset="utf-8"></script>

<script>
	var ws;
	var rommId = 'DOC${TST_UNQ_KY_VAL}';
	
	$(document).ready(function () {
		$('#alrim').hide();
		$('#alrim_show').hide();
		$('#alrim_new').hide();

		start_ozjs("OZViewer","/oz80/ozhviewer/");
		
		connect();
	})	

	function connect()
	{
	    ws = new WebSocket('ws://pelssink.khnp.se.hn');
		ws.onopen = function() {
		    console.log('웹소켓 연결 성공');
		    let users = '{"USER_ID":"${LOGIN_USER_ID}","USER_NAME":"${LOGIN_USER_NM}","DEPT_NM":"${LOGIN_USER_DEPT_NM}"}';
		    
			let json = '{"roomId": "' + rommId + '", "type": "newClient", "user": ' + users +'}' ;
			sendMessage(json);
		};
	
		ws.onmessage = function(event) {
		    console.log('메시지 수신 :', event.data);
		    
		    if(event.data=="PING")
		    	return;
		    
			const json = JSON.parse(event.data);
			if(json["roomId"] != rommId) {
				return;
			}
		
			if(json["type"] == "broadcast") {
				const broadData = json["value"];
				
				if(broadData["event"] == "movePage")
				{
					GoPage(broadData["page"]);
				} 
				else if(broadData["event"] == "setForm")
				{
					const formId = broadData["formId"]
					const value = broadData["value"]
			
					SetForm('{"'+ formId+'": "' + value +'"}');
				} 
				else if(broadData["event"] == "commentDraw")
				{
					const memo = broadData["memo"];
					const page = OZViewer.GetInformation("CURRENT_PAGE");
					DrawComment(memo);
					OZViewer.Script("movepage="+page);
				}
			}
			else if(json["type"] == "clientList") {
				const users = json["users"];
				$('#su').val(users.length);
				
				console.log('client :' + users);
				console.log('client :' + users[0]);
				console.log('client 수 :', users.length);
				var msg = "";
				for(var i=0; i<users.length; i++)
				{
                                        var user = users[i];
					var user_id = user["USER_ID"];
					var user_name = user["USER_NAME"];
					var dept_nm = user["DEPT_NM"];
					msg = msg + user_id + "," + user_name + "," + dept_nm + "\r\n";
				}
				$('#su').attr('title', msg);
				
				
			}
			else if(json["type"] == "chat") {
				const value = json["value"];
				const senderId = value["senderId"];
				const senderName = value["senderName"];
				const message = value["message"];
				const createdAt = value["createdAt"];
				
				console.log('sender :' + senderId + "," + senderName);
				console.log('message :' + message);
				console.log('createdAt :' + createdAt);
				
				var Msg = message.replaceAll("<br>", "\r\n");

				if(senderId != "${LOGIN_USER_ID}") {

					const messages = document.querySelector('.chat-messages');

		        		const newMessage = document.createElement('div');
		        		newMessage.classList.add('message', 'user');
		        		newMessage.textContent = createdAt + "[" + senderName  + "]\n" + Msg;
		    
		        		messages.appendChild(newMessage);
		        		//elem.value = '';
		        		//elem.style.height = 'auto';
		        		messages.scrollTop = messages.scrollHeight;

					$('#alrim_new').show();
				}


				
				//document.getElementById('alarm_show_msg').value = senderId + "," + senderName + '\r\n' + createdAt + '\r\n=======================\r\n' + Msg;
				//$('#alrim_show').show();
				
				//$('alarm_msg').val('전송자: ' + sender + createdAt +  message);
				
				//
				//let json = '{"roomId": "' + rommId + '", "type": "chat", "value": { "sender":"M1EU0004", "message":"aaaaa", "createdAt":"YYYY-MM-DD HH:MM:SS"} }';
				//sendMessage(json);
			}
		};
	
		ws.onclose = function() {
		    console.log('연결 종료');
		    connect();
		};
	
		ws.onerror = function(error) {
		    console.log('웹소켓 오류 :', error);
		};
	}
	
	function sendMessage(message) {
	    ws.send(message);
	}


	function OZUserActionCommand_OZViewer(param1, param2, param3, param4) {
		console.log("ActionCommand 1:" + param1 + ",2:" + param2 + ",3:" + param3 + ",4:" + param4);

		if(param1=="CommentDraw"){
			console.log(OZViewer.GetInformation("MEMO_DATA"));
		}
	}

	function OZPageChangeCommand_OZViewer(param1) {
		console.log("Change Command 1:" + param1);
	}

	function OZUserEvent_OZViewer(param1, param2, param3, param4) {
		console.log("UserEvnet 1:" + param1 + ",2:" + param2 + ",3:" + param3 + ",4:" + param4);
	}
	
	function OZEFormInputEventCommand_OZViewer(param1, param2, param3, param4) {
		console.log("EFormInputEventCommand 1:" + param1 + ",2:" + param2 + ",3:" + param3 + ",4:" + param4);

		getInputData(param2);
	}

	function getInputData(formId)
	{
		var inputJsonAll = OZViewer.GetInformation("INPUT_JSON_ALL_GROUP_BY_REPORT");
		inputJsonAll = JSON.parse(inputJsonAll);
		
		//console.log("INPUT_JSON_ALL_GROUP_BY_REPORT >>" +inputJsonAll);

		for(let i=0; i< inputJsonAll.length; i++)
		{
			var obj = inputJsonAll[i]["Input"];

			if(obj[formId])
			{
				console.log(obj[formId]);
				return;
			}
		}
	}

	function getCallshimStr() {
	    let call_shim = "";
	    call_shim += "_TraceLn('[call_shim_] ozarg_1 :'+ozarg_1+' | ozarg_2 :'+ozarg_2+' | ozarg_3 : '+ozarg_3+' | ozarg_4 : '+ozarg_4);";
	    call_shim += " if(ozarg_1 == 'f_setvalues') {";
	    call_shim += "     var jsonObj = JSON.parse(ozarg_2);	";
	    call_shim += "	  for (var key in jsonObj) {	";
	    call_shim += "		  _TraceLn('[key]'+key +'[value]'+jsonObj[key]); ";
	    call_shim += "         var comp = GetInputComponent(key);";
	    call_shim += "         if(comp && comp.GetInputType() == 'RadioButton'){ ";
	    call_shim += "             var comp = GetInputComponent(key); ";
	    call_shim += "             if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4) ";
	    call_shim += "         }else if(comp && comp.GetInputType() == 'RadioButtonGroup'){ ";
	    call_shim += "   	      var comp1 = comp.GetRadioButtons(); ";
	    call_shim += "   	      comp1 = JSON.parse(comp1); ";
	    call_shim += "   	      var checked = []; ";
	    call_shim += "   	      for(var i = 0; i<comp1.length; i++){ ";
	    call_shim += "   	         var comp2 = comp.GetRadioButton(comp1[i]); ";
	    call_shim += "   		     if(comp2)checked.push(comp2.IsChecked()); ";
	    call_shim += "   	      } ";
	    call_shim += "   	      SetInputValue(key, jsonObj[key]); ";
	    call_shim += "   	      for(var i = 0; i<comp1.length; i++){ ";
	    call_shim += "   	         var comp2 = comp.GetRadioButton(comp1[i]); ";
	    call_shim += "   	         if(comp2 && comp2.IsChecked() != checked[i]){ ";
	    call_shim += "   		        comp2.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "   		     } ";
	    call_shim += "   	      } ";
	    call_shim += "   	      if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "          }else if (comp && comp.GetInputType() == 'SignPad'){ ";
	    call_shim += "   	      SetInputValue(key, jsonObj[key]); ";
	    call_shim += "   	      if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "   	      var reuseName = comp.GetReusableSignName(); ";
	    call_shim += "   	      if (reuseName != '') { ";
	    call_shim += "   	         _SetReusableSignData(reuseName, comp.GetValue()); ";
	    call_shim += "   	      } ";
	    call_shim += "   	   }else{ ";
	    call_shim += "   	      SetInputValue(key, jsonObj[key]); ";
	    call_shim += "   	      if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "          } ";
	    call_shim += "  	   } ";
	    call_shim += "  }";
	    
	    return call_shim
	}

	// 입력데이터 리턴
	function getInputJson() {
		/*
		var reportCnt = OZViewer.GetInformation("REPORT_COUNT");
		var rdata = new Object();
		for (var i = 0; i < reportCnt; i++) {
			var inputValue = OZViewer.GetInformation("INPUT_JSON_AT=" + i);
			console.log("[" + i+ "] input json >> " + inputValue);
			rdata[OZViewer.GetInformation("DISPLAYNAME_AT=" + i)] = inputValue;
		}
		var jsonStr = JSON.stringify(rdata);
		console.log("rdata >>" +jsonStr);
		*/
		var inputJsonAll = OZViewer.GetInformation("INPUT_JSON_ALL_GROUP_BY_REPORT");
		console.log("INPUT_JSON_ALL_GROUP_BY_REPORT >>" +inputJsonAll);

		return inputJsonAll;
	}	
	
	function SetOZParamters_OZViewer(){
		var oz;
		oz = document.getElementById("OZViewer");
		oz.sendToActionScript("viewer.focus_doc_index", "0"); //자식 ozr 개수
		oz.sendToActionScript("viewer.useractioncommand", "true");
		oz.sendToActionScript("viewer.pagechangecommand", "true");
		oz.sendToActionScript("viewer.pagedisplay","continuous");
		oz.sendToActionScript("viewer.externaleventshim", getCallshimStr());
		oz.sendToActionScript("global.concatpage","true");
		oz.sendToActionScript("eform.signpad_type","dialog");
		oz.sendToActionScript("eform.inputeventcommand","true");
		oz.sendToActionScript("print.alldocument","true");
		oz.sendToActionScript("pdf.savecomment","all");
		oz.sendToActionScript("viewer.childcount", "0"); //자식 ozr 개수
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.openfile","http://pels.khnp.se.hn/upload/<%=FNAME1%>");
		<%
			if("PDF".equals(DIV)) {
		%>
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.args1=pdf","http://pels.khnp.se.hn/upload/<%=FNAME2%>");
		//oz.sendToActionScript("connection.args2","viewerType=HTML5 Canvas Viewer");
		<%
			}
			else {
		%>
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.args1","viewerType=HTML5 Canvas Viewer");
		<%
			}
		%>
		oz.sendToActionScript("information.debug","true");
		
		// stemp
		oz.sendToActionScript("image.defaultsize","50,36");
		oz.sendToActionScript("image.path","http://pels.khnp.se.hn/");
		oz.sendToActionScript("image.editable","false");
		oz.sendToActionScript("image.showborder","false");

		return true;
	}		
	
	function OZImageSet()
	{
		OZViewer.ScriptEx('attachimage', 'image.path=http://pels.khnp.se.hn/resources/assets/images/email1.png;image.defaultssize=100,40',';');
	}
	
	function SaveOzd()
	{
		var jsondata = getInputJson();

		// 입력데이터 서버에 전송
		$.ajax({
			url: 'http://pels.khnp.se.hn/oz80/pels/inspection_save.jsp',
			type: "POST",
			//data: "jsondata=" + encodeURIComponent( getInputJson() ),
			data: { ozd_file : '<%=FNAME1%>', ozr_file : '<%=FNAME2%>', jsondata : getInputJson()},
			success: function (resultStr) {
				console.log("resultStr="+resultStr);
				if(resultStr.trim().length == 0) {
					alert(" 저장시 오류가 발생했습니다.\n오즈스케줄러 로그를 확인해 주시기 바랍니다.");
					return;
				}
				
				var result = JSON.parse(resultStr);
				if (result.Status == "success") {
					alert("[Success] " + result.Message);
				} else {
					alert("[Fail] " + result.Message);                        
				}
				//self.opener.location.reload();
				//self.close();
			},
			error: function (err) {
				alert(err.statusText);
			}
		});
	}
	
	function SaveCFY() {
		if (!confirm('점검완료를 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', '${TST_UNQ_KY_VAL}');
		formData.append('PRSTS_CFY', 'C');
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Exam_CFY_Update.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					alert(resultData.resultMsg);
				} else {
					alert('저장에 실패하였습니다.');
					console.log('Save Fail!!');
				}
			},
			error: function () {
				alert('저장에 실패하였습니다.');
				console.log('Error occured!!');
			}
		})
	}

	function SetForm(data)
	{
		var reportCount = OZViewer.GetInformation("REPORT_COUNT");

		const jsonData = '{"A080200001_tbx_1": "2024-06-04" }';

		for(let i=0; i<reportCount; i++) {
			if(data)
				OZViewer.Document_TriggerExternalEventByDocIndex(i, "call_shim_f_setvalues", data, "");
			else
				OZViewer.Document_TriggerExternalEventByDocIndex(i, "call_shim_f_setvalues", jsonData, "")
		}

	}

	function GoPage(pageNo)
	{
		OZViewer.Script("movepage="+pageNo);
	}

	function DrawComment(memo)
	{
		const data = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPE9aTU9ESSBWRVJTSU9OPSIxLjAiPgo8UkVQT1JUPgo8UEFHRSBWPSIyIiBIPSIwIj4KPE9aQ09NTUVOVD4mbHQ7b3p2ZWN0b3JpbWFnZSB2ZXJzaW9uPSIxLjAiJmd0OwombHQ7cGFnZSByPSIxIiZndDsmbHQ7L3BhZ2UmZ3Q7CiZsdDtzdHJpbmd0YWJsZSZndDsmbHQ7L3N0cmluZ3RhYmxlJmd0OyZsdDtvIG49IjEiJmd0O3M2NTUzNyBQIzAgcDEgQiBNMzIyLjUsMTA1IFEzMjIuNSwxMDUgMzIyLjg3NSwxMDUgUTMyMy4yNSwxMDUgMzIzLjI1LDEwNS4zNzUgUTMyMy4yNSwxMDUuNzUgMzIyLjUsMTA2Ljg3NSBRMzIxLjc1LDEwOCAzMjEsMTA5Ljg3NSBRMzIwLjI1LDExMS43NSAzMTkuNSwxMTIuNSBRMzE4Ljc1LDExMy4yNSAzMTcuNjI1LDExNC43NSBRMzE2LjUsMTE2LjI1IDMxNC4yNSwxMTguNSBRMzEyLDEyMC43NSAzMDkuNzUsMTIzIFEzMDcuNSwxMjUuMjUgMzA0LjUsMTI3LjUgUTMwMS41LDEyOS43NSAyOTguNSwxMzIgUTI5NS41LDEzNC4yNSAyOTEuNzUsMTM2LjEyNSBRMjg4LDEzOCAyODQuNjI1LDE0MC4yNSBRMjgxLjI1LDE0Mi41IDI3Ni43NSwxNDUuMTI1IFEyNzIuMjUsMTQ3Ljc1IDI2Ny43NSwxNTAuMzc1IFEyNjMuMjUsMTUzIDI1OC4zNzUsMTU1LjYyNSBRMjUzLjUsMTU4LjI1IDI0NC44NzUsMTYyIFEyMzYuMjUsMTY1Ljc1IDIzMS4zNzUsMTY4IFEyMjYuNSwxNzAuMjUgMjIxLjI1LDE3Mi41IFEyMTYsMTc0Ljc1IDIxMS44NzUsMTc1Ljg3NSBRMjA3Ljc1LDE3NyAyMDUuNSwxNzguNSBRMjAzLjI1LDE4MCAxOTkuODc1LDE4MS44NzUgUTE5Ni41LDE4My43NSAxOTMuODc1LDE4NS42MjUgUTE5MS4yNSwxODcuNSAxODksMTg5IFExODYuNzUsMTkwLjUgMTg0LjUsMTkyIFExODIuMjUsMTkzLjUgMTgwLDE5NS4zNzUgUTE3Ny43NSwxOTcuMjUgMTc1Ljg3NSwxOTguMzc1IFExNzQsMTk5LjUgMTczLjI1LDIwMC4yNSBRMTcyLjUsMjAxIDE3MS43NSwyMDEuNzUgUTE3MSwyMDIuNSAxNzAuNjI1LDIwMi41IFExNzAuMjUsMjAyLjUgMTcxLjM3NSwyMDIuNSBRMTcyLjUsMjAyLjUgMTc0LDIwMi41IFExNzUuNSwyMDIuNSAxNzguMTI1LDIwMi4xMjUgUTE4MC43NSwyMDEuNzUgMTg0LjUsMjAxIFExODguMjUsMjAwLjI1IDE5MiwyMDAuMjUgUTE5NS43NSwyMDAuMjUgMjAxLjM3NSwyMDAuMjUgUTIwNywyMDAuMjUgMjExLjg3NSwyMDEgUTIxNi43NSwyMDEuNzUgMjIzLjEyNSwyMDIuMTI1IFEyMjkuNSwyMDIuNSAyMzcuMzc1LDIwNCBRMjQ1LjI1LDIwNS41IDI1MS42MjUsMjA1Ljg3NSBRMjU4LDIwNi4yNSAyNjMuMjUsMjA3LjM3NSBRMjY4LjUsMjA4LjUgMjcyLjYyNSwyMDkuMjUgUTI3Ni43NSwyMTAgMjgxLjI1LDIxMC43NSBRMjg1Ljc1LDIxMS41IDI4OS4xMjUsMjEyLjYyNSBRMjkyLjUsMjEzLjc1IDI5NS44NzUsMjE0LjUgUTI5OS4yNSwyMTUuMjUgMzAxLjg3NSwyMTYuMzc1IFEzMDQuNSwyMTcuNSAzMDYuMzc1LDIxNy44NzUgUTMwOC4yNSwyMTguMjUgMzEwLjg3NSwyMTguNjI1IFEzMTMuNSwyMTkgMzE1LjM3NSwyMTkuMzc1IFEzMTcuMjUsMjE5Ljc1IDMxOCwyMTkuNzUgUTMxOC43NSwyMTkuNzUgMzE5LjUsMjE5Ljc1IFEzMjAuMjUsMjE5Ljc1IDMyMSwyMTkuNzUgUTMyMS43NSwyMTkuNzUgMzIyLjUsMjE5Ljc1IFEzMjMuMjUsMjE5Ljc1IDMyMy42MjUsMjE5IFEzMjQsMjE4LjI1IDMyNC4zNzUsMjE4LjI1IFEzMjQuNzUsMjE4LjI1IDMyNS41LDIxNy44NzUgUTMyNi4yNSwyMTcuNSAzMjYuMjUsMjE3LjEyNSBRMzI2LjI1LDIxNi43NSAzMjcsMjE2LjM3NSBRMzI3Ljc1LDIxNiAzMjcuNzUsMjE0Ljg3NSBRMzI3Ljc1LDIxMy43NSAzMjcuNzUsMjEyLjYyNSBRMzI3Ljc1LDIxMS41IDMyNy43NSwyMDkuNjI1IFEzMjcuNzUsMjA3Ljc1IDMyNy43NSwyMDYuNjI1IFEzMjcuNzUsMjA1LjUgMzI3Ljc1LDIwNCBRMzI3Ljc1LDIwMi41IDMyNywyMDAuNjI1IFEzMjYuMjUsMTk4Ljc1IDMyNS44NzUsMTk2LjUgUTMyNS41LDE5NC4yNSAzMjQuMzc1LDE5My4xMjUgUTMyMy4yNSwxOTIgMzIyLjEyNSwxOTAuMTI1IFEzMjEsMTg4LjI1IDMxOS44NzUsMTg2IFEzMTguNzUsMTgzLjc1IDMxNy42MjUsMTgyLjI1IFEzMTYuNSwxODAuNzUgMzE1LjM3NSwxNzguNSBRMzE0LjI1LDE3Ni4yNSAzMTMuNSwxNzQuNzUgUTMxMi43NSwxNzMuMjUgMzExLjI1LDE3MSBRMzA5Ljc1LDE2OC43NSAzMDcuODc1LDE2NS4zNzUgUTMwNiwxNjIgMzA0LjEyNSwxNTkuMzc1IFEzMDIuMjUsMTU2Ljc1IDMwMCwxNTMuMzc1IFEyOTcuNzUsMTUwIDI5NS4xMjUsMTQ2LjI1IFEyOTIuNSwxNDIuNSAyOTAuNjI1LDEzOS44NzUgUTI4OC43NSwxMzcuMjUgMjg2Ljg3NSwxMzQuNjI1IFEyODUsMTMyIDI4My44NzUsMTMwLjEyNSBRMjgyLjc1LDEyOC4yNSAyODEuMjUsMTI1LjYyNSBRMjc5Ljc1LDEyMyAyNzguMjUsMTIxLjEyNSBRMjc2Ljc1LDExOS4yNSAyNzYsMTE4LjUgUTI3NS4yNSwxMTcuNzUgMjc0LjUsMTE2LjYyNSBRMjczLjc1LDExNS41IDI3Mi4yNSwxMTMuNjI1IFEyNzAuNzUsMTExLjc1IDI2OS4yNSwxMDkuODc1IFEyNjcuNzUsMTA4IDI2Ny4zNzUsMTA3LjI1IFEyNjcsMTA2LjUgMjY2LjI1LDEwNS43NSBRMjY1LjUsMTA1IDI2NS41LDEwNC4yNSBRMjY1LjUsMTAzLjUgMjY1LjEyNSwxMDMuNSBRMjY0Ljc1LDEwMy41IDI2NC4zNzUsMTA0LjYyNSBRMjY0LDEwNS43NSAyNjMuMjUsMTA3LjYyNSBRMjYyLjUsMTA5LjUgMjYwLjYyNSwxMTIuODc1IFEyNTguNzUsMTE2LjI1IDI1OCwxMjAuMzc1IFEyNTcuMjUsMTI0LjUgMjU2LjEyNSwxMjcuODc1IFEyNTUsMTMxLjI1IDI1NC4yNSwxMzUgUTI1My41LDEzOC43NSAyNTEuNjI1LDE0My42MjUgUTI0OS43NSwxNDguNSAyNDksMTUxLjUgUTI0OC4yNSwxNTQuNSAyNDcuNSwxNTkgUTI0Ni43NSwxNjMuNSAyNDYuNzUsMTY3LjYyNSBRMjQ2Ljc1LDE3MS43NSAyNDYsMTc3LjM3NSBRMjQ1LjI1LDE4MyAyNDQuODc1LDE4Ny4xMjUgUTI0NC41LDE5MS4yNSAyNDMsMTk1Ljc1IFEyNDEuNSwyMDAuMjUgMjQxLjEyNSwyMDQgUTI0MC43NSwyMDcuNzUgMjQwLjM3NSwyMTEuNSBRMjQwLDIxNS4yNSAyNDAsMjE3LjEyNSBRMjQwLDIxOSAyMzkuMjUsMjIxLjI1IFEyMzguNSwyMjMuNSAyMzguNSwyMjQuMjUgUTIzOC41LDIyNSAyMzguNSwyMjUuNzUgUTIzOC41LDIyNi41IDIzOC41LDIyNy42MjUgUTIzOC41LDIyOC43NSAyMzguNSwyMjkuNSBRMjM4LjUsMjMwLjI1IDIzOC41LDIzMS4zNzUgUTIzOC41LDIzMi41IDIzOC41LDIzMy42MjUgUTIzOC41LDIzNC43NSAyMzguNSwyMzUuODc1IFEyMzguNSwyMzcgMjM4LjUsMjM3Ljc1IFEyMzguNSwyMzguNSAyMzguNSwyMzguODc1IFEyMzguNSwyMzkuMjUgMjM4LjUsMjM5LjYyNSBRMjM4LjUsMjQwIDIzOS4yNSwyNDAgUTI0MCwyNDAgMjQwLjM3NSwyNDAgUTI0MC43NSwyNDAgMjQxLjg3NSwyMzkuMjUgUTI0MywyMzguNSAyNDMuNzUsMjM3LjM3NSBRMjQ0LjUsMjM2LjI1IDI0NC44NzUsMjM1LjUgUTI0NS4yNSwyMzQuNzUgMjQ2LDIzMy42MjUgUTI0Ni43NSwyMzIuNSAyNDcuNSwyMzEuMzc1IFEyNDguMjUsMjMwLjI1IDI0OSwyMjkuNSBRMjQ5Ljc1LDIyOC43NSAyNTEuMjUsMjI3LjI1IFEyNTIuNzUsMjI1Ljc1IDI1My41LDIyNSBRMjU0LjI1LDIyNC4yNSAyNTQuNjI1LDIyMy41IFEyNTUsMjIyLjc1IDI1Ni4xMjUsMjIyIFEyNTcuMjUsMjIxLjI1IDI1OCwyMjAuODc1IFEyNTguNzUsMjIwLjUgMjU5Ljg3NSwyMTkgUTI2MSwyMTcuNSAyNjEuNzUsMjE2Ljc1IFEyNjIuNSwyMTYgMjY0LDIxNC41IFEyNjUuNSwyMTMgMjY3LjM3NSwyMTAuNzUgUTI2OS4yNSwyMDguNSAyNzAuNzUsMjA1Ljg3NSBRMjcyLjI1LDIwMy4yNSAyNzQuNSwyMDEuMzc1IFEyNzYuNzUsMTk5LjUgMjc5LDE5Ni41IFEyODEuMjUsMTkzLjUgMjgzLjEyNSwxOTEuMjUgUTI4NSwxODkgMjg2Ljg3NSwxODYuMzc1IFEyODguNzUsMTgzLjc1IDI5MC4yNSwxODAuMzc1IFEyOTEuNzUsMTc3IDI5My4yNSwxNzQuMzc1IFEyOTQuNzUsMTcxLjc1IDI5NS41LDE2OC4zNzUgUTI5Ni4yNSwxNjUgMjk3Ljc1LDE2MS42MjUgUTI5OS4yNSwxNTguMjUgMzAwLDE1NS42MjUgUTMwMC43NSwxNTMgMzAxLjg3NSwxNTAuNzUgUTMwMywxNDguNSAzMDMuNzUsMTQ1Ljg3NSBRMzA0LjUsMTQzLjI1IDMwNiwxNDEgUTMwNy41LDEzOC43NSAzMDguMjUsMTM3LjI1IFEzMDksMTM1Ljc1IDMxMC4xMjUsMTMzLjg3NSBRMzExLjI1LDEzMiAzMTIuNzUsMTMwLjEyNSBRMzE0LjI1LDEyOC4yNSAzMTUuNzUsMTI2Ljc1IFEzMTcuMjUsMTI1LjI1IDMxNy42MjUsMTI0LjUgUTMxOCwxMjMuNzUgMzE5LjUsMTIyLjYyNSBRMzIxLDEyMS41IDMyMSwxMjAuNzUgUTMyMSwxMjAgMzIyLjUsMTE4LjUgUTMyNCwxMTcgMzI0LjM3NSwxMTUuODc1IFEzMjQuNzUsMTE0Ljc1IDMyNi4yNSwxMTMuMjUgUTMyNy43NSwxMTEuNzUgMzI4LjUsMTExLjM3NSBRMzI5LjI1LDExMSAzMzAsMTEwLjI1IFEzMzAuNzUsMTA5LjUgMzMxLjUsMTA4Ljc1IFEzMzIuMjUsMTA4IDMzMi42MjUsMTA3LjYyNSBRMzMzLDEwNy4yNSAzMzQuMTI1LDEwNi41IFEzMzUuMjUsMTA1Ljc1IDMzNS4yNSwxMDUuMzc1IFEzMzUuMjUsMTA1IDMzNS4yNSwxMDQuNjI1IFEzMzUuMjUsMTA0LjI1IDMzNS4yNSwxMDMuODc1IFEzMzUuMjUsMTAzLjUgMzM1LjI1LDEwMy4xMjUgUTMzNS4yNSwxMDIuNzUgMzM1LjYyNSwxMDIuMzc1IFEzMzYsMTAyIDMzNi4zNzUsMTAxLjYyNSBRMzM2Ljc1LDEwMS4yNSAzMzcuMTI1LDEwMC44NzUgdiZsdDsvbyZndDsKJmx0Oy9venZlY3RvcmltYWdlJmd0OzwvT1pDT01NRU5UPgo8L1BBR0U+CjwvUkVQT1JUPgo8L09aTU9EST4K";

		if(memo)
			OZViewer.Script("memo_data="+memo);
		else
			OZViewer.Script("memo_data="+data);
	}
	
	function alrim_on()
	{
		//document.getElementById('alarm_msg').value = "";
		$('#alrim_new').show();
	}
	
	function alrim_off()
	{
		$('#alrim').hide();
	}
	
	function alrim_show_off()
	{
		$('#alrim_show').hide();
	}
	
	function alrim_send()
	{
		var message = $('#alarm_msg').val();
		let today = new Date();
		let year = today.getFullYear();
		let month = ('0' + (today.getMonth()+1)).slice(-2);
		let day = ('0' + today.getDate()).slice(-2);
		let hours = ('0' + today.getHours()).slice(-2);
		let minutes = ('0' + today.getMinutes()).slice(-2);
		let seconds = ('0' + today.getSeconds()).slice(-2);
		let dateString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

		message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
		
		let json = '{"roomId": "' + rommId + '", "type": "chat", "value": { "senderId":"${LOGIN_USER_ID}", "senderName":"${LOGIN_USER_NM}", "senderDept":"${LOGIN_USER_DEPT_NM}","message":"' + message  + '", "createdAt":"' + dateString + '"} }';
		
		console.log(json);
		
		//alert(json);
		sendMessage(json);
		
		$('#alrim').hide();
		
	}

	function message_send()
	{
		let today = new Date();
		let year = today.getFullYear();
		let month = ('0' + (today.getMonth()+1)).slice(-2);
		let day = ('0' + today.getDate()).slice(-2);
		let hours = ('0' + today.getHours()).slice(-2);
		let minutes = ('0' + today.getMinutes()).slice(-2);
		let seconds = ('0' + today.getSeconds()).slice(-2);
		let dateString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

		const messages = document.querySelector('.chat-messages');
		var elem = document.getElementById("send_data");
		
        var text = elem.value.trim();
        if (text === '') return;
    
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'me');
        newMessage.textContent = dateString + "[${LOGIN_USER_NM}]\n" + text;
    
        messages.appendChild(newMessage);
        elem.value = '';
        elem.style.height = 'auto';
        messages.scrollTop = messages.scrollHeight;
        
        text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
		
		let json = '{"roomId": "' + rommId + '", "type": "chat", "value": { "senderId":"${LOGIN_USER_ID}", "senderName":"${LOGIN_USER_NM}", "senderDept":"${LOGIN_USER_DEPT_NM}","message":"' + text  + '", "createdAt":"' + dateString + '"} }';
		
		console.log(json);
		
		//alert(json);
		sendMessage(json);
        
	}

	function alarm_new_close()
	{
		$('#alrim_new').hide();
	}

	function alarm_new_open()
	{
		$('#alrim_new').show();
	}


</script>
    <style>
        body {margin: 0; padding: 0; font-family: sans-serif;}

        .chat-container {position: fixed; bottom: 20px; right: 20px; width: 300px; height: 400px; background-color: #cde0f1; 
            border: 1px solid #999; border-radius: 10px; display: flex; flex-direction: column; box-shadow: 0 0 10px rgba(0,0,0,0.3); overflow: hidden;
            opacity: 1; transform: translateY(0); transition: opacity 0.2s ease, transform 0.2s ease;}
        .chat-container.hidden {opacity: 0; transform: translateY(20px); pointer-events: none;}

        .chat-header {padding: 10px; font-weight: bold; background-color: #b2cde0;}
        .chat-messages {flex: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column;}
        .message {max-width: 95%; margin: 5px 0; padding: 8px 12px; border-radius: 10px; display: inline-block; position: relative; font-size: 11px;
            word-wrap: break-word; word-break: break-word; white-space: pre-wrap;}
        .message.user {background-color: #ffffff; align-self: flex-start;}
        .message.me {background-color: #ffee33; align-self: flex-end;}

        .chat-input {display: flex; padding: 10px; border-top: 1px solid #ccc; background-color: #e3f1ff;}
        .chat-input textarea {flex: 1; padding: 6px 10px; font-size: 14px; border: 1px solid #aaa; border-radius: 5px; resize: none; overflow: hidden; line-height: 1.4; min-height: 38px; max-height: 140px;}
        .chat-input button {margin-left: 8px; padding: 6px 12px; font-size: 14px; background-color: #4477ff; color: white; border: none; border-radius: 5px; cursor: pointer;}

        .close-button {float: right; background: none; border: none; font-size: 18px; cursor: pointer;}
        .chat-toggle {position: fixed; bottom: 20px; right: 20px; background-color: #4477ff; color: white; padding: 10px 14px; 
            border-radius: 30px; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.2); cursor: pointer;}
        .chat-toggle .icon {font-size: 18px;}

    </style>


<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text"></span> 	
		</div>      
		<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>
		<div class="PageButtonGroup" style="text-align:right">
		<!-- 
			<a class="btn-m" href="javascript:GoPage(3);"><span class="Text">3페이지로 이동</span></a>
			<a class="btn-m" href="javascript:SetForm();"><span class="Text">폼에 값 전달(3페이지)</span></a>
			<a class="btn-m" href="javascript:DrawComment();"><span class="Text">그리기(3페이지)</span></a> -->
			<!-- <a class="btn-m" href="javascript:SaveOzd();"><span class="Text">저장</span></a> -->
			<!-- <a class="btn-m" href="javascript:SaveCFY();"><span class="Text">점검완료</span></a> -->
			<!-- <a class="btn-m" href="javascript:OZImageSet();"><span class="Text">이미지삽입</span></a> -->
		</div>         
	</div>
	<div class="Contents" style="background-color: aliceblue;"> 			
		<div style="background-color: aliceblue; height:35px; display: table-cell; vertical-align:middle;">
			참가자수 : <input name="su" id="su" type="text" style="margin-top:0px; width:60px; text-align:center" class="TextBox" readonly/>
		</div> 
		<div style="background-color: aliceblue; height:25px; display: table-cell; vertical-align:middle;">
		 &nbsp; <a class="btn-m" href="javascript:alrim_on();" style="background-color: #aa88ff; height:25px;"><span class="Text" style="line-height:25px;">알림전송</span></a> 
		</div>
	</div>
	<div class="chat-container" style="z-index:999999;" id="alrim_new">
        <div class="chat-header">
            <span>알림내역</span>
            <button class="close-button"  onclick="javascript:alarm_new_close();">×</button>
        </div>
        <div class="chat-messages">
        </div>
        <div class="chat-input">
            <textarea id="send_data" name="send_data" placeholder="메시지를 입력하세요"></textarea>
            <button onclick="javascript:message_send();">전송</button>
        </div>      
    </div>

	
	<div id="alrim" style="width:35opx; height: 200px; left:10px; outline: solid 1px black; position:absolute; z-index:999999; background-color: white;">
		<textarea id="alarm_msg" rows="8" cols="50"></textarea>
		<div style="text-align:center;">
		<a class="btn-m" href="javascript:alrim_send();"><span class="Text">알림전송</span></a>
		<a class="btn-m" href="javascript:alrim_off();"><span class="Text">닫기</span></a>
		</div>	
	</div>
	<div id="alrim_show" style="width:35opx; height: 200px; left:10px; outline: solid 1px black; position:absolute; z-index:999999; background-color: white;">
		<textarea id="alarm_show_msg" rows="8" cols="50"></textarea>
		<div style="text-align:center;">
		<a class="btn-m" href="javascript:alrim_show_off();"><span class="Text">닫기</span></a>
		</div>	
	</div>
	<div id="OZViewer" style="width:100%;height:89%"></div>
</body>
</html>

