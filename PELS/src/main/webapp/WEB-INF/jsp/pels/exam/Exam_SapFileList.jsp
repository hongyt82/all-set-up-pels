<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	var SAP_FILE_LIST_LOG = '[SapFileList]';

	function sapFileListGetRowState() {
		var rows = [];
		var chkElements = document.getElementsByName('CHK_ITEM');
		var hiddenInputs = document.querySelectorAll('#form input[name=FILE_NAME]');

		for (var i = 0; i < chkElements.length; i++) {
			var isChecked = chkElements[i].checked;
			var hiddenFileName = hiddenInputs[i] ? hiddenInputs[i].value : '';
			var uiFileName = '';
			var row = chkElements[i].closest('tr');
			if (row && row.cells && row.cells.length > 1) {
				uiFileName = (row.cells[1].innerText || row.cells[1].textContent || '').trim();
			}
			rows.push({
				rowIndex: i,
				checked: isChecked,
				uiFileName: uiFileName,
				hiddenFileName: hiddenFileName,
				match: uiFileName === hiddenFileName
			});
		}
		return rows;
	}

	function sapFileListGetFilledUrls(form) {
		var slots = ['FILE_URL1', 'FILE_URL2', 'FILE_URL3', 'FILE_URL4', 'FILE_URL5'];
		var filled = [];
		for (var i = 0; i < slots.length; i++) {
			var val = form[slots[i]] ? (form[slots[i]].value || '').trim() : '';
			if (val) {
				filled.push({ slot: slots[i], value: val });
			}
		}
		return filled;
	}

	function sapFileListLogSnapshot(label) {
		var form = document.getElementById('form');
		var rows = sapFileListGetRowState();
		var checkedRows = rows.filter(function (r) { return r.checked; });
		var mismatchRows = rows.filter(function (r) { return r.checked && !r.match; });
		var filledUrls = form ? sapFileListGetFilledUrls(form) : [];

		console.log(SAP_FILE_LIST_LOG, '--- snapshot:', label, '---');
		console.log(SAP_FILE_LIST_LOG, 'total rows:', rows.length);
		console.log(SAP_FILE_LIST_LOG, 'UI checked count:', checkedRows.length);
		console.log(SAP_FILE_LIST_LOG, 'checked file names (UI):', checkedRows.map(function (r) { return r.uiFileName; }));
		console.log(SAP_FILE_LIST_LOG, 'checked file names (hidden):', checkedRows.map(function (r) { return r.hiddenFileName; }));
		console.log(SAP_FILE_LIST_LOG, 'form filled FILE_URL count:', filledUrls.length);
		console.log(SAP_FILE_LIST_LOG, 'form filled FILE_URL values:', filledUrls);

		if (mismatchRows.length > 0) {
			console.warn(SAP_FILE_LIST_LOG, 'UI/hidden mismatch rows:', mismatchRows);
		}
		if (form && checkedRows.length !== filledUrls.length) {
			console.warn(
				SAP_FILE_LIST_LOG,
				'count mismatch: UI checked=' + checkedRows.length + ', FILE_URL filled=' + filledUrls.length
			);
		} else if (form && checkedRows.length > 0) {
			console.log(SAP_FILE_LIST_LOG, 'OK: checked count matches FILE_URL count (' + checkedRows.length + ')');
		}

		return {
			rows: rows,
			checkedRows: checkedRows,
			filledUrls: filledUrls
		};
	}

	/**
	 * 체크박스 선택 건수 = JSON 배열 요소 개수 (1체크→1요소, 2체크→2요소)
	 * message 형식: [{"CHCK_SNO":"","PWPL_ID":"2230","FILE_NAME":"...","FILE_URL":"..."}, ...]
     * FILE_NAME, FILE_URL 두개의 사항을 임의로 넣었음
	 */
	function sapFileListBuildBridgeMessage(resultData, lastSel) {
		lastSel = lastSel || window.__sapFileListLastSelection || {};
		var lastSave = window.__sapFileListLastSave || {};
		var pwplId = (resultData && resultData.PWPL_ID) ? String(resultData.PWPL_ID) : '2230';
		var chckSnoRaw = (resultData && resultData.CHCK_SNO) ? String(resultData.CHCK_SNO) : '';
		var chckSnos = chckSnoRaw.split(',').map(function (s) {
			return s.trim();
		});
		var checkedItems = lastSel.checkedItems || [];
		var fileUrls = (lastSave.fileUrls && lastSave.fileUrls.length)
			? lastSave.fileUrls
			: (lastSel.fileUrls || []);

		var source = checkedItems.length > 0
			? checkedItems
			: fileUrls.map(function (name) {
				return { FILE_NAME: name, FILE_URL: name };
			});

		return source.map(function (item, i) {
			var fileName = String(item.FILE_NAME || item.FILE_URL || fileUrls[i] || '').trim();
			var chckSno = (chckSnos[i] != null && chckSnos[i] !== '') ? String(chckSnos[i]) : '';
			return {
				CHCK_SNO: chckSno,
				PWPL_ID: pwplId,
				FILE_NAME: fileName,
				FILE_URL: fileName
			};
		});
	}

	/** 체크박스 / FILE_URL / bridge message 개수 일치 여부 (1체크=1건 버그 검증) */
	function sapFileListVerifyCounts(lastSel, lastSave, bridgeItemCount) {
		var fileUrls = (lastSave && lastSave.fileUrls) ? lastSave.fileUrls : [];
		var fileNames = (lastSel && lastSel.fileNames) ? lastSel.fileNames : [];
		var checkboxCount = lastSel && lastSel.checkedCount != null ? lastSel.checkedCount : null;

		var checks = {
			checkboxSelected: checkboxCount,
			selectionFileNames: fileNames.length,
			lastSaveFileUrls: fileUrls.length,
			fileUrlSendCount: lastSave ? lastSave.fileUrlSendCount : null,
			bridgeMessageItems: bridgeItemCount
		};

		var pass = true;
		var errors = [];

		if (checkboxCount != null && fileNames.length !== checkboxCount) {
			pass = false;
			errors.push('체크박스 ' + checkboxCount + '개 vs 선택 fileNames ' + fileNames.length + '개');
		}
		if (checkboxCount != null && fileUrls.length !== checkboxCount) {
			pass = false;
			errors.push('체크박스 ' + checkboxCount + '개 vs lastSave.fileUrls ' + fileUrls.length + '개');
		}
		if (lastSave && lastSave.fileUrlSendCount != null && fileUrls.length !== lastSave.fileUrlSendCount) {
			pass = false;
			errors.push('fileUrls.length(' + fileUrls.length + ') vs fileUrlSendCount(' + lastSave.fileUrlSendCount + ')');
		}
		if (bridgeItemCount != null && fileUrls.length !== bridgeItemCount) {
			pass = false;
			errors.push('lastSave.fileUrls ' + fileUrls.length + '개 vs Android message ' + bridgeItemCount + '개');
		}
		if (checkboxCount != null && bridgeItemCount != null && checkboxCount !== bridgeItemCount) {
			pass = false;
			errors.push('체크박스 ' + checkboxCount + '개 vs Android message ' + bridgeItemCount + '개');
		}

		return { checks: checks, pass: pass, errors: errors };
	}

	function sapFileListClearFileUrls(form) {
		var slots = ['FILE_URL1', 'FILE_URL2', 'FILE_URL3', 'FILE_URL4', 'FILE_URL5'];
		var before = {};
		for (var i = 0; i < slots.length; i++) {
			if (form[slots[i]]) {
				before[slots[i]] = form[slots[i]].value || '';
				form[slots[i]].value = '';
			}
		}
		var hadValue = Object.keys(before).some(function (k) { return before[k]; });
		if (hadValue) {
			console.log(SAP_FILE_LIST_LOG, 'cleared previous FILE_URL slots:', before);
		}
	}

	$(document).ready(function () {
		$(document).on('change', 'input[name=CHK_ITEM]', function () {
			sapFileListLogSnapshot('checkbox changed');
		});
	});
	
	function fncSave () {
		//if (!gfnChkReqValidation()) return
		
		let params = new Object()
		let formData = new FormData()
		
		formData.append('CHCK_STRT_DT', $('#CHCK_STRT_DT').val());		// 점검시작일자	
		formData.append('CHCK_END_DT', $('#CHCK_END_DT').val());		// 점검종료일자	
		formData.append('CHCK_TITL', $('#CHCK_TITL').val());			// 제목명
		formData.append('CHKPR_ID', $('#CHKPR_ID').val());				// 점검자ID	
		formData.append('CHKPR_FNM', $('#CHKPR_FNM').val());			// 점검자성명	
		formData.append('WRKOR_NO', $('#WRKOR_NO').val());				// 작업오더번호	
		formData.append('PRSTS_CFY', $('#PRSTS_CFY').val());			// 진행상태구분	

		formData.append('DOC_TYP_CD', $('#DOC_TYP_CD').val());	
		formData.append('PRT_NO', $('#PRT_NO').val());	
		formData.append('PRCDOC_NO', $('#PRCDOC_NO').val());	
		formData.append('PRCDOC_NM', $('#PRCDOC_NM').val());	
		formData.append('PRCDOC_RVSN_NO', $('#PRCDOC_RVSN_NO').val());	
		formData.append('FILE_URL1', $('#FILE_URL1').val());	
		formData.append('FILE_URL2', $('#FILE_URL2').val());	
		formData.append('FILE_URL3', $('#FILE_URL3').val());	
		formData.append('FILE_URL4', $('#FILE_URL4').val());	
		formData.append('FILE_URL5', $('#FILE_URL5').val());	

		var LOG_SAVE = SAP_FILE_LIST_LOG;
		var formDataLog = {};
		formData.forEach(function (value, key) {
			formDataLog[key] = value;
		});
		var sendFileUrls = [
			formDataLog.FILE_URL1,
			formDataLog.FILE_URL2,
			formDataLog.FILE_URL3,
			formDataLog.FILE_URL4,
			formDataLog.FILE_URL5
		].map(function (v) { return v ? String(v).trim() : ''; })
		 .filter(function (v) { return v.length > 0; });

		console.log(LOG_SAVE, '=== Exam_Insert_Ajax FormData ===', formDataLog);
		console.log(LOG_SAVE, 'FILE_URL send count:', sendFileUrls.length);
		console.log(LOG_SAVE, 'FILE_URL send list (fileUrls 배열):', sendFileUrls);

		window.__sapFileListLastSave = {
			savedAt: new Date().toISOString(),
			fileUrlSendCount: sendFileUrls.length,
			fileUrls: sendFileUrls.slice(),
			fileUrlSlots: {
				FILE_URL1: formDataLog.FILE_URL1 || '',
				FILE_URL2: formDataLog.FILE_URL2 || '',
				FILE_URL3: formDataLog.FILE_URL3 || '',
				FILE_URL4: formDataLog.FILE_URL4 || '',
				FILE_URL5: formDataLog.FILE_URL5 || ''
			}
		};
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: '<%=request.getContextPath()%>/Exam_Insert_Ajax.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
                    console.log(SAP_FILE_LIST_LOG, 'Exam_Insert_Ajax result:', resultData);
                    console.log(SAP_FILE_LIST_LOG, 'CHCK_SNO (comma-separated):', resultData.CHCK_SNO);

                    var lastSel = window.__sapFileListLastSelection || {};
                    var lastSave = window.__sapFileListLastSave || {};

                    var bridgeItems = sapFileListBuildBridgeMessage(resultData, lastSel);
                    var bridgeMessage = JSON.stringify(bridgeItems);
                    var verify = sapFileListVerifyCounts(lastSel, lastSave, bridgeItems.length);

                    console.log(SAP_FILE_LIST_LOG, 'Android message (JSON array):', bridgeMessage);
                    console.log(SAP_FILE_LIST_LOG, 'Android message parsed:', bridgeItems);
                    console.log(SAP_FILE_LIST_LOG, 'lastSave.fileUrls (서버 전송 파일):', lastSave.fileUrls);
                    console.log(SAP_FILE_LIST_LOG, 'delivery verify:', verify.checks);

                    if (verify.pass) {
						console.log(
							SAP_FILE_LIST_LOG,
							'VERIFY PASS: 체크 ' + verify.checks.checkboxSelected + '개 = fileUrls ' +
							verify.checks.lastSaveFileUrls + '개 = Android message ' + verify.checks.bridgeMessageItems + '개'
						);
					} else {
						console.error(SAP_FILE_LIST_LOG, 'VERIFY FAIL (잔여/중복 전송 의심):', verify.errors);
					}

                    sapFileListLogSnapshot('before sendAlertWithAck');
                    sendAlertWithAck(bridgeMessage, bridgeItems.length);
					//fnInputBack();
				} else {
					alert('등록에 실패하였습니다.');
					console.log('Save Fail!!');
				}
			},
			error: function () {
				alert('등록에 실패하였습니다.');
				console.log('Error occured!!');
			}
		})
	}

	// 절차서관리 선택
	function fnFormSelect () {
		var LOG = SAP_FILE_LIST_LOG;
		const chkElements = document.getElementsByName("CHK_ITEM");
		const chkElement1 = $('#form input[name=FILE_NAME]');
		let form = document.getElementById('form');

		console.log(LOG, '=== fnFormSelect START (다운로드 click) ===');
		sapFileListLogSnapshot('before assign');

		// 이전 선택 잔여값 제거 → 1개 선택 시 1개만 전송되도록
		sapFileListClearFileUrls(form);

		// UI 상단 표시 vs hidden 필드 (동일 데이터인지 확인)
		var uiDocInfo = {
			PRCDOC_NO: '${PRCDOC_NO}',
			PRCDOC_NM: '${PRCDOC_NM}',
			DOC_TYP_CD: '${DOC_TYP_CD}',
			PRT_NO: '${PRT_NO}',
			PRCDOC_RVSN_NO: '${PRCDOC_RVSN_NO}'
		};
		var formDocInfo = {
			PRCDOC_NO: form.PRCDOC_NO ? form.PRCDOC_NO.value : '',
			PRCDOC_NM: form.PRCDOC_NM ? form.PRCDOC_NM.value : '',
			DOC_TYP_CD: form.DOC_TYP_CD ? form.DOC_TYP_CD.value : '',
			PRT_NO: form.PRT_NO ? form.PRT_NO.value : '',
			PRCDOC_RVSN_NO: form.PRCDOC_RVSN_NO ? form.PRCDOC_RVSN_NO.value : ''
		};
		console.log(LOG, 'UI header (JSP render):', uiDocInfo);
		console.log(LOG, 'Form hidden (document):', formDocInfo);

		let chkCnt = 0;
		var selectedRows = [];

		for (let i = 0; i < chkElements.length; i++) {
			var isChecked = $(chkElements[i]).is(':checked');
			var hiddenFileName = $(chkElement1[i]).val();
			var uiFileName = '';
			try {
				var row = chkElements[i].closest('tr');
				if (row && row.cells && row.cells.length > 1) {
					uiFileName = (row.cells[1].innerText || row.cells[1].textContent || '').trim();
				}
			} catch (e) {}

			if (isChecked) {
				chkCnt++;
				var slot = 'FILE_URL' + chkCnt;
				if (chkCnt == 1) { form.FILE_URL1.value = hiddenFileName; }
				if (chkCnt == 2) { form.FILE_URL2.value = hiddenFileName; }
				if (chkCnt == 3) { form.FILE_URL3.value = hiddenFileName; }
				if (chkCnt == 4) { form.FILE_URL4.value = hiddenFileName; }
				if (chkCnt == 5) { form.FILE_URL5.value = hiddenFileName; }

				selectedRows.push({
					rowIndex: i,
					slot: slot,
					uiFileName: uiFileName,
					hiddenFileName: hiddenFileName,
					match: uiFileName === hiddenFileName
				});
			}
		}

		var filledUrls = sapFileListGetFilledUrls(form);
		var uiCheckedNames = selectedRows.map(function (r) { return r.uiFileName; });
		var assignedNames = filledUrls.map(function (u) { return u.value; });

		console.log(LOG, 'Selected count (checkbox):', chkCnt);
		console.log(LOG, 'Selected rows detail:', selectedRows);
		console.log(LOG, 'Assigned FILE_URL list:', assignedNames);
		console.log(LOG, 'Verification:', {
			uiCheckedCount: chkCnt,
			assignedUrlCount: filledUrls.length,
			namesMatchOrder: JSON.stringify(uiCheckedNames) === JSON.stringify(assignedNames),
			allUiHiddenMatch: selectedRows.every(function (r) { return r.match; })
		});

		if (chkCnt !== filledUrls.length) {
			console.error(LOG, 'ERROR: checkbox count and FILE_URL count differ', chkCnt, filledUrls.length);
		} else {
			console.log(LOG, 'OK: ' + chkCnt + ' checked → ' + filledUrls.length + ' FILE_URL assigned');
		}

		if (chkCnt == 0) {
			console.warn(LOG, 'No checkbox selected');
			alert('자료를 선택하여 주십시오.');
			return;
		}

		if (chkCnt > 5) {
			console.warn(LOG, 'More than 5 files selected; only first 5 will be sent');
		}

		// form에 반영된 FILE_URL + fncSave로 전달될 hidden 값
		var fileUrls = {
			FILE_URL1: form.FILE_URL1.value,
			FILE_URL2: form.FILE_URL2.value,
			FILE_URL3: form.FILE_URL3.value,
			FILE_URL4: form.FILE_URL4.value,
			FILE_URL5: form.FILE_URL5.value
		};
		var savePayload = {
			CHCK_STRT_DT: form.CHCK_STRT_DT ? form.CHCK_STRT_DT.value : '',
			CHCK_END_DT: form.CHCK_END_DT ? form.CHCK_END_DT.value : '',
			CHCK_TITL: form.CHCK_TITL ? form.CHCK_TITL.value : '',
			CHKPR_ID: form.CHKPR_ID ? form.CHKPR_ID.value : '',
			CHKPR_FNM: form.CHKPR_FNM ? form.CHKPR_FNM.value : '',
			WRKOR_NO: form.WRKOR_NO ? form.WRKOR_NO.value : '',
			PRSTS_CFY: form.PRSTS_CFY ? form.PRSTS_CFY.value : '',
			DOC_TYP_CD: formDocInfo.DOC_TYP_CD,
			PRT_NO: formDocInfo.PRT_NO,
			PRCDOC_NO: formDocInfo.PRCDOC_NO,
			PRCDOC_NM: formDocInfo.PRCDOC_NM,
			PRCDOC_RVSN_NO: formDocInfo.PRCDOC_RVSN_NO,
			FILE_URL1: fileUrls.FILE_URL1,
			FILE_URL2: fileUrls.FILE_URL2,
			FILE_URL3: fileUrls.FILE_URL3,
			FILE_URL4: fileUrls.FILE_URL4,
			FILE_URL5: fileUrls.FILE_URL5
		};

		console.log(LOG, 'Form FILE_URL slots:', fileUrls);
		console.log(LOG, 'Payload for fncSave (Exam_Insert_Ajax):', savePayload);
		sapFileListLogSnapshot('after assign (before confirm)');

		window.__sapFileListLastSelection = {
			selectedAt: new Date().toISOString(),
			checkedCount: chkCnt,
			fileNames: assignedNames.slice(),
			fileUrls: assignedNames.slice(),
			filledUrlCount: filledUrls.length,
			docInfo: formDocInfo,
			checkedItems: selectedRows.map(function (r, idx) {
				return {
					SEQ: idx + 1,
					FILE_NAME: r.hiddenFileName,
					FILE_URL: r.hiddenFileName,
					uiFileName: r.uiFileName,
					rowIndex: r.rowIndex,
					slot: r.slot
				};
			})
		};

		if (!confirm('단말기에 자료를 다운로드하시겠습니까?')) {
			console.log(LOG, 'User cancelled confirm');
			return;
		}

		console.log(LOG, 'Calling fncSave()...');
		fncSave();
	}
	
	function fnInputBack () {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_Input_M.do?USER_ID=${CHKPR_ID}";
		form.submit()
	}		
	
	function fnFormBack () {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_SapList.do"
		form.submit()
	}	
</script>
<script>
	window.PelsNative = window.PelsNative || {};
	
	window.PelsNative.onInputResult = function(field, value) {
	  if (field === 'sampleInput') {
	    var el = document.getElementById('sampleInput');
	    if (el) el.value = value || '';
	  }
	  if (field === 'sampleInputAck') {
	    var elAck = document.getElementById('sampleInputAck');
	    if (elAck) elAck.value = value || '';
	  }
	  console.log('[PelsNative] onInputResult', field, value);
	};
	
	window.PelsNative.onApiResult = function(endpoint, status, bodyJson) {
	  console.log('[PelsNative] onApiResult', endpoint, status, bodyJson);
	};
	
	// ACK / Promise 버전 호출
	function sendAlertWithAck(message, bridgeItemCount) {
		var LOG_BRIDGE = '[SapFileListBridge]';
		var parsed = null;
		var itemCount = bridgeItemCount;

		try {
			parsed = JSON.parse(message);
			if (itemCount == null) {
				itemCount = Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
			}
		} catch (e) {
			console.warn(LOG_BRIDGE, 'message JSON.parse failed:', e);
			if (itemCount == null) {
				itemCount = null;
			}
		}

		var lastSel = window.__sapFileListLastSelection || {};
		var lastSave = window.__sapFileListLastSave || {};
		var fileUrls = lastSave.fileUrls || [];
		var verify = sapFileListVerifyCounts(lastSel, lastSave, itemCount);

		console.log(LOG_BRIDGE, '=== sendAlertWithAck (Android message 검증) ===');
		console.log(LOG_BRIDGE, 'message (raw string):', message);
		console.log(LOG_BRIDGE, 'message parsed:', parsed);
		console.log(LOG_BRIDGE, 'message item count (Android로 전달 건수):', itemCount);

		console.log(LOG_BRIDGE, '--- last checkbox selection (lastSel) ---');
		console.log(LOG_BRIDGE, '  checkedCount:', lastSel.checkedCount);
		console.log(LOG_BRIDGE, '  fileNames:', lastSel.fileNames);
		console.log(LOG_BRIDGE, '  fileUrls (선택 시점):', lastSel.fileUrls);

		console.log(LOG_BRIDGE, '--- last FILE_URL save (lastSave) ---');
		console.log(LOG_BRIDGE, '  fileUrlSendCount:', lastSave.fileUrlSendCount);
		console.log(LOG_BRIDGE, '  fileUrls 배열 길이:', fileUrls.length);
		console.log(LOG_BRIDGE, '  fileUrls 배열 항목:', fileUrls);
		console.log(LOG_BRIDGE, '  fileUrlSlots (빈 슬롯=정상):', lastSave.fileUrlSlots);

		console.log(LOG_BRIDGE, '  checkedItems (체크박스 선택):', lastSel.checkedItems);

		console.log(LOG_BRIDGE, '--- 개수 비교 (버그: 1체크인데 2건 전달 등) ---');
		console.log(LOG_BRIDGE, '  verify checks:', verify.checks);

		if (verify.pass) {
			console.log(
				LOG_BRIDGE,
				'VERIFY PASS ✓ 체크 ' + verify.checks.checkboxSelected + '개 → fileUrls ' +
				verify.checks.lastSaveFileUrls + '개 → Android message ' + verify.checks.bridgeMessageItems + '개'
			);
		} else {
			console.error(LOG_BRIDGE, 'VERIFY FAIL ✗', verify.errors);
			console.error(
				LOG_BRIDGE,
				'예: 체크 1개인데 fileUrls 또는 message가 2개면 이전 선택 잔여값 버그 가능'
			);
		}

		// fileUrls 항목별 상세 (1건/2건 확인용)
		fileUrls.forEach(function (name, idx) {
			console.log(LOG_BRIDGE, '  fileUrls[' + idx + ']:', name);
		});
		if (Array.isArray(parsed)) {
			parsed.forEach(function (item, idx) {
				console.log(LOG_BRIDGE, '  bridge[' + idx + ']:', item);
				if (lastSave.fileUrls && lastSave.fileUrls[idx] && item.FILE_NAME !== lastSave.fileUrls[idx]) {
					console.warn(
						LOG_BRIDGE,
						'  bridge[' + idx + '] FILE_NAME mismatch:',
						item.FILE_NAME,
						'vs lastSave.fileUrls:',
						lastSave.fileUrls[idx]
					);
				}
			});
		}
        //
        if (window.PelsAndroidBridge && PelsAndroidBridge.ui && PelsAndroidBridge.ui.showAlertWithAck) {
            console.log(LOG_BRIDGE, 'PelsAndroidBridge.ui.showAlertWithAck call');
            PelsAndroidBridge.ui
                .showAlertWithAck(message)
                .then(function (res) {
                    console.log(LOG_BRIDGE, 'showAlertWithAck OK', res);
                })
                .catch(function (err) {
                    console.log(LOG_BRIDGE, 'showAlertWithAck FAIL', err);
                });
        } else {
            console.log(LOG_BRIDGE, 'PC browser (no bridge) — alert preview');
            alert(message);
        }
	}
	
	function sendInputRequestWithAck() {
	  var current = document.getElementById('sampleInputAck').value;
      if (window.PelsAndroidBridge && PelsAndroidBridge.ui && PelsAndroidBridge.input.requestWithAck) {
            console.log("PelsAndroidBridge Current :: " + current)
            console.log("=======PelsAndroidBridge 객체 있음 (안드로이드 웹뷰 기반상에서 동작한다는 뜻임)======");
            PelsAndroidBridge.input
                .requestWithAck('sampleInputAck', current)
                .then(function (res) {
                    console.log('[Web] input.requestWithAck OK', res);
                })
                .catch(function (err) {
                    console.log('[Web] input.requestWithAck FAIL', err);
                });
      }else{
            console.log("Current :: " + current)
            // 여기는 그냥 PC 브라우저에서 호출한 경우
            // alert(message.data); // console만
            alert("input.requestWithAck");
      }
	}
	
	function sendApiRequestWithAck() {
        if (window.PelsAndroidBridge && PelsAndroidBridge.ui && PelsAndroidBridge.api.callWithAck) {
            PelsAndroidBridge.api
                .callWithAck('/v1/example',
                    {code: 'ACK01', date: '2026-03-13'},
                    'GET')
                .then(function (res) {
                    console.log('[Web] api.callWithAck OK', res);
                })
                .catch(function (err) {
                    console.log('[Web] api.callWithAck FAIL', err);
                });
        }else{
            alert('API Call with Ack'); // console만
        }
	}
</script>	
<style>

	#myTable tbody tr td {
		line-height: 24px;
	}
	
	body.real-skin  {
		font-size: 14px;
	    min-width: 360px;
	}	
</style>	

<body class="no-skin real-skin real-popup">
<form id="form" name="form" method="post">
<input type="hidden" name="SH_DOC_TYP_CD" value="${SH_DOC_TYP_CD}">
<input type="hidden" name="SH_PRCDOC_NO" value="${SH_PRCDOC_NO}">
<input type="hidden" name="SH_PRT_NO" value="${SH_PRT_NO}">

<input name="PRCDOC_NO" id="PRCDOC_NO" type="hidden" value="${PRCDOC_NO}"> 
<input name="PRCDOC_NM" id="PRCDOC_NM" type="hidden" value="${PRCDOC_NM}"> 
<input name="DOC_TYP_CD" id="DOC_TYP_CD" type="hidden" value="${DOC_TYP_CD}"> 
<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" type="hidden" value="${PRCDOC_RVSN_NO}"> 
<input name="PRT_NO" id="PRT_NO" type="hidden" value="${PRT_NO}"> 

<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" type="hidden" value="${CHCK_STRT_DT}"> 
<input name="CHCK_END_DT" id="CHCK_END_DT" type="hidden" value="${CHCK_END_DT}"> 
<input name="CHCK_TITL" id="CHCK_TITL" type="hidden" value="${CHCK_TITL}"> 
<input name="CHKPR_ID" id="CHKPR_ID" type="hidden" value="${CHKPR_ID}"> 
<input name="CHKPR_FNM" id="CHKPR_FNM" type="hidden" value="${CHKPR_FNM}"> 
<input name="WRKOR_NO" id="WRKOR_NO" type="hidden" value=""> 
<input name="PRSTS_CFY" id="PRSTS_CFY" type="hidden" value="R">
 
<input name="FILE_URL1" id="FILE_URL1" type="hidden" value="">
<input name="FILE_URL2" id="FILE_URL2" type="hidden" value="">
<input name="FILE_URL3" id="FILE_URL3" type="hidden" value="">
<input name="FILE_URL4" id="FILE_URL4" type="hidden" value="">
<input name="FILE_URL5" id="FILE_URL5" type="hidden" value="">
<div class="Header">  
	<div class="PageTitle">		
		<span class="Text">SAP PDF 가져오기</span>
	</div>      
	<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>         
</div>
<div class="Contents"> 			
	<div class="RealPanel">
		<div class="Title">
			<div class="TitleArea">
				<span class="SubTitle"></span>
			</div>
			<div class="ControlArea"></div>
		</div>
		<div class="RealSearchBox">
			<div class="NormalSearch">
				<div class="Default">
					<table border="0" cellpadding="0" cellspacing="0" class="Outline">
						<colgroup>
							<col style="width:100%" />
						</colgroup>
						<tr>
							<td class="Title">
							<span style="font-weight: normal;">문서번호[</span>	 ${PRCDOC_NO} 
							<span style="font-weight: normal;">], 문서제목[</span> ${PRCDOC_NM}
							<span style="font-weight: normal;">]</span>
							</td>
						</tr>
						<tr>
							<td class="Title">
							<span style="font-weight: normal;">문서유형[</span> ${DOC_TYP_CD} 
							<span style="font-weight: normal;">], 문서부분[</span> ${PRT_NO}
							<span style="font-weight: normal;">], 개정번호[</span> ${PRCDOC_RVSN_NO}
							<span style="font-weight: normal;">]</span>
							</td>							
						</tr>
					</table>
				</div>
			</div>
		</div>				
		<div class="ContentPanel">
			<div class="Grid">
				<table cellspacing="0" cellpadding="0" border="0" class="Outline" id = "myTable">
					<colgroup>
						<col width="70px" />
						<col width="*" />
					</colgroup>
					<tr class="Header">
						<th>선택</th>
						<th>파일이름</th>
					</tr>
					<c:forEach var="form" items="${SapFileList}" begin="0" end="${SapFileList.size()}" step="1">
						<tr class="Item">
							<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="" >
								<input type="hidden" name="FILE_NAME" value="${form.FILE_NAME}">
							</td>
							<td align="left">${form.FILE_NAME}</td>
						</tr>
					</c:forEach>
					<c:if test="${SapFileList.size() eq 0}">
						<tr class="Item">
							<td colspan="2" style="text-align: center;">조회된 자료가 없습니다.</td>
						</tr>
					</c:if>
				</table>
				
				<div class="PageButtonGroup">
					<a class="btn-m" href="javascript:fnFormSelect() ;"><span class="Text">다운로드</span></a>
					<a class="btn-m" href="javascript:fnFormBack() ;"><span class="Text">이전화변</span></a>
				</div>
			</div>
		</div>
	</div>
</div>
</form>
</body>
</html>

